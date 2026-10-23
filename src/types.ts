export type GenreTag = 
  | 'txvt'
  | 'hiện đại'
  | 'open world'
  | 'cổ trang'
  | 'BG/BL'
  | 'ngọt'
  | 'ngược'
  | 'chữa lành';

export const PRESET_TAGS: string[] = [
  'txvt',
  'hiện đại',
  'open world',
  'cổ trang',
  'BG/BL',
  'ngọt',
  'ngược',
  'chữa lành'
];

export interface CharacterComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface Character {
  id: string;
  name: string;
  title: string; // Tagline / Mô tả ngắn
  avatar: string; // Avatar URL / File Data URL
  tags: string[]; // Các tag / từ khóa
  creator: string; // Tác giả (mặc định Admin)
  chatUrl: string; // Link 1 (mặc định "Tiến tới Ggai")
  chatUrl2?: string; // Link 2 (tùy chọn dự phòng / bổ sung)
  chatUrlLabel?: string; // Nhãn tùy chỉnh nút link 1
  chatUrl2Label?: string; // Nhãn tùy chỉnh nút link 2
  votes: number; // Mặc định 0
  likes: number; // Mặc định 0
  createdAt?: string;
  isFavorite?: boolean;
  isDraft?: boolean; // Trạng thái bản nháp (lưu nháp khi tạo/sửa)
  isPrivate?: boolean; // Trạng thái riêng tư (chỉ Creator/Admin thấy)
  notes?: string; // Ghi chú nhân vật
  password?: string; // Mật khẩu truy cập (nếu có)
  story?: string; // Cốt truyện / STORY của nhân vật
  firstMessage?: string; // Tin nhắn đầu tiên / FIRST MESSAGE
  decorativeItemSet?: string; // Bộ item trang trí riêng (vd: '♡ ୨୧ ♡', '✦ ── ✦', '˚₊‧ ୨୧ ‧₊˚', '꒰ა ♡ ໒꒱')
  comments?: CharacterComment[]; // Danh sách bình luận thực tế (AI không tự tạo)
}

export interface AppNotification {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isRead?: boolean;
  type?: 'announcement' | 'new_character';
  characterId?: string;
}

export interface ContactInfo {
  facebookPage: string;
  nglLink: string;
}

export type PaperStyle = 'white' | 'cream' | 'pink' | 'lavender' | 'blue';

export type BookmarkPaperStyle =
  | 'cream'     // Giấy kem
  | 'pink'      // Giấy hồng nhạt
  | 'lavender'  // Giấy tím nhạt
  | 'blue'      // Giấy xanh nhạt
  | 'gingham'   // Giấy caro
  | 'floral'    // Giấy có hoa văn nhỏ
  | 'lace'      // Bookmark ren
  | 'star'      // Bookmark ngôi sao
  | 'ribbon'    // Bookmark nơ
  | 'vintage';  // Bookmark giấy cũ

export type BookmarkTailDecor = '♡' | '୨୧' | '✦' | '〜' | '˚₊‧' | '꒰ა ໒꒱';

export interface CharacterBookmark {
  characterId: string;
  createdAt: string;
  paperStyle: BookmarkPaperStyle;
  tailDecor: BookmarkTailDecor;
  readingProgress?: number; // 0-100 percentage
  chapterIndex?: number;
  lastReadAt?: string;
  order?: number;
}

export interface BoardNote {
  id: string;
  author: string;          // Tên do người dùng tự nhập
  content: string;         // Nội dung do người dùng tự nhập
  imageUrl?: string;       // Ảnh đính kèm trực tiếp (nếu có)
  createdAt: string;       // Thời gian ISO string
  updatedAt?: string;      // Thời gian cập nhật ISO string
  creatorToken?: string;   // Token nhận diện tác giả để chỉnh sửa & xóa
  likes: number;           // Số lượt thả tim
  paperStyle: PaperStyle;  // Kiểu giấy (white, cream, pink, lavender, blue)
  rotation: number;        // Góc nghiêng nhẹ (-3 đến 3)
  decoration: 'pin' | 'tape' | 'ribbon'; // Loại trang trí ở cạnh trên
  isPinned?: boolean;      // Ghim lời nhắn bởi Admin (dấu ୨୧)
  isHidden?: boolean;      // Ẩn lời nhắn bởi Admin
}

