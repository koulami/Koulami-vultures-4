/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IncomingMessage, ServerResponse } from 'http';

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

// Background tick
setInterval(() => {
  checkExpiration();
}, 1000);

function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
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

/**
 * Handles all /api/game/* requests in Vite dev server (or standalone Express server)
 */
export async function handleGameApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url || '';
  if (!url.startsWith('/api/game')) {
    return false;
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
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

  return false;
}
