import { GarmentItem, AccessoryItem } from '../types';
import { outfits } from './outfits';

export const VIET_PHUC_GARMENTS: GarmentItem[] = outfits.map((o) => ({
  id: o.id,
  name: o.ten,
  dynasty: o.thoiKy,
  period: o.thoiKy,
  description: o.cauTruc,
  significance: o.yNghia,
  culturalRank:
    o.id === 'vien-linh' || o.id === 'nhat-binh'
      ? 'court'
      : o.id === 'ao-tac'
      ? 'ceremonial'
      : o.id === 'ba-ba-khan-ran'
      ? 'daily'
      : 'festive',
  allowedPantColors: ['#FFFDF7', '#1E1B18', '#2F4A7A'],
  defaultColors: {
    primary:
      o.id === 'giao-linh'
        ? '#D9442B'
        : o.id === 'vien-linh'
        ? '#2F4A7A'
        : o.id === 'ngu-than-lap-co'
        ? '#1E1B18'
        : o.id === 'tu-than-yem'
        ? '#E9B824'
        : '#3E7D4F',
    collar: '#FFFDF7',
    pant: '#FFFDF7',
  },
}));

export const ACCESSORIES_DATABASE: AccessoryItem[] = [
  // Giày / Footwear
  {
    id: 'sneaker-chunky',
    category: 'footwear',
    name: 'Sneaker Chunky Phối Màu Đỏ Sơn',
    modernStyle: 'Streetwear Gen Z',
    description: 'Đế dày phóng khoáng, điểm viền đỏ chu sa tạo nét đối lập thị giác đầy năng động.',
    harmonyLevel: 'high',
    culturalNote: 'Kết hợp hài hòa khi phối cùng dáng áo tà ngắn hoặc vén tà nhẹ, tạo sự năng động cho giới trẻ dạo phố.',
  },
  {
    id: 'bitis-hunter-retro',
    category: 'footwear',
    name: "Giày Biti's Hunter Phố Cổ",
    modernStyle: 'Retro Casual',
    description: 'Thương hiệu quốc dân phiên bản hoa văn thổ cẩm đương đại, êm nhẹ bền bỉ.',
    harmonyLevel: 'high',
    culturalNote: 'Rất ăn ý với Áo Ngũ Thân tay chẽn hoặc Áo Dài tà suông, giữ nét tự hào sản phẩm thuần Việt.',
  },
  {
    id: 'guoc-moc-remix',
    category: 'footwear',
    name: 'Guốc Mộc Sơn Mài Quai Nhung',
    modernStyle: 'Indie Folk / Neo-Heritage',
    description: 'Guốc gỗ xoan đào chạm khắc mây nước truyền thống, đệm quai nhung mềm mại.',
    harmonyLevel: 'high',
    culturalNote: 'Sự kết hợp hoàn hảo tuyệt đối cả về lịch sử lẫn công năng nghi lễ.',
  },
  {
    id: 'boot-da-den',
    category: 'footwear',
    name: 'Combat Boot Da Đen Cổ Cao',
    modernStyle: 'Grunge / Dark Chic',
    description: 'Chất liệu da đanh cá tính với dây thắt kim loại, phom đứng đắn góc cạnh.',
    harmonyLevel: 'medium',
    culturalNote: 'Nên kết hợp với Áo Tấc hoặc Ngũ Thân màu tối/xanh chàm. Tránh diện khi vào các chốn tế lễ nghiêm cẩn.',
  },

  // Nón / Khăn đội đầu
  {
    id: 'khan-van-remix',
    category: 'headwear',
    name: 'Khăn Vấn Lụa Tơ Tằm Cổ Truyền',
    modernStyle: 'Heritage Chic',
    description: 'Khăn vấn xếp nhiều nếp tinh tế theo kiểu Bắc Bộ & Kinh kỳ Huế, đính ghim cài bạc nhỏ.',
    harmonyLevel: 'high',
    culturalNote: 'Chuẩn mực văn hóa tuyệt đối, nâng tầm tính trang nghiêm của bộ trang phục.',
  },
  {
    id: 'non-bucket-dong-ho',
    category: 'headwear',
    name: 'Nón Bucket Hoạ Tiết Lợn Dân Gian',
    modernStyle: 'Harajuku / Pop Art',
    description: 'Mũ tai bèo vải canvas thêu chú lợn âm dương ngộ nghĩnh trên nền vàng điệp.',
    harmonyLevel: 'medium',
    culturalNote: 'Thích hợp đi lễ hội hội chợ văn hóa, fesival sáng tạo trẻ; không hợp không gian thờ phụng.',
  },
  {
    id: 'non-quai-thao-mini',
    category: 'headwear',
    name: 'Nón Quai Thao Remix Đeo Sau Lưng',
    modernStyle: 'Neo-Tradition',
    description: 'Chiếc nón Ba Tầm / Quai Thao thu nhỏ cách điệu, quàng dây lụa hồng hoa quỳ sau lưng.',
    harmonyLevel: 'high',
    culturalNote: 'Gợi nhớ duyên dáng quan họ Bắc Ninh khi phối cùng Áo Giao Lĩnh hoặc Áo Tấc.',
  },
  {
    id: 'none-headwear',
    category: 'headwear',
    name: 'Để Tóc Tự Nhiên (Không Đội Nón)',
    modernStyle: 'Minimalist',
    description: 'Mái tóc gọn hoặc buông xõa thanh lịch tự nhiên.',
    harmonyLevel: 'high',
    culturalNote: 'Tự nhiên, trẻ trung và dễ ứng dụng hằng ngày.',
  },

  // Kính mắt / Eyewear
  {
    id: 'kinh-ram-cyber',
    category: 'eyewear',
    name: 'Kính Râm Cyber Y2K Gọng Bạc',
    modernStyle: 'Cyberpunk Y2K',
    description: 'Tròng kính tráng gương hình giọt nước thuôn dài tương lai.',
    harmonyLevel: 'sensitive',
    culturalNote: 'Tạo điểm nhấn thị giác cực mạnh cho concept chụp hình đường phố (Street-snap). Tuy nhiên, tháo kính khi thực hiện nghi lễ bái tổ.',
  },
  {
    id: 'kinh-gong-vang-thay-do',
    category: 'eyewear',
    name: 'Kính Tròn Cổ Điển Gọng Vàng',
    modernStyle: 'Intellectual Vintage',
    description: 'Kính mắt tròn tao nhã của giới học giả trí thức đầu thế kỷ 20.',
    harmonyLevel: 'high',
    culturalNote: 'Rất tôn nét Nho nhã khi kết hợp cùng Áo Ngũ Thân hoặc Áo Tấc.',
  },
  {
    id: 'none-eyewear',
    category: 'eyewear',
    name: 'Không Đeo Kính',
    modernStyle: 'Classic',
    description: 'Khuôn mặt sáng, ánh nhìn chân phương.',
    harmonyLevel: 'high',
    culturalNote: 'Giữ nguyên nét đẹp thanh tú thuần chất.',
  },

  // Cầm tay / Handheld
  {
    id: 'tui-tote-dong-ho',
    category: 'handheld',
    name: 'Túi Tote Vải Bố "Hứng Dừa Remix"',
    modernStyle: 'Gen Z Eco Daily',
    description: 'Túi tote in mộc tranh dân gian trên nền vải mộc canvas dệt thô thân thiện môi trường.',
    harmonyLevel: 'high',
    culturalNote: 'Vừa tiện dụng đựng iPad, sổ tay vừa đồng điệu tuyệt hảo với triết lý thẩm mỹ dân gian.',
  },
  {
    id: 'quat-giay-cham-sen',
    category: 'handheld',
    name: 'Quạt Giấy Xanh Chàm Hoạ Sen Điệp',
    modernStyle: 'Artisan Craft',
    description: 'Quạt nan tre dán giấy dó nhuộm chàm, rắc vụn vỏ sò điệp óng ánh lấp lánh.',
    harmonyLevel: 'high',
    culturalNote: 'Vật bất ly thân tao nhã của cổ nhân, cực kỳ phù hợp trong mọi bối cảnh.',
  },
  {
    id: 'tai-nghe-over-ear',
    category: 'handheld',
    name: 'Tai Nghe Over-Ear Kim Loại Cổ Điển',
    modernStyle: 'Lo-Fi Chill Hop',
    description: 'Tai nghe quàng cổ bọc da nâu viền kim loại bạc sáng bóng.',
    harmonyLevel: 'medium',
    culturalNote: 'Thể hiện một Gen Z đắm chìm trong âm hưởng nhạc cụ dân tộc cải biên (Ca trù chill, nhã nhạc lofi).',
  },
  {
    id: 'tra-sua-dat-nung',
    category: 'handheld',
    name: 'Bình Trà Gốm Nung Dáng Cổ',
    modernStyle: 'Modern Tea Enthusiast',
    description: 'Bình trà gốm mộc quai mây đựng trà sen Tây Hồ nóng hổi.',
    harmonyLevel: 'high',
    culturalNote: 'Nét thưởng trà phong nhã hài hòa với khí chất thanh tao của cổ phục.',
  },

  // Trang sức / Jewelry
  {
    id: 'kieng-bac-hoa-sen',
    category: 'jewelry',
    name: 'Vòng Kiềng Bạc Chạm Hoa Sen Cung Đình',
    modernStyle: 'Royal Silver',
    description: 'Kiềng bạc nguyên khối uốn quanh cổ, chạm nổi cánh sen tinh xảo lối kim hoàn Đồng Xâm.',
    harmonyLevel: 'high',
    culturalNote: 'Món trang sức truyền thống không thể thiếu của các quý cô khi diện áo Nhật Bình hay Áo Tấc.',
  },
  {
    id: 'chuoi-hat-tram-charm-bac',
    category: 'jewelry',
    name: 'Chuỗi Trầm Hương 108 Hạt Mix Charm Ngũ Hành',
    modernStyle: 'Neo-Zen',
    description: 'Vòng trầm hương tự nhiên thoảng hương ấm áp, đính hạt bạc khắc chữ Phúc Lộc.',
    harmonyLevel: 'high',
    culturalNote: 'Biểu trưng cho sự an yên, tâm tính trầm tĩnh hòa quyện cùng cốt cách Việt.',
  },
  {
    id: 'none-jewelry',
    category: 'jewelry',
    name: 'Không Đeo Trang Sức',
    modernStyle: 'Clean Minimal',
    description: 'Giản dị, mộc mạc.',
    harmonyLevel: 'high',
    culturalNote: 'Phù hợp khi muốn tập trung trọn vẹn vào hoa văn của tấm áo.',
  },
];

