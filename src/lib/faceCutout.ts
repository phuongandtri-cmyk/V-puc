import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import { FACE_FIT } from '../config/faceFit';

export interface FaceCutoutResult {
  facePatchUrl: string;
  dataUrl: string; // for compatibility
  skinHex: string;
  photoFaceBoxWidth: number;
  photoFaceBoxHeight: number;
  photoEyeNormY: number;
  note?: string;
}

let landmarkerInstance: FaceLandmarker | null = null;
let landmarkerPromise: Promise<FaceLandmarker> | null = null;

const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

async function getLandmarker(): Promise<FaceLandmarker> {
  if (landmarkerInstance) return landmarkerInstance;
  if (landmarkerPromise) return landmarkerPromise;

  landmarkerPromise = (async () => {
    const wasmFileset = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
    );

    try {
      const landmarker = await FaceLandmarker.createFromOptions(wasmFileset, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: 'GPU',
        },
        runningMode: 'IMAGE',
        numFaces: 2,
      });
      landmarkerInstance = landmarker;
      return landmarker;
    } catch {
      // Fallback to CPU delegate if GPU delegate is unavailable
      const landmarker = await FaceLandmarker.createFromOptions(wasmFileset, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: 'CPU',
        },
        runningMode: 'IMAGE',
        numFaces: 2,
      });
      landmarkerInstance = landmarker;
      return landmarker;
    }
  })();

  try {
    return await landmarkerPromise;
  } catch (err) {
    landmarkerPromise = null;
    throw err;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Không thể tải ảnh.'));
    img.src = src;
  });
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export async function processFaceCutout(imageSrc: string): Promise<FaceCutoutResult> {
  const img = await loadImage(imageSrc);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Không thể khởi tạo Canvas 2D.');

  const maxDim = 1600;
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;
  if (w <= 0 || h <= 0) throw new Error('Kích thước ảnh không hợp lệ.');

  if (w > maxDim || h > maxDim) {
    if (w > h) {
      h = Math.round((h * maxDim) / w);
      w = maxDim;
    } else {
      w = Math.round((w * maxDim) / h);
      h = maxDim;
    }
  }

  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);

  const landmarker = await getLandmarker();
  const detectionResult = landmarker.detect(canvas);

  if (!detectionResult.faceLandmarks || detectionResult.faceLandmarks.length === 0) {
    throw new Error('Không tìm thấy gương mặt. Hãy dùng ảnh chụp chính diện, đủ sáng.');
  }

  let note: string | undefined;
  let chosenFaceIndex = 0;

  if (detectionResult.faceLandmarks.length > 1) {
    note = 'Đã phát hiện nhiều gương mặt. Hệ thống tự động chọn gương mặt lớn nhất.';
    let maxArea = -1;
    detectionResult.faceLandmarks.forEach((face, idx) => {
      let minX = 1, maxX = 0, minY = 1, maxY = 0;
      for (const pt of face) {
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.y > maxY) maxY = pt.y;
      }
      const area = (maxX - minX) * (maxY - minY);
      if (area > maxArea) {
        maxArea = area;
        chosenFaceIndex = idx;
      }
    });
  }

  const landmarks = detectionResult.faceLandmarks[chosenFaceIndex];
  const getPt = (idx: number) => ({
    x: landmarks[idx].x * w,
    y: landmarks[idx].y * h,
  });

  // Calculate eye centres
  const leftEyeIndices = [33, 133, 160, 159, 158, 157, 173, 153, 144, 145, 154, 155];
  const rightEyeIndices = [362, 263, 387, 386, 385, 384, 398, 380, 373, 374, 381, 382];

  let sumLx = 0, sumLy = 0;
  for (const idx of leftEyeIndices) {
    const pt = getPt(idx);
    sumLx += pt.x;
    sumLy += pt.y;
  }
  const eyeLeft = { x: sumLx / leftEyeIndices.length, y: sumLy / leftEyeIndices.length };

  let sumRx = 0, sumRy = 0;
  for (const idx of rightEyeIndices) {
    const pt = getPt(idx);
    sumRx += pt.x;
    sumRy += pt.y;
  }
  const eyeRight = { x: sumRx / rightEyeIndices.length, y: sumRy / rightEyeIndices.length };

  // eyeMid = midpoint of the two eye centres
  const eyeMid = {
    x: (eyeLeft.x + eyeRight.x) / 2,
    y: (eyeLeft.y + eyeRight.y) / 2,
  };

  // Rotate so the eye line is horizontal
  const dx = eyeRight.x - eyeLeft.x;
  const dy = eyeRight.y - eyeLeft.y;
  const angleRad = Math.atan2(dy, dx); // radians

  const rotatePt = (p: { x: number; y: number }) => {
    const cos = Math.cos(-angleRad);
    const sin = Math.sin(-angleRad);
    const px = p.x - eyeMid.x;
    const py = p.y - eyeMid.y;
    return {
      x: eyeMid.x + px * cos - py * sin,
      y: eyeMid.y + px * sin + py * cos,
    };
  };

  // Face box from MediaPipe landmarks (after rotation):
  // left = landmark 234, right = landmark 454, top = landmark 10, bottom = landmark 152 (chin)
  const pt234 = rotatePt(getPt(234));
  const pt454 = rotatePt(getPt(454));
  const pt10 = rotatePt(getPt(10));
  const pt152 = rotatePt(getPt(152));

  const boxLeft = Math.min(pt234.x, pt454.x);
  const boxRight = Math.max(pt234.x, pt454.x);
  const boxTop = Math.min(pt10.y, pt152.y);
  const boxBottom = Math.max(pt10.y, pt152.y);

  const boxW = Math.max(10, boxRight - boxLeft);
  const boxH = Math.max(10, boxBottom - boxTop);

  // Expand the box: 4% left/right, 6% top, 2% bottom
  const expLeft = boxLeft - 0.04 * boxW;
  const expRight = boxRight + 0.04 * boxW;
  const expTop = boxTop - 0.06 * boxH;
  const expBottom = boxBottom + 0.02 * boxH;

  const expW = Math.max(10, expRight - expLeft);
  const expH = Math.max(10, expBottom - expTop);

  // Average photo skin colour sampled from both cheeks (landmarks 50 and 280, 9×9 px each)
  let skinHex = '#FFE7D1';
  try {
    let totalR = 0, totalG = 0, totalB = 0, count = 0;
    const sampleCheek = (pt: { x: number; y: number }) => {
      const cx = Math.round(pt.x);
      const cy = Math.round(pt.y);
      const startX = Math.max(0, cx - 4);
      const endX = Math.min(w - 1, cx + 4);
      const startY = Math.max(0, cy - 4);
      const endY = Math.min(h - 1, cy + 4);
      const sw = endX - startX + 1;
      const sh = endY - startY + 1;
      if (sw > 0 && sh > 0) {
        const data = ctx.getImageData(startX, startY, sw, sh).data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 60) {
            totalR += data[i];
            totalG += data[i + 1];
            totalB += data[i + 2];
            count++;
          }
        }
      }
    };
    sampleCheek(getPt(50));
    sampleCheek(getPt(280));
    if (count > 0) {
      skinHex = rgbToHex(totalR / count, totalG / count, totalB / count);
    }
  } catch {
    skinHex = '#FFE7D1';
  }

  // Draw this box stretched to fill a 512×512 canvas (non-uniform is fine here)
  const patchCanvas = document.createElement('canvas');
  patchCanvas.width = 512;
  patchCanvas.height = 512;
  const pCtx = patchCanvas.getContext('2d');
  if (!pCtx) throw new Error('Không thể khởi tạo Canvas 2D.');

  pCtx.save();
  pCtx.scale(512 / expW, 512 / expH);
  pCtx.translate(-expLeft, -expTop);
  pCtx.translate(eyeMid.x, eyeMid.y);
  pCtx.rotate(-angleRad);
  pCtx.translate(-eyeMid.x, -eyeMid.y);
  pCtx.drawImage(canvas, 0, 0);
  pCtx.restore();

  // Mask in canvas: ellipse centred (256, 256), rx 252, ry 252,
  // with a soft fade of FACE_FIT.feather × 512 px at the edge (destination-in with an elliptical gradient).
  // Outside = transparent.
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = 512;
  maskCanvas.height = 512;
  const mCtx = maskCanvas.getContext('2d');
  if (mCtx) {
    mCtx.save();
    mCtx.translate(256, 256);
    mCtx.scale(252, 252);

    const featherFraction = (FACE_FIT.feather * 512) / 252;
    const innerStop = Math.max(0, Math.min(0.99, 1 - featherFraction));

    const grad = mCtx.createRadialGradient(0, 0, innerStop, 0, 0, 1);
    grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    grad.addColorStop(innerStop, 'rgba(0, 0, 0, 1)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    mCtx.fillStyle = grad;
    mCtx.beginPath();
    mCtx.arc(0, 0, 1, 0, Math.PI * 2);
    mCtx.fill();
    mCtx.restore();
  }

  pCtx.globalCompositeOperation = 'destination-in';
  pCtx.drawImage(maskCanvas, 0, 0);

  const facePatchUrl = patchCanvas.toDataURL('image/png');
  // Relative eyeMid y within the expanded face box
  const photoEyeNormY = (eyeMid.y - expTop) / expH;

  return {
    facePatchUrl,
    dataUrl: facePatchUrl,
    skinHex,
    photoFaceBoxWidth: expW,
    photoFaceBoxHeight: expH,
    photoEyeNormY,
    note,
  };
}
