// stylingOptions.ts — Danh mục màu, họa tiết, phụ kiện cho Studio phối đồ (bước 2)
// Mỗi lựa chọn mang "tags" để Culture Guard (cultureRules.ts) nhận diện.
// "nguon": "tai-lieu" = có trong VietPhuc_KnowledgeBase_v2; "remix" = món hiện đại do đội thêm cho tinh thần Gen Z.

export type Tag =
  | "doi-dau-nam"          // khăn xếp, khăn lươn
  | "doi-dau-nu"           // khăn vành dây, khăn mỏ quạ, nón quai thao, nón lá ba tầm
  | "khan-ran"
  | "giay-truyen-thong"
  | "giay-hien-dai"
  | "phu-kien-hien-dai"
  | "trang-suc-quy-toc"
  | "mau-vang-chinh-sac"
  | "hoa-van-rong-phuong"
  | "hoa-van-pham-cap";    // linh thú, chim quý kiểu Bổ tử

export interface ColorOption {
  id: string;
  ten: string;
  hex: string;
  tags: Tag[];
  truyenThongCho: string[]; // id trang phục có màu này trong mauTruyenThong (outfits.ts)
}

export interface PatternOption {
  id: string;
  ten: string;
  moTa: string;
  tags: Tag[];
}

export type AccessoryGroup = "doi-dau" | "giay" | "trang-suc" | "hien-dai";

export interface AccessoryOption {
  id: string;
  ten: string;
  nhom: AccessoryGroup;
  tags: Tag[];
  nguon: "tai-lieu" | "remix";
}

export const colors: ColorOption[] = [
  { id: "den-tham", ten: "Đen thâm", hex: "#1E1B18", tags: [], truyenThongCho: ["truc-linh", "ao-tac", "tu-than-yem", "ba-ba-khan-ran"] },
  { id: "nau-cu-nau", ten: "Nâu củ nâu", hex: "#6B4226", tags: [], truyenThongCho: ["tu-than-yem", "ba-ba-khan-ran"] },
  { id: "xanh-cham", ten: "Xanh chàm", hex: "#2F4A7A", tags: [], truyenThongCho: ["truc-linh", "ao-tac"] },
  { id: "tim", ten: "Tím", hex: "#6B4C8A", tags: [], truyenThongCho: ["ao-tac", "nhat-binh"] },
  { id: "xanh-lo", ten: "Xanh lơ", hex: "#8DB8D8", tags: [], truyenThongCho: ["tu-than-yem", "ba-ba-khan-ran"] },
  { id: "hoa-hien", ten: "Màu hoa hiên", hex: "#E39B2B", tags: [], truyenThongCho: ["tu-than-yem"] },
  { id: "xanh-ma-non", ten: "Xanh mạ non", hex: "#A8C66C", tags: [], truyenThongCho: ["ba-ba-khan-ran"] },
  { id: "trang-nga", ten: "Trắng ngà", hex: "#FBF7EE", tags: [], truyenThongCho: ["ba-ba-khan-ran"] },
  { id: "do-son", ten: "Đỏ son", hex: "#D9442B", tags: [], truyenThongCho: [] },
  { id: "vang-chinh-sac", ten: "Vàng chính sắc", hex: "#F2C200", tags: ["mau-vang-chinh-sac"], truyenThongCho: ["nhat-binh"] },
];

export const patterns: PatternOption[] = [
  { id: "tron", ten: "Lụa trơn", moTa: "Không họa tiết", tags: [] },
  { id: "hoa-sen", ten: "Hoa sen", moTa: "Họa tiết hoa sen", tags: [] },
  { id: "may-song-nuoc", ten: "Mây – sóng nước", moTa: "Mây cuộn và sóng nước Thủy ba", tags: [] },
  { id: "bo-tu-hac", ten: "Hạc (kiểu Bổ tử)", moTa: "Chim quý thêu kiểu Bổ tử, dấu hiệu phẩm cấp quan lại", tags: ["hoa-van-pham-cap"] },
  { id: "rong-phuong", ten: "Rồng phượng", moTa: "Họa tiết rồng phượng cung đình", tags: ["hoa-van-rong-phuong"] },
];

export const accessories: AccessoryOption[] = [
  { id: "khan-xep", ten: "Khăn xếp", nhom: "doi-dau", tags: ["doi-dau-nam"], nguon: "tai-lieu" },
  { id: "khan-mo-qua", ten: "Khăn mỏ quạ", nhom: "doi-dau", tags: ["doi-dau-nu"], nguon: "tai-lieu" },
  { id: "non-quai-thao", ten: "Nón quai thao", nhom: "doi-dau", tags: ["doi-dau-nu"], nguon: "tai-lieu" },
  { id: "khan-ran", ten: "Khăn rằn", nhom: "doi-dau", tags: ["khan-ran"], nguon: "tai-lieu" },
  { id: "kieng-co", ten: "Kiềng cổ", nhom: "trang-suc", tags: ["trang-suc-quy-toc"], nguon: "tai-lieu" },
  { id: "kinh-ram", ten: "Kính râm", nhom: "hien-dai", tags: ["phu-kien-hien-dai"], nguon: "remix" },
  { id: "tui-tote", ten: "Túi tote", nhom: "hien-dai", tags: ["phu-kien-hien-dai"], nguon: "remix" },
];
