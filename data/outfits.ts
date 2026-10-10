// outfits.ts — Dữ liệu Việt phục cho app "Việt phục Remix"
// Nguồn nội dung: VietPhuc_KnowledgeBase_v2 (đã làm sạch). Trạng thái: chờ đội duyệt.
// Các trường suKienPhuHop là SUY LUẬN từ bối cảnh sử dụng trong tài liệu — đội cần xác nhận.

export type Gender = "nam" | "nu" | "ca-hai";
export type Occasion = "tet" | "ky-yeu" | "le-hoi" | "cuoi-hoi" | "dao-pho" | "le-chua";

export interface Source {
  ten: string;
  url: string;
  hang: "A" | "B";
}

export interface Outfit {
  id: string;
  ten: string;
  tenKhac: string[];
  thoiKy: string;
  gioiTinh: Gender;
  cauTruc: string;
  diemNhanDien: {
    coAo: string;
    chieuVat: string;
    cachCai: string;
    tayAo: string;
    doDaiVaLop: string;
  };
  boiCanhSuDung: string;
  yNghia: string;
  mauTruyenThong: string[];
  phuKienDiKem: { nam: string[]; nu: string[] };
  suKienPhuHop: Occasion[];
  luuY: string[];
  nguon: Source[];
  thamKhaoThem: string[];
  anhThamChieu: string[];
  canDuyet: string[];
  demo: boolean;
  trangThai: "cho-duyet" | "da-duyet";
}

const KHAM_DINH: Source = {
  ten: "Khâm định Đại Nam hội điển sự lệ tục biên - Viện Sử học",
  url: "https://viensuhoc.vass.gov.vn/cong-trinh-tieu-bieu/kham-dinh-dai-nam-hoi-dien-su-le-tuc-bien-434950",
  hang: "A",
};

const NGAN_NAM_AO_MU: Source = {
  ten: "Sách Ngàn năm áo mũ (Trần Quang Đức) - trang giới thiệu trên OpenEdu",
  url: "https://openedu.vn/khoa-hoc/sach-ngan-nam-ao-mu-khoa-1972",
  hang: "A",
};

const TUOI_TRE_NGU_THAN: Source = {
  ten: "Áo ngũ thân thời Nguyễn trở về trong đời sống giới trẻ - Báo Tuổi Trẻ",
  url: "https://tuoitre.vn/ao-ngu-than-thoi-nguyen-tro-ve-trong-doi-song-gioi-tre-viet-20210224092341015.htm",
  hang: "B",
};

