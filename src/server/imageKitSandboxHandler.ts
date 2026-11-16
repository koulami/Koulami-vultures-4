/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import type { IncomingMessage, ServerResponse } from 'http';
import { getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let envLoaded = false;
function ensureEnvLoaded() {
  if (envLoaded) return;
  envLoaded = true;
  try {
    dotenv.config();
  } catch {
    // Process environment variables provided by Cloud Run / AI Studio remain intact
  }
}

export const SANDBOX_FOLDER = '/vulture-arena/test-sandbox/';
export const SANDBOX_LIST_PATH = '/vulture-arena/test-sandbox';
export const SANDBOX_QR_TOKEN = 'VA-TEST-IMAGEKIT-2026';
export const AUTHORIZED_ADMIN_EMAIL = 'koulami34@gmail.com';
export const SANDBOX_CLEANUP_CONFIRM_PHRASE = 'DELETE_SANDBOX_MEDIA';

const SANDBOX_SLOTS = {
  image: {
    tag: 'test-ik-image-1',
    expectedKind: 'image' as const,
  },
  video: {
    tag: 'test-ik-video-1',
    expectedKind: 'video' as const,
  },
} as const;

type SandboxSlot = keyof typeof SANDBOX_SLOTS;

interface ImageKitEnvConfig {
  configured: boolean;
  missingVars: string[];
  urlEndpoint: string;
  publicKey: string;
  privateKey: string;
}

function isPlaceholderValue(val: string): boolean {
  if (!val) return true;
  const upper = val.toUpperCase();
  return (
    upper.includes('MY_IMAGEKIT_') ||
    upper.includes('YOUR_IMAGEKIT_ID') ||
    upper === 'PLACEHOLDER'
  );
}

function getImageKitConfig(): ImageKitEnvConfig {
  ensureEnvLoaded();
  const urlEndpoint = (process.env.IMAGEKIT_URL_ENDPOINT || '').trim().replace(/\/+$/, '');
  const publicKey = (process.env.IMAGEKIT_PUBLIC_KEY || '').trim();
  const privateKey = (process.env.IMAGEKIT_PRIVATE_KEY || '').trim();

  const missingVars: string[] = [];
  if (isPlaceholderValue(urlEndpoint) || !urlEndpoint.startsWith('https://')) {
    missingVars.push('IMAGEKIT_URL_ENDPOINT');
  }
  if (isPlaceholderValue(publicKey)) {
    missingVars.push('IMAGEKIT_PUBLIC_KEY');
  }
  if (isPlaceholderValue(privateKey)) {
    missingVars.push('IMAGEKIT_PRIVATE_KEY');
  }

  return {
    configured: missingVars.length === 0,
    missingVars,
    urlEndpoint,
    publicKey,
    privateKey,
  };
}

let cachedProjectId: string | null = null;
function getFirebaseProjectId(): string {
  if (cachedProjectId) return cachedProjectId;
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (typeof parsed?.projectId === 'string' && parsed.projectId.trim().length > 0) {
      const pid = parsed.projectId.trim();
      cachedProjectId = pid;
      return pid;
    }
  } catch (err) {
    console.warn('Could not read firebase-applet-config.json for projectId:', err);
  }
  cachedProjectId = 'gen-lang-client-0967635155';
  return cachedProjectId;
}

function getFirebaseAdminApp(): App {
  const appName = 'imagekit-sandbox-admin';
  const existing = getApps().find((app) => app.name === appName);
  if (existing) return existing;
  return initializeApp({ projectId: getFirebaseProjectId() }, appName);
}

interface VerifiedTeacherIdentity {
  uid: string;
  email: string;
}