export interface UserFeedback {
  id: string;
  category: 'idea' | 'bug' | 'feedback' | 'message';
  content: string;
  createdAt: string;
  isRead?: boolean;
}

export interface StarEffectSettings {
  isEnabled: boolean;
  density: 'low' | 'medium' | 'high';
  speed: 'slow' | 'medium' | 'fast';
  brightness: 'dim' | 'medium' | 'bright';
}

export interface SnowEffectSettings {
  isEnabled: boolean;
  density: 'low' | 'medium' | 'high';
  speed: 'slow' | 'medium' | 'fast';
  opacity?: 'subtle' | 'medium' | 'visible';
}

export interface DefaultBgmTrack {
  id: string;
  youtubeId: string;
  url: string;
  title: string;
  subtitle: string;
}

export const DEFAULT_BGM_TRACKS: DefaultBgmTrack[] = [
  {
    id: 'track-1',
    youtubeId: 'KurOdyfsWRA',
    url: 'https://youtu.be/KurOdyfsWRA',
    title: 'Giai Điệu Thư Giãn 1',
    subtitle: 'Nhạc mặc định trực tiếp 1',
  },
  {
    id: 'track-2',
    youtubeId: 'Q5cuZL30iao',
    url: 'https://youtu.be/Q5cuZL30iao',
    title: 'Giai Điệu Thư Giãn 2',
    subtitle: 'Nhạc mặc định trực tiếp 2',
  },
  {
    id: 'track-3',
    youtubeId: '5RdSua1R8c0',
    url: 'https://youtu.be/5RdSua1R8c0',
    title: 'Giai Điệu Thư Giãn 3',
    subtitle: 'Nhạc mặc định trực tiếp 3',
  },
];

export interface AudioSettings {
  isBgmOn: boolean;
  bgmVolume: number;
  isSfxOn: boolean;
  sfxVolume: number;
  currentTrackIndex?: number;
  customBgmUrl?: string;
  customBgmType?: 'file' | 'default';
  customBgmName?: string;
  starSettings?: StarEffectSettings;
  snowSettings?: SnowEffectSettings;
}

export type ThemeMode = 'light' | 'dark';

export interface SavedCakeTopping {
  id: string;
  icon: string;
  name: string;
  x: number; // percentage on cake top 0-100
  y: number; // percentage on cake top 0-100
}

export interface SavedCake {
  id: string;
  name: string;
  createdAt: string;
  recipeName: string;
  ingredientsUsed: string[];
  toppings: SavedCakeTopping[];
  rewardGiven?: string;
  bakedDuration?: number;
}

export type MascotMood =
  | 'normal'
  | 'happy'
  | 'sleepy'
  | 'sleeping'
  | 'reading'
  | 'searching'
  | 'loading'
  | 'empty'
  | 'night'
  | 'cheering'
  | 'peeking';

export type MascotDisplayMode = 'always' | 'free' | 'quiet';

export type MascotSpot = 'window' | 'books' | 'table' | 'plant';

export type MascotAccessoryId =
  | 'none'
  | 'bow'
  | 'beanie'
  | 'hairpin'
  | 'scarf'
  | 'cat_ears'
  | 'nightcap'
  | 'glasses'
  | 'crown'
  | 'angel_wings';

export interface MascotAccessory {
  id: MascotAccessoryId;
  name: string;
  icon: string;
  description: string;
  unlockHint: string;
}

export interface MascotSettings {
  displayMode: MascotDisplayMode;
  currentSpot: MascotSpot;
  currentAccessory: MascotAccessoryId;
  showInReader: boolean;
  foundCount: number;
  unlockedAccessories: MascotAccessoryId[];
}