export const outfits: Outfit[] = [
  {
    id: "giao-linh",
    ten: "Áo Giao lĩnh",
    tenKhac: ["Áo cổ chéo", "Áo vạt chéo", "Áo tràng bạt"],
    thoiKy: "Từ thời Bắc thuộc cho đến hết thời Lê Trung Hưng",
    gioiTinh: "ca-hai",
    cauTruc:
      "Áo xẻ ngực, hai vạt đè chéo lên nhau tạo thành hình chữ V trước ngực, vạt trái đè vạt phải (tả thân áp hữu thân). Áo thường ghép từ 4 đến 5 khổ vải hẹp, xẻ tà hai bên hông và có dải dây vải ở hông để buộc cố định.",
    diemNhanDien: {
      coAo: "Cổ chéo xẻ ngực, hai vạt đè chéo tạo hình chữ V trước ngực",
      chieuVat: "Vạt bên trái luôn đè lên vạt bên phải (tả thân áp hữu thân)",
      cachCai: "Buộc bằng dải dây vải phía hông để cố định vạt trong và vạt ngoài",
      tayAo: "Tay thụng (ống tay rộng) cho lễ tiết và quý tộc, hoặc tay chẽn (tay hẹp) cho làm việc và sinh hoạt thường nhật",
      doDaiVaLop:
        "Xẻ tà hai bên hông; nam mặc cùng quần ống rộng hoặc khố, nữ mặc phủ ngoài áo yếm và váy đụp đen, thắt dải lụa ngang eo",
    },
    boiCanhSuDung:
      "Từng được coi là quốc phục thời nhà Lê, phổ biến khắp Đàng Ngoài từ vua chúa, quan lại đến thường dân. Trong cung đình dùng làm đại lễ phục, tế phục mặc phủ ngoài; trong dân gian dùng cho cả lễ tiết lẫn sinh hoạt thường nhật.",
    yNghia:
      "Vạt trái (Dương) đè vạt phải (Âm) thể hiện triết lý Âm Dương cân bằng. Dáng áo buông rủ mềm mại toát lên phong thái nhã nhặn, tự do mà vẫn mực thước của người Việt xưa.",
    mauTruyenThong: [],
    phuKienDiKem: {
      nam: ["quần ống rộng", "khố"],
      nu: ["áo yếm", "váy đụp đen", "dải lụa thắt ngang eo"],
    },
    suKienPhuHop: ["le-hoi", "dao-pho"],
    luuY: ["Vạt bên trái phải đè lên vạt bên phải (tả thân áp hữu thân), không mặc ngược chiều vạt"],
    nguon: [KHAM_DINH, NGAN_NAM_AO_MU],
    thamKhaoThem: [],
    anhThamChieu: ["https://drive.google.com/drive/folders/18WbcNcGLeI9INwZET1f55P3uURbDlBgV?usp=drive_link"],
    canDuyet: [],
    demo: true,
    trangThai: "cho-duyet",
  },
  {
    id: "vien-linh",
    ten: "Áo Viên lĩnh",
    tenKhac: ["Áo cổ tròn", "Áo đoàn lĩnh"],
    thoiKy: "Thời Lý, Trần, Lê và Nguyễn",
    // Tài liệu chỉ nhắc vua chúa, quan lại và nam giới dân gian → "nam". Đội xác nhận lại.
    gioiTinh: "ca-hai",
    cauTruc:
      "Cổ khoét tròn ôm sát chân cổ, cố định bằng khuy gài lệch về phía vai và nách phải; thân áo may rộng, xẻ tà hai bên hông hoặc có tà lót bên trong. Triều phục Viên lĩnh của vua quan thường thêu Bổ tử trước ngực và sau lưng để phân định phẩm cấp.",
    diemNhanDien: {
      coAo: "Cổ khoét tròn, ôm sát chân cổ người mặc",
      chieuVat: "không có dữ liệu",
      cachCai: "Khuy gài lệch về phía vai và nách phải",
      tayAo: "không có dữ liệu riêng (thời Lê Trung Hưng, nam giới dân gian được mặc loại hẹp tay hoặc ngắn tay)",
      doDaiVaLop: "Thân áo may rộng rãi, xẻ tà hai bên hông hoặc có tà lót bên trong",
    },
    boiCanhSuDung:
      "Lễ phục và công phục chính thức của vua chúa, hoàng tộc và quan lại trong các buổi thiết triều, ban yến, xử lý công đường. Thời Lê Trung Hưng, nam giới dân gian cũng được mặc áo cổ tròn hẹp tay hoặc ngắn tay để tiện lao động.",
    yNghia:
      "Cổ tròn tượng trưng cho vòm Trời trong quan niệm \"Thiên tròn Đất vuông\", biểu thị sự trọn vẹn, kỷ cương và trật tự. Khoác áo Viên lĩnh mang ý nghĩa người làm quan đang thực thi mệnh trời, giữ gìn phép nước.",
    mauTruyenThong: [],
    phuKienDiKem: { nam: [], nu: [] },
    suKienPhuHop: ["le-hoi"],
    luuY: [
      "Cổ áo gài khuy lệch về phía vai và nách phải",
      "Bổ tử (thêu linh thú, chim quý) là dấu hiệu phẩm cấp quan lại trên triều phục, không phải họa tiết trang trí tùy ý",
    ],
    nguon: [KHAM_DINH, NGAN_NAM_AO_MU],
    thamKhaoThem: [],
    anhThamChieu: ["https://drive.google.com/drive/folders/1V_FOMNWtvO_U1YTQ0zJ7tI7mt2A4aalu?usp=drive_link"],
    canDuyet: [],
    demo: true,
    trangThai: "cho-duyet",
  },
  {
    id: "truc-linh",
    ten: "Áo Trực lĩnh",
    tenKhac: ["Áo cổ thẳng"],
    thoiKy: "Thời Lê Trung Hưng (thế kỷ XVII – XVIII)",
    gioiTinh: "ca-hai",
    cauTruc:
      "Cổ áo may thẳng, xẻ dọc từ cổ xuống chân tà; áo có thể cài khuy song song hoặc thả tà khoác ngoài áo lót. Tay áo rộng vừa hoặc tay chẽn.",
    diemNhanDien: {
      coAo: "Cổ thẳng, xẻ dọc từ cổ xuống chân tà",
      chieuVat: "Hai vạt xẻ dọc thẳng từ cổ xuống chân tà",
      cachCai: "Cài khuy song song hoặc thả tà khoác ngoài áo lót",
      tayAo: "Tay rộng vừa hoặc tay chẽn",
      doDaiVaLop:
        "Nam mặc cùng quần suông; nữ khoác ngoài áo yếm và váy quây, dải thắt lưng buộc buông rủ",
    },
    boiCanhSuDung:
      "Trang phục sinh hoạt đời thường của sĩ phu, nữ giới và dân thường thời Hậu Lê, đáp ứng tính thực dụng và sự linh hoạt trong lao động cũng như giao tiếp xã hội.",
    yNghia:
      "Kiểu áo đời thường của thời Hậu Lê, đề cao sự thực dụng và linh hoạt. Dải thắt lưng buông rủ tạo nét thon thả, thanh thoát cho người mặc.",
    mauTruyenThong: ["thâm", "xanh sẫm", "màu sừng"],
    phuKienDiKem: {
      nam: ["quần suông"],
      nu: ["áo yếm", "váy quây", "dải thắt lưng"],
    },
    suKienPhuHop: ["dao-pho"],
    luuY: ["Nữ giới mặc khoác ngoài áo yếm và váy quây, kèm dải thắt lưng buộc buông rủ"],
    nguon: [
      {
        ten: "Khám phá trang phục Việt cổ tại Bảo tàng TPHCM - VietNamNet",
        url: "https://vietnamnet.vn/kham-pha-trang-phuc-viet-co-tai-bao-tang-tphcm-2466128.html",
        hang: "B",
      },
    ],
    thamKhaoThem: [],
    anhThamChieu: ["https://drive.google.com/drive/folders/1FBtpTjhfZyK-RC762RgcHSfXCqz3zkte?usp=drive_link"],
    canDuyet: [],
    demo: false,
    trangThai: "cho-duyet",
  },
  {
    id: "ngu-than-lap-co",
    ten: "Áo Ngũ Thân Lập Cổ",
    tenKhac: ["Áo dài ngũ thân"],
    thoiKy: "Thế kỷ XIX và đầu thế kỷ XX (khởi đầu từ cải cách năm 1744)",
    gioiTinh: "ca-hai",
    cauTruc:
      "Gồm 5 thân vải: hai thân trước ghép thành vạt cả, hai thân sau ghép thành vạt sau, và vạt con nằm ẩn bên trong vạt cả. Cổ đứng ôm sát, 5 khuy gài chéo từ cổ xuống nách và hông phải; dáng suông rộng vừa phải, xẻ tà từ hông.",
    diemNhanDien: {
      coAo: "Cổ đứng (lập cổ), ôm sát cổ, kín đáo",
      chieuVat: "Vạt cả rộng bên ngoài che vạt con (vạt lót) bên trong",
      cachCai: "5 khuy (gỗ, đá, ngọc hoặc kim loại) gài chéo từ cổ xuống nách và kéo dài xuống hông phải",
      tayAo: "Tay chẽn (ôm sát cẳng tay, thường phục) hoặc tay thụng (rộng bản, lễ phục)",
      doDaiVaLop:
        "Dáng suông rộng vừa phải, xẻ tà từ hông; nam mặc cùng quần trắng và khăn xếp, nữ mặc cùng quần tuyết bạch hoặc váy lụa",
    },
    boiCanhSuDung:
      "Trang phục quốc dân của người Việt suốt thế kỷ XIX và đầu thế kỷ XX, sau cải cách của Chúa Nguyễn Phúc Khoát và chính sách thống nhất y phục của Vua Minh Mạng. Nam lẫn nữ, từ vua quan đến dân thường đều mặc.",
    yNghia:
      "Bốn vạt ngoài tượng trưng cho Tứ thân phụ mẫu che chở vạt con – chính là bản thân người mặc; năm khuy áo đại diện cho Ngũ thường hay Ngũ đức. Cổ đứng kín đáo nhắc về sự lịch sự, khiêm nhường.",
    mauTruyenThong: [],
    phuKienDiKem: {
      nam: ["quần trắng", "khăn xếp"],
      nu: ["quần tuyết bạch", "váy lụa"],
    },
    suKienPhuHop: ["tet", "le-hoi", "dao-pho"],
    luuY: [
      "Áo có 5 khuy gài chéo từ cổ xuống nách và hông phải",
      "Cổ áo là cổ đứng (lập cổ) ôm sát cổ",
    ],
    nguon: [
      {
        ten: "Hiểu đúng để bảo tồn áo ngũ thân truyền thống - Báo Đại biểu Nhân dân",
        url: "https://daibieunhandan.vn/hieu-dung-de-bao-ton-ao-ngu-than-truyen-thong-10283118.html",
        hang: "B",
      },
      TUOI_TRE_NGU_THAN,
      {
        ten: "Nét văn hóa trong trang phục của người Hà Nội - VietNamNet",
        url: "https://vietnamnet.vn/net-van-hoa-trong-trang-phuc-cua-nguoi-ha-noi-1022.html",
        hang: "B",
      },
    ],
    thamKhaoThem: [],
    anhThamChieu: ["https://drive.google.com/drive/folders/1BYXIkBGfRUzA6JlhG8E64RtmPCxOtBC3?usp=drive_link"],
    canDuyet: ["#1", "#5"],
    demo: true,
    trangThai: "cho-duyet",
  },
  {
    id: "ao-tac",
    ten: "Áo Tấc",
    tenKhac: ["Áo Lễ", "Áo Ngũ Thân Tay Thụng"],
    thoiKy: "Triều Nguyễn (1802 – 1945)",
    gioiTinh: "ca-hai",
    cauTruc:
      "Giữ nguyên cấu trúc 5 thân và cổ đứng của áo Ngũ Thân Lập Cổ, nhưng ống tay rộng khoảng 1 tấc vải và dài qua đầu ngón tay. Thường may bằng gấm, sa, lụa sẫm màu hoặc tông màu trang nhã.",
    diemNhanDien: {
      coAo: "Cổ đứng (lập cổ) như áo ngũ thân",
      chieuVat: "Cấu trúc 5 thân như áo ngũ thân (vạt cả che vạt con)",
      cachCai: "không có dữ liệu riêng (giữ cấu trúc áo ngũ thân)",
      tayAo: "Tay thụng rộng khoảng 1 tấc vải, dài qua đầu ngón tay",
      doDaiVaLop:
        "Nam mặc cùng quần trắng suông, khăn xếp đen hoặc xanh; nữ mặc cùng quần lụa tuyết bạch hoặc váy lụa, quấn khăn xếp hoặc vành dây",
    },
    boiCanhSuDung:
      "Lễ phục trong các nghi lễ trang trọng như lễ chạp, cúng tế, đám cưới, lễ thọ, viếng đình chùa của sĩ phu và tầng lớp trung lưu, thượng lưu thời Nguyễn. Ngày nay giới trẻ mặc áo Tấc trong lễ tốt nghiệp, đám cưới truyền thống, chụp ảnh kỷ yếu.",
    yNghia:
      "Khi chắp tay làm lễ, hai ống tay thụng rủ xuống thành vòm cung cân đối, thể hiện sự kính cẩn trước tổ tiên. Vì vậy áo Tấc gắn với những dịp nghi lễ trang trọng.",
    mauTruyenThong: ["thâm", "lam", "tím"],
    phuKienDiKem: {
      nam: ["quần trắng suông", "khăn xếp đen", "khăn xếp xanh"],
      nu: ["quần lụa tuyết bạch", "váy lụa", "khăn xếp", "khăn vành dây"],
    },
    suKienPhuHop: ["le-hoi", "cuoi-hoi", "le-chua", "ky-yeu"],
    luuY: ["Tay áo thụng rộng khoảng 1 tấc vải và dài qua đầu ngón tay"],
    nguon: [TUOI_TRE_NGU_THAN],
    thamKhaoThem: [],
    anhThamChieu: ["https://drive.google.com/drive/folders/1aNVVqjGMIgqnHBHenWFuS7KdlGFtLGhr?usp=drive_link"],
    canDuyet: [],
    demo: false,
    trangThai: "cho-duyet",
  },
  {
    id: "nhat-binh",
    ten: "Áo Nhật Bình",
    tenKhac: ["Phi Phong Đối Khâm"],
    thoiKy: "Triều Nguyễn (quy định từ năm 1807)",
    gioiTinh: "nu",
    cauTruc:
      "Áo đối khâm xẻ dọc giữa ngực, bản viền cổ to tạo thành hình chữ nhật trước ngực. Tay áo rộng và dài, cửa tay dệt hoặc thêu 5 vạch ngũ sắc, thả hai dải Thùy lưu, cố định bằng cúc nạm ngọc, vàng hoặc đá quý.",
    diemNhanDien: {
      coAo: "Bản viền cổ to xẻ dọc trước ngực, hai bờ cổ ghép lại tạo dáng chữ Nhật (日)",
      chieuVat: "Đối khâm (xẻ dọc chính giữa trước ngực)",
      cachCai: "Cúc nạm ngọc, vàng hoặc đá quý",
      tayAo: "Rộng và dài; cửa tay có 5 vạch ngũ sắc, dưới cổ tay thả hai dải Thùy lưu",
      doDaiVaLop: "Mặc kèm quần ống màu tuyết bạch, đầu quấn khăn vành hoặc đội mũ Kim ước/Kim phượng",
    },
    boiCanhSuDung:
      "Triều phục và lễ phục bắt buộc của Hoàng hậu, Hoàng thái hậu, Công chúa, Phi tần, Mệnh phụ trong các đại lễ như Tết Nguyên Đán, Tế Giao, triều hội, cưới hỏi hoàng gia. Cuối thời Nguyễn trở thành lễ phục cưới của cô dâu quý tộc.",
    yNghia:
      "Đỉnh cao thẩm mỹ cung đình Huế, thể hiện sự phân định thứ bậc nghiêm cẩn. Dải ngũ sắc ở tay áo tượng trưng Ngũ hành hòa hợp; hoa văn phượng, sen, bát bửu, sóng nước gửi gắm ước vọng bình an, trường thọ.",
    mauTruyenThong: ["vàng chính sắc", "cam", "đỏ chính sắc", "xích đào", "tím sẫm", "tím nhạt"],
    phuKienDiKem: {
      nam: [],
      nu: ["quần ống màu tuyết bạch", "khăn vành", "mũ Kim ước", "mũ Kim phượng"],
    },
    suKienPhuHop: ["tet", "le-hoi", "cuoi-hoi"],
    luuY: [
      "Trang phục của nữ giới",
      "Màu sắc và hoa văn phân định theo phẩm cấp: Hoàng hậu mặc vàng chính sắc hoặc cam thêu rồng phượng; Công chúa đỏ chính sắc thêu Phượng ổ; Phi tần xích đào hoặc tím",
    ],
    nguon: [
      KHAM_DINH,
      {
        ten: "Lệ trong Khâm định Đại Nam hội điển sự lệ - Tạp chí Tòa án",
        url: "https://tapchitoaan.vn/le-trong-kham-dinh-dai-nam-hoi-dien-su-le",
        hang: "B",
      },
      {
        ten: "Áo Nhật Bình - Nét đẹp cổ phục Việt - Báo Tuổi Trẻ",
        url: "https://tuoitre.vn/dulichtphcm/ao-nhat-binh-net-dep-co-phuc-viet-dac-sac-thoi-chua-nguyen-10716451.htm",
        hang: "B",
      },
      {
        ten: "Áo Nhật Bình là trang phục cung đình nổi tiếng ở triều đại nào của Việt Nam - VietNamNet",
        url: "https://vietnamnet.vn/ao-nhat-binh-la-trang-phuc-cung-dinh-noi-tieng-o-trieu-dai-nao-cua-viet-nam-2118986.html",
        hang: "B",
      },
    ],
    thamKhaoThem: ["https://vi.wikipedia.org/wiki/%C3%81o_Nh%E1%BA%ADt_b%C3%ACnh"],
    anhThamChieu: ["https://drive.google.com/drive/folders/1g_-asXVxdpXjmMmcgwuYtu23aExTnTSi?usp=drive_link"],
    canDuyet: ["#4"],
    demo: false,
    trangThai: "cho-duyet",
  },
  {
    id: "tu-than-yem",
    ten: "Áo Tứ Thân & Yếm",
    tenKhac: ["Áo Tứ Thân"],
    thoiKy: "Thế kỷ XVII đến giữa thế kỷ XX",
    gioiTinh: "nu",
    cauTruc:
      "May từ 4 khổ vải dài hẹp: hai thân sau khâu sống giữa lưng phủ quá gối, hai thân trước tách rời để buộc thắt nút trước bụng. Áo không có khuy, mặc ngoài áo yếm và váy đụp đen xòe rộng.",
    diemNhanDien: {
      coAo: "không có dữ liệu",
      chieuVat: "Hai vạt sau khâu sống giữa lưng; hai vạt trước tách rời, buộc thắt nút trước bụng",
      cachCai: "Không có khuy, hai vạt trước buộc thắt nút",
      tayAo: "không có dữ liệu",
      doDaiVaLop:
        "Vạt sau phủ quá gối; bên trong mặc áo yếm (cổ xây hoặc cổ xẻ), dưới mặc váy đụp đen, eo thắt dải lụa màu, đầu đội khăn mỏ quạ hoặc nón lá ba tầm, nón quai thao",
    },
    boiCanhSuDung:
      "Trang phục lao động và sinh hoạt thường nhật của phụ nữ nông thôn Đồng bằng Bắc Bộ và vùng Kinh Bắc. Dịp hội hè, lễ chùa, cưới hỏi, áo may bằng lụa, the màu rực rỡ phối yếm thắm thành lễ phục của các liền chị.",
    yNghia:
      "Vẻ đẹp mộc mạc, tháo vát và đằm thắm của người phụ nữ Bắc Bộ. Bốn thân áo tượng trưng Tứ thân phụ mẫu, nút buộc trước bụng tượng trưng sự gắn kết thủy chung.",
    mauTruyenThong: ["nâu củ nâu", "đen nhuộm thâm", "màu hoa hiên", "xanh lơ"],
    phuKienDiKem: {
      nam: [],
      nu: [
        "áo yếm (cổ xây hoặc cổ xẻ)",
        "váy đụp đen",
        "dải lụa màu thắt eo",
        "khăn mỏ quạ",
        "nón lá ba tầm",
        "nón quai thao",
      ],
    },
    suKienPhuHop: ["le-hoi", "dao-pho", "le-chua", "cuoi-hoi"],
    luuY: [
      "Trang phục của nữ giới",
      "Hai vạt trước buộc thắt nút, không dùng khuy",
      "Cách mặc truyền thống: áo yếm bên trong, váy đụp đen, dải lụa thắt eo",
    ],
    nguon: [
      NGAN_NAM_AO_MU,
      {
        ten: "Ngắm 50 hiện vật áo dài Việt Nam - Báo Tuổi Trẻ",
        url: "https://tuoitre.vn/phunuonline/ngam-50-hien-vat-ao-dai-viet-nam-11061392.htm",
        hang: "B",
      },
    ],
    thamKhaoThem: [],
    anhThamChieu: ["https://drive.google.com/drive/folders/15PI7fvQCmO5ChGbinZskQOG3Bi6VsC16?usp=drive_link"],
    canDuyet: ["#3"],
    demo: true,
    trangThai: "cho-duyet",
  },
  {
    id: "ba-ba-khan-ran",
    ten: "Áo Bà Ba & Khăn Rằn",
    tenKhac: ["Áo Bà Ba"],
    thoiKy: "Đầu thế kỷ XX đến nay",
    gioiTinh: "ca-hai",
    cauTruc:
      "Áo vạt ngắn, xẻ giữa ngực, cổ tròn không bâu, cài khuy nhựa hoặc khuy đồng. Áo nam có 2 túi to ở vạt trước; áo nữ chiết eo, tà lượn mềm, bản cải tiến có thêm cổ lá sen, chắp vai, tay raglan.",
    diemNhanDien: {
      coAo: "Cổ tròn không bâu (bản nữ cải tiến có cổ lá sen)",
      chieuVat: "Xẻ giữa ngực, vạt ngắn",
      cachCai: "Khuy nhựa hoặc khuy đồng",
      tayAo: "không có dữ liệu (bản nữ cải tiến có ráp tay raglan)",
      doDaiVaLop:
        "Áo vạt ngắn; nam mặc cùng quần đen ống rộng suông, quấn khăn rằn ở cổ hoặc trên đầu; nữ mặc cùng quần lụa đen rộng suông",
    },
    boiCanhSuDung:
      "Gắn với khai hoang mở cõi và đời sống sông nước Nam Bộ. Đi đồng, lao động, chèo thuyền dùng màu đen, nâu; đi chơi, lễ tiết chọn lụa hoặc the màu nhẹ nhàng.",
    yNghia:
      "Mộc mạc, bình dị mà phóng khoáng, can trường – đúng chất cư dân sông nước Nam Bộ. Bộ trang phục tôn vinh sự linh hoạt, tháo vát trong tiến trình mở đất phương Nam.",
    mauTruyenThong: ["đen", "nâu", "xanh lơ", "mạ non", "trắng"],
    phuKienDiKem: {
      nam: ["quần đen ống rộng suông", "khăn rằn"],
      nu: ["quần lụa đen rộng suông"],
    },
    suKienPhuHop: ["dao-pho", "le-hoi"],
    luuY: [
      "Khăn rằn quấn cổ hoặc đội đầu là phụ kiện đặc trưng",
      "Áo nam có 2 túi to ở vạt trước; áo nữ chiết eo, tà lượn mềm",
    ],
    nguon: [
      {
        ten: "Nét đặc trưng trong trang phục nông dân Nam bộ - Báo Tuổi Trẻ",
        url: "https://tuoitre.vn/net-dac-trung-trong-trang-phuc-nong-dan-nam-bo-251053.htm",
        hang: "B",
      },
    ],
    thamKhaoThem: [],
    anhThamChieu: ["https://drive.google.com/drive/folders/1KvyAafBIg34gXHwmq77cOt6x9K-Kz88M?usp=drive_link"],
    canDuyet: [],
    demo: true,
    trangThai: "cho-duyet",
  },
];

export const SHOW_ONLY_APPROVED = false;
