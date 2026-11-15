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
  creator: string; // Tác giả (mặc định Yui)
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

export type BookmarkTailDecor = '♡' | '୨୧' | '✦' | '〜' | '˚₊‧' | '꒰ა ໒꒱' | '❄';

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
    youtubeId: 'aLZ32mQ_7TA',
    url: 'https://youtu.be/aLZ32mQ_7TA?si=b6Bz9BZCG8QfX4nR',
    title: 'Giai Điệu Mùa Đông 1',
    subtitle: 'Hộp Ký Ức Mùa Đông · Bản nhạc 1',
  },
  {
    id: 'track-2',
    youtubeId: 'JcZsPmeTJB8',
    url: 'https://youtu.be/JcZsPmeTJB8?si=Ic5JL_yzSL0qZ7cG',
    title: 'Giai Điệu Mùa Đông 2',
    subtitle: 'Hộp Ký Ức Mùa Đông · Bản nhạc 2',
  },
  {
    id: 'track-3',
    youtubeId: 'xtvrEu1JknM',
    url: 'https://youtu.be/xtvrEu1JknM?si=nV55C2erNoD63HCX',
    title: 'Giai Điệu Mùa Đông 3',
    subtitle: 'Hộp Ký Ức Mùa Đông · Bản nhạc 3',
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
  title: '« Hộp Ký Ức Mùa Đông · Góc Nhỏ Của Yui » ✦',
  greeting: 'Thân gửi người lữ khách ghé lại bên khung cửa tuyết rơi,\n\n« 晚来天欲雪，能饮一杯无 »\n(Vãn lai thiên dục tuyết, năng ẩm nhất bôi vô)\n*Dịch thơ: Chiều muộn trời sắp đổ tuyết, có thể cùng uống một chén trà ấm không?*\n\nCảm tạ cậu đã dừng chân nơi chiếc hộp mùa đông tĩnh lặng này. Giữa những ngày gió lạnh, nơi đây gom góp những bóng hình nhân vật được dệt nên từ ngòi bút thiết tha, những mẩu chuyện dịu dàng và hơi ấm sưởi lòng người lữ khách.',
  closing: '« 愿有岁月可回首，且以深情共白头 »\n(Nguyện hữu tuế nguyệt khả hồi thủ, thả dĩ thâm tình cộng bạch đầu)\n\nMong rằng nơi góc nhỏ phủ tuyết trong veo này, cậu sẽ tìm thấy sự bình yên, gác lại mọi âu lo sau cánh cửa mùa đông.',
  signature: 'Yui · Người Giữ Hộp Ký Ức Mùa Đông ❄',
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

export interface AchievementRewardDef {
  badgeId: BadgeId;
  giftName: string;
  giftIcon: string;
  accessoryId?: MascotAccessoryId;
  accessoryLabel?: string;
  frameId?: AvatarFrame;
  frameLabel?: string;
  decoration?: ProfileDecoration;
}

export const ACHIEVEMENT_REWARDS: Record<BadgeId, AchievementRewardDef> = {
  first_visit: {
    badgeId: 'first_visit',
    giftName: 'Hoa Tuyết Sơ Ngộ',
    giftIcon: '❄️',
    frameId: 'paper',
    frameLabel: 'Khung Giấy Tuyết',
    decoration: 'sparkles',
  },
  bookmarker: {
    badgeId: 'bookmarker',
    giftName: 'Kẹp Trang Pha Lê',
    giftIcon: '🔖',
    frameId: 'ribbon',
    frameLabel: 'Khung Ruy Băng',
    decoration: 'ribbons',
  },
  collector: {
    badgeId: 'collector',
    giftName: 'Hộp Ký Ức Tri Âm',
    giftIcon: '🎁',
    frameId: 'star',
    frameLabel: 'Khung Sao Tuyết',
    decoration: 'stars',
  },
  night_owl: {
    badgeId: 'night_owl',
    giftName: 'Đèn Bão Đêm Đông',
    giftIcon: '🌙',
    frameId: 'little_cosmos',
    frameLabel: 'Khung Đêm Ngân Hà',
    decoration: 'stars',
  },
  explorer: {
    badgeId: 'explorer',
    giftName: 'Chìa Khóa Góc Ẩn',
    giftIcon: '🪽',
    frameId: 'little_angel',
    frameLabel: 'Khung Thiên Thần',
    decoration: 'sparkles',
  },
  baker: {
    badgeId: 'baker',
    giftName: 'Bánh Ngọt Đêm Tuyết',
    giftIcon: '🧁',
    frameId: 'sweet_bakery',
    frameLabel: 'Khung Tiệm Bánh Ấm',
    decoration: 'petals',
  },
  streak_master: {
    badgeId: 'streak_master',
    giftName: 'Vương Miện Tuyết Bền Bỉ',
    giftIcon: '👑',
    frameId: 'winter',
    frameLabel: 'Khung Mùa Đông Vĩnh Cửu',
    decoration: 'snow',
  },
};

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
  claimedAchievements?: BadgeId[];
  claimedGifts?: string[];
  updatedAt?: string;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Tên của bạn',
  bio: '',
  avatar: null,
  avatarShape: 'circle',
  avatarZoom: 1,
  avatarFrame: 'none',
  profileTheme: 'winter',
  decoration: 'snow',
  favoriteTags: [],
  favoriteCharacterId: null,
  favoriteQuote: '',
  isPublic: true,
  selectedBadges: ['first_visit'],
  unlockedBadges: ['first_visit'],
  claimedAchievements: [],
  claimedGifts: [],
};

