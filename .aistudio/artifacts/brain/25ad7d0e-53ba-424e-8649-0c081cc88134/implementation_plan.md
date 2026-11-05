# Game Synchronization Stability & Fallback Polling Fix

Stabilize real-time synchronization between teacher and student devices by decoupling clock skew updates from the main sync `useEffect` lifecycle and converting unconditional 2.5s REST polling into an intelligent fallback when SSE is offline.

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Zero Disruption to Existing Logic**: All 75 questions, teams, posters, timers, access PINs, scores, photos, and administrator controls remain 100% untouched.
> - **No Server Endpoint Changes**: The existing server endpoints (`/api/game/state`, `/api/game/stream`, `/api/game/start`, `/api/game/pause`, `/api/game/reset`, `/api/game/team-progress`) remain unmodified.
> - **Guaranteed Zero-Miss on Reconnection**: On SSE reconnect, the client immediately requests a full state snapshot from `/api/game/state` so no state transitions (pause, start, expire, reset) can ever be missed.

## 1. Overview & Problem Diagnosis

Currently in `src/App.tsx`:
1. `serverClockOffsetMs` is in the dependency array of the sync `useEffect`. Every time state arrives with `serverTimeMs`, `applySyncedState` calculates skew and calls `setServerClockOffsetMs(skew)`. Because millisecond jitter is unavoidable, `serverClockOffsetMs` triggers an effect cleanup that abruptly terminates `sse.close()` and tears down the stream.
2. Unconditional REST polling runs every 2.5 seconds via `setInterval(checkServerState, 2500)` regardless of SSE health, constantly re-triggering the above clock skew loop and flooding the network.
3. Because student devices are stuck in a persistent SSE teardown/reconnect cycle, server broadcast events like `game_paused` or `game_started` can be dropped when they coincide with the reconnection window.

## 2. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       Server State                          │
│     (Authoritative State, SSE Broadcasts, REST State API)    │
└──────────────────────────┬──────────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
    ┌─────────────────┐         ┌──────────────────┐
    │   SSE Stream    │         │ REST Fallback    │
    │ /api/game/stream│         │ /api/game/state  │
    └────────┬────────┘         └────────┬─────────┘
             │ Connected                 │ Only if SSE
             │                           │ disconnected/error
             ▼                           ▼
    ┌──────────────────────────────────────────────┐
    │              applySyncedState()              │
    │  - Reads clock skew via serverClockOffsetRef │
    │  - Updates serverClockOffsetMs only on jitter│
    │  - Updates isGameStarted, timers & progress  │
    └──────────────────────────────────────────────┘
```

## 3. Targeted File & Function Modifications

### File: `/src/App.tsx`

#### Function / Hook 1: Clock Skew Decoupling (`serverClockOffsetMsRef`)
- **Location**: Near `const [serverClockOffsetMs, setServerClockOffsetMs] = useState<number>(0);` (~line 341) and inside `applySyncedState` (~line 379).
- **Modification**:
  - Introduce `const serverClockOffsetMsRef = useRef<number>(0);` and `const hasDismissedExpiredModalRef = useRef<boolean>(false);`.
  - In `applySyncedState`:
    ```typescript
    if (typeof data.serverTimeMs === 'number') {
      const skew = data.serverTimeMs - Date.now();
      serverClockOffsetMsRef.current = skew;
      // Only trigger component re-render if skew changed significantly (> 500ms),
      // preventing unnecessary re-renders while keeping LiveGameTimer accurate
      setServerClockOffsetMs((prev) => (Math.abs(prev - skew) > 500 ? skew : prev));
    }
    ```
  - When calculating `effectiveNow` in `applySyncedState`: use `serverClockOffsetMsRef.current`.
  - In the sync `useEffect` dependency array: change from `[syncChannel, serverClockOffsetMs, hasDismissedExpiredModal]` to `[syncChannel]`.
  - **Result**: The sync effect mounts once and maintains a permanent, undisturbed SSE connection without lifecycle churn.

#### Function / Hook 2: Intelligent Fallback REST Polling & Reconnect Catch-Up
- **Location**: Inside the sync `useEffect` (~lines 443–553).
- **Modification**:
  - Implement dynamic fallback polling management:
    - On mount: Call `checkServerState()` once to guarantee immediate initial state hydration before SSE handshake completes.
    - On `sse.onopen`: Clear any active fallback polling interval (`clearInterval(pollInterval); pollInterval = null;`). SSE is now primary. Immediately call `checkServerState()` to reconcile any state changes that occurred during handshake or reconnect.
    - On `sse.onerror`: If SSE connection drops or fails, start `pollInterval = setInterval(checkServerState, 3000)` so the client continues updating state seamlessly until SSE reconnects.
  - Keep `BroadcastChannel` and storage event listeners intact for instant same-browser cross-tab updates.

## 4. How Missed Game Events Are Prevented

1. **Immediate Reconciliation on Handshake/Reconnect**: Whenever `sse.onopen` triggers (both initially and after any network reconnect), `checkServerState()` is called immediately. This pulls the latest authoritative server snapshot, applying any events (pause, resume, start, expire, reset) that fired while offline.
2. **Seamless Fallback Polling**: While SSE is disconnected, REST polling every 3 seconds guarantees students never stay out of sync for more than one poll cycle.
3. **No Redundant Reconnects**: By decoupling `serverClockOffsetMs`, the SSE connection remains open indefinitely, eliminating the primary cause of missed events in the first place.

## 5. Verification Plan

- Verify compilation and lint passes with zero errors.
- Verify SSE stream connects and remains continuously connected without cyclic restarts.
- Verify REST polling halts while SSE is connected, and automatically resumes if SSE disconnects.
- Verify Admin Start, Pause, Resume, Reset, and Timer expiration trigger immediate UI updates across tabs and views.
- Verify all 75 questions, teams, posters, student PIN flows, and scores remain fully operational.
