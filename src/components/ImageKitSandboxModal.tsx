/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Upload,
  ImageIcon,
  Video,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  QrCode,
  Activity,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import {
  auth,
  googleProvider,
  AUTHORIZED_ADMIN_EMAIL,
  isAuthorizedAdminEmail,
} from '../utils/firebaseClient';
import {
  SANDBOX_FOLDER,
  SANDBOX_QR_TOKEN,
  SANDBOX_TAGS,
  fetchImageKitStatus,
  fetchSandboxMediaRef,
  uploadSandboxFileToImageKit,
  cleanupSandboxMedia,
  probeVideoRangeSupport,
  formatBytesCompact,
  type ImageKitStatusResponse,
  type SandboxTestRefResponse,
  type SandboxSlot,
  type RangeProbeResult,
} from '../utils/imageKitSandboxClient';

interface ImageKitSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'el' | 'en';
}

export const ImageKitSandboxModal: React.FC<ImageKitSandboxModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const isEn = language === 'en';

  const [firebaseUser, setFirebaseUser] = useState<User | null>(() => auth.currentUser);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [statusInfo, setStatusInfo] = useState<ImageKitStatusResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState<boolean>(false);

  const [imageRefData, setImageRefData] = useState<SandboxTestRefResponse | null>(null);
  const [videoRefData, setVideoRefData] = useState<SandboxTestRefResponse | null>(null);
  const [lookupLoading, setLookupLoading] = useState<boolean>(false);

  const [imageProgress, setImageProgress] = useState<number | null>(null);
  const [videoProgress, setVideoProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  const [rangeProbe, setRangeProbe] = useState<RangeProbeResult | null>(null);
  const [probingRange, setProbingRange] = useState<boolean>(false);

  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Two-step manual cleanup confirmation state (never automatic)
  const [cleanupTarget, setCleanupTarget] = useState<SandboxSlot | null>(null);
  const [cleanupConfirmText, setCleanupConfirmText] = useState<string>('');
  const [cleanupBusy, setCleanupBusy] = useState<boolean>(false);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsub();
  }, []);

  const isTeacherVerified = isAuthorizedAdminEmail(
    firebaseUser?.email,
    firebaseUser?.emailVerified
  );

  const loadSandboxState = useCallback(async () => {
    setStatusLoading(true);
    setLookupLoading(true);
    try {
      const status = await fetchImageKitStatus();
      setStatusInfo(status);
      if (status.configured) {
        const [imgRes, vidRes] = await Promise.all([
          fetchSandboxMediaRef('image'),
          fetchSandboxMediaRef('video'),
        ]);
        setImageRefData(imgRes);
        setVideoRefData(vidRes);
      } else {
        setImageRefData(null);
        setVideoRefData(null);
      }
    } catch (err: unknown) {
      setUploadError(
        err instanceof Error ? err.message : 'Failed to load ImageKit sandbox status.'
      );
    } finally {
      setStatusLoading(false);
      setLookupLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setUploadError(null);
      setUploadSuccessMsg(null);
      setRangeProbe(null);
      setCleanupTarget(null);
      setCleanupConfirmText('');
      loadSandboxState();
    }
  }, [isOpen, loadSandboxState]);

  if (!isOpen) return null;

  const studentSandboxUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?mediaSandbox=1`
      : '?mediaSandbox=1';

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (!isAuthorizedAdminEmail(cred.user.email, cred.user.emailVerified)) {
        setAuthError(
          isEn
            ? `Signed in as ${cred.user.email || 'unknown'}, but only ${AUTHORIZED_ADMIN_EMAIL} is authorized to sign sandbox uploads.`
            : `Συνδεθήκατε ως ${cred.user.email || 'άγνωστος'}, αλλά μόνο ο εξουσιοδοτημένος λογαριασμός ${AUTHORIZED_ADMIN_EMAIL} επιτρέπεται να ανεβάζει υλικό.`
        );
      }
    } catch (err: unknown) {
      setAuthError(
        err instanceof Error
          ? err.message
          : isEn
          ? 'Google sign-in popup could not complete.'
          : 'Η σύνδεση με Google δεν ολοκληρώθηκε.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignOut = async () => {
    setAuthError(null);
    await signOut(auth);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    slot: SandboxSlot
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadError(null);
    setUploadSuccessMsg(null);

    if (!statusInfo?.configured) {
      setUploadError(
        isEn
          ? 'ImageKit server Secrets are not configured yet. Configure them first before uploading.'
          : 'Οι μεταβλητές περιβάλλοντος ImageKit δεν έχουν ρυθμιστεί ακόμη στον διακομιστή.'
      );
      return;
    }

    if (!firebaseUser || !isTeacherVerified) {
      setUploadError(
        isEn
          ? `Please sign in with ${AUTHORIZED_ADMIN_EMAIL} first to authorize this upload.`
          : `Παρακαλούμε συνδεθείτε πρώτα με ${AUTHORIZED_ADMIN_EMAIL} για εξουσιοδότηση μεταφόρτωσης.`
      );
      return;
    }

    const setProgress = slot === 'image' ? setImageProgress : setVideoProgress;
    setProgress(0);

    try {
      const idToken = await firebaseUser.getIdToken(true);
      const uploaded = await uploadSandboxFileToImageKit({
        file,
        slot,
        idToken,
        onProgress: (pct) => setProgress(pct),
      });

      // Confirm live lookup immediately via ImageKit List Files API
      const refreshed = await fetchSandboxMediaRef(slot);
      if (slot === 'image') {
        setImageRefData(refreshed);
      } else {
        setVideoRefData(refreshed);
        setRangeProbe(null);
      }

      setUploadSuccessMsg(
        isEn
          ? `Uploaded "${uploaded.name}" (${formatBytesCompact(uploaded.size)}) to ImageKit folder ${SANDBOX_FOLDER} with tag "${SANDBOX_TAGS[slot]}".`
          : `Επιτυχής μεταφόρτωση «${uploaded.name}» (${formatBytesCompact(uploaded.size)}) στον φάκελο ${SANDBOX_FOLDER} με ετικέτα «${SANDBOX_TAGS[slot]}».`
      );
    } catch (err: unknown) {
      setUploadError(
        err instanceof Error ? err.message : 'Upload failed unexpectedly.'
      );
    } finally {
      setTimeout(() => setProgress(null), 1200);
    }
  };

  const handleRunRangeProbe = async () => {
    const url = videoRefData?.media?.url;
    if (!url) return;
    setProbingRange(true);
    const result = await probeVideoRangeSupport(url);
    setRangeProbe(result);
    setProbingRange(false);
  };

  const handleConfirmCleanup = async () => {
    if (!cleanupTarget || cleanupConfirmText.trim().toUpperCase() !== 'DELETE') return;
    if (!firebaseUser || !isTeacherVerified) return;

    setCleanupBusy(true);
    setUploadError(null);
    setUploadSuccessMsg(null);
    try {
      const idToken = await firebaseUser.getIdToken(true);
      const res = await cleanupSandboxMedia({ slot: cleanupTarget, idToken });
      const refreshed = await fetchSandboxMediaRef(cleanupTarget);
      if (cleanupTarget === 'image') {
        setImageRefData(refreshed);
      } else {
        setVideoRefData(refreshed);
        setRangeProbe(null);
      }
      setUploadSuccessMsg(
        isEn
          ? `Removed ${res.deletedCount} sandbox ${cleanupTarget} file(s) tagged "${SANDBOX_TAGS[cleanupTarget]}".`
          : `Διαγράφηκαν ${res.deletedCount} αρχεία δοκιμής (${cleanupTarget}) με ετικέτα «${SANDBOX_TAGS[cleanupTarget]}».`
      );
      setCleanupTarget(null);
      setCleanupConfirmText('');
    } catch (err: unknown) {
      setUploadError(
        err instanceof Error ? err.message : 'Manual sandbox cleanup failed.'
      );
    } finally {
      setCleanupBusy(false);
    }
  };

  const handleCopyStudentLink = async () => {
    try {
      await navigator.clipboard.writeText(studentSandboxUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Clipboard API unavailable in restricted iframe contexts
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-stone-200 max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-400">
                ImageKit Sandbox Test
              </h2>
              <p className="text-xs text-stone-400">
                {isEn
                  ? 'Isolated persistence verification (Option C) — Zero changes to existing 123 questions or classroom data'
                  : 'Απομονωμένη δοκιμή μόνιμης αποθήκευσης (Επιλογή C) — Καμία αλλαγή στις 123 ερωτήσεις ή στα δεδομένα τάξης'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
            aria-label={isEn ? 'Close' : 'Κλείσιμο'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm">
          {/* Strict Isolation Notice */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">
                {isEn
                  ? 'Protected Production Data Guarantee'
                  : 'Εγγύηση Προστασίας Υφιστάμενων Δεδομένων'}
              </p>
              <p className="text-emerald-900/90 leading-relaxed">
                {isEn
                  ? `This sandbox operates strictly inside ImageKit folder ${SANDBOX_FOLDER} using tags "${SANDBOX_TAGS.image}", "${SANDBOX_TAGS.video}", and test QR token ${SANDBOX_QR_TOKEN}. Existing questions (123), VA-PARK-VALUES-2026, VA-LIBRARY-THREATS-2026, IndexedDB, posters, teams, and Firestore are untouched.`
                  : `Αυτό το sandbox λειτουργεί αποκλειστικά στον φάκελο ${SANDBOX_FOLDER} με ετικέτες «${SANDBOX_TAGS.image}», «${SANDBOX_TAGS.video}» και δοκιμαστικό QR token ${SANDBOX_QR_TOKEN}. Οι 123 ερωτήσεις, τα υπάρχοντα QR, το IndexedDB, οι αφίσες και το Firestore παραμένουν απολύτως άθικτα.`}
              </p>
            </div>
          </div>

          {/* 1. Server ImageKit Configuration Check */}
          {statusLoading && !statusInfo ? (
            <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-stone-600 text-xs flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>
                {isEn
                  ? 'Checking server ImageKit configuration...'
                  : 'Έλεγχος ρυθμίσεων ImageKit στον διακομιστή...'}
              </span>
            </div>
          ) : statusInfo && !statusInfo.configured ? (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {isEn
                    ? 'ImageKit Server Environment Variables Missing'
                    : 'Λείπουν οι μεταβλητές περιβάλλοντος ImageKit στον διακομιστή'}
                </span>
              </div>
              <p className="leading-relaxed">
                {isEn
                  ? 'Uploads and lookups are disabled until you add the following free ImageKit account Secrets in AI Studio (Settings -> Secrets) and restart the dev server:'
                  : 'Οι μεταφορτώσεις και οι αναζητήσεις είναι απενεργοποιημένες μέχρι να προσθέσετε τα παρακάτω Secrets του δωρεάν λογαριασμού ImageKit στο AI Studio και να επανεκκινήσετε τον server:'}
              </p>
              <ul className="list-disc pl-5 font-mono text-[11px] space-y-0.5 text-amber-900">
                {statusInfo.missingVars.map((v) => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* 2. Teacher Google Identity Verification (Firebase Admin verifyIdToken target) */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5 text-xs">
              <div className="font-bold text-stone-900 flex items-center gap-1.5">
                <ShieldCheck
                  className={`w-4 h-4 ${
                    isTeacherVerified ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                />
                <span>
                  {isEn
                    ? 'Teacher Google Upload Authorization'
                    : 'Εξουσιοδότηση Μεταφόρτωσης Εκπαιδευτικού (Google)'}
                </span>
              </div>
              {firebaseUser ? (
                <p className="text-stone-600">
                  {isTeacherVerified ? (
                    <span className="text-emerald-700 font-semibold">
                      {isEn
                        ? `Verified teacher: ${firebaseUser.email}`
                        : `Επαληθευμένος εκπαιδευτικός: ${firebaseUser.email}`}
                    </span>
                  ) : (
                    <span className="text-rose-700 font-semibold">
                      {isEn
                        ? `Signed in as ${firebaseUser.email || 'unknown'} — requires ${AUTHORIZED_ADMIN_EMAIL}`
                        : `Συνδεδεμένος ως ${firebaseUser.email || 'άγνωστος'} — απαιτείται ${AUTHORIZED_ADMIN_EMAIL}`}
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-stone-500">
                  {isEn
                    ? `Sign in with ${AUTHORIZED_ADMIN_EMAIL} to obtain server-signed ImageKit upload tokens.`
                    : `Συνδεθείτε με ${AUTHORIZED_ADMIN_EMAIL} για λήψη υπογραφής μεταφόρτωσης από τον server.`}
                </p>
              )}
              {authError && (
                <p className="text-rose-600 font-semibold pt-1">{authError}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {firebaseUser ? (
                <button
                  type="button"
                  onClick={handleGoogleSignOut}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Switch / Sign Out' : 'Αποσύνδεση Google'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>
                    {authLoading
                      ? isEn
                        ? 'Signing in...'
                        : 'Σύνδεση...'
                      : isEn
                      ? 'Verify Google Account'
                      : 'Επαλήθευση Google'}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={loadSandboxState}
                disabled={lookupLoading}
                className="px-3 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${lookupLoading ? 'animate-spin' : ''}`}
                />
                <span>
                  {isEn ? 'Refresh from ImageKit' : 'Ανανέωση από ImageKit'}
                </span>
              </button>
            </div>
          </div>

          {/* Feedback Banners */}
          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{uploadSuccessMsg}</span>
            </div>
          )}

          {/* 3. Two Isolated Test Slots: Image & MP4 Video */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Slot A: Image */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-sky-600" />
                    <h3 className="font-bold text-stone-900 text-sm">
                      {isEn ? 'Test Image Slot' : 'Δοκιμαστική Εικόνα'}
                    </h3>
                  </div>
                  <code className="text-[11px] font-mono bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                    {SANDBOX_TAGS.image}
                  </code>
                </div>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'image')}
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={!statusInfo?.configured || !isTeacherVerified || imageProgress !== null}
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-stone-200 disabled:text-stone-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>
                    {imageProgress !== null
                      ? isEn
                        ? `Uploading... ${imageProgress}%`
                        : `Μεταφόρτωση... ${imageProgress}%`
                      : isEn
                      ? 'Upload Test Image (<= 25 MB)'
                      : 'Μεταφόρτωση Δοκιμαστικής Εικόνας (<= 25 MB)'}
                  </span>
                </button>

                {imageProgress !== null && (
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-600 transition-all duration-150"
                      style={{ width: `${imageProgress}%` }}
                    />
                  </div>
                )}

                {imageRefData?.hasDuplicates && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px]">
                    <strong>
                      {isEn ? 'Multiple matching files found:' : 'Εντοπίστηκαν πολλαπλά αρχεία:'}
                    </strong>{' '}
                    {imageRefData.duplicateCount}{' '}
                    {isEn
                      ? 'files match this tag in ImageKit (displaying newest). Automatic deletion is disabled.'
                      : 'αρχεία ταιριάζουν με αυτή την ετικέτα (προβάλλεται το νεότερο).'}
                  </div>
                )}

                {imageRefData?.found && imageRefData.media ? (
                  <div className="space-y-2 pt-1">
                    <div className="rounded-xl overflow-hidden border border-stone-200 bg-stone-950 flex items-center justify-center max-h-52">
                      <img
                        src={imageRefData.media.url}
                        alt={imageRefData.media.name || 'ImageKit Sandbox Test Image'}
                        className="max-h-52 w-auto object-contain"
                      />
                    </div>
                    <div className="text-[11px] text-stone-600 space-y-0.5 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <p className="font-mono truncate">
                        <strong>{isEn ? 'File:' : 'Αρχείο:'}</strong> {imageRefData.media.name}
                      </p>
                      <p>
                        <strong>{isEn ? 'Size:' : 'Μέγεθος:'}</strong>{' '}
                        {formatBytesCompact(imageRefData.media.size)}
                        {imageRefData.media.width && imageRefData.media.height
                          ? ` • ${imageRefData.media.width}×${imageRefData.media.height}px`
                          : ''}
                      </p>
                      <p className="truncate font-mono text-[10px] text-stone-500">
                        {imageRefData.media.url}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-stone-50 border border-dashed border-stone-300 text-stone-500 text-xs text-center">
                    {statusInfo?.configured
                      ? isEn
                        ? 'No test image uploaded in ImageKit sandbox yet.'
                        : 'Δεν έχει μεταφορτωθεί ακόμη δοκιμαστική εικόνα στο sandbox.'
                      : isEn
                      ? 'Waiting for ImageKit configuration.'
                      : 'Αναμονή ρύθμισης ImageKit.'}
                  </div>
                )}
              </div>

              {imageRefData?.found && isTeacherVerified && (
                <div className="pt-2 border-t border-stone-100">
                  {cleanupTarget === 'image' ? (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2 text-xs">
                      <p className="font-bold text-rose-900">
                        {isEn
                          ? `Type DELETE to confirm removing ${imageRefData.duplicateCount} file(s) tagged "${SANDBOX_TAGS.image}":`
                          : `Πληκτρολογήστε DELETE για επιβεβαίωση διαγραφής (${imageRefData.duplicateCount} αρχείο/α με ετικέτα «${SANDBOX_TAGS.image}»):`}
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={cleanupConfirmText}
                          onChange={(e) => setCleanupConfirmText(e.target.value)}
                          placeholder="DELETE"
                          className="flex-1 px-2.5 py-1.5 bg-white border border-rose-300 rounded-lg text-xs font-mono"
                        />
                        <button
                          type="button"
                          disabled={
                            cleanupBusy ||
                            cleanupConfirmText.trim().toUpperCase() !== 'DELETE'
                          }
                          onClick={handleConfirmCleanup}
                          className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 disabled:opacity-40 text-white font-bold text-xs cursor-pointer"
                        >
                          {cleanupBusy ? '...' : isEn ? 'Confirm' : 'Επιβεβαίωση'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCleanupTarget(null);
                            setCleanupConfirmText('');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-stone-200 text-stone-700 font-semibold text-xs cursor-pointer"
                        >
                          {isEn ? 'Cancel' : 'Άκυρο'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setCleanupTarget('image');
                        setCleanupConfirmText('');
                      }}
                      className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>
                        {isEn
                          ? 'Manual Sandbox Image Cleanup'
                          : 'Χειροκίνητος καθαρισμός δοκιμαστικής εικόνας'}
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Slot B: Video */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-rose-600" />
                    <h3 className="font-bold text-stone-900 text-sm">
                      {isEn ? 'Test MP4 Video Slot' : 'Δοκιμαστικό Βίντεο MP4'}
                    </h3>
                  </div>
                  <code className="text-[11px] font-mono bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                    {SANDBOX_TAGS.video}
                  </code>
                </div>

                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,.mp4,video/*"
                  onChange={(e) => handleFileUpload(e, 'video')}
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={!statusInfo?.configured || !isTeacherVerified || videoProgress !== null}
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-stone-200 disabled:text-stone-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>
                    {videoProgress !== null
                      ? isEn
                        ? `Uploading... ${videoProgress}%`
                        : `Μεταφόρτωση... ${videoProgress}%`
                      : isEn
                      ? 'Upload Test MP4 Video (<= 100 MB)'
                      : 'Μεταφόρτωση Δοκιμαστικού MP4 (<= 100 MB)'}
                  </span>
                </button>

                {videoProgress !== null && (
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-600 transition-all duration-150"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>
                )}

                {videoRefData?.hasDuplicates && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px]">
                    <strong>
                      {isEn ? 'Multiple matching files found:' : 'Εντοπίστηκαν πολλαπλά αρχεία:'}
                    </strong>{' '}
                    {videoRefData.duplicateCount}{' '}
                    {isEn
                      ? 'files match this tag in ImageKit (displaying newest). Automatic deletion is disabled.'
                      : 'αρχεία ταιριάζουν με αυτή την ετικέτα (προβάλλεται το νεότερο).'}
                  </div>
                )}

                {videoRefData?.found && videoRefData.media ? (
                  <div className="space-y-2 pt-1">
                    <div className="rounded-xl overflow-hidden border border-stone-200 bg-black">
                      <video
                        key={videoRefData.media.url}
                        src={videoRefData.media.url}
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full max-h-52 mx-auto"
                      />
                    </div>
                    <div className="text-[11px] text-stone-600 space-y-1 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <p className="font-mono truncate">
                        <strong>{isEn ? 'File:' : 'Αρχείο:'}</strong> {videoRefData.media.name}
                      </p>
                      <p>
                        <strong>{isEn ? 'Size:' : 'Μέγεθος:'}</strong>{' '}
                        {formatBytesCompact(videoRefData.media.size)}
                        {videoRefData.media.duration
                          ? ` • ${Math.round(videoRefData.media.duration)}s`
                          : ''}
                      </p>
                      <div className="pt-1 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleRunRangeProbe}
                          disabled={probingRange}
                          className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Activity className="w-3 h-3 text-amber-400" />
                          <span>
                            {probingRange
                              ? isEn
                                ? 'Checking...'
                                : 'Έλεγχος...'
                              : isEn
                              ? 'Verify HTTP 206 Range Support'
                              : 'Έλεγχος HTTP 206 Range'}
                          </span>
                        </button>
                      </div>
                      {rangeProbe && (
                        <p
                          className={`text-[11px] font-mono pt-1 ${
                            rangeProbe.supported ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {rangeProbe.supported
                            ? rangeProbe.contentRange
                              ? `HTTP ${rangeProbe.status} • Content-Range: ${rangeProbe.contentRange} (${rangeProbe.receivedBytes ?? '?'} B)`
                              : `HTTP ${rangeProbe.status} Partial Content • ${rangeProbe.receivedBytes ?? rangeProbe.contentLength ?? '?'} B slice verified (CORS hides Content-Range header from JS)`
                            : `HTTP ${rangeProbe.status} • ${rangeProbe.error || 'Range request not 206'}`}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-stone-50 border border-dashed border-stone-300 text-stone-500 text-xs text-center">
                    {statusInfo?.configured
                      ? isEn
                        ? 'No test MP4 video uploaded in ImageKit sandbox yet.'
                        : 'Δεν έχει μεταφορτωθεί ακόμη δοκιμαστικό βίντεο MP4 στο sandbox.'
                      : isEn
                      ? 'Waiting for ImageKit configuration.'
                      : 'Αναμονή ρύθμισης ImageKit.'}
                  </div>
                )}
              </div>

              {videoRefData?.found && isTeacherVerified && (
                <div className="pt-2 border-t border-stone-100">
                  {cleanupTarget === 'video' ? (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2 text-xs">
                      <p className="font-bold text-rose-900">
                        {isEn
                          ? `Type DELETE to confirm removing ${videoRefData.duplicateCount} file(s) tagged "${SANDBOX_TAGS.video}":`
                          : `Πληκτρολογήστε DELETE για επιβεβαίωση διαγραφής (${videoRefData.duplicateCount} αρχείο/α με ετικέτα «${SANDBOX_TAGS.video}»):`}
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={cleanupConfirmText}
                          onChange={(e) => setCleanupConfirmText(e.target.value)}
                          placeholder="DELETE"
                          className="flex-1 px-2.5 py-1.5 bg-white border border-rose-300 rounded-lg text-xs font-mono"
                        />
                        <button
                          type="button"
                          disabled={
                            cleanupBusy ||
                            cleanupConfirmText.trim().toUpperCase() !== 'DELETE'
                          }
                          onClick={handleConfirmCleanup}
                          className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 disabled:opacity-40 text-white font-bold text-xs cursor-pointer"
                        >
                          {cleanupBusy ? '...' : isEn ? 'Confirm' : 'Επιβεβαίωση'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCleanupTarget(null);
                            setCleanupConfirmText('');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-stone-200 text-stone-700 font-semibold text-xs cursor-pointer"
                        >
                          {isEn ? 'Cancel' : 'Άκυρο'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setCleanupTarget('video');
                        setCleanupConfirmText('');
                      }}
                      className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>
                        {isEn
                          ? 'Manual Sandbox Video Cleanup'
                          : 'Χειροκίνητος καθαρισμός δοκιμαστικού βίντεο'}
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 4. Separate Student Device Opt-in Link & Dual QR Codes */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-900 text-stone-100 border border-stone-800 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <QrCode className="w-4 h-4" />
                <span>
                  {isEn
                    ? 'Student Browser Verification (?mediaSandbox=1)'
                    : 'Επαλήθευση σε Φυλλομετρητή Μαθητή (?mediaSandbox=1)'}
                </span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {isEn
                  ? 'Step 1: Scan the Student Entry QR with a regular phone camera (or copy the URL) to open ?mediaSandbox=1. Step 2: Inside that page, use the in-app Scan QR button on the Station Unlock QR (or type the token) to unlock the video.'
                  : 'Βήμα 1: Σαρώστε το QR Εισόδου Μαθητή με την απλή κάμερα του κινητού (ή αντιγράψτε τον σύνδεσμο) για να ανοίξει η σελίδα ?mediaSandbox=1. Βήμα 2: Μέσα στη σελίδα, σαρώστε το QR Ξεκλειδώματος Σταθμού (ή πληκτρολογήστε τον κωδικό) για να παίξει το βίντεο.'}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <code className="px-2.5 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-[11px] text-amber-300 font-mono truncate max-w-full">
                  {studentSandboxUrl}
                </code>
                <button
                  type="button"
                  onClick={handleCopyStudentLink}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-stone-700"
                >
                  {copiedLink ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {copiedLink
                      ? isEn
                        ? 'Copied'
                        : 'Αντιγράφηκε'
                      : isEn
                      ? 'Copy URL'
                      : 'Αντιγραφή'}
                  </span>
                </button>
                <a
                  href="?mediaSandbox=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>
                    {isEn ? 'Open Student Test View' : 'Άνοιγμα Δοκιμής Μαθητή'}
                  </span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* QR 1: Student Entry Link QR (?mediaSandbox=1) */}
              <div className="bg-stone-800/80 border border-stone-700 rounded-2xl p-3.5 flex items-center gap-3.5">
                <div className="bg-white p-2 rounded-xl shrink-0">
                  <QRCodeSVG value={studentSandboxUrl} size={96} />
                </div>
                <div className="space-y-1 min-w-0">
                  <span className="inline-block text-[10px] font-black uppercase tracking-wider text-amber-300">
                    {isEn ? '1. Student Entry Link QR' : '1. QR Εισόδου Μαθητή'}
                  </span>
                  <p className="text-[11px] text-stone-300 leading-snug">
                    {isEn
                      ? 'Scan with ordinary phone camera to open the ?mediaSandbox=1 student page.'
                      : 'Σάρωση με την κάμερα κινητού για άνοιγμα της σελίδας ?mediaSandbox=1.'}
                  </p>
                  <code className="block text-[10px] font-mono text-amber-200/90 truncate">
                    ?mediaSandbox=1
                  </code>
                </div>
              </div>

              {/* QR 2: Station Token Unlock QR (VA-TEST-IMAGEKIT-2026) */}
              <div className="bg-stone-800/80 border border-stone-700 rounded-2xl p-3.5 flex items-center gap-3.5">
                <div className="bg-white p-2 rounded-xl shrink-0">
                  <QRCodeSVG value={SANDBOX_QR_TOKEN} size={96} />
                </div>
                <div className="space-y-1 min-w-0">
                  <span className="inline-block text-[10px] font-black uppercase tracking-wider text-emerald-300">
                    {isEn ? '2. Station Unlock QR' : '2. QR Ξεκλειδώματος Σταθμού'}
                  </span>
                  <p className="text-[11px] text-stone-300 leading-snug">
                    {isEn
                      ? 'Scan inside the sandbox Scan QR camera (or type manually) to unlock video.'
                      : 'Σάρωση μέσα από το «Σάρωση QR» της σελίδας (ή πληκτρολόγηση) για το βίντεο.'}
                  </p>
                  <code className="block text-[10px] font-mono font-bold text-emerald-200">
                    {SANDBOX_QR_TOKEN}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
