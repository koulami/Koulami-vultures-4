/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ImageIcon,
  Video,
  QrCode,
  Camera,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { QRCameraScanner } from './QRCameraScanner';
import {
  SANDBOX_QR_TOKEN,
  fetchImageKitStatus,
  fetchSandboxMediaRef,
  probeVideoRangeSupport,
  formatBytesCompact,
  type ImageKitStatusResponse,
  type SandboxTestRefResponse,
  type RangeProbeResult,
} from '../utils/imageKitSandboxClient';

export const ImageKitStudentSandboxView: React.FC = () => {
  const [language, setLanguage] = useState<'el' | 'en'>('el');
  const isEn = language === 'en';

  const [statusInfo, setStatusInfo] = useState<ImageKitStatusResponse | null>(null);
  const [imageRefData, setImageRefData] = useState<SandboxTestRefResponse | null>(null);
  const [videoRefData, setVideoRefData] = useState<SandboxTestRefResponse | null>(null);
  const [loadingImage, setLoadingImage] = useState<boolean>(true);
  const [loadingVideo, setLoadingVideo] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [qrInput, setQrInput] = useState<string>('');
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [unlockedToken, setUnlockedToken] = useState<string | null>(null);
  const [qrInvalidMessage, setQrInvalidMessage] = useState<string | null>(null);

  const [videoMetaInfo, setVideoMetaInfo] = useState<{
    duration: number;
    width: number;
    height: number;
    currentTime: number;
  } | null>(null);
  const [rangeProbe, setRangeProbe] = useState<RangeProbeResult | null>(null);
  const [probingRange, setProbingRange] = useState<boolean>(false);

  const loadImageSlot = useCallback(async () => {
    setLoadingImage(true);
    setErrorMessage(null);
    try {
      const status = await fetchImageKitStatus();
      setStatusInfo(status);
      if (status.configured) {
        const imgRes = await fetchSandboxMediaRef('image');
        setImageRefData(imgRes);
      } else {
        setImageRefData(null);
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to query ImageKit sandbox image.'
      );
    } finally {
      setLoadingImage(false);
    }
  }, []);

  const loadVideoSlot = useCallback(async () => {
    setLoadingVideo(true);
    setErrorMessage(null);
    setVideoMetaInfo(null);
    setRangeProbe(null);
    try {
      const vidRes = await fetchSandboxMediaRef('video');
      setVideoRefData(vidRes);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to query ImageKit sandbox video.'
      );
    } finally {
      setLoadingVideo(false);
    }
  }, []);

  useEffect(() => {
    loadImageSlot();
  }, [loadImageSlot]);

  const verifySandboxQrToken = (rawToken: string) => {
    const normalized = rawToken.trim().toUpperCase();
    if (!normalized) return;

    if (normalized === SANDBOX_QR_TOKEN) {
      setQrInvalidMessage(null);
      setUnlockedToken(normalized);
      loadVideoSlot();
    } else {
      setUnlockedToken(null);
      setVideoRefData(null);
      setQrInvalidMessage(
        isEn
          ? `Token "${normalized}" is not valid here. Sandbox accepts ONLY ${SANDBOX_QR_TOKEN}.`
          : `Ο κωδικός «${normalized}» δεν ισχύει εδώ. Το Sandbox δέχεται ΜΟΝΟ το ${SANDBOX_QR_TOKEN}.`
      );
    }
  };

  const handleQrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifySandboxQrToken(qrInput);
  };

  const handleRangeProbe = async () => {
    const url = videoRefData?.media?.url;
    if (!url) return;
    setProbingRange(true);
    const result = await probeVideoRangeSupport(url);
    setRangeProbe(result);
    setProbingRange(false);
  };

  const normalAppHref =
    typeof window !== 'undefined' ? window.location.pathname || '/' : '/';

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans antialiased flex flex-col">
      {/* Compact Student Sandbox Header */}
      <header className="bg-stone-900 text-stone-100 border-b border-stone-800 px-4 sm:px-6 py-2.5 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-black text-amber-400">
                {isEn ? 'Field Station Sandbox' : 'Σταθμός Δοκιμής Πολυμέσων'}
              </h1>
              <p className="text-[11px] text-stone-400 font-mono">
                ?mediaSandbox=1
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage((prev) => (prev === 'el' ? 'en' : 'el'))}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold cursor-pointer border border-stone-700"
            >
              {language === 'el' ? 'EN' : 'ΕΛ'}
            </button>
            <a
              href={normalAppHref}
              className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-stone-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isEn ? 'Normal App' : 'Κανονική Εφαρμογή'}</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-5 flex-1">
        {/* Status / Config Alert */}
        {statusInfo && !statusInfo.configured && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {isEn
                  ? 'Media storage is not configured on this server yet.'
                  : 'Η αποθήκευση πολυμέσων δεν έχει ρυθμιστεί ακόμη σε αυτόν τον διακομιστή.'}
              </span>
            </p>
            <p className="text-amber-900">
              {isEn
                ? 'Ask the teacher to add IMAGEKIT_URL_ENDPOINT, IMAGEKIT_PUBLIC_KEY, and IMAGEKIT_PRIVATE_KEY in AI Studio Secrets.'
                : 'Ο εκπαιδευτικός πρέπει να προσθέσει τα IMAGEKIT_URL_ENDPOINT, IMAGEKIT_PUBLIC_KEY και IMAGEKIT_PRIVATE_KEY στα Secrets.'}
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* PRIMARY ABOVE-THE-FOLD SECTION: Student Token Entry, QR Scanning & Video Playback */}
        <section className="bg-white rounded-3xl border border-stone-200 shadow-sm p-4 sm:p-6 space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-base">
                {isEn
                  ? 'Unlock Station Video'
                  : 'Ξεκλείδωμα Βίντεο Σταθμού QR'}
              </h2>
              <p className="text-xs text-stone-500">
                {isEn
                  ? 'Scan the station QR code or type the station token below'
                  : 'Σαρώστε τον κωδικό QR του σταθμού ή πληκτρολογήστε τον κωδικό παρακάτω'}
              </p>
            </div>
          </div>

          <form onSubmit={handleQrSubmit} className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <QrCode className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder={isEn ? 'Enter station token...' : 'Εισαγωγή κωδικού σταθμού...'}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold cursor-pointer"
            >
              {isEn ? 'Unlock Video' : 'Έλεγχος Κωδικού'}
            </button>

            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>{isEn ? 'Scan QR' : 'Σάρωση QR'}</span>
            </button>
          </form>

          {qrInvalidMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{qrInvalidMessage}</span>
            </div>
          )}

          {unlockedToken === SANDBOX_QR_TOKEN && (
            <div className="pt-2 border-t border-stone-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-2.5 rounded-xl text-xs font-bold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {isEn
                      ? `Token ${SANDBOX_QR_TOKEN} verified!`
                      : `Ο κωδικός ${SANDBOX_QR_TOKEN} επαληθεύτηκε!`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={loadVideoSlot}
                  disabled={loadingVideo}
                  className="text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw
                    className={`w-3 h-3 ${loadingVideo ? 'animate-spin' : ''}`}
                  />
                  <span>{isEn ? 'Refresh' : 'Ανανέωση'}</span>
                </button>
              </div>

              {videoRefData?.hasDuplicates && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs">
                  {isEn
                    ? `Notice: ${videoRefData.duplicateCount} matching test videos exist in ImageKit; playing the most recent one.`
                    : `Σημείωση: Υπάρχουν ${videoRefData.duplicateCount} δοκιμαστικά βίντεο στο ImageKit· αναπαράγεται το πιο πρόσφατο.`}
                </div>
              )}

              {loadingVideo ? (
                <div className="p-8 text-center text-xs text-stone-500">
                  {isEn ? 'Loading station video...' : 'Φόρτωση βίντεο σταθμού...'}
                </div>
              ) : videoRefData?.found && videoRefData.media ? (
                <div className="space-y-3">
                  <div className="rounded-2xl overflow-hidden border border-stone-200 bg-black p-1.5">
                    <video
                      key={videoRefData.media.url}
                      src={videoRefData.media.url}
                      controls
                      playsInline
                      preload="metadata"
                      onLoadedMetadata={(e) => {
                        const v = e.currentTarget;
                        setVideoMetaInfo({
                          duration: v.duration,
                          width: v.videoWidth,
                          height: v.videoHeight,
                          currentTime: v.currentTime,
                        });
                      }}
                      onTimeUpdate={(e) => {
                        const v = e.currentTarget;
                        setVideoMetaInfo((prev) =>
                          prev
                            ? { ...prev, currentTime: v.currentTime }
                            : {
                                duration: v.duration,
                                width: v.videoWidth,
                                height: v.videoHeight,
                                currentTime: v.currentTime,
                              }
                        );
                      }}
                      className="w-full max-h-96 mx-auto rounded-xl bg-black"
                    />
                  </div>

                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-700 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono font-semibold truncate">
                        {videoRefData.media.name}
                      </span>
                      <span>{formatBytesCompact(videoRefData.media.size)}</span>
                    </div>
                    {videoMetaInfo && (
                      <p className="text-[11px] font-mono text-stone-600">
                        {isEn ? 'Stream ready:' : 'Έτοιμο για αναπαραγωγή:'}{' '}
                        {videoMetaInfo.width}×{videoMetaInfo.height} •{' '}
                        {videoMetaInfo.currentTime.toFixed(1)}s /{' '}
                        {Number.isFinite(videoMetaInfo.duration)
                          ? `${videoMetaInfo.duration.toFixed(1)}s`
                          : '--'}
                      </p>
                    )}

                    <div className="pt-1 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleRangeProbe}
                        disabled={probingRange}
                        className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Activity className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          {probingRange
                            ? isEn
                              ? 'Probing...'
                              : 'Έλεγχος...'
                            : isEn
                            ? 'Check HTTP 206 Range'
                            : 'Έλεγχος HTTP 206 Range'}
                        </span>
                      </button>
                      {rangeProbe && (
                        <span
                          className={`text-[11px] font-mono ${
                            rangeProbe.supported ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {rangeProbe.supported
                            ? rangeProbe.contentRange
                              ? `HTTP ${rangeProbe.status} • Content-Range: ${rangeProbe.contentRange} (${rangeProbe.receivedBytes ?? '?'} B)`
                              : `HTTP ${rangeProbe.status} Partial Content • ${rangeProbe.receivedBytes ?? rangeProbe.contentLength ?? '?'} B slice verified`
                            : `HTTP ${rangeProbe.status} • ${rangeProbe.error || 'Range request not 206'}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-stone-50 border border-dashed border-stone-300 text-center text-xs text-stone-500">
                  {isEn
                    ? 'No test MP4 video found yet. Ask the teacher to upload one first.'
                    : 'Δεν βρέθηκε ακόμη δοκιμαστικό βίντεο MP4.'}
                </div>
              )}
            </div>
          )}

          {isScannerOpen && (
            <QRCameraScanner
              expectedToken={SANDBOX_QR_TOKEN}
              language={language}
              onScanSuccess={(decoded) => {
                setQrInput(decoded);
                verifySandboxQrToken(decoded);
              }}
              onClose={() => setIsScannerOpen(false)}
            />
          )}
        </section>

        {/* SECONDARY SECTION BELOW: Persistent Test Image Verification */}
        <section className="bg-white rounded-3xl border border-stone-200 shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-stone-900 text-base">
                  {isEn
                    ? 'Station Test Photo'
                    : 'Δοκιμαστική Φωτογραφία Σταθμού'}
                </h2>
                <p className="text-xs text-stone-500">
                  {isEn
                    ? 'Persistent cross-device image preview'
                    : 'Προεπισκόπηση μόνιμης φωτογραφίας μεταξύ συσκευών'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadImageSlot}
              disabled={loadingImage}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loadingImage ? 'animate-spin' : ''}`}
              />
              <span>{isEn ? 'Reload' : 'Επαναφόρτωση'}</span>
            </button>
          </div>

          {imageRefData?.hasDuplicates && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs">
              {isEn
                ? `Notice: ${imageRefData.duplicateCount} matching test images exist; showing the most recent one.`
                : `Σημείωση: Υπάρχουν ${imageRefData.duplicateCount} δοκιμαστικές εικόνες· εμφανίζεται η πιο πρόσφατη.`}
            </div>
          )}

          {loadingImage ? (
            <div className="p-6 text-center text-xs text-stone-500">
              {isEn ? 'Loading test photo...' : 'Φόρτωση δοκιμαστικής φωτογραφίας...'}
            </div>
          ) : imageRefData?.found && imageRefData.media ? (
            <div className="space-y-3">
              <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-950 flex items-center justify-center p-2">
                <img
                  src={imageRefData.media.url}
                  alt={imageRefData.media.name || 'Sandbox test image'}
                  className="max-h-80 w-auto object-contain rounded-xl"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600 bg-stone-50 px-3.5 py-2.5 rounded-xl border border-stone-200">
                <span className="font-mono truncate">{imageRefData.media.name}</span>
                <span>
                  {formatBytesCompact(imageRefData.media.size)}
                  {imageRefData.media.width && imageRefData.media.height
                    ? ` • ${imageRefData.media.width}×${imageRefData.media.height}px`
                    : ''}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-stone-50 border border-dashed border-stone-300 text-center text-xs text-stone-500">
              {isEn
                ? 'No test photo found yet. Ask the teacher to upload one first.'
                : 'Δεν βρέθηκε ακόμη δοκιμαστική φωτογραφία.'}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