export type FeatureStatus = 'active' | 'new' | 'updating' | 'closed';

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
  mainTitle: 'Sổ Tay Trợ Giúp & Hướng Dẫn Mùa Đông',
  subTitle: 'Khám phá trọn vẹn các tính năng thú vị tại Hộp Ký Ức Mùa Đông của Yui',
  badgeText: 'Guide & Tips',
  announcementNote: '❄️ Mẹo: Bạn có thể kẹp bookmark nhân vật và tạo bộ sưu tập riêng trên Kệ sách trang chủ!',
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
      name: '❄️ Tiện ích & Quẻ tuyết',
      icon: '❄️',
      title: '❄️ Quẻ Tuyết May Mắn, Ngẫu Nhiên & Chuỗi Ghé Thăm',
      description: 'Những trải nghiệm mùa đông mỗi ngày:',
      items: [
        {
          id: 'item_fort_1',
          title: 'Rút lời nhắn Quẻ Tuyết May Mắn',
          desc: 'Mỗi ngày hãy ghé thăm Hộp Quẻ Mùa Đông trên đầu trang để lắng nghe thông điệp chữa lành, màu sắc may mắn và nhân vật tương thích.',
        },
        {
          id: 'item_fort_2',
          title: 'Hôm nay gặp ai đây? (Snow Random)',
          desc: 'Nếu phân vân chưa biết trò chuyện cùng ai, hãy dùng tính năng Snow Random theo chủ đề để bông tuyết dẫn lối cho bạn.',
        },
        {
          id: 'item_fort_3',
          title: 'Chuỗi ngày ghé thăm (Streak)',
          desc: 'Mỗi ngày ghé thăm chiếc hộp sẽ tích lũy 1 ngày chuỗi ghé thăm liên tiếp. Nhận quà phụ kiện và khung hồ sơ khi đạt mốc!',
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
          desc: 'Nhấn vào nút biểu tượng Ánh sáng mùa đông / Đêm tuyết ở góc trên thanh Header để chuyển đổi giữa hai không gian tuyết rơi êm dịu.',
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
  isPrivate?: boolean;
  clientToken?: string;
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

export type WinterContactMethod = 'none' | 'facebook' | 'discord' | 'email' | 'other';

export interface WinterLetter {
  id: string;
  senderName: string;
  preferredDisplayName: string;
  donateNote: string;
  contactMethod: WinterContactMethod;
  contactPlatformName: string;
  contactValue: string;
  message: string;
  allowContactThanks: boolean;
  silentGift: boolean;
  hideIdentity: boolean;
  allowPublicNickname: boolean;
  isRead: boolean;
  isThanked: boolean;
  internalNote: string;
  createdAt?: any;
  updatedAt?: any;
}

export type MemoryGalleryCategory = 'chat' | 'fanart' | 'moment';

export interface MemoryGalleryReply {
  id: string;
  author: string;
  isAnonymous: boolean;
  content: string;
  replyToAuthor?: string;
  createdAt: string;
  creatorToken?: string;
}

export interface MemoryGalleryPost {
  id: string;
  title: string;
  category: MemoryGalleryCategory;
  author: string;
  isAnonymous: boolean;
  characterName?: string;
  content: string;
  imageUrl?: string;
  sourceCredit?: string;
  likes: number;
  replies: MemoryGalleryReply[];
  createdAt: string;
  creatorToken?: string;
}

export type WhisperCategory = 'quote' | 'excerpt' | 'snapshot';

export interface WhisperComment {
  id: string;
  author: string;
  isAnonymous: boolean;
  content: string;
  replyToAuthor?: string;
  createdAt: string;
  creatorToken?: string;
}

export interface WhisperPost {
  id: string;
  title: string;
  category: WhisperCategory;
  subtitleOrMood?: string;
  content: string;
  imageUrl?: string;
  author: string;
  likes: number;
  comments: WhisperComment[];
  createdAt: string;
  updatedAt?: string;
}

