/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Authoritative synchronized game state
export interface TeamProgressReport {
  teamId: string;
  answeredCount: number;
  score: number;
  totalAssigned: number;
  lastUpdateMs: number;
}

export interface ServerGameState {
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

let gameState: ServerGameState = {
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

// SSE connected clients set
const sseClients = new Set<Response>();

function broadcast(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Check and mark expiration if time passed
function checkExpiration() {
  if (gameState.isStarted && gameState.endsAtMs && !gameState.isExpired) {
    if (Date.now() >= gameState.endsAtMs) {
      gameState.isExpired = true;
      broadcast('game_expired', {
        ...gameState,
        serverTimeMs: Date.now(),
      });
    }
  }
}

// 1. Get current authoritative game state
app.get('/api/game/state', (_req: Request, res: Response) => {
  checkExpiration();
  res.json({
    success: true,
    state: gameState,
    serverTimeMs: Date.now(),
  });
});

// 2. Administrator settings (set duration in minutes before starting)
app.post('/api/game/settings', (req: Request, res: Response) => {
  const { durationMinutes } = req.body;
  if (typeof durationMinutes === 'number' && durationMinutes > 0 && durationMinutes <= 180) {
    gameState.durationMinutes = Math.round(durationMinutes);
    gameState.durationMs = gameState.durationMinutes * 60 * 1000;
    
    // If game is running, adjust endsAtMs accordingly
    if (gameState.isStarted && gameState.startedAtMs) {
      gameState.endsAtMs = gameState.startedAtMs + gameState.durationMs;
      gameState.isExpired = Date.now() >= gameState.endsAtMs;
    }

    broadcast('settings_updated', gameState);

    res.json({
      success: true,
      message: `Duration set to ${gameState.durationMinutes} minutes`,
      state: gameState,
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid duration. Must be between 1 and 180 minutes.',
    });
  }
});

// 3. Start game simultaneously for all teams with synchronized start/end timestamps
app.post('/api/game/start', (req: Request, res: Response) => {
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();

  let durationMinutes = gameState.durationMinutes || DEFAULT_DURATION_MINUTES;
  if (typeof req.body?.durationMinutes === 'number' && req.body.durationMinutes > 0) {
    durationMinutes = Math.round(req.body.durationMinutes);
  }

  const durationMs = durationMinutes * 60 * 1000;
  const endsAtMs = nowMs + durationMs;

  gameState = {
    ...gameState,
    isStarted: true,
    startedAt: nowIso,
    startedAtMs: nowMs,
    scheduledStartTime: req.body?.scheduledStartTime || nowIso,
    durationMinutes,
    durationMs,
    endsAtMs,
    isExpired: false,
  };

  broadcast('game_started', {
    ...gameState,
    serverTimeMs: nowMs,
  });

  res.json({
    success: true,
    message: `Game started for all teams with ${durationMinutes} minutes duration`,
    state: gameState,
    serverTimeMs: nowMs,
  });
});

// 4. Pause game
app.post('/api/game/pause', (_req: Request, res: Response) => {
  gameState = {
    ...gameState,
    isStarted: false,
  };

  broadcast('game_paused', gameState);

  res.json({
    success: true,
    message: 'Game paused',
    state: gameState,
  });
});

// 5. Reset game state
app.post('/api/game/reset', (_req: Request, res: Response) => {
  gameState = {
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

  broadcast('game_reset', gameState);

  res.json({
    success: true,
    message: 'Game state reset',
    state: gameState,
  });
});

// 6. Report team progress for administrator dashboard
app.post('/api/game/team-progress', (req: Request, res: Response) => {
  const { teamId, answeredCount, score, totalAssigned } = req.body;
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

    broadcast('team_progress', {
      teamId,
      report,
      teamProgress: gameState.teamProgress,
    });

    res.json({ success: true, report });
  } else {
    res.status(400).json({ success: false, message: 'Missing teamId' });
  }
});

// 7. SSE stream for synchronized real-time game start & timer across all devices
app.get('/api/game/stream', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  checkExpiration();

  // Send initial authoritative state immediately
  res.write(
    `event: state\ndata: ${JSON.stringify({ ...gameState, serverTimeMs: Date.now() })}\n\n`
  );

  sseClients.add(res);

  // Heartbeat ping to prevent connection timeout
  const pingInterval = setInterval(() => {
    try {
      checkExpiration();
      res.write(': ping\n\n');
    } catch {
      clearInterval(pingInterval);
      sseClients.delete(res);
    }
  }, 10000);

  req.on('close', () => {
    clearInterval(pingInterval);
    sseClients.delete(res);
  });
});

// Regular server-side timer tick to catch expiration
setInterval(() => {
  checkExpiration();
}, 1000);

// Vite middleware or static serving
async function setupServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vulture Arena server listening on port ${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
