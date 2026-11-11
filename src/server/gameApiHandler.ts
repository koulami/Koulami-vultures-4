/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';

export interface TeamProgressReport {
  teamId: string;
  answeredCount: number;
  score: number;
  totalAssigned: number;
  lastUpdateMs: number;
}

export interface ServerGameState {
  sessionId: string;
  isStarted: boolean;
  startedAt: string | null;
  startedAtMs: number | null;
  scheduledStartTime: string | null;
  durationMinutes: number;
  durationMs: number;
  endsAtMs: number | null;
  isExpired: boolean;
  roomPin: string;
  teamProgress: Record<string, TeamProgressReport>;
}

const DEFAULT_DURATION_MINUTES = 15;

export let gameState: ServerGameState = {
  sessionId: `session_${Date.now()}`,
  isStarted: false,
  startedAt: null,
  startedAtMs: null,
  scheduledStartTime: null,
  durationMinutes: DEFAULT_DURATION_MINUTES,
  durationMs: DEFAULT_DURATION_MINUTES * 60 * 1000,
  endsAtMs: null,
  isExpired: false,
  roomPin: 'GYPES-2026',
  teamProgress: {},
};

// SSE connected clients
const sseClients = new Set<ServerResponse>();

export function broadcastGameEvent(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Check expiration against authoritative clock
export function checkExpiration(): boolean {
  if (gameState.isStarted && gameState.endsAtMs && !gameState.isExpired) {
    if (Date.now() >= gameState.endsAtMs) {
      gameState.isExpired = true;
      broadcastGameEvent('game_expired', {
        ...gameState,
        serverTimeMs: Date.now(),
      });
      return true;
    }
  }
  return false;
}

// Background tick (unref'd so it does not prevent vite build from exiting cleanly)
const expirationTimer = setInterval(() => {
  checkExpiration();
}, 1000);
if (typeof expirationTimer.unref === 'function') {
  expirationTimer.unref();
}

function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Range, X-Media-Type, X-File-Name, X-File-Size',
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const stationUploadsDir = path.resolve(process.cwd(), 'uploads', 'station-media');
if (!fs.existsSync(stationUploadsDir)) {
  fs.mkdirSync(stationUploadsDir, { recursive: true });
}

// Dedicated storage directory for synchronized student team posters and photo submissions
const postersUploadsDir = path.resolve(process.cwd(), 'uploads', 'posters');
if (!fs.existsSync(postersUploadsDir)) {
  fs.mkdirSync(postersUploadsDir, { recursive: true });
}
const serverPostersFilePath = path.join(postersUploadsDir, 'posters.json');
const serverSubmissionsFilePath = path.join(postersUploadsDir, 'submissions.json');

let serverPosters: Record<string, any> = {};
let serverSubmissions: any[] = [];

function loadServerPostersFromDisk() {
  try {
    if (fs.existsSync(serverPostersFilePath)) {
      const raw = fs.readFileSync(serverPostersFilePath, 'utf-8');
      serverPosters = JSON.parse(raw);
      if (serverPosters && typeof serverPosters === 'object') {
        for (const p of Object.values(serverPosters)) {
          if (p && typeof (p as any).members === 'string') {
            (p as any).members = (p as any).members
              .split(/[,;&]/)
              .map((m: string) => m.trim())
              .filter((m: string) => m.length > 0);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Failed to load posters from disk:', err);
  }
  try {
    if (fs.existsSync(serverSubmissionsFilePath)) {
      const raw = fs.readFileSync(serverSubmissionsFilePath, 'utf-8');
      serverSubmissions = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to load photo submissions from disk:', err);
  }
}
loadServerPostersFromDisk();

function saveServerPostersToDisk() {
  try {
    const tmpPosters = `${serverPostersFilePath}.tmp_${Date.now()}`;
    fs.writeFileSync(tmpPosters, JSON.stringify(serverPosters, null, 2), 'utf-8');
    fs.renameSync(tmpPosters, serverPostersFilePath);
  } catch (err) {
    console.error('Failed to save posters to disk:', err);
  }
  try {
    const tmpSubs = `${serverSubmissionsFilePath}.tmp_${Date.now()}`;
    fs.writeFileSync(tmpSubs, JSON.stringify(serverSubmissions, null, 2), 'utf-8');
    fs.renameSync(tmpSubs, serverSubmissionsFilePath);
  } catch (err) {
    console.error('Failed to save photo submissions to disk:', err);
  }
}

/**
 * Handles all /api/game/* and /api/station-media/* requests in Vite dev server (or standalone Express server)
 */
export async function handleGameApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url || '';
  if (!url.startsWith('/api/game') && !url.startsWith('/api/station-media')) {
    return false;
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Range, X-Media-Type, X-File-Name, X-File-Size',
    });
    res.end();
    return true;
  }

  const cleanPath = url.split('?')[0];

  // 1. GET /api/game/state - Current authoritative game state
  if (req.method === 'GET' && cleanPath === '/api/game/state') {
    checkExpiration();
    sendJson(res, 200, {
      success: true,
      state: gameState,
      serverTimeMs: Date.now(),
    });
    return true;
  }

  // 2. GET /api/game/stream - Real-time SSE stream
  if (req.method === 'GET' && cleanPath === '/api/game/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering': 'no',
    });

    checkExpiration();

    // Send initial state immediately
    res.write(
      `event: state\ndata: ${JSON.stringify({ ...gameState, serverTimeMs: Date.now() })}\n\n`
    );

    sseClients.add(res);

    // Heartbeat ping
    const pingTimer = setInterval(() => {
      try {
        checkExpiration();
        res.write(': ping\n\n');
      } catch {
        clearInterval(pingTimer);
        sseClients.delete(res);
      }
    }, 10000);

    req.on('close', () => {
      clearInterval(pingTimer);
      sseClients.delete(res);
    });

    return true;
  }

  // 3. POST /api/game/start - Administrator starts a fresh game session
  if (req.method === 'POST' && cleanPath === '/api/game/start') {
    const body = await parseJsonBody(req);
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();

    let durationMinutes = gameState.durationMinutes || DEFAULT_DURATION_MINUTES;
    if (typeof body?.durationMinutes === 'number' && body.durationMinutes > 0) {
      durationMinutes = Math.round(body.durationMinutes);
    }

    const durationMs = durationMinutes * 60 * 1000;
    const endsAtMs = nowMs + durationMs;
    const newSessionId = `session_${nowMs}_${Math.random().toString(36).substring(2, 7)}`;

    gameState = {
      ...gameState,
      sessionId: newSessionId,
      isStarted: true,
      startedAt: nowIso,
      startedAtMs: nowMs,
      scheduledStartTime: body?.scheduledStartTime || nowIso,
      durationMinutes,
      durationMs,
      endsAtMs,
      isExpired: false,
    };

    const payload = {
      ...gameState,
      serverTimeMs: nowMs,
    };

    broadcastGameEvent('game_started', payload);
    broadcastGameEvent('state', payload);

    sendJson(res, 200, {
      success: true,
      message: `Game started successfully for all teams (${durationMinutes} minutes)`,
      state: gameState,
      serverTimeMs: nowMs,
    });
    return true;
  }

  // 4. POST /api/game/settings - Update duration
  if (req.method === 'POST' && cleanPath === '/api/game/settings') {
    const body = await parseJsonBody(req);
    const { durationMinutes } = body;
    if (typeof durationMinutes === 'number' && durationMinutes > 0 && durationMinutes <= 180) {
      gameState.durationMinutes = Math.round(durationMinutes);
      gameState.durationMs = gameState.durationMinutes * 60 * 1000;

      if (gameState.isStarted && gameState.startedAtMs) {
        gameState.endsAtMs = gameState.startedAtMs + gameState.durationMs;
        gameState.isExpired = Date.now() >= gameState.endsAtMs;
      }

      broadcastGameEvent('settings_updated', { ...gameState, serverTimeMs: Date.now() });
      sendJson(res, 200, { success: true, state: gameState });
    } else {
      sendJson(res, 400, { success: false, message: 'Invalid durationMinutes' });
    }
    return true;
  }

  // 5. POST /api/game/pause - Pause game
  if (req.method === 'POST' && cleanPath === '/api/game/pause') {
    gameState.isStarted = false;
    broadcastGameEvent('game_paused', { ...gameState, serverTimeMs: Date.now() });
    sendJson(res, 200, { success: true, state: gameState });
    return true;
  }

  // 6. POST /api/game/reset - Reset to lobby
  if (req.method === 'POST' && cleanPath === '/api/game/reset') {
    gameState = {
      sessionId: `session_${Date.now()}`,
      isStarted: false,
      startedAt: null,
      startedAtMs: null,
      scheduledStartTime: null,
      durationMinutes: gameState.durationMinutes || DEFAULT_DURATION_MINUTES,
      durationMs: (gameState.durationMinutes || DEFAULT_DURATION_MINUTES) * 60 * 1000,
      endsAtMs: null,
      isExpired: false,
      roomPin: 'GYPES-2026',
      teamProgress: {},
    };

    broadcastGameEvent('game_reset', { ...gameState, serverTimeMs: Date.now() });
    broadcastGameEvent('state', { ...gameState, serverTimeMs: Date.now() });
    sendJson(res, 200, { success: true, state: gameState });
    return true;
  }

  // 7. POST /api/game/recover - Safe administrator recovery from stuck/expired state
  if (req.method === 'POST' && cleanPath === '/api/game/recover') {
    gameState = {
      ...gameState,
      sessionId: `session_recovered_${Date.now()}`,
      isStarted: false,
      startedAt: null,
      startedAtMs: null,
      endsAtMs: null,
      isExpired: false,
    };

    const payload = { ...gameState, serverTimeMs: Date.now(), isRecovered: true };
    broadcastGameEvent('game_recovered', payload);
    broadcastGameEvent('state', payload);

    sendJson(res, 200, {
      success: true,
      message: 'Game state safely recovered. Returned to waiting lobby.',
      state: gameState,
    });
    return true;
  }

  // 8. POST /api/game/team-progress - Report progress
  if (req.method === 'POST' && cleanPath === '/api/game/team-progress') {
    const body = await parseJsonBody(req);
    const { teamId, answeredCount, score, totalAssigned } = body;
    if (teamId) {
      const report: TeamProgressReport = {
        teamId,
        answeredCount: typeof answeredCount === 'number' ? answeredCount : 0,
        score: typeof score === 'number' ? score : 0,
        totalAssigned: typeof totalAssigned === 'number' ? totalAssigned : 0,
        lastUpdateMs: Date.now(),
      };

      gameState.teamProgress = {
        ...gameState.teamProgress,
        [teamId]: report,
      };

      broadcastGameEvent('team_progress', {
        teamId,
        report,
        teamProgress: gameState.teamProgress,
      });

      sendJson(res, 200, { success: true, report });
    } else {
      sendJson(res, 400, { success: false, message: 'Missing teamId' });
    }
    return true;
  }

  // 8b. GET /api/game/posters - Retrieve all synchronized team posters and student photos
  if (req.method === 'GET' && cleanPath === '/api/game/posters') {
    sendJson(res, 200, {
      success: true,
      posters: serverPosters,
      submissions: serverSubmissions,
      serverTimeMs: Date.now(),
    });
    return true;
  }

  // 8c. POST /api/game/posters - Student device or admin saves/updates team posters and photo submissions
  if (req.method === 'POST' && cleanPath === '/api/game/posters') {
    const body = await parseJsonBody(req);
    const { teamId, poster, submission, submissions, posters } = body;
    let updatedCount = 0;

    const normalizePoster = (p: any) => {
      if (!p || typeof p !== 'object') return p;
      if (typeof p.members === 'string') {
        p.members = p.members
          .split(/[,;&]/)
          .map((m: string) => m.trim())
          .filter((m: string) => m.length > 0);
      }
      return p;
    };

    if (posters && typeof posters === 'object') {
      for (const [tId, pData] of Object.entries(posters)) {
        if (pData && typeof pData === 'object') {
          const normalized = normalizePoster({ ...pData });
          serverPosters[tId] = { ...(serverPosters[tId] || {}), ...normalized };
          updatedCount++;
        }
      }
    } else if (teamId && poster && typeof poster === 'object') {
      const normalized = normalizePoster({ ...poster });
      serverPosters[teamId] = { ...(serverPosters[teamId] || {}), ...normalized };
      updatedCount++;
    }

    // Handle submissions
    const incomingSubs: any[] = [];
    if (submission && typeof submission === 'object') {
      incomingSubs.push(submission);
    }
    if (Array.isArray(submissions)) {
      incomingSubs.push(...submissions);
    }
    if (incomingSubs.length > 0) {
      for (const sub of incomingSubs) {
        if (!sub || typeof sub !== 'object') continue;
        const idx = serverSubmissions.findIndex(
          (s) => s.id === sub.id || (s.teamId === sub.teamId && s.questionId === sub.questionId)
        );
        if (idx >= 0) {
          serverSubmissions[idx] = { ...serverSubmissions[idx], ...sub };
        } else {
          serverSubmissions.push(sub);
        }
      }
    }

    saveServerPostersToDisk();

    // Broadcast poster_updated event to all connected clients (especially teacher/admin)
    broadcastGameEvent('poster_updated', {
      teamId: teamId || (Object.keys(serverPosters)[0] || 'all'),
      poster: teamId ? serverPosters[teamId] : undefined,
      posters: serverPosters,
      submissions: serverSubmissions,
      serverTimeMs: Date.now(),
    });

    sendJson(res, 200, {
      success: true,
      message: `Successfully synchronized ${updatedCount} team poster(s)`,
      posters: serverPosters,
      submissions: serverSubmissions,
    });
    return true;
  }

  // 8d. POST /api/game/clear-data - Administrator permanently clears previous game session data for a new game
  if (
    (req.method === 'POST' && cleanPath === '/api/game/clear-data') ||
    (req.method === 'DELETE' && cleanPath === '/api/game/posters')
  ) {
    // 1. Clear in-memory posters and submissions
    serverPosters = {};
    serverSubmissions = [];

    // 2. Persist cleared state to disk atomically
    saveServerPostersToDisk();

    // 3. Reset game session and team progress
    gameState = {
      sessionId: `session_${Date.now()}`,
      isStarted: false,
      startedAt: null,
      startedAtMs: null,
      scheduledStartTime: null,
      durationMinutes: gameState.durationMinutes || DEFAULT_DURATION_MINUTES,
      durationMs: (gameState.durationMinutes || DEFAULT_DURATION_MINUTES) * 60 * 1000,
      endsAtMs: null,
      isExpired: false,
      roomPin: 'GYPES-2026',
      teamProgress: {},
    };

    const payload = {
      ...gameState,
      posters: {},
      submissions: [],
      serverTimeMs: Date.now(),
      clearedAt: new Date().toISOString(),
    };

    // 4. Broadcast clearance events over SSE to all connected clients
    broadcastGameEvent('game_cleared', payload);
    broadcastGameEvent('poster_updated', {
      posters: {},
      submissions: [],
      serverTimeMs: Date.now(),
    });
    broadcastGameEvent('game_reset', payload);
    broadcastGameEvent('state', payload);

    sendJson(res, 200, {
      success: true,
      message: 'Previous game session data cleared successfully. Ready for new game.',
      state: gameState,
      posters: {},
      submissions: [],
    });
    return true;
  }

  // 9. Station Media Metadata Check: GET /api/station-media-info/:token
  if (req.method === 'GET' && cleanPath.startsWith('/api/station-media-info/')) {
    const rawToken = decodeURIComponent(cleanPath.replace('/api/station-media-info/', ''));
    if (!rawToken) {
      sendJson(res, 200, { exists: false });
      return true;
    }

    const token = rawToken.trim().toUpperCase();
    const safeToken = token.replace(/[^a-zA-Z0-9_-]/g, '_');
    const metaPath = path.join(stationUploadsDir, `${safeToken}.meta.json`);

    if (fs.existsSync(metaPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        if (fs.existsSync(meta.filePath)) {
          const stat = fs.statSync(meta.filePath);
          sendJson(res, 200, {
            exists: true,
            token: meta.token,
            mediaType: meta.mediaType,
            mimeType: meta.mimeType,
            fileName: meta.fileName,
            size: stat.size,
            url: `/api/station-media/${encodeURIComponent(token)}`,
            updatedAt: meta.updatedAt,
          });
          return true;
        }
      } catch {}
    }

    sendJson(res, 200, { exists: false });
    return true;
  }

  // 10. Station Media Retrieval: GET /api/station-media/:token
  if (req.method === 'GET' && cleanPath.startsWith('/api/station-media/')) {
    const rawToken = decodeURIComponent(cleanPath.replace('/api/station-media/', ''));
    if (!rawToken) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Station token required');
      return true;
    }

    const token = rawToken.trim().toUpperCase();
    const safeToken = token.replace(/[^a-zA-Z0-9_-]/g, '_');
    const metaPath = path.join(stationUploadsDir, `${safeToken}.meta.json`);

    if (!fs.existsSync(metaPath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('No media uploaded for this station token');
      return true;
    }

    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      if (!fs.existsSync(meta.filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Media file missing on server');
        return true;
      }

      const stat = fs.statSync(meta.filePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const stream = fs.createReadStream(meta.filePath, { start, end });

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': meta.mimeType || 'application/octet-stream',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Access-Control-Allow-Origin': '*',
        });
        stream.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': meta.mimeType || 'application/octet-stream',
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Access-Control-Allow-Origin': '*',
        });
        fs.createReadStream(meta.filePath).pipe(res);
      }
      return true;
    } catch (err: any) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error retrieving media: ' + err.message);
      return true;
    }
  }

  // 11. Station Media Upload: POST /api/station-media/:token
  if (req.method === 'POST' && cleanPath.startsWith('/api/station-media/')) {
    const rawToken = decodeURIComponent(cleanPath.replace('/api/station-media/', ''));
    if (!rawToken) {
      sendJson(res, 400, { success: false, message: 'Station token required' });
      return true;
    }

    const token = rawToken.trim().toUpperCase();
    const safeToken = token.replace(/[^a-zA-Z0-9_-]/g, '_');
    const mediaTypeHeader = (req.headers['x-media-type'] as string) || '';
    const fileNameHeader = (req.headers['x-file-name'] as string) || '';
    const fileSizeHeader = (req.headers['x-file-size'] as string) || '';
    const contentLengthHeader = req.headers['content-length'];
    const contentType = (req.headers['content-type'] as string) || 'application/octet-stream';

    // Parse expected bytes from Content-Length or X-File-Size
    let expectedLength: number | undefined;
    if (contentLengthHeader) {
      const parsed = parseInt(contentLengthHeader as string, 10);
      if (!isNaN(parsed) && parsed > 0) expectedLength = parsed;
    }
    if (!expectedLength && fileSizeHeader) {
      const parsed = parseInt(fileSizeHeader, 10);
      if (!isNaN(parsed) && parsed > 0) expectedLength = parsed;
    }

    const isVideo = contentType.startsWith('video/') || mediaTypeHeader === 'video';
    const mediaType = isVideo ? 'video' : 'image';
    const fileName = fileNameHeader
      ? decodeURIComponent(fileNameHeader)
      : isVideo
      ? 'station-video.mp4'
      : 'station-photo.jpg';

    const ext = path.extname(fileName) || (isVideo ? '.mp4' : '.jpg');
    const filePath = path.join(stationUploadsDir, `${safeToken}${ext}`);
    const metaPath = path.join(stationUploadsDir, `${safeToken}.meta.json`);
    const tempFilePath = path.join(stationUploadsDir, `${safeToken}.upload_${Date.now()}_tmp`);

    let isTerminated = false;

    const cleanupTempFile = () => {
      try {
        if (!writeStream.destroyed) {
          writeStream.destroy();
        }
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch {}
    };

    const writeStream = fs.createWriteStream(tempFilePath);

    req.on('aborted', () => {
      if (isTerminated || req.complete) return;
      isTerminated = true;
      cleanupTempFile();
      sendJson(res, 400, {
        success: false,
        message: 'Upload aborted by client or connection dropped',
      });
    });

    req.on('error', (err) => {
      if (isTerminated) return;
      isTerminated = true;
      cleanupTempFile();
      sendJson(res, 500, {
        success: false,
        message: 'Network error reading upload stream',
        error: err.message,
      });
    });

    writeStream.on('error', (err) => {
      if (isTerminated) return;
      isTerminated = true;
      cleanupTempFile();
      sendJson(res, 500, {
        success: false,
        message: 'Failed to write media file to disk',
        error: err.message,
      });
    });

    writeStream.on('finish', () => {
      if (isTerminated) return;

      if (!fs.existsSync(tempFilePath)) {
        isTerminated = true;
        sendJson(res, 500, {
          success: false,
          message: 'Temporary upload file disappeared after stream finished',
        });
        return;
      }

      const stat = fs.statSync(tempFilePath);
      const actualSize = stat.size;

      // 1. Validate non-empty file
      if (actualSize <= 0) {
        isTerminated = true;
        cleanupTempFile();
        sendJson(res, 400, {
          success: false,
          message: 'Received empty file (0 bytes)',
        });
        return;
      }

      // 2. Validate against expected Content-Length / X-File-Size when available
      if (typeof expectedLength === 'number' && expectedLength > 0) {
        if (actualSize !== expectedLength) {
          isTerminated = true;
          cleanupTempFile();
          sendJson(res, 400, {
            success: false,
            message: `Incomplete upload: expected ${expectedLength} bytes, received ${actualSize} bytes`,
            expectedSize: expectedLength,
            actualSize,
          });
          return;
        }
      }

      // 3. Atomic replacement of final file
      try {
        fs.renameSync(tempFilePath, filePath);
      } catch (err: any) {
        isTerminated = true;
        cleanupTempFile();
        sendJson(res, 500, {
          success: false,
          message: 'Failed to commit uploaded media file',
          error: err.message,
        });
        return;
      }

      isTerminated = true;
      const meta = {
        token,
        mediaType,
        fileName,
        mimeType: contentType,
        filePath,
        size: actualSize,
        url: `/api/station-media/${encodeURIComponent(token)}`,
        updatedAt: Date.now(),
      };

      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
      sendJson(res, 200, {
        success: true,
        message: 'Media saved successfully on server for cross-device access',
        url: meta.url,
        size: actualSize,
        meta,
      });
    });

    req.pipe(writeStream);
    return true;
  }

  // 12. Station Media Delete: DELETE /api/station-media/:token
  if (req.method === 'DELETE' && cleanPath.startsWith('/api/station-media/')) {
    const rawToken = decodeURIComponent(cleanPath.replace('/api/station-media/', ''));
    if (!rawToken) {
      sendJson(res, 400, { success: false });
      return true;
    }

    const token = rawToken.trim().toUpperCase();
    const safeToken = token.replace(/[^a-zA-Z0-9_-]/g, '_');
    const metaPath = path.join(stationUploadsDir, `${safeToken}.meta.json`);

    if (fs.existsSync(metaPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        if (meta.filePath && fs.existsSync(meta.filePath)) {
          fs.unlinkSync(meta.filePath);
        }
        fs.unlinkSync(metaPath);
      } catch {}
    }

    sendJson(res, 200, { success: true, message: 'Media removed from server' });
    return true;
  }

  return false;
}
