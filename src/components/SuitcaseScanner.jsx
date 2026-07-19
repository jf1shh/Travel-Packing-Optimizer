import React, { useState, useRef, useEffect, useCallback } from 'react';
import { measureFromTaps, formatDimensions, REFERENCE_CARD_MM } from '../utils/measurement';
import { lookupByBarcode, searchByBrand } from '../utils/suitcaseDatabase';

// ── Constants ────────────────────────────────────────────────────────────────
const PHASE = {
  SETUP: 'setup',
  CAPTURING: 'capturing',
  CALIBRATE: 'calibrate',
  MEASURE_L: 'measure_l',
  MEASURE_W: 'measure_w',
  RESULT: 'result',
  ERROR: 'error',
};

const MODE = {
  MEASURE: 'measure',
  BARCODE: 'barcode',
};

const INSTRUCTION = {
  [PHASE.CAPTURING]: 'Place a credit card on top of your suitcase, then tap Capture',
  [PHASE.CALIBRATE]: 'Tap each end of the credit card (long edge)',
  [PHASE.MEASURE_L]: 'Tap each end of the suitcase — the longer side',
  [PHASE.MEASURE_W]: 'Tap each end of the suitcase — the shorter side',
};

const DOT_RADIUS = 10;
const LINE_COLOR = '#3b82f6';
const DOT_COLOR = '#2563eb';
const DOT_ACTIVE_COLOR = '#ef4444';
const GUIDE_COLOR = 'rgba(255,255,255,0.7)';
const BARCODE_SCAN_COLOR = '#22c55e';
const BARCODE_DETECT_INTERVAL = 200; // ms between barcode detection attempts