export interface WelcomeLetterConfig {
  id?: string;
  title: string;
  greeting: string;
  closing: string;
  signature: string;
  updatedAt?: string;
}

export const DEFAULT_WELCOME_LETTER: WelcomeLetterConfig = {
  title: '« Bến Đỗ Bình Yên · Góc Nhỏ Của Yui » ✦',
  greeting: 'Thân gửi người lữ khách ghé lại bên bờ sóng biếc,\n\n« 沧海月明珠有泪，蓝田日暖玉生烟 »\n(Thương hải nguyệt minh châu hữu lệ, Lam điền nhật noãn ngọc sinh yên)\n*Dịch thơ: Biển biếc trăng trong ngời giọt ngọc, Lam điền nắng ấm khói trầm bay.*\n\nCảm tạ cậu đã dừng chân nơi hải trình tĩnh lặng này. Giữa biển đời muôn trùng biến ảo, nơi đây gom góp những bóng hình nhân vật được dệt nên từ ngòi bút thiết tha, những mẩu chuyện dịu dàng và từng nhịp sóng vỗ về tâm hồn lữ khách.',
  closing: '« 愿随流水寄相思，莫道沧桑失故知 »\n(Nguyện tùy lưu thủy ký tương tư, mạc đạo thương tang thất cố tri)\n*Dịch thơ: Nguyện gửi tương tư theo dòng nước, Đừng than dâu bể lạc tri âm.*\n\nMong rằng nơi bến đỗ trong veo này, bồ sẽ tìm thấy một góc nhỏ bình yên, gác lại mọi âu lo sau cánh cửa đại dương.',
  signature: 'Yui · Người Giữ Ngọn Hải Đăng ♡',
};

export type AvatarFrame =
  | 'none'
  | 'paper'
  | 'ribbon'
  | 'star'
  | 'flower'
  | 'glass'
  | 'winter'
  | 'moonlit_sea'
  | 'ancient_moon'
  | 'little_angel'
  | 'pixel_player'
  | 'sakura_breeze'
  | 'little_cosmos'
  | 'dear_you'
  | 'cozy_room'
  | 'sweet_bakery'
  | 'secret_garden'
  | 'night_train'
  | 'deep_ocean'
  | 'ancient_library'
  | 'dreamy_park'
  | 'little_witch';

export type ProfileTheme = 'light' | 'dark' | 'night-sky' | 'soft-paper' | 'winter' | 'spring';

export type ProfileDecoration = 'none' | 'sparkles' | 'petals' | 'snow' | 'stars' | 'ribbons';

export type BadgeId =
  | 'first_visit'
  | 'bookmarker'
  | 'collector'
  | 'night_owl'
  | 'explorer'
  | 'baker'
  | 'streak_master';

export interface UserBadge {
  id: BadgeId;
  title: string;
  symbol: string;
  icon: string;
  description: string;
  requirement: string;
}

export const APP_BADGES: UserBadge[] = [
  {
    id: 'first_visit',
    title: 'First Visit',
    symbol: '✦',
    icon: '✨',
    description: 'Lần đầu bước vào góc nhỏ',
    requirement: 'Đã ghé thăm ứng dụng',
  },
  {
    id: 'bookmarker',
    title: 'Bookmarker',
    symbol: '♡',
    icon: '🔖',
    description: 'Đã lưu Character hoặc Đánh dấu trang',
    requirement: 'Lưu ít nhất 1 nhân vật vào Yêu thích / Bookmark',
  },
  {
    id: 'collector',
    title: 'Collector',
    symbol: '🎀',
    icon: '🎁',
    description: 'Người sưu tầm chăm chỉ',
    requirement: 'Mở khóa từ 2 vật phẩm hoặc huy hiệu',
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    symbol: '🌙',
    icon: '🌌',
    description: 'Cú đêm trầm lắng',
    requirement: 'Sử dụng Dark Mode hoặc Night Sky Theme',
  },
  {
    id: 'explorer',
    title: 'Explorer',
    symbol: '✧',
    icon: '🧭',
    description: 'Khám phá bí mật & Easter Egg',
    requirement: 'Tìm thấy góc ẩn hoặc chuông gió / Easter Egg',
  },
  {
    id: 'baker',
    title: 'Sweet Baker',
    symbol: '🍰',
    icon: '🧁',
    description: 'Thợ làm bánh ngọt ngào',
    requirement: 'Đã ghé góc chơi Tiệm Bánh Nhỏ',
  },
  {
    id: 'streak_master',
    title: 'Dedicated Friend',
    symbol: '🔥',
    icon: '⭐',
    description: 'Người bạn quen thuộc',
    requirement: 'Đạt chuỗi ghé thăm hàng ngày',
  },
];

