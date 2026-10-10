// outfitImages.ts — Ảnh phục dựng (tạo bằng AI, đội đã đối chiếu tư liệu) cho khung "Ảnh phục dựng".
// Đổi IMAGE_BASE_URL thành nơi lưu thư mục outfits/ (ví dụ jsDelivr từ GitHub). Không dùng link Google Drive.
// Áo Giao lĩnh: ảnh đã chỉnh lại cổ chéo ở lớp ngoài (vạt trái đè vạt phải) theo tư liệu.

export const IMAGE_BASE_URL = "https://cdn.jsdelivr.net/gh/phuongandtri-cmyk/viet-phuc-remix@main/outfits/";

export type ViewKey = "truoc" | "sau" | "nghieng" | "nghieng-trai" | "3-4" | "sau-3-4";
export interface OutfitImageSet {
  nam?: Partial<Record<ViewKey, string>>;
  nu?: Partial<Record<ViewKey, string>>;
  phuKien?: { id: string; ten: string; file: string }[];
  ghiChu?: string;
}

export const VIEW_LABELS: Record<ViewKey, string> = {"truoc": "Trước", "sau": "Sau", "nghieng": "Nghiêng", "nghieng-trai": "Nghiêng trái", "3-4": "3/4", "sau-3-4": "Sau 3/4"};

export const outfitImages: Record<string, OutfitImageSet> = {
  "giao-linh": {
    nam: {"truoc": "giao-linh_nam_truoc.webp", "sau": "giao-linh_nam_sau.webp", "nghieng": "giao-linh_nam_nghieng.webp", "3-4": "giao-linh_nam_3-4.webp"},
    nu: {"truoc": "giao-linh_nu_truoc.webp", "sau": "giao-linh_nu_sau.webp", "nghieng": "giao-linh_nu_nghieng.webp", "3-4": "giao-linh_nu_3-4.webp"},
    ghiChu: "Bản nữ mặc váy trắng; tư liệu ghi váy đụp đen – cần đội xác nhận.",
  },
  "ngu-than-lap-co": {
    nam: {"truoc": "ngu-than-lap-co_nam_truoc.webp", "sau": "ngu-than-lap-co_nam_sau.webp", "nghieng": "ngu-than-lap-co_nam_nghieng.webp", "3-4": "ngu-than-lap-co_nam_3-4.webp"},
    nu: {"truoc": "ngu-than-lap-co_nu_truoc.webp", "sau": "ngu-than-lap-co_nu_sau.webp", "nghieng": "ngu-than-lap-co_nu_nghieng.webp", "3-4": "ngu-than-lap-co_nu_3-4.webp"},
  },
  "vien-linh": {
    nam: {"truoc": "vien-linh_nam_truoc.webp", "sau": "vien-linh_nam_sau.webp", "nghieng": "vien-linh_nam_nghieng.webp", "3-4": "vien-linh_nam_3-4.webp"},
    nu: {"truoc": "vien-linh_nu_truoc.webp", "sau": "vien-linh_nu_sau.webp", "nghieng": "vien-linh_nu_nghieng.webp", "3-4": "vien-linh_nu_3-4.webp"},
    ghiChu: "Bản nam có bổ tử hình hạc minh họa phẩm cấp quan văn.",
  },
  "ao-tac": {
    nam: {"truoc": "ao-tac_nam_truoc.webp", "sau": "ao-tac_nam_sau.webp", "nghieng": "ao-tac_nam_nghieng.webp", "3-4": "ao-tac_nam_3-4.webp"},
    nu: {"truoc": "ao-tac_nu_truoc.webp", "sau": "ao-tac_nu_sau.webp", "nghieng": "ao-tac_nu_nghieng.webp", "3-4": "ao-tac_nu_3-4.webp"},
  },
  "truc-linh": {
    nam: {"truoc": "truc-linh_nam_truoc.webp", "sau": "truc-linh_nam_sau.webp", "nghieng": "truc-linh_nam_nghieng.webp", "3-4": "truc-linh_nam_3-4.webp"},
    nu: {"truoc": "truc-linh_nu_truoc.webp", "sau": "truc-linh_nu_sau.webp", "nghieng": "truc-linh_nu_nghieng.webp", "3-4": "truc-linh_nu_3-4.webp"},
  },
  "nhat-binh": {
    nu: {"truoc": "nhat-binh_nu_truoc.webp", "sau": "nhat-binh_nu_sau.webp", "nghieng": "nhat-binh_nu_nghieng.webp", "3-4": "nhat-binh_nu_3-4.webp", "nghieng-trai": "nhat-binh_nu_nghieng-trai.webp", "sau-3-4": "nhat-binh_nu_sau-3-4.webp"},
    ghiChu: "Màu đỏ theo tư liệu là màu áo của Công chúa.",
  },
  "ba-ba-khan-ran": {
    nam: {"truoc": "ba-ba-khan-ran_nam_truoc.webp", "3-4": "ba-ba-khan-ran_nam_3-4.webp"},
    nu: {"truoc": "ba-ba-khan-ran_nu_truoc.webp", "3-4": "ba-ba-khan-ran_nu_3-4.webp"},
    phuKien: [{"id": "khan-ran", "ten": "Khăn rằn", "file": "ba-ba-khan-ran_phu-kien_khan-ran.webp"}],
    ghiChu: "Bản nữ mặc quần trắng; tư liệu ghi quần lụa đen – cần đội xác nhận.",
  },
  "tu-than-yem": {
    nu: {"truoc": "tu-than-yem_nu_truoc.webp", "sau": "tu-than-yem_nu_sau.webp", "nghieng": "tu-than-yem_nu_nghieng.webp", "nghieng-trai": "tu-than-yem_nu_nghieng-trai.webp", "3-4": "tu-than-yem_nu_3-4.webp"},
    phuKien: [{"id": "yem", "ten": "Yếm", "file": "tu-than-yem_phu-kien_yem.webp"}, {"id": "vay-dup", "ten": "Váy đụp", "file": "tu-than-yem_phu-kien_vay-dup.webp"}, {"id": "that-lung", "ten": "Thắt lưng", "file": "tu-than-yem_phu-kien_that-lung.webp"}, {"id": "khan-mo-qua", "ten": "Khăn mỏ quạ", "file": "tu-than-yem_phu-kien_khan-mo-qua.webp"}, {"id": "ao-trai-phang", "ten": "Áo trải phẳng", "file": "tu-than-yem_phu-kien_ao-trai-phang.webp"}],
    ghiChu: "Ảnh thắt dải lưng phía trước; tư liệu ghi hai vạt trước buộc thắt nút – cần đội xác nhận.",
  },
};

export function imageUrl(file: string): string {
  return IMAGE_BASE_URL + file;
}