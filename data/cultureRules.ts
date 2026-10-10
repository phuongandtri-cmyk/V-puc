// cultureRules.ts — Luật Culture Guard cho app "Việt phục Remix"
// loaiCanCu "tai-lieu": rút từ VietPhuc_KnowledgeBase_v2 (canCu = id phần trang phục làm căn cứ).
// loaiCanCu "nguyen-tac-remix": nguyên tắc phối do đội đặt ra (không phải sự thật lịch sử).
// Mức độ (mucDo) là quyết định thiết kế của đội — đội duyệt lại trước khi nộp.

import type { Occasion } from "./outfits";
import type { Tag } from "./stylingOptions";

export interface RuleCondition {
  outfitIds?: string[];          // chỉ áp dụng khi trang phục đang chọn nằm trong danh sách
  outfitIdsNgoaiTru?: string[];  // không áp dụng cho các trang phục này
  gioiTinhNhanVat?: "nam" | "nu";
  suKien?: Occasion[];           // dịp đang chọn nằm trong danh sách
  coTag?: Tag[];                 // lựa chọn hiện tại có ít nhất 1 tag trong danh sách
  trangPhucKhacGioi?: boolean;   // outfit.gioiTinh khác "ca-hai" và khác giới tính nhân vật
  dipNgoaiBoiCanh?: boolean;     // đã chọn dịp nhưng dịp đó không có trong outfit.suKienPhuHop
}

export interface CultureRule {
  id: string;
  mucDo: "xanh" | "vang" | "do";
  khiNao: RuleCondition;
  giaiThich: string;
  goiYSua: string;
  loaiCanCu: "tai-lieu" | "nguyen-tac-remix";
  canCu: string; // id trang phục trong outfits.ts, hoặc "" nếu là nguyên tắc remix
}

