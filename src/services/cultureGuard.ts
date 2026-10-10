export { evaluateLook } from '../lib/cultureGuard';
export type { LookSelection, CultureGuardResult } from '../lib/cultureGuard';

/**
 * Photobooth generation mock with artificial 3-second delay
 */
export async function generatePhotobooth(
  onProgress?: (step: string, percent: number) => void
): Promise<boolean> {
  const steps = [
    { text: 'Đang chuẩn bị bản mộc khắc gỗ dân gian...', percent: 25 },
    { text: 'Đang nghiền bột vỏ điệp óng ánh rải nền giấy dó...', percent: 50 },
    { text: 'Đang dập từng lớp màu tự nhiên: Điệp, Vàng Hòe, Đỏ Sơn, Xanh Chàm...', percent: 75 },
    { text: 'Đang quét lớp mực than lá tre định hình viền nét hoàn tất...', percent: 95 },
  ];

  for (const s of steps) {
    if (onProgress) {
      onProgress(s.text, s.percent);
    }
    await new Promise((resolve) => setTimeout(resolve, 750));
  }

  if (onProgress) {
    onProgress('Khắc in hoàn tất!', 100);
  }
  return true;
}