export interface UserProfile {
  name: string;
  bio: string;
  avatar: string | null;
  avatarShape: 'circle' | 'rounded';
  avatarZoom: number;
  avatarFrame: AvatarFrame;
  profileTheme: ProfileTheme;
  decoration: ProfileDecoration;
  favoriteTags: GenreTag[];
  favoriteCharacterId: string | null;
  favoriteQuote: string;
  isPublic: boolean;
  selectedBadges: BadgeId[];
  unlockedBadges: BadgeId[];
  updatedAt?: string;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Tên của bạn',
  bio: '',
  avatar: null,
  avatarShape: 'circle',
  avatarZoom: 1,
  avatarFrame: 'none',
  profileTheme: 'soft-paper',
  decoration: 'none',
  favoriteTags: [],
  favoriteCharacterId: null,
  favoriteQuote: '',
  isPublic: true,
  selectedBadges: ['first_visit'],
  unlockedBadges: ['first_visit'],
};export type FeatureStatus = 'active' | 'new' | 'updating' | 'closed';

export interface Feature {
  id: string;
  name: string;
  description: string;
  detailedDescription: string;
  usageGuide: string;
  tags: string[];
  category: string;
  status: FeatureStatus;
  displayOrder: number;
  isPublic: boolean;
  updateInfo?: string;
  createdAt?: string;
  decorationStyle: 'flower' | 'star' | 'ribbon';
}

export interface HelpGuideItem {
  id: string;
  title: string;
  desc: string;
  badge?: string;
  linkAction?: 'creatorRequest' | 'messageBoard' | 'fortune' | 'bgm' | 'explore' | 'bookmarks';
}

export interface HelpGuideCategory {
  id: string;
  key: string;
  name: string;
  icon: string;
  title: string;
  description: string;
  items: HelpGuideItem[];
}

export interface HelpCenterConfig {
  mainTitle: string;
  subTitle: string;
  badgeText: string;
  announcementNote?: string;
  categories: HelpGuideCategory[];
  updatedAt?: string;
}

