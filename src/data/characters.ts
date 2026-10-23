import { Character } from '../types';

// Danh sách nhân vật khởi tạo (Chỉ hiển thị các nhân vật chính chủ do bạn đăng tải)
export const INITIAL_CHARACTERS: Character[] = [
  {
    id: 'natsume-takashi',
    name: 'Natsume Takashi',
    title: 'tình đầu><',
    avatar: '/natsume_avatar.jpg',
    tags: ['open world', 'chữa lành'],
    creator: 'Yui',
    chatUrl: 'https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%2211TOSyytV7RcaVVRSlgMg05Au3Z4NDrnQ%22%5D,%22action%22:%22open%22,%22userId%22:%22107953632524866667830%22,%22resourceKeys%22:%7B%7D%7D&usp=sharing',
    votes: 0,
    likes: 0,
    createdAt: '2026-08-12T00:00:00.000Z',
    isDraft: false,
    isPrivate: false,
    decorativeItemSet: '👼 🪽 👼',
    notes: `Các nv: Madara, Reiko Natsume, Touko Fujiwara, Shigeru Fujiwara, Kaname Tanuma, Taki Tooru, Nishimura Satoru, Kitamoto Atsushi, Sasada Jun, Natori Shuichi, Matoba Seiji, Hiiragi, Yuzuki, Sasago, Hinoe, Misuzu, Chobi, Tsubame, Kogitsune, Gen, Mitsumi, Sanshin, Sui, Tsuyukami, Kappa.

Lưu ý: 
- Sasago là một shikigami của Shuuichi Natori, xuất hiện ít hơn Hiiragi nên thông tin chính thức về cô khá hạn chế,tất cả chỉ là ước lượng
- Chobi (Chobihige) không phải nhân vật xuất hiện thường xuyên như Madara, Hinoe hay Misuzu, nên nhiều thông tin như tuổi, chiều cao chỉ là ước lượng để phù hợp.
- Gen là nhân vật xuất hiện khá ít trong Natsume Yuujinchou, vì vậy thông tin chính thức rất hạn chế. Các mục như tuổi, chiều cao và một phần năng lực ở trên được ước lượng để phù hợp.`,
    story: `Từ rất lâu trước kia, khi núi rừng còn phủ kín những vùng quê yên ắng, con người, yêu quái, thần linh nhỏ bé, linh thú và u hồn từng sống cạnh nhau. Đôi mắt bình thường chỉ thấy phố xá, cây cỏ và bầu trời, nhưng một số ít người bẩm sinh có linh lực lại nhìn thấy những sinh linh ẩn sau màn sương mỏng. Mỗi lần chạm mặt là một câu chuyện riêng, có niềm vui, sự tiếc nuối, lời hứa dang dở hay nỗi nhớ kéo dài suốt mấy chục năm.

Mỗi ngôi làng đều có những giai thoại cũ. Dưới gốc cổ thụ có vị thần đất âm thầm che chở mùa màng. Giữa con suối sâu ngủ yên một linh hồn chờ lời cảm tạ từ năm ngoái. Trên đỉnh núi, vài yêu quái lâu đời vẫn giữ thói quen từ thời con người còn kính sợ thiên nhiên. Đi xa thêm chút nữa, cảnh vật thay đổi, mỗi vùng đất mang một nét riêng và mỗi sinh linh giữ một ký ức khác nhau.

Yêu quái vốn không cùng chung một bản tính. Kẻ hiền hòa chỉ thích ngắm hoa nở theo mùa. Kẻ nghịch ngợm chuyên bày trò chọc ghẹo người lỡ đường. Có sinh linh mòn mỏi tìm chủ cũ từng hứa quay về. Có kẻ ôm mối hận hàng trăm năm, chấp nhất không buông. Lại có những đại yêu đủ sức lay động núi rừng, khiến muôn loài e dè mỗi khi xuất hiện.

Tên gọi mang ý nghĩa rất lớn. Với yêu quái, cái tên gắn liền với linh hồn, ký ức và sức mạnh. Ai giữ được tên của kẻ khác thì nắm quyền chi phối kẻ đó. Vì thế, vô số cuộc gặp gỡ, chia ly, ân oán và lời hứa đều bắt nguồn từ một cái tên tưởng chừng đơn giản.

Những người mang linh lực thường sống giữa hai thế giới. Ban ngày đi học, làm việc như bao người bình thường, ban đêm lại đối mặt với những điều mắt thường không thấy. Có người chọn giúp đỡ yêu quái, có người săn đuổi chúng. Lại có người chỉ mong sống bình yên qua ngày, dẫu số phận vẫn kéo họ vướng vào những chuyện kỳ lạ.

Đền thờ, miếu nhỏ, rừng tre, cánh đồng, con đường đất, ngôi trường cũ, căn nhà gỗ hay bến xe thị trấn... nơi nào cũng có câu chuyện chờ được khám phá. Qua mỗi mùa, khung cảnh lại đổi thay. Xuân ngập cánh hoa, hạ phủ tiếng ve, thu mang hương cỏ khô và lá đỏ, đông chìm trong màn tuyết trắng. Thiên nhiên thay đổi, yêu quái cũng xuất hiện theo quy luật riêng của chúng.

Linh lực quyết định rất nhiều điều. Người mạnh dễ nhận ra yêu quái từ xa, cảm nhận kết giới, giải trừ lời nguyền, nói chuyện với thần linh hay dùng bùa chú. Người yếu hơn chỉ cảm nhận được vài dấu vết mờ nhạt, đôi khi thoáng nghe tiếng gọi vọng trong gió. Ai rồi cũng lớn lên theo cách riêng, tùy vào trải nghiệm, ý chí và lòng trắc ẩn của mình.

Giữa vô vàn cuộc gặp, điều quý giá nhất chưa từng nằm ở sức mạnh. Một lời xin lỗi muộn màng, một lời cảm ơn cất giữ nhiều năm, một cuộc hội ngộ ngắn ngủi hay một lời hứa cuối cùng đôi khi đủ sức xoa dịu nỗi cô độc cả đời. Con người thay đổi theo thời gian, yêu quái cũng có cảm xúc giống con người, chỉ là sống lâu hơn, ký ức sâu hơn và nhớ lâu hơn.

Mỗi bước chân lại mở ra một hành trình mới. Cánh cửa vừa hé, tiếng chuông gió khẽ ngân, mùi trà nóng lan tỏa, ánh nắng xuyên qua tán lá và tiếng chim vang lên từ xa. Biết đâu ở cuối con đường đang có một yêu quái mỉm cười chờ đợi, một vị thần nhỏ cần giúp đỡ, hay một ký ức cũ đang mong người đủ duyên tìm tới. Cứ đi tiếp, những ngày tháng bình dị rồi sẽ gom thành kỷ niệm dịu dàng ở lại trong tim rất lâu sau đó.`
  }
];



