# 📹 Hướng Dẫn Thêm Video Vào Trang Chủ

## Vấn đề với YouTube Embed
- YouTube embed luôn hiển thị branding và một số controls
- Không thể xem khi không có mạng
- Phụ thuộc vào YouTube

## Giải pháp: Sử dụng Video Local

### Bước 1: Download Video từ YouTube

Có nhiều cách để download video từ YouTube:

#### Cách 1: Sử dụng yt-dlp (Khuyến nghị - miễn phí, không quảng cáo)
1. Cài đặt yt-dlp:
   - Windows: Download từ https://github.com/yt-dlp/yt-dlp/releases
   - Hoặc dùng: `pip install yt-dlp`
2. Mở terminal/cmd tại thư mục project
3. Chạy lệnh:
   ```bash
   yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" -o "public/videos/electra-intro.%(ext)s" https://youtu.be/C1EH61NgCIE
   ```

#### Cách 2: Sử dụng Website Online (Dễ dàng hơn)
1. Truy cập: https://www.y2mate.com/ hoặc https://en.savefrom.net/
2. Dán link: `https://youtu.be/C1EH61NgCIE`
3. Chọn chất lượng MP4 (720p hoặc 1080p)
4. Download về máy
5. Đổi tên file thành: `electra-intro.mp4`
6. Copy file vào thư mục: `public/videos/`

#### Cách 3: Sử dụng Extension Chrome
1. Cài extension "Video DownloadHelper" hoặc "SaveFrom.net"
2. Mở video YouTube
3. Click vào icon extension để download
4. Đổi tên và copy vào `public/videos/`

### Bước 2: Đặt File Video Vào Đúng Thư Mục

1. Đảm bảo file video có tên: `electra-intro.mp4`
2. Đặt file vào: `public/videos/electra-intro.mp4`
3. Cấu trúc thư mục:
   ```
   public/
   └── videos/
       └── electra-intro.mp4
   ```

### Bước 3: Tối Ưu Video (Tùy chọn)

Để giảm dung lượng và tăng tốc độ tải:

1. Sử dụng FFmpeg để nén video:
   ```bash
   ffmpeg -i public/videos/electra-intro.mp4 -vcodec libx264 -crf 28 -preset slow -acodec aac -b:a 128k public/videos/electra-intro-compressed.mp4
   ```

2. Hoặc sử dụng tool online: https://www.freeconvert.com/video-compressor

### Bước 4: Kiểm Tra

1. Chạy ứng dụng: `npm run dev`
2. Vào trang chủ
3. Video sẽ tự động phát, không có controls, không có branding YouTube
4. Video sẽ hoạt động ngay cả khi không có mạng (sau khi đã tải lần đầu)

## Lưu Ý

- **Dung lượng file**: Video có thể lớn (50-200MB), cần cân nhắc tốc độ tải trang
- **Format**: Nên dùng MP4 (H.264) để tương thích tốt nhất
- **Tối ưu**: Nén video để giảm dung lượng nhưng vẫn giữ chất lượng tốt
- **Fallback**: Code đã hỗ trợ cả MP4 và WebM format

## Tính Năng Hiện Tại

✅ Tự động phát (autoplay)  
✅ Tắt tiếng mặc định (muted)  
✅ Lặp lại (loop)  
✅ Không có controls (không thể chỉnh thời gian)  
✅ Không có branding YouTube  
✅ Hoạt động offline (sau khi tải lần đầu)  
✅ Responsive trên mọi thiết bị  


