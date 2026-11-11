import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { Camera, X, CheckCircle2, AlertTriangle, RefreshCw, QrCode } from 'lucide-react';

interface QRCameraScannerProps {
  expectedToken: string;
  language: 'el' | 'en';
  onScanSuccess: (decodedToken: string) => void;
  onClose: () => void;
}

export const QRCameraScanner: React.FC<QRCameraScannerProps> = ({
  expectedToken,
  language,
  onScanSuccess,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'invalid'>('idle');
  const [scannedValue, setScannedValue] = useState<string>('');

  // Translations
  const t = {
    title: language === 'el' ? 'Ζωντανή Σάρωση QR Σταθμού' : 'Live Station QR Scanner',
    subtitle:
      language === 'el'
        ? 'Τοποθετήστε τον κωδικό QR του σταθμού μέσα στο πλαίσιο'
        : 'Point camera at the station QR code within the frame',
    requesting:
      language === 'el'
        ? 'Αίτημα πρόσβασης στην κάμερα...'
        : 'Requesting camera access...',
    permissionDenied:
      language === 'el'
        ? 'Η πρόσβαση στην κάμερα απορρίφθηκε. Επιτρέψτε την κάμερα στις ρυθμίσεις του φυλλομετρητή ή πληκτρολογήστε τον κωδικό χειροκίνητα.'
        : 'Camera permission was denied. Please allow camera access in browser settings or type the code manually.',
    cameraNotFound:
      language === 'el'
        ? 'Δεν βρέθηκε διαθέσιμη κάμερα στη συσκευή. Πληκτρολογήστε τον κωδικό χειροκίνητα.'
        : 'No camera found on this device. Please type the code manually.',
    cameraError:
      language === 'el'
        ? 'Σφάλμα κατά την εκκίνηση της κάμερας. Μπορείτε να πληκτρολογήσετε τον κωδικό χειροκίνητα.'
        : 'Camera error. You can enter the code manually.',
    successFeedback:
      language === 'el'
        ? '✓ Έγκυρος κωδικός QR σταθμού!'
        : '✓ Valid station QR code!',
    invalidFeedback:
      language === 'el'
        ? '⚠️ Ο κωδικός QR που σαρώθηκε δεν αντιστοιχεί σε αυτόν τον σταθμό.'
        : '⚠️ Scanned QR code does not match this station token.',
    closeBtn: language === 'el' ? 'Κλείσιμο' : 'Close',
    switchCamera: language === 'el' ? 'Αλλαγή Κάμερας' : 'Flip Camera',
    retryCamera: language === 'el' ? 'Δοκιμή Ξανά' : 'Retry Camera',
    scannedTokenLabel: language === 'el' ? 'Σαρώθηκε:' : 'Scanned:',
  };

  // Safe camera stream stopping function
  const stopCamera = useCallback(() => {
    if (animFrameIdRef.current !== null) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping video track:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Frame decoding loop using jsQR (and BarcodeDetector where available)
  const scanLoop = useCallback(() => {
    if (isProcessingRef.current) {
      return;
    }

    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      animFrameIdRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    if (video.videoWidth > 0 && video.videoHeight > 0) {
      let canvas = canvasRef.current;
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvasRef.current = canvas;
      }

      // Optimize canvas dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data && code.data.trim().length > 0) {
          const raw = code.data.trim();
          isProcessingRef.current = true;
          setScannedValue(raw);

          const isMatch = raw.toUpperCase() === expectedToken.trim().toUpperCase();

          if (isMatch) {
            setScanStatus('success');
            onScanSuccess(raw);
            // Brief visual celebration then shut camera and close modal
            setTimeout(() => {
              stopCamera();
              onClose();
            }, 800);
            return;
          } else {
            setScanStatus('invalid');
            // Populate input with the scanned token so student sees what was detected
            onScanSuccess(raw);
            // Resume scanning after 2 seconds to allow re-targeting
            setTimeout(() => {
              setScanStatus('idle');
              isProcessingRef.current = false;
              animFrameIdRef.current = requestAnimationFrame(scanLoop);
            }, 2000);
            return;
          }
        }
      }
    }

    animFrameIdRef.current = requestAnimationFrame(scanLoop);
  }, [expectedToken, onScanSuccess, onClose, stopCamera]);

  // Start device camera
  const startCamera = useCallback(async () => {
    stopCamera();
    isProcessingRef.current = false;
    setScanStatus('idle');
    setErrorMessage(null);
    setHasPermission(null);

    if (!navigator?.mediaDevices?.getUserMedia) {
      setHasPermission(false);
      setErrorMessage(t.cameraNotFound);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        animFrameIdRef.current = requestAnimationFrame(scanLoop);
      }
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      setHasPermission(false);
      const errorObj = err as { name?: string; message?: string };
      if (
        errorObj.name === 'NotAllowedError' ||
        errorObj.name === 'PermissionDeniedError'
      ) {
        setErrorMessage(t.permissionDenied);
      } else if (
        errorObj.name === 'NotFoundError' ||
        errorObj.name === 'DevicesNotFoundError'
      ) {
        setErrorMessage(t.cameraNotFound);
      } else {
        setErrorMessage(t.cameraError);
      }
    }
  }, [facingMode, scanLoop, stopCamera, t.cameraError, t.cameraNotFound, t.permissionDenied]);

  // Start on mount or when facingMode toggles
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Flip camera toggle
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-stone-900 border-2 border-stone-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-rose-300">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">{t.title}</h3>
              <p className="text-[11px] text-stone-400">{t.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
            title={t.closeBtn}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Viewport Area */}
        <div className="relative bg-black flex-1 min-h-[300px] sm:min-h-[360px] flex items-center justify-center overflow-hidden">
          {/* Live Video Preview */}
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Hidden Canvas for Decoding */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Active Viewfinder Frame Overlay (when permission is granted) */}
          {hasPermission && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Outer darkened vignette */}
              <div className="absolute inset-0 bg-stone-950/40" />

              {/* Central scanning square */}
              <div
                className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl border-2 transition-all duration-300 ${
                  scanStatus === 'success'
                    ? 'border-emerald-400 bg-emerald-500/15 shadow-[0_0_30px_rgba(52,211,153,0.5)]'
                    : scanStatus === 'invalid'
                    ? 'border-amber-400 bg-amber-500/15 shadow-[0_0_30px_rgba(251,191,36,0.5)]'
                    : 'border-white/80 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                }`}
              >
                {/* 4 Viewfinder Corners */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-rose-500 rounded-tl-xl -mt-0.5 -ml-0.5" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-rose-500 rounded-tr-xl -mt-0.5 -mr-0.5" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-rose-500 rounded-bl-xl -mb-0.5 -ml-0.5" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-rose-500 rounded-br-xl -mb-0.5 -mr-0.5" />

                {/* Animated Laser Scanning Line */}
                {scanStatus === 'idle' && (
                  <div className="absolute inset-x-2 top-2 h-0.5 bg-linear-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_10px_#f43f5e] animate-pulse" />
                )}
              </div>
            </div>
          )}

          {/* State: Requesting permission spinner */}
          {hasPermission === null && !errorMessage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center bg-stone-950">
              <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold text-stone-300">{t.requesting}</p>
            </div>
          )}

          {/* State: Permission Denied or Error */}
          {hasPermission === false && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center bg-stone-900/95">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h4 className="text-sm font-bold text-white">
                  {language === 'el' ? 'Απαιτείται Άδεια Κάμερας' : 'Camera Access Needed'}
                </h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  {errorMessage || t.permissionDenied}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t.retryCamera}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    onClose();
                  }}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-stone-700"
                >
                  <span>{t.closeBtn}</span>
                </button>
              </div>
            </div>
          )}

          {/* Success Overlay Banner */}
          {scanStatus === 'success' && (
            <div className="absolute inset-x-4 bottom-4 p-3 bg-emerald-950/90 border border-emerald-500 rounded-2xl text-emerald-200 text-center shadow-lg backdrop-blur-md flex items-center justify-center gap-2 animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs text-left">
                <span className="font-bold block">{t.successFeedback}</span>
                <span className="font-mono text-[10px] text-emerald-300 truncate max-w-[220px] block">
                  {t.scannedTokenLabel} {scannedValue}
                </span>
              </div>
            </div>
          )}

          {/* Invalid Scan Overlay Banner */}
          {scanStatus === 'invalid' && (
            <div className="absolute inset-x-4 bottom-4 p-3 bg-amber-950/90 border border-amber-500 rounded-2xl text-amber-200 text-center shadow-lg backdrop-blur-md flex items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs text-left">
                <span className="font-bold block">{t.invalidFeedback}</span>
                <span className="font-mono text-[10px] text-amber-300 truncate max-w-[220px] block">
                  {t.scannedTokenLabel} {scannedValue}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-stone-950/80 border-t border-stone-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={toggleFacingMode}
            className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-stone-700"
            title={t.switchCamera}
          >
            <Camera className="w-3.5 h-3.5 text-stone-400" />
            <span>{t.switchCamera}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer border border-stone-700"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