export const COLOR_PALETTES = [
  { id: 'do-son', name: 'Đỏ Chu Sa (Sơn)', hex: '#D9442B', meaning: 'Màu từ đá son tự nhiên, tượng trưng sinh khí may mắn & uy quyền triều đình.' },
  { id: 'vang-hoe', name: 'Vàng Hoa Hòe (Hòe)', hex: '#E9B824', meaning: 'Màu từ nụ hoa hòe phơi khô, sắc vàng ấm rạng rỡ của đất trời màu mỡ.' },
  { id: 'xanh-cham', name: 'Xanh Chàm (Chàm)', hex: '#2F4A7A', meaning: 'Nhuộm từ lá chàm rừng sâu, màu sắc trầm tĩnh, bền bỉ của người Việt.' },
  { id: 'den-than', name: 'Đen Mực Than (Đen)', hex: '#1E1B18', meaning: 'Mực giã từ than lá tre đốt kín, sắc nét viền mộc vững chãi.' },
  { id: 'trang-diep', name: 'Trắng Vỏ Điệp (Trắng)', hex: '#FFFDF7', meaning: 'Bột vỏ sò điệp nghiền mịn hồ nếp, óng ánh phản quang lấp lánh như ngọc.' },
  { id: 'xanh-tre', name: 'Xanh Rừng Tre (Lục)', hex: '#3E7D4F', meaning: 'Màu gỉ đồng xanh và rặng tre ngà thân thuộc làng quê.' },
];

export const SKIN_TONES = [
  { id: 'ivory', name: 'Trắng Sứ Điệp', hex: '#FFE7D1' },
  { id: 'peach', name: 'Hồng Đào Tươi', hex: '#F7D0B7' },
  { id: 'honey', name: 'Bánh Mật Khỏe Khoắn', hex: '#E2B184' },
  { id: 'bronze', name: 'Đồng Hun Nắng Gió', hex: '#BF8A5C' },
];