async function verifyTeacherAdminToken(
  req: IncomingMessage
): Promise<{ ok: true; admin: VerifiedTeacherIdentity } | { ok: false; status: number; message: string }> {
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return {
      ok: false,
      status: 401,
      message: 'Authentication required: Missing Bearer Firebase ID token.',
    };
  }

  const idToken = authHeader.slice('Bearer '.length).trim();
  if (!idToken || idToken.length > 8192) {
    return {
      ok: false,
      status: 401,
      message: 'Authentication failed: Invalid Bearer token format.',
    };
  }

  try {
    const adminApp = getFirebaseAdminApp();
    const decoded = await getAuth(adminApp).verifyIdToken(idToken);
    const email = typeof decoded.email === 'string' ? decoded.email.trim().toLowerCase() : '';

    if (decoded.email_verified !== true || email !== AUTHORIZED_ADMIN_EMAIL) {
      return {
        ok: false,
        status: 403,
        message: 'Forbidden: Only verified teacher account koulami34@gmail.com is authorized.',
      };
    }

    return {
      ok: true,
      admin: {
        uid: decoded.uid,
        email,
      },
    };
  } catch {
    return {
      ok: false,
      status: 401,
      message: 'Authentication failed: Invalid or expired Firebase ID token.',
    };
  }
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const existingBody = (req as unknown as { body?: unknown }).body;
  if (existingBody && typeof existingBody === 'object' && !Array.isArray(existingBody)) {
    return Promise.resolve(existingBody as Record<string, unknown>);
  }
  return new Promise((resolve) => {
    let body = '';
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size <= 64 * 1024) {
        body += chunk;
      }
    });
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        resolve(parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

interface ImageKitFileItem {
  type?: string;
  fileId?: string;
  name?: string;
  filePath?: string;
  tags?: unknown;
  url?: string;
  size?: number;
  fileType?: string;
  mime?: string;
  width?: number;
  height?: number;
  duration?: number;
  createdAt?: string;
  updatedAt?: string;
}

function isValidSandboxFileForSlot(item: ImageKitFileItem, slot: SandboxSlot): boolean {
  if (!item || typeof item !== 'object') return false;
  if (item.type !== 'file') return false;
  if (typeof item.filePath !== 'string' || !item.filePath.startsWith(SANDBOX_FOLDER)) return false;
  if (typeof item.url !== 'string' || !item.url.startsWith('https://')) return false;

  const expectedTag = SANDBOX_SLOTS[slot].tag;
  if (!Array.isArray(item.tags) || !item.tags.includes(expectedTag)) return false;

  if (slot === 'image') {
    return item.fileType === 'image';
  }

  // Video slot validation: ImageKit classifies MP4 under fileType === 'non-image'
  const mime = typeof item.mime === 'string' ? item.mime.toLowerCase() : '';
  const name = typeof item.name === 'string' ? item.name.toLowerCase() : '';
  return (
    item.fileType !== 'image' &&
    (mime.startsWith('video/') || name.endsWith('.mp4') || mime === '')
  );
}

async function listValidatedSandboxFiles(
  cfg: ImageKitEnvConfig,
  slot: SandboxSlot,
  limit = 10
): Promise<
  | { ok: true; matches: ImageKitFileItem[] }
  | { ok: false; status: number; message: string }
> {
  const slotCfg = SANDBOX_SLOTS[slot];
  const query = new URLSearchParams({
    path: SANDBOX_LIST_PATH,
    tags: slotCfg.tag,
    sort: 'DESC_CREATED',
    limit: String(limit),
  });

  const basicAuth = Buffer.from(`${cfg.privateKey}:`, 'utf-8').toString('base64');

  let upstreamRes: globalThis.Response;
  try {
    upstreamRes = await fetch(`https://api.imagekit.io/v1/files?${query.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });
  } catch (err: unknown) {
    return {
      ok: false,
      status: 502,
      message: `Failed to reach ImageKit API: ${err instanceof Error ? err.message : 'Network error'}`,
    };
  }

  if (upstreamRes.status === 429) {
    const resetHeader = upstreamRes.headers.get('X-RateLimit-Reset');
    return {
      ok: false,
      status: 429,
      message: resetHeader
        ? `ImageKit API rate limit reached. Try again after reset (${resetHeader}).`
        : 'ImageKit API rate limit reached. Please retry in a few seconds.',
    };
  }

  if (!upstreamRes.ok) {
    return {
      ok: false,
      status: upstreamRes.status === 401 || upstreamRes.status === 403 ? 502 : upstreamRes.status,
      message: `ImageKit List Files API returned HTTP ${upstreamRes.status}. Verify IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT.`,
    };
  }

  let rawItems: unknown;
  try {
    rawItems = await upstreamRes.json();
  } catch {
    return {
      ok: false,
      status: 502,
      message: 'ImageKit List Files API returned invalid JSON.',
    };
  }

  if (!Array.isArray(rawItems)) {
    return {
      ok: false,
      status: 502,
      message: 'Unexpected response format from ImageKit List Files API.',
    };
  }

  const matches = (rawItems as ImageKitFileItem[]).filter((item) =>
    isValidSandboxFileForSlot(item, slot)
  );

  return { ok: true, matches };
}

export async function handleImageKitSandboxApiRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const url = req.url || '';
  if (!url.startsWith('/api/imagekit')) {
    return false;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return true;
  }

  const parsedUrl = new URL(url, 'http://localhost');
  const cleanPath = parsedUrl.pathname;

  // 1. GET /api/imagekit/status - Check whether ImageKit Secrets are configured (never exposes secrets)
  if (req.method === 'GET' && cleanPath === '/api/imagekit/status') {
    const cfg = getImageKitConfig();
    sendJson(res, 200, {
      success: true,
      configured: cfg.configured,
      missingVars: cfg.missingVars,
      sandboxFolder: SANDBOX_FOLDER,
      sandboxQrToken: SANDBOX_QR_TOKEN,
    });
    return true;
  }

  // 2. POST /api/imagekit/auth - Teacher Admin-verified upload signature (HMAC-SHA1)
  if (req.method === 'POST' && cleanPath === '/api/imagekit/auth') {
    const authCheck = await verifyTeacherAdminToken(req);
    if (!authCheck.ok) {
      sendJson(res, authCheck.status, {
        success: false,
        message: authCheck.message,
      });
      return true;
    }

    const body = await parseJsonBody(req);
    const slot = body.slot;
    if (slot !== 'image' && slot !== 'video') {
      sendJson(res, 400, {
        success: false,
        message: 'Invalid sandbox slot. Allowed values: image, video.',
      });
      return true;
    }

    const cfg = getImageKitConfig();
    if (!cfg.configured) {
      sendJson(res, 503, {
        success: false,
        configured: false,
        missingVars: cfg.missingVars,
        message: `ImageKit environment variables are not configured: ${cfg.missingVars.join(', ')}`,
      });
      return true;
    }

    const token = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 300; // 5 minutes validity
    const signature = crypto
      .createHmac('sha1', cfg.privateKey)
      .update(`${token}${expire}`)
      .digest('hex');

    sendJson(res, 200, {
      success: true,
      slot,
      token,
      expire,
      signature,
      publicKey: cfg.publicKey,
      urlEndpoint: cfg.urlEndpoint,
      folder: SANDBOX_FOLDER,
      tag: SANDBOX_SLOTS[slot].tag,
      useUniqueFileName: true,
    });
    return true;
  }

  // 3. GET /api/imagekit/test-ref?slot=image|video - Strictly scoped public lookup for isolated sandbox
  if (req.method === 'GET' && cleanPath === '/api/imagekit/test-ref') {
    // Reject any unexpected query parameters to prevent general-purpose search probing
    for (const key of parsedUrl.searchParams.keys()) {
      if (key !== 'slot') {
        sendJson(res, 400, {
          success: false,
          message: `Unsupported query parameter "${key}". Only "slot" is permitted.`,
        });
        return true;
      }
    }

    const slot = parsedUrl.searchParams.get('slot');
    if (slot !== 'image' && slot !== 'video') {
      sendJson(res, 400, {
        success: false,
        message: 'Invalid slot parameter. Allowed values: image, video.',
      });
      return true;
    }

    const cfg = getImageKitConfig();
    if (!cfg.configured) {
      sendJson(res, 503, {
        success: false,
        configured: false,
        missingVars: cfg.missingVars,
        found: false,
        slot,
        duplicateCount: 0,
        hasDuplicates: false,
        media: null,
        message: `ImageKit is not configured. Missing server Secrets: ${cfg.missingVars.join(', ')}`,
      });
      return true;
    }

    const lookup = await listValidatedSandboxFiles(cfg, slot, 10);
    if (!lookup.ok) {
      sendJson(res, lookup.status, {
        success: false,
        configured: true,
        found: false,
        slot,
        duplicateCount: 0,
        hasDuplicates: false,
        media: null,
        message: lookup.message,
      });
      return true;
    }

    const matches = lookup.matches;
    const latest = matches[0] || null;
    const expectedTag = SANDBOX_SLOTS[slot].tag;

    sendJson(res, 200, {
      success: true,
      configured: true,
      found: Boolean(latest),
      slot,
      expectedFolder: SANDBOX_FOLDER,
      expectedTag,
      duplicateCount: matches.length,
      hasDuplicates: matches.length > 1,
      media: latest
        ? {
            url: latest.url,
            name: latest.name || '',
            size: typeof latest.size === 'number' ? latest.size : 0,
            fileType: latest.fileType || '',
            mime: latest.mime || (slot === 'video' ? 'video/mp4' : 'image/*'),
            width: typeof latest.width === 'number' ? latest.width : null,
            height: typeof latest.height === 'number' ? latest.height : null,
            duration: typeof latest.duration === 'number' ? latest.duration : null,
            createdAt: latest.createdAt || null,
            updatedAt: latest.updatedAt || null,
          }
        : null,
    });
    return true;
  }

  // 4. POST /api/imagekit/sandbox-cleanup - Admin-only manual cleanup with explicit confirmation phrase
  if (req.method === 'POST' && cleanPath === '/api/imagekit/sandbox-cleanup') {
    const authCheck = await verifyTeacherAdminToken(req);
    if (!authCheck.ok) {
      sendJson(res, authCheck.status, {
        success: false,
        message: authCheck.message,
      });
      return true;
    }

    const body = await parseJsonBody(req);
    const slot = body.slot;
    const confirmPhrase = body.confirmPhrase;

    if (slot !== 'image' && slot !== 'video') {
      sendJson(res, 400, {
        success: false,
        message: 'Invalid sandbox slot. Allowed values: image, video.',
      });
      return true;
    }

    if (confirmPhrase !== SANDBOX_CLEANUP_CONFIRM_PHRASE) {
      sendJson(res, 400, {
        success: false,
        message: 'Explicit cleanup confirmation phrase is required.',
      });
      return true;
    }

    const cfg = getImageKitConfig();
    if (!cfg.configured) {
      sendJson(res, 503, {
        success: false,
        configured: false,
        missingVars: cfg.missingVars,
        message: `ImageKit is not configured: ${cfg.missingVars.join(', ')}`,
      });
      return true;
    }

    const lookup = await listValidatedSandboxFiles(cfg, slot, 25);
    if (!lookup.ok) {
      sendJson(res, lookup.status, {
        success: false,
        message: lookup.message,
      });
      return true;
    }

    const basicAuth = Buffer.from(`${cfg.privateKey}:`, 'utf-8').toString('base64');
    const deletedNames: string[] = [];

    for (const file of lookup.matches) {
      if (!file.fileId || !isValidSandboxFileForSlot(file, slot)) continue;
      const delRes = await fetch(
        `https://api.imagekit.io/v1/files/${encodeURIComponent(file.fileId)}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Basic ${basicAuth}`,
          },
        }
      );
      if (delRes.ok || delRes.status === 204) {
        deletedNames.push(file.name || file.fileId);
      }
    }

    sendJson(res, 200, {
      success: true,
      slot,
      deletedCount: deletedNames.length,
      deletedNames,
    });
    return true;
  }

  sendJson(res, 404, {
    success: false,
    message: 'Unknown ImageKit sandbox endpoint.',
  });
  return true;
}