export const DEFAULT_HELP_CENTER_CONFIG: HelpCenterConfig = {
  mainTitle: 'Sổ Tay Trợ Giúp & Hướng Dẫn Hải Trình',
  subTitle: 'Khám phá trọn vẹn các tính năng thú vị tại góc nhỏ của Yui',
  badgeText: 'Guide & Tips',
  announcementNote: '🌊 Mẹo: Bạn có thể kẹp bookmark nhân vật và tạo bộ sưu tập riêng trên Kệ sách trang chủ!',
  categories: [
    {
      id: 'cat_explore',
      key: 'explore',
      name: '🧭 Khám phá',
      icon: '🧭',
      title: '🧭 Hướng Dẫn Khám Phá & Tìm Kiếm Nhân Vật',
      description: 'Các mẹo tìm kiếm nhanh và tương tác cùng nhân vật:',
      items: [
        {
          id: 'item_exp_1',
          title: 'Tìm kiếm & Lọc theo chủ đề',
          desc: 'Nhập tên hoặc từ khóa vào thanh tìm kiếm, hoặc nhấn vào các Thẻ gợi ý (#ngọt_ngào, #fantasy, #học_đường, #hiện_đại,...) để lọc ngay lập tức danh sách nhân vật phù hợp.',
        },
        {
          id: 'item_exp_2',
          title: 'Trải nghiệm chi tiết & Đọc truyện',
          desc: 'Nhấn vào thẻ nhân vật để mở sổ tay thông tin chi tiết, xem Story mở đầu, lời chào đầu tiên (First Message), ghi chú tác giả và bình chọn thả tim.',
        },
        {
          id: 'item_exp_3',
          title: 'Tiến tới chat Ggai',
          desc: 'Nhấn nút "Tiến tới Ggai" ở góc dưới mỗi thẻ để mở ngay liên kết trò chuyện trực tiếp với Character AI.',
        },
        {
          id: 'item_exp_4',
          title: 'Gõ cửa góc nhỏ',
          desc: 'Thử nhấn gõ vào cánh cửa thần kỳ ở đầu trang để lắng nghe những lời nhắn động viên ấm áp và hiệu ứng âm thanh êm dịu.',
        },
      ],
    },
    {
      id: 'cat_bookmarks',
      key: 'bookmarks',
      name: '🔖 Kẹp trang',
      icon: '🔖',
      title: '🔖 Sưu Tầm Kẹp Trang & Kệ Sách Của Mình',
      description: 'Lưu giữ nhân vật yêu thích và tiến độ đọc truyện:',
      items: [
        {
          id: 'item_bm_1',
          title: 'Kẹp Bookmark nhân vật',
          desc: 'Khi xem chi tiết nhân vật, bạn có thể tạo một chiếc Bookmark giấy xinh xắn để ghim nhân vật lên kệ sách cá nhân trên trang chủ.',
        },
        {
          id: 'item_bm_2',
          title: 'Tùy biến phong cách giấy & đuôi ruy-băng',
          desc: 'Tự do chọn kiểu giấy (giấy kem, giấy caro, ren vintage, hoa nhí) và ký hiệu đuôi kẹp (✦, ♡, 〜, ˚₊‧) mang phong cách riêng của bạn.',
        },
        {
          id: 'item_bm_3',
          title: 'Lưu tiến độ đọc Story',
          desc: 'Kéo thanh tiến độ khi đọc truyện trong Chế độ Đọc (Story Reader) để tự động ghi nhớ phần truyện bạn đang đọc dở dang.',
        },
        {
          id: 'item_bm_4',
          title: 'Sắp xếp kệ sách',
          desc: 'Lọc kệ sách theo Mới nhất, Cũ nhất, thứ tự chữ cái A-Z hoặc danh sách các bạn đang đọc dở.',
        },
      ],
    },
    {
      id: 'cat_fortune',
      key: 'fortune',
      name: '🐚 Tiện ích & Vỏ sò',
      icon: '🐚',
      title: '🐚 Vỏ Sò May Mắn, Ngẫu Nhiên & Chuỗi Ghé Thăm',
      description: 'Những trải nghiệm biển khơi mỗi ngày:',
      items: [
        {
          id: 'item_fort_1',
          title: 'Rút lời nhắn Vỏ Sò May Mắn',
          desc: 'Mỗi ngày hãy ghé thăm Vỏ Sò Đại Dương trên đầu trang, chọn một vỏ sò để lắng nghe thông điệp chữa lành, màu sắc may mắn và nhân vật tương thích.',
        },
        {
          id: 'item_fort_2',
          title: 'Hôm nay gặp ai đây? (Xúc xắc ngẫu nhiên)',
          desc: 'Nếu phân vân chưa biết trò chuyện cùng ai, hãy dùng tính năng xúc xắc ngẫu nhiên theo chủ đề để dòng hải lưu dẫn lối cho bạn.',
        },
        {
          id: 'item_fort_3',
          title: 'Chuỗi ngày ghé thăm (Streak)',
          desc: 'Mỗi ngày ghé thăm góc nhỏ sẽ tích lũy 1 ngày chuỗi ghé thăm liên tiếp. Khám phá các mốc phần thưởng thú vị khi duy trì chuỗi ghé thăm chăm chỉ!',
        },
      ],
    },
    {
      id: 'cat_request',
      key: 'request',
      name: '💌 Gửi đơn & Bảng tin',
      icon: '💌',
      title: '💌 Hòm Thư Creator & Bảng Tin Lưu Niệm',
      description: 'Kết nối và gửi thông điệp tới tác giả:',
      items: [
        {
          id: 'item_req_1',
          title: 'Gửi đơn yêu cầu (Creator Request)',
          desc: 'Bạn có thể gửi yêu cầu tạo Character mới, đề xuất chỉnh sửa, báo lỗi hoặc gửi lời góp ý kèm ảnh minh họa trực tiếp đến Creator.',
        },
        {
          id: 'item_req_2',
          title: 'Theo dõi phản hồi đơn',
          desc: 'Vào tab "Đơn của tôi" trong Hòm thư để theo dõi trạng thái duyệt, phản hồi chi tiết từ Creator hoặc bổ sung thông tin khi cần.',
        },
        {
          id: 'item_req_3',
          title: 'Dán lời nhắn lên Bảng Tin Lưu Niệm',
          desc: 'Viết những dòng tin nhắn ngọt ngào, chọn màu giấy ghi chú và đính kèm ảnh để lưu giữ kỷ niệm cùng mọi người ghé thăm góc nhỏ.',
        },
      ],
    },
    {
      id: 'cat_faq',
      key: 'faq',
      name: '❓ Hỏi đáp (FAQ)',
      icon: '❓',
      title: '❓ Câu Hỏi Thường Gặp (FAQ)',
      description: 'Giải đáp các thắc mắc thông dụng:',
      items: [
        {
          id: 'item_faq_1',
          title: 'Dữ liệu yêu thích và kẹp trang có bị mất khi tải lại trang không?',
          desc: 'Không, các đánh dấu yêu thích, tiến độ đọc, bookmark và ghi chú được lưu trữ đồng bộ trong bộ nhớ trình duyệt và dữ liệu đám mây an toàn.',
        },
        {
          id: 'item_faq_2',
          title: 'Làm sao để tắt/bật nhạc nền BGM và âm thanh SFX?',
          desc: 'Nhấn vào biểu tượng nốt nhạc 🎵 ở thanh tiêu đề trên cùng để mở bảng Cài đặt Âm thanh, bạn có thể chỉnh âm lượng hoặc chọn bài hát yêu thích.',
        },
        {
          id: 'item_faq_3',
          title: 'Làm sao để chuyển đổi chế độ Sáng / Tối?',
          desc: 'Nhấn vào nút biểu tượng Mặt Trời / Mặt Trăng ở góc trên thanh Header để chuyển đổi giữa hai không gian đại dương êm dịu.',
        },
      ],
    },
  ],
};

