// landmarks.ts — Bối cảnh danh thắng cho thẻ Lookbook (bước 3–4).
// chibiBg: nền chibi 1024×1280 (tỉ lệ 4:5) để đặt nhân vật lên. realPhoto: ảnh thật, chỉ dùng làm tham chiếu khi AI tạo ảnh chân dung.
// groundY: vị trí bàn chân nhân vật theo tỉ lệ chiều cao thẻ (0 = mép trên, 1 = mép dưới).
// charHeight: chiều cao nhân vật (từ đỉnh tóc đến chân) theo tỉ lệ chiều cao thẻ.

export const LANDMARK_BASE_URL = "https://cdn.jsdelivr.net/gh/phuongandtri-cmyk/viet-phuc-remix@main/landmarks/";

export interface Landmark {
  id: string;
  ten: string;
  moTa: string;
  chibiBg: string;
  realPhoto: string;
  groundY: number;
  charHeight: number;
  credit: string;
  promptHint: string;
}

export const landmarks: Landmark[] = [
  { id: "hoang-thanh-hue", ten: "Hoàng Thành Huế", moTa: "Ngọ Môn & Cung điện Triều Nguyễn", chibiBg: "hoang-thanh-hue_chibi.webp", realPhoto: "hoang-thanh-hue_real.webp", groundY: 0.94, charHeight: 0.50, credit: "", promptHint: "standing on the stone bridge in front of Ngọ Môn gate of the Huế Imperial Citadel, Vietnam, at sunset" },
  { id: "van-mieu", ten: "Văn Miếu – Quốc Tử Giám", moTa: "Khuê Văn Các & Bia Tiến sĩ", chibiBg: "van-mieu_chibi.webp", realPhoto: "van-mieu_real.webp", groundY: 0.95, charHeight: 0.36, credit: "", promptHint: "standing on the stone path in front of Khuê Văn Các pavilion, Temple of Literature, Hà Nội" },
  { id: "hoi-an", ten: "Phố cổ Hội An", moTa: "Đèn lồng hoa đăng & phố cổ rêu phong", chibiBg: "hoi-an_chibi.webp", realPhoto: "hoi-an_real.webp", groundY: 0.80, charHeight: 0.30, credit: "", promptHint: "standing on the riverside walkway in front of mustard-yellow old houses with silk lanterns, Hội An ancient town" },
  { id: "ben-thanh", ten: "Chợ Bến Thành", moTa: "Biểu tượng di sản đất Sài Gòn", chibiBg: "ben-thanh_chibi.webp", realPhoto: "ben-thanh_real.webp", groundY: 0.95, charHeight: 0.30, credit: "", promptHint: "standing on the plaza in front of the Bến Thành Market clock tower, Saigon, on a sunny day" },
];

export const landmarkUrl = (file: string): string => LANDMARK_BASE_URL + file;