const SuitcaseScanner = ({ isOpen, onClose, onDimensionsReady }) => {
  // ── Shared state ───────────────────────────────────────────────────────────
  const [scannerMode, setScannerMode] = useState(MODE.MEASURE);
  const [phase, setPhase] = useState(PHASE.SETUP);
  const [errorMsg, setErrorMsg] = useState('');
  const [facingMode, setFacingMode] = useState('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [measurements, setMeasurements] = useState(null);
  const [scannedModel, setScannedModel] = useState(null); // {brand, model, l, w, h, type, preset}

  // Measure-mode state
  const [capturedImage, setCapturedImage] = useState(null);
  const [tapPoints, setTapPoints] = useState([]);

  // Barcode-mode state
  const [detectedBarcodes, setDetectedBarcodes] = useState([]);
  const [barcodeValue, setBarcodeValue] = useState(null);
  const [brandQuery, setBrandQuery] = useState('');
  const [brandResults, setBrandResults] = useState([]);
  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [barcodeSupported, setBarcodeSupported] = useState(null); // null=checking

  // ── Refs ───────────────────────────────────────────────────────────────────
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const barcodeDetectorRef = useRef(null);
  const lastDetectionRef = useRef(0);
  const allPointsRef = useRef({ calibrate: null, measureL: null, measureW: null });

  // ── Derived ────────────────────────────────────────────────────────────────
  const isLiveCamera = (scannerMode === MODE.MEASURE && phase === PHASE.CAPTURING) ||
    (scannerMode === MODE.BARCODE);
  const isMeasuring = phase === PHASE.CALIBRATE || phase === PHASE.MEASURE_L || phase === PHASE.MEASURE_W;

  // ── BarcodeDetector setup ──────────────────────────────────────────────────
  useEffect(() => {
    if (!('BarcodeDetector' in window)) {
      setBarcodeSupported(false);
      return;
    }
    window.BarcodeDetector.getSupportedFormats()
      .then(formats => {
        if (formats && formats.length > 0) {
          barcodeDetectorRef.current = new window.BarcodeDetector({ formats });
          setBarcodeSupported(true);
        } else {
          setBarcodeSupported(false);
        }
      })
      .catch(() => setBarcodeSupported(false));
  }, []);

  // ── Camera lifecycle ───────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async (mode = 'environment') => {
    stopCamera();
    setErrorMsg('');
    if (scannerMode === MODE.MEASURE) setPhase(PHASE.SETUP);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setFacingMode(mode);
      setTorchOn(false);
      if (scannerMode === MODE.MEASURE) setPhase(PHASE.CAPTURING);
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg('Camera permission was denied. Please allow camera access in your browser settings and try again.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMsg('No camera found on this device. You can still enter dimensions manually.');
      } else {
        setErrorMsg(`Camera error: ${err.message}. You can close this and enter dimensions manually.`);
      }
      if (scannerMode === MODE.MEASURE) setPhase(PHASE.ERROR);
    }
  }, [stopCamera, scannerMode]);

  // Start/stop camera on mount and mode switch
  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, scannerMode]);

  // ── Barcode detection loop ─────────────────────────────────────────────────
  const detectBarcodes = useCallback(async () => {
    const detector = barcodeDetectorRef.current;
    const video = videoRef.current;
    if (!detector || !video || video.readyState < 2) return;

    const now = Date.now();
    if (now - lastDetectionRef.current < BARCODE_DETECT_INTERVAL) return;
    lastDetectionRef.current = now;

    try {
      const barcodes = await detector.detect(video);
      if (barcodes.length > 0) {
        setDetectedBarcodes(barcodes);
        const first = barcodes[0];
        setBarcodeValue(first.rawValue);

        const match = lookupByBarcode(first.rawValue);
        if (match) {
          setScannedModel(match);
          setMeasurements({ lengthCm: match.l, widthCm: match.w, heightCm: match.h });
          stopCamera();
        }
      }
    } catch {
      // Detection can transiently fail on some frames — ignore
    }
  }, [stopCamera]);

  // ── Live camera → Canvas render loop ───────────────────────────────────────
  useEffect(() => {
    if (!isLiveCamera) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');

    const drawFrame = () => {
      if (!video || video.readyState < 2) {
        animationRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const cw = canvas.parentElement?.clientWidth || canvas.width;
      const ch = canvas.parentElement?.clientHeight || canvas.height;
      const scale = Math.min(cw / vw, ch / vh);
      const dw = vw * scale;
      const dh = vh * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;

      canvas.width = cw;
      canvas.height = ch;

      // Mirror for front camera
      if (facingMode === 'user') {
        ctx.save();
        ctx.translate(cw, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, vw, vh, -dx, dy, dw, dh);
        ctx.restore();
      } else {
        ctx.drawImage(video, 0, 0, vw, vh, dx, dy, dw, dh);
      }

      // Mode-specific overlay
      if (scannerMode === MODE.MEASURE) {
        drawMeasureOverlay(ctx, cw, ch, dw, dh);
      } else {
        drawBarcodeOverlay(ctx, cw, ch, dw, dh, dx, dy);
      }

      // Run barcode detection
      if (scannerMode === MODE.BARCODE) {
        detectBarcodes();
      }

      animationRef.current = requestAnimationFrame(drawFrame);
    };

    drawFrame();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLiveCamera, scannerMode, facingMode, detectedBarcodes]);

  // ── Overlay: Measure mode (card guide) ─────────────────────────────────────
  const drawMeasureOverlay = (ctx, cw, ch, dw, dh) => {
    const cardW = Math.min(dw, dh) * 0.7;
    const cardH = cardW * (REFERENCE_CARD_MM.height / REFERENCE_CARD_MM.width);
    const cx = cw / 2;
    const cy = ch / 2;

    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, 0, cw, ch);
    ctx.clearRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH);

    ctx.strokeStyle = GUIDE_COLOR;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH);
    ctx.setLineDash([]);

    ctx.fillStyle = GUIDE_COLOR;
    ctx.font = '500 14px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Place card here', cx, cy - cardH / 2 - 16);
  };

  // ── Overlay: Barcode mode (scan region + bounding boxes) ───────────────────
  const drawBarcodeOverlay = (ctx, cw, ch, dw, dh, dx, dy) => {
    // Scan region (centered rectangle)
    const scanW = Math.min(dw, dh) * 0.8;
    const scanH = scanW * 0.35;
    const sx = cw / 2 - scanW / 2;
    const sy = ch / 2 - scanH / 2;

    // Semi-transparent outside scan region
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, cw, ch);
    ctx.clearRect(sx, sy, scanW, scanH);

    // Scan region border
    ctx.strokeStyle = BARCODE_SCAN_COLOR;
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 8]);
    ctx.strokeRect(sx, sy, scanW, scanH);
    ctx.setLineDash([]);

    // Corner accents
    const cornerLen = 20;
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    [ [sx, sy, 1, 1], [sx + scanW, sy, -1, 1], [sx, sy + scanH, 1, -1], [sx + scanW, sy + scanH, -1, -1] ]
      .forEach(([cx, cy, dirX, dirY]) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy + cornerLen * dirY);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + cornerLen * dirX, cy);
        ctx.stroke();
      });

    // Draw detected barcode bounding boxes
    detectedBarcodes.forEach(barcode => {
      const { x, y, width, height } = barcode.boundingBox;
      // Scale from video coords to canvas coords
      const scaleX = dw / (videoRef.current?.videoWidth || 1);
      const scaleY = dh / (videoRef.current?.videoHeight || 1);
      const bx = (facingMode === 'user' ? cw - (x + width) * scaleX - dx : x * scaleX + dx);
      const by = y * scaleY + dy;
      const bw = width * scaleX;
      const bh = height * scaleY;

      ctx.strokeStyle = BARCODE_SCAN_COLOR;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.strokeRect(bx - 2, by - 2, bw + 4, bh + 4);

      // Barcode value label
      if (barcodeValue && barcode.rawValue === barcodeValue) {
        ctx.fillStyle = 'rgba(34,197,94,0.9)';
        ctx.font = '600 13px Outfit, monospace';
        ctx.textAlign = 'center';
        const label = barcodeValue.length > 16 ? barcodeValue.slice(0, 16) + '...' : barcodeValue;
        ctx.fillText(label, bx + bw / 2, by - 10);
      }
    });

    // Label
    ctx.fillStyle = GUIDE_COLOR;
    ctx.font = '500 14px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Point camera at suitcase barcode', cw / 2, sy + scanH + 28);
  };

  // ── Torch ──────────────────────────────────────────────────────────────────
  const toggleTorch = useCallback(async () => {
    if (!streamRef.current) return;
    try {
      const track = streamRef.current.getVideoTracks()[0];
      if (!track) return;
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] });
      setTorchOn(prev => !prev);
    } catch { /* torch not supported */ }
  }, [torchOn]);

  // ── Switch camera ──────────────────────────────────────────────────────────
  const switchCamera = useCallback(() => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    startCamera(next);
  }, [facingMode, startCamera]);

  // ── Mode switching ─────────────────────────────────────────────────────────
  const switchMode = useCallback((mode) => {
    setScannerMode(mode);
    setMeasurements(null);
    setScannedModel(null);
    setDetectedBarcodes([]);
    setBarcodeValue(null);
    setBrandQuery('');
    setBrandResults([]);
    setShowBrandPicker(false);
    setCapturedImage(null);
    setTapPoints([]);
    allPointsRef.current = { calibrate: null, measureL: null, measureW: null };
    if (mode === MODE.MEASURE) setPhase(PHASE.SETUP);
  }, []);

  // ── Capture photo (measure mode) ───────────────────────────────────────────
  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const offscreen = document.createElement('canvas');
    offscreen.width = video.videoWidth;
    offscreen.height = video.videoHeight;
    const ctx = offscreen.getContext('2d');

    if (facingMode === 'user') {
      ctx.translate(offscreen.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, offscreen.width, offscreen.height);

    setCapturedImage(offscreen.toDataURL('image/jpeg', 0.92));
    setTapPoints([]);
    setPhase(PHASE.CALIBRATE);
    stopCamera();
  }, [facingMode, stopCamera]);

  // ── Tap handling on still image (measure mode) ─────────────────────────────
  const getCanvasCoords = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  }, []);

  const handleCanvasTap = useCallback((e) => {
    e.preventDefault();
    if (!isMeasuring) return;
    const coords = getCanvasCoords(e);
    if (!coords) return;
    setTapPoints(prev => prev.length >= 2 ? prev : [...prev, coords]);
  }, [isMeasuring, getCanvasCoords]);

  // ── Render still image on canvas (measure mode) ────────────────────────────
  useEffect(() => {
    if (!capturedImage || scannerMode !== MODE.MEASURE || phase === PHASE.CAPTURING || phase === PHASE.SETUP || phase === PHASE.ERROR) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.onload = () => {
      const cw = canvas.parentElement?.clientWidth || canvas.width;
      const ch = canvas.parentElement?.clientHeight || canvas.height;
      const scale = Math.min(cw / img.width, ch / img.height);
      canvas.width = cw;
      canvas.height = ch;

      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
      drawTapPoints(ctx, tapPoints);
    };
    img.src = capturedImage;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturedImage, phase, tapPoints, scannerMode]);

  const drawTapPoints = (ctx, points) => {
    if (!points || points.length === 0) return;
    if (points.length >= 2) {
      ctx.strokeStyle = LINE_COLOR;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.stroke();
    }
    points.forEach((p, i) => {
      ctx.fillStyle = i === 0 ? DOT_COLOR : DOT_ACTIVE_COLOR;
      ctx.beginPath();
      ctx.arc(p.x, p.y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  // ── Compute result (measure mode) ──────────────────────────────────────────
  useEffect(() => {
    if (scannerMode !== MODE.MEASURE) return;

    if (phase === PHASE.CALIBRATE && tapPoints.length === 2) {
      allPointsRef.current.calibrate = tapPoints;
      setTapPoints([]);
      setPhase(PHASE.MEASURE_L);
    }
  }, [phase, tapPoints, scannerMode]);

  useEffect(() => {
    if (scannerMode !== MODE.MEASURE) return;

    if (phase === PHASE.MEASURE_L && tapPoints.length === 2) {
      allPointsRef.current.measureL = tapPoints;
      setTapPoints([]);
      setPhase(PHASE.MEASURE_W);
    }
  }, [phase, tapPoints, scannerMode]);

  useEffect(() => {
    if (scannerMode !== MODE.MEASURE) return;

    if (phase === PHASE.MEASURE_W && tapPoints.length === 2) {
      allPointsRef.current.measureW = tapPoints;
      const { calibrate, measureL, measureW } = allPointsRef.current;
      if (calibrate && measureL && measureW) {
        const result = measureFromTaps(
          calibrate[0], calibrate[1],
          measureL[0], measureL[1],
          measureW[0], measureW[1],
          REFERENCE_CARD_MM.width
        );
        setMeasurements(result);
        setPhase(PHASE.RESULT);
      }
    }
  }, [phase, tapPoints, scannerMode]);

  // ── Brand search (barcode mode) ────────────────────────────────────────────
  const handleBrandSearch = useCallback((query) => {
    setBrandQuery(query);
    if (query.trim().length >= 2) {
      const results = searchByBrand(query);
      setBrandResults(results);
      setShowBrandPicker(true);
    } else {
      setBrandResults([]);
      setShowBrandPicker(false);
    }
  }, []);

  const handleSelectModel = useCallback((model) => {
    setScannedModel(model);
    setMeasurements({ lengthCm: model.l, widthCm: model.w, heightCm: model.h });
    setShowBrandPicker(false);
    setBrandQuery(`${model.brand} — ${model.model}`);
    setBrandResults([]);
    stopCamera();
  }, [stopCamera]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleRetake = () => {
    allPointsRef.current = { calibrate: null, measureL: null, measureW: null };
    setTapPoints([]);
    setCapturedImage(null);
    setMeasurements(null);
    setScannedModel(null);
    setDetectedBarcodes([]);
    setBarcodeValue(null);
    setBrandQuery('');
    setBrandResults([]);
    setShowBrandPicker(false);
    startCamera(facingMode);
  };

  const handleUseDimensions = () => {
    if (measurements) {
      onDimensionsReady({
        ...formatDimensions(measurements),
        preset: scannedModel?.preset || 'custom',
        model: scannedModel ? `${scannedModel.brand} ${scannedModel.model}` : null,
      });
    }
    onClose();
  };

  const handleClose = () => {
    stopCamera();
    setTapPoints([]);
    setCapturedImage(null);
    setMeasurements(null);
    setScannedModel(null);
    setDetectedBarcodes([]);
    setBarcodeValue(null);
    setBrandQuery('');
    setBrandResults([]);
    setShowBrandPicker(false);
    allPointsRef.current = { calibrate: null, measureL: null, measureW: null };
    onClose();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (!isOpen) return null;

  const showBarcodeScanning = scannerMode === MODE.BARCODE && !measurements && !scannedModel;
  const showResult = measurements && (phase === PHASE.RESULT || scannedModel);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: '#000',
      display: 'flex', flexDirection: 'column', fontFamily: 'Outfit, sans-serif',
    }}>
      {/* ── Top bar with mode tabs ─────────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 12px', backgroundColor: 'rgba(0,0,0,0.85)', color: 'white', zIndex: 10,
      }}>
        <button onClick={handleClose} style={{
          background: 'none', border: 'none', color: 'white', fontSize: '16px',
          padding: '8px 12px', cursor: 'pointer', boxShadow: 'none',
        }}>
          ✕ Close
        </button>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 3 }}>
          <button
            onClick={() => switchMode(MODE.MEASURE)}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: '13px', fontWeight: 600,
              border: 'none', cursor: 'pointer', boxShadow: 'none',
              backgroundColor: scannerMode === MODE.MEASURE ? '#3b82f6' : 'transparent',
              color: 'white',
              transition: 'all 0.15s ease',
            }}
          >
            📏 Measure
          </button>
          <button
            onClick={() => switchMode(MODE.BARCODE)}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: '13px', fontWeight: 600,
              border: 'none', cursor: 'pointer', boxShadow: 'none',
              backgroundColor: scannerMode === MODE.BARCODE ? '#3b82f6' : 'transparent',
              color: 'white',
              transition: 'all 0.15s ease',
            }}
          >
            📷 Scan
          </button>
        </div>

        <div style={{ width: 60 }} />
      </div>

      {/* ── Camera / Canvas area ───────────────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#111' }}>
        <video ref={videoRef} playsInline muted style={{ display: 'none' }} />

        <canvas
          ref={canvasRef}
          onMouseDown={isMeasuring ? handleCanvasTap : undefined}
          onTouchStart={isMeasuring ? handleCanvasTap : undefined}
          style={{
            width: '100%', height: '100%', display: 'block',
            cursor: isMeasuring ? 'crosshair' : 'default',
            touchAction: isMeasuring ? 'none' : 'auto',
          }}
        />

        {/* Instruction banner (measure mode) */}
        {(phase === PHASE.CAPTURING || isMeasuring) && scannerMode === MODE.MEASURE && (
          <div style={{
            position: 'absolute', bottom: 100, left: 16, right: 16,
            backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 12, padding: '12px 16px',
            color: 'white', textAlign: 'center', fontSize: '15px', fontWeight: 500,
            backdropFilter: 'blur(8px)', pointerEvents: 'none',
          }}>
            {INSTRUCTION[phase]}
            {isMeasuring && (
              <div style={{ marginTop: 6, fontSize: 13, opacity: 0.7 }}>
                {tapPoints.length}/2 points placed
              </div>
            )}
          </div>
        )}

        {/* Barcode scanning indicator */}
        {showBarcodeScanning && barcodeValue && (
          <div style={{
            position: 'absolute', bottom: 100, left: 16, right: 16,
            backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 12, padding: '10px 16px',
            color: '#22c55e', textAlign: 'center', fontSize: '14px', fontWeight: 600,
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(34,197,94,0.3)',
          }}>
            Barcode detected: {barcodeValue}
            <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.7, marginTop: 4 }}>
              {scannedModel ? 'Model found!' : 'No model match — try brand search below'}
            </div>
          </div>
        )}

        {/* Undo last tap */}
        {isMeasuring && tapPoints.length > 0 && (
          <button onClick={() => setTapPoints(prev => prev.slice(0, -1))} style={{
            position: 'absolute', top: 12, right: 12,
            backgroundColor: 'rgba(0,0,0,0.6)', color: 'white',
            border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8,
            padding: '8px 14px', fontSize: 13, cursor: 'pointer', boxShadow: 'none',
            backdropFilter: 'blur(8px)',
          }}>
            ↩ Undo
          </button>
        )}
      </div>

      {/* ── Bottom controls ────────────────────────────────────────────────── */}
      <div style={{
        padding: '16px', backgroundColor: 'rgba(0,0,0,0.9)',
        display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', zIndex: 10,
      }}>
        {/* Error state */}
        {phase === PHASE.ERROR && (
          <div style={{ color: '#ef4444', textAlign: 'center', padding: 8 }}>
            <p style={{ margin: '0 0 12px', fontSize: 14 }}>{errorMsg}</p>
            <button onClick={handleClose} style={{
              padding: '10px 24px', backgroundColor: '#3b82f6', color: 'white',
              border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: 'none',
            }}>
              Enter Dimensions Manually
            </button>
          </div>
        )}

        {/* Measure mode: live camera controls */}
        {scannerMode === MODE.MEASURE && phase === PHASE.CAPTURING && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center' }}>
            <CameraSideBtn onClick={switchCamera} title="Switch camera" icon="🔄" />
            <div onClick={capturePhoto} style={{
              width: 72, height: 72, borderRadius: '50%', backgroundColor: 'white',
              border: '4px solid rgba(255,255,255,0.3)', cursor: 'pointer',
              boxShadow: '0 0 0 4px rgba(59,130,246,0.3)',
            }} />
            <CameraSideBtn onClick={toggleTorch} title="Toggle flashlight" icon={torchOn ? '🔦' : '💡'} active={torchOn} />
          </div>
        )}

        {/* Barcode mode: live camera controls + brand search */}
        {showBarcodeScanning && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Camera controls */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center' }}>
              <CameraSideBtn onClick={switchCamera} title="Switch camera" icon="🔄" />
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                border: `3px solid ${barcodeValue ? BARCODE_SCAN_COLOR : 'rgba(255,255,255,0.3)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'border-color 0.3s ease',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  backgroundColor: barcodeValue ? BARCODE_SCAN_COLOR : 'rgba(255,255,255,0.2)',
                  transition: 'background-color 0.3s ease',
                }} />
              </div>
              <CameraSideBtn onClick={toggleTorch} title="Toggle flashlight" icon={torchOn ? '🔦' : '💡'} active={torchOn} />
            </div>

            {/* Brand search input */}
            <div style={{ position: 'relative', width: '100%', maxWidth: 360, margin: '0 auto' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  value={brandQuery}
                  onChange={(e) => handleBrandSearch(e.target.value)}
                  placeholder={barcodeValue && !scannedModel
                    ? `Barcode ${barcodeValue.slice(0, 12)}... — search brand?`
                    : 'Or type brand name...'}
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 10,
                    backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    color: 'white', fontSize: '14px', outline: 'none',
                  }}
                  onFocus={() => brandQuery.trim().length >= 2 && setShowBrandPicker(true)}
                />
              </div>

              {/* Brand search dropdown */}
              {showBrandPicker && brandResults.length > 0 && (
                <div style={{
                  position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 4,
                  backgroundColor: 'rgba(15,23,42,0.97)', borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.12)', maxHeight: 200, overflowY: 'auto',
                  zIndex: 20,
                }}>
                  {brandResults.map((m, i) => (
                    <div
                      key={`${m.brand}-${m.model}-${i}`}
                      onClick={() => handleSelectModel(m)}
                      style={{
                        padding: '10px 14px', cursor: 'pointer', color: 'white',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        fontSize: '13px', display: 'flex', justifyContent: 'space-between',
                        transition: 'background-color 0.1s',
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(59,130,246,0.15)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <span style={{ fontWeight: 500 }}>{m.brand} — {m.model}</span>
                      <span style={{ opacity: 0.6, fontSize: 12 }}>
                        {m.l}×{m.w}×{m.h} cm
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Barcode not supported message */}
            {barcodeSupported === false && !barcodeValue && (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 12, padding: '4px 0' }}>
                Barcode scanning not supported in this browser — use brand search above
              </div>
            )}
          </div>
        )}

        {/* Measure mode: measuring controls */}
        {isMeasuring && (
          <button onClick={handleRetake} style={{
            padding: '10px 24px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10,
            fontSize: 14, fontWeight: 500, cursor: 'pointer', boxShadow: 'none',
          }}>
            Retake Photo
          </button>
        )}

        {/* Result display (both modes) */}
        {showResult && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
            {/* Model info (barcode/brand match) */}
            {scannedModel && (
              <div style={{
                backgroundColor: 'rgba(34,197,94,0.12)', borderRadius: 8, padding: '6px 16px',
                color: '#22c55e', fontSize: 13, fontWeight: 500,
                border: '1px solid rgba(34,197,94,0.2)',
              }}>
                {scannedModel.brand} — {scannedModel.model}
              </div>
            )}

            {/* Dimensions */}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', color: 'white', fontSize: 14 }}>
              <DimDisplay label="Length (cm)" value={measurements.lengthCm} color="#3b82f6" />
              <DimDisplay label="Width (cm)" value={measurements.widthCm} color="#3b82f6" />
              <DimDisplay label="Height (cm)" value={measurements.heightCm} color={scannedModel ? '#22c55e' : '#8b5cf6'}
                suffix={!scannedModel ? ' (est.)' : ''} />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleRetake} style={{
                padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10,
                fontSize: 14, fontWeight: 500, cursor: 'pointer', boxShadow: 'none',
              }}>
                Retake
              </button>
              <button onClick={handleUseDimensions} style={{
                padding: '10px 32px', backgroundColor: '#3b82f6', color: 'white',
                border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
                cursor: 'pointer', boxShadow: 'none',
              }}>
                ✓ Use These Dimensions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Sub-components ───────────────────────────────────────────────────────────
const CameraSideBtn = ({ onClick, title, icon, active }) => (
  <button onClick={onClick} title={title} style={{
    width: 44, height: 44, borderRadius: '50%',
    backgroundColor: active ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.15)',
    border: 'none', color: 'white', fontSize: 20, cursor: 'pointer', boxShadow: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    {icon}
  </button>
);

const DimDisplay = ({ label, value, color, suffix = '' }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}{suffix}</div>
    <div style={{ opacity: 0.6, fontSize: 12 }}>{label}</div>
  </div>
);

export default SuitcaseScanner;