export const cultureRules: CultureRule[] = [
  // ===== ĐỎ — chưa phù hợp =====
  {
    id: "rong-phuong-thuong-phuc",
    mucDo: "do",
    khiNao: { coTag: ["hoa-van-rong-phuong"], outfitIdsNgoaiTru: ["nhat-binh"] },
    giaiThich: "Rồng phượng là họa tiết của trang phục hoàng gia, được quy định chặt chẽ theo phẩm cấp.",
    goiYSua: "Thử hoa sen hoặc mây – sóng nước để giữ nét cổ điển mà không mượn biểu tượng vương quyền.",
    loaiCanCu: "tai-lieu",
    canCu: "nhat-binh",
  },

  // ===== VÀNG — nên cân nhắc =====
  {
    id: "rong-phuong-nhat-binh",
    mucDo: "vang",
    khiNao: { coTag: ["hoa-van-rong-phuong"], outfitIds: ["nhat-binh"] },
    giaiThich: "Theo quy chế triều Nguyễn, áo Nhật Bình thêu rồng phượng là lễ phục của Hoàng hậu.",
    goiYSua: "Nếu chụp ảnh tái hiện, hãy ghi rõ đây là phục dựng; hoặc chọn hoa sen để gần với lễ phục cô dâu quý tộc.",
    loaiCanCu: "tai-lieu",
    canCu: "nhat-binh",
  },
  {
    id: "vang-chinh-sac",
    mucDo: "vang",
    khiNao: { coTag: ["mau-vang-chinh-sac"] },
    giaiThich: "Vàng chính sắc là màu áo Nhật Bình của Hoàng hậu trong quy chế triều Nguyễn.",
    goiYSua: "Màu hoa hiên hoặc xanh lơ vẫn rực rỡ mà không mang ý nghĩa vương quyền.",
    loaiCanCu: "tai-lieu",
    canCu: "nhat-binh",
  },
  {
    id: "bo-tu-pham-cap",
    mucDo: "vang",
    khiNao: { coTag: ["hoa-van-pham-cap"] },
    giaiThich: "Họa tiết chim quý kiểu Bổ tử là dấu hiệu phẩm cấp quan lại trên triều phục, không phải trang trí tùy ý.",
    goiYSua: "Chọn hoa sen hoặc mây – sóng nước nếu bạn không định tái hiện trang phục quan lại.",
    loaiCanCu: "tai-lieu",
    canCu: "vien-linh",
  },
  {
    id: "trang-phuc-khac-gioi",
    mucDo: "vang",
    khiNao: { trangPhucKhacGioi: true },
    giaiThich: "Theo tài liệu, trang phục này truyền thống dành cho giới còn lại.",
    goiYSua: "Bạn vẫn có thể remix, nhưng nếu muốn đúng truyền thống hãy chọn trang phục dành cho cả nam và nữ như giao lĩnh hay ngũ thân.",
    loaiCanCu: "tai-lieu",
    canCu: "",
  },
  {
    id: "doi-dau-nam-cho-nu",
    mucDo: "vang",
    khiNao: { gioiTinhNhanVat: "nu", coTag: ["doi-dau-nam"] },
    giaiThich: "Khăn xếp và khăn lươn theo truyền thống là đồ đội đầu của nam giới.",
    goiYSua: "Khăn vành dây hoặc khăn mỏ quạ là lựa chọn truyền thống của nữ giới.",
    loaiCanCu: "tai-lieu",
    canCu: "ngu-than-lap-co",
  },
  {
    id: "doi-dau-nu-cho-nam",
    mucDo: "vang",
    khiNao: { gioiTinhNhanVat: "nam", coTag: ["doi-dau-nu"] },
    giaiThich: "Khăn vành dây, khăn mỏ quạ và nón quai thao theo truyền thống là đồ đội đầu của nữ giới.",
    goiYSua: "Khăn xếp hoặc khăn lươn là lựa chọn truyền thống của nam giới.",
    loaiCanCu: "tai-lieu",
    canCu: "tu-than-yem",
  },
  {
    id: "dip-ngoai-boi-canh",
    mucDo: "vang",
    khiNao: { dipNgoaiBoiCanh: true },
    giaiThich: "Dịp bạn chọn không nằm trong bối cảnh sử dụng truyền thống của trang phục này.",
    goiYSua: "Xem các trang phục có nhãn \"Hợp dịp\" để có lựa chọn sát với dịp hơn.",
    loaiCanCu: "tai-lieu",
    canCu: "",
  },
  {
    id: "hien-dai-le-chua",
    mucDo: "vang",
    khiNao: { suKien: ["le-chua"], coTag: ["giay-hien-dai", "phu-kien-hien-dai"] },
    giaiThich: "Đi lễ chùa, đình là dịp trang nghiêm, món đồ hiện đại dễ làm giảm vẻ trang trọng.",
    goiYSua: "Cất kính râm và túi tote khi vào không gian thờ tự.",
    loaiCanCu: "nguyen-tac-remix",
    canCu: "",
  },

  // ===== XANH — phối hài hòa =====
  {
    id: "hien-dai-dao-pho",
    mucDo: "xanh",
    khiNao: { suKien: ["dao-pho", "ky-yeu"], coTag: ["giay-hien-dai", "phu-kien-hien-dai"] },
    giaiThich: "Dạo phố và chụp kỷ yếu là dịp thoải mái, phối thêm món hiện đại là cách remix hợp lý.",
    goiYSua: "Giữ đúng dáng áo truyền thống để bộ phối vẫn nhận ra được loại Việt phục.",
    loaiCanCu: "nguyen-tac-remix",
    canCu: "",
  },
  {
    id: "tu-than-doi-dau",
    mucDo: "xanh",
    khiNao: { outfitIds: ["tu-than-yem"], coTag: ["doi-dau-nu"] },
    giaiThich: "Áo tứ thân đi cùng khăn mỏ quạ hoặc nón quai thao đúng công thức truyền thống của phụ nữ Bắc Bộ.",
    goiYSua: "Thêm váy đụp đen và dải lụa thắt eo để trọn bộ.",
    loaiCanCu: "tai-lieu",
    canCu: "tu-than-yem",
  },
  {
    id: "ba-ba-khan-ran",
    mucDo: "xanh",
    khiNao: { outfitIds: ["ba-ba-khan-ran"], coTag: ["khan-ran"] },
    giaiThich: "Khăn rằn là phụ kiện đặc trưng đi cùng áo bà ba Nam Bộ.",
    goiYSua: "Quấn khăn ở cổ hoặc trên đầu đều đúng truyền thống.",
    loaiCanCu: "tai-lieu",
    canCu: "ba-ba-khan-ran",
  },
  {
    id: "ngu-than-khan-xep",
    mucDo: "xanh",
    khiNao: { outfitIds: ["ngu-than-lap-co", "ao-tac"], gioiTinhNhanVat: "nam", coTag: ["doi-dau-nam"] },
    giaiThich: "Áo ngũ thân hoặc áo tấc đi cùng khăn xếp đúng cách mặc truyền thống của nam giới.",
    goiYSua: "Phối thêm quần trắng để trọn bộ.",
    loaiCanCu: "tai-lieu",
    canCu: "ngu-than-lap-co",
  },
];
