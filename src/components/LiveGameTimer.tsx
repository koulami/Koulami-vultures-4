/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface LiveGameTimerProps {
  isStarted: boolean;
  endsAtMs: number | null;
  serverClockOffsetMs?: number;
  language: 'el' | 'en';
  onExpire?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const LiveGameTimer: React.FC<LiveGameTimerProps> = ({
  isStarted,
  endsAtMs,
  serverClockOffsetMs = 0,
  language,
  onExpire,
  size = 'md',
  showLabel = true,
}) => {
  const isEn = language === 'en';
  const [remainingMs, setRemainingMs] = useState<number>(() => {
    if (!isStarted || !endsAtMs) return 0;
    const now = Date.now() + serverClockOffsetMs;
    return Math.max(0, endsAtMs - now);
  });

  const hasFiredExpireRef = React.useRef<boolean>(false);

  // Reset expire trigger if a fresh game session or future endsAtMs is set
  useEffect(() => {
    if (endsAtMs && endsAtMs > Date.now() + serverClockOffsetMs) {
      hasFiredExpireRef.current = false;
    }
  }, [endsAtMs, serverClockOffsetMs]);

  useEffect(() => {
    if (!isStarted || !endsAtMs) {
      setRemainingMs(0);
      return;
    }

    const updateRemaining = () => {
      const now = Date.now() + serverClockOffsetMs;
      const rem = Math.max(0, endsAtMs - now);
      setRemainingMs(rem);

      // CRITICAL: Only fire onExpire ONCE when transitioning to expired, NEVER repeatedly in the loop
      if (rem <= 0 && onExpire && !hasFiredExpireRef.current) {
        hasFiredExpireRef.current = true;
        onExpire();
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 250); // High-precision real-time update

    return () => clearInterval(interval);
  }, [isStarted, endsAtMs, serverClockOffsetMs, onExpire]);

  if (!isStarted || !endsAtMs) {
    return null;
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isExpired = remainingMs <= 0;
  const isCritical = !isExpired && remainingMs < 120000; // < 2 minutes
  const isWarning = !isExpired && !isCritical && remainingMs < 300000; // < 5 minutes

  // Visual Styling classes
  let containerStyle = 'bg-stone-900/90 text-amber-400 border-stone-700 shadow-md';
  let badgeStyle = 'bg-amber-500/20 text-amber-400 border-amber-500/40';

  if (isExpired) {
    containerStyle = 'bg-rose-950/90 text-rose-300 border-rose-700 shadow-rose-950/50 animate-pulse';
    badgeStyle = 'bg-rose-600 text-white border-rose-500';
  } else if (isCritical) {
    containerStyle = 'bg-rose-900/90 text-rose-200 border-rose-500 ring-2 ring-rose-500/50 shadow-lg animate-pulse';
    badgeStyle = 'bg-rose-500 text-white border-rose-400';
  } else if (isWarning) {
    containerStyle = 'bg-amber-950/90 text-amber-300 border-amber-600 ring-1 ring-amber-500/40';
    badgeStyle = 'bg-amber-500 text-stone-950 border-amber-400 font-black';
  }

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base sm:text-lg gap-3',
  }[size];

  const timeTextSize = {
    sm: 'text-xs',
    md: 'text-sm font-black',
    lg: 'text-lg sm:text-xl font-black tracking-wider',
  }[size];

  return (
    <div
      className={`inline-flex items-center rounded-2xl border transition-all ${containerStyle} ${sizeClasses}`}
      role="timer"
      aria-live="polite"
      title={
        isExpired
          ? (isEn ? 'Time has expired' : 'Ο χρόνος έχει λήξει')
          : (isEn ? `Time remaining: ${formattedTime}` : `Απομένουν: ${formattedTime}`)
      }
    >
      <div className="flex items-center gap-1.5">
        <Clock
          className={`shrink-0 ${
            size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
          } ${isCritical || isExpired ? 'animate-spin text-rose-400' : 'text-amber-400'}`}
        />
        {showLabel && (
          <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider opacity-80">
            {isExpired
              ? (isEn ? 'Time Ended:' : 'Τέλος Χρόνου:')
              : (isEn ? 'Time Left:' : 'Χρόνος:')}
          </span>
        )}
      </div>

      <span className={`font-mono tabular-nums ${timeTextSize}`}>
        {isExpired ? '00:00' : formattedTime}
      </span>

      {isExpired ? (
        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white tracking-widest shrink-0">
          {isEn ? 'EXPIRED' : 'ΕΛΗΞΕ'}
        </span>
      ) : isCritical ? (
        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300 tracking-wider shrink-0 hidden sm:inline">
          {isEn ? 'HURRY' : 'ΤΕΛΕΥΤΑΙΑ ΛΕΠΤΑ'}
        </span>
      ) : null}
    </div>
  );
};