export type BottleStyle = 'crystal' | 'coral' | 'azure' | 'luminous' | 'pearl';
export type BottleSeal = 'star' | 'heart' | 'shell' | 'wave';

export interface WishingBottle {
  id: string;
  author: string;
  message: string;
  bottleStyle: BottleStyle;
  seal: BottleSeal;
  tag?: string;
  hearts: number;
  fishedCount: number;
  createdAt: string;
  senderId?: string;
}

export interface FeatureBoardConfig {
  description: string;
  updatedAt?: string;
}

export interface WallpaperConfig {
  imageUrl: string;
  isCustomEnabled: boolean;
  opacity: number;
  updatedAt?: string;
}

export const DEFAULT_WALLPAPER_CONFIG: WallpaperConfig = {
  imageUrl: '',
  isCustomEnabled: false,
  opacity: 0.85,
};

export type RequestType =
  | 'Request Character'
  | 'Request chỉnh sửa'
  | 'Góp ý website'
  | 'Báo lỗi'
  | 'Đề xuất tính năng'
  | 'Hợp tác'
  | 'Khác';

export interface CreatorRequest {
  id: string;
  senderName: string;
  requestType: RequestType;
  content: string;
  link1?: string;
  link2?: string;
  imageUrl?: string | null;
  status: 'pending_approval' | 'approved' | 'needs_revision' | 'responded' | 'rejected';
  createdAt: string;
  adminNote?: string;
  creatorResponse?: string;
  respondedAt?: string;
}

export type CommandCardColor =
  | '#FCE8F0' // Hồng phấn
  | '#EEE8FA' // Tím lavender
  | '#E7F2FA' // Xanh baby
  | '#E6F5EF' // Xanh mint
  | '#FFF5D9' // Vàng kem
  | '#FCE9DF' // Đào pastel
  | '#E8F4FF' // Xanh trời nhạt
  | '#F8F1E7'; // Kem sữa

export interface CommandColorOption {
  name: string;
  hex: string;
  borderHex: string;
  tagBg: string;
  tagText: string;
  darkBg: string;
  darkBorder: string;
}

export const COMMAND_COLOR_OPTIONS: CommandColorOption[] = [
  { name: 'Hồng phấn', hex: '#FCE8F0', borderHex: '#F7C6D9', tagBg: '#F9D5E5', tagText: '#9E2A59', darkBg: '#351F2A', darkBorder: '#643248' },
  { name: 'Tím lavender', hex: '#EEE8FA', borderHex: '#D8C8F6', tagBg: '#DFD5F5', tagText: '#5B3799', darkBg: '#281F38', darkBorder: '#4E386B' },
  { name: 'Xanh baby', hex: '#E7F2FA', borderHex: '#C5DFF4', tagBg: '#D5E8F7', tagText: '#235D8A', darkBg: '#1B2633', darkBorder: '#324E6B' },
  { name: 'Xanh mint', hex: '#E6F5EF', borderHex: '#C3E7D7', tagBg: '#D1EFE2', tagText: '#1F6B50', darkBg: '#182A24', darkBorder: '#2F5948' },
  { name: 'Vàng kem', hex: '#FFF5D9', borderHex: '#FFE4A8', tagBg: '#FCEBBF', tagText: '#875C0C', darkBg: '#332C1A', darkBorder: '#614E24' },
  { name: 'Đào pastel', hex: '#FCE9DF', borderHex: '#F7CBB6', tagBg: '#FAD9C8', tagText: '#94441F', darkBg: '#35231C', darkBorder: '#643F2F' },
  { name: 'Xanh trời nhạt', hex: '#E8F4FF', borderHex: '#C6E3FF', tagBg: '#D7EBFF', tagText: '#1D6299', darkBg: '#1A2738', darkBorder: '#314F73' },
  { name: 'Kem sữa', hex: '#F8F1E7', borderHex: '#EADBCC', tagBg: '#EFE3D3', tagText: '#735738', darkBg: '#2E2720', darkBorder: '#544637' },
];

export type CommandDecoration = '♡' | '✦' | '୨୧' | '˚' | '⋆';

export const COMMAND_DECORATIONS: CommandDecoration[] = ['♡', '✦', '୨୧', '˚', '⋆'];

export interface PromptCommand {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  color: string; // hex code from COMMAND_COLOR_OPTIONS or custom pastel
  decoration: CommandDecoration;
  displayOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ContactLink {
  id: string;
  label: string;
  value: string;
  display: string;
  iconType: 'facebook' | 'ngl' | 'instagram' | 'discord' | 'tiktok' | 'email' | 'web' | 'other';
  imageUrl?: string;
  displayOrder: number;
  createdAt: string;
}

export interface HeroPresentationConfig {
  isEnabled: boolean;
  videoUrl?: string;
  videoName?: string;
  overlayOpacity?: number; // 0.1 to 0.9, default 0.4
  blendMode?: 'normal' | 'screen' | 'overlay' | 'soft-light';
  blurAmount?: number; // 0 to 10px
  updatedAt?: string;
}

export const DEFAULT_HERO_PRESENTATION: HeroPresentationConfig = {
  isEnabled: false,
  videoUrl: '',
  videoName: '',
  overlayOpacity: 0.4,
  blendMode: 'screen',
  blurAmount: 0,
};


