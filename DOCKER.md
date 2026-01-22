# Docker Setup cho PPTX Preview

## Giới thiệu

Dự án này sử dụng LibreOffice và poppler-utils trong Docker để convert PPTX thành ảnh PNG cho việc preview. Giải pháp này cho chất lượng preview tốt hơn nhiều so với việc dùng pptx-in-html-out.

### Conversion Process

Để convert từng slide PPTX thành ảnh PNG riêng biệt, hệ thống sử dụng 2 bước:

1. **PPTX → PDF** (LibreOffice)
   ```bash
   libreoffice --headless --convert-to pdf presentation.pptx
   ```

2. **PDF → PNG images** (pdftoppm từ poppler-utils)
   ```bash
   pdftoppm -png -r 150 presentation.pdf output-prefix
   ```
   - Mỗi page trong PDF → 1 file PNG
   - Resolution: 150 DPI (có thể điều chỉnh)
   - Output: `output-prefix-1.png`, `output-prefix-2.png`, ...

File PDF tạm được tự động xóa sau khi convert xong.

## Yêu cầu

- Docker
- Docker Compose (optional nhưng recommended)

## Cài đặt và chạy

### Cách 1: Sử dụng Docker Compose (Recommended)

```bash
# Build và chạy container
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng container
docker-compose down
```

### Cách 2: Sử dụng Docker trực tiếp

```bash
# Build image
docker build -t rikai-slide-maker .

# Run container
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/output:/app/output \
  -v $(pwd)/jobs.db:/app/jobs.db \
  --name rikai-slide-maker \
  rikai-slide-maker

# Xem logs
docker logs -f rikai-slide-maker

# Dừng container
docker stop rikai-slide-maker
docker rm rikai-slide-maker
```

## API Endpoints

### 1. Preview bằng HTML (cũ - không recommended)

```bash
POST /api/pptx/preview-html
Body: { "jobId": "your-job-id" }
```

### 2. Preview bằng PNG images (mới - recommended)

```bash
POST /api/pptx/preview-images
Body: { "jobId": "your-job-id" }

# Response
{
  "success": true,
  "jobId": "your-job-id",
  "totalSlides": 10,
  "images": [
    "/api/pptx/preview-image/your-job-id/your-job-id.png",
    "/api/pptx/preview-image/your-job-id/your-job-id-1.png",
    ...
  ]
}
```

### 3. Lấy từng ảnh preview

```bash
GET /api/pptx/preview-image/{jobId}/{filename}
```

## Cách sử dụng trong Frontend

```typescript
// Gọi API để convert PPTX sang images
const response = await fetch('/api/pptx/preview-images', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ jobId: 'your-job-id' })
});

const data = await response.json();

// Hiển thị images
data.images.forEach((imageUrl, index) => {
  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = `Slide ${index + 1}`;
  img.className = 'slide-preview';
  document.getElementById('preview-container').appendChild(img);
});
```

## Cấu trúc thư mục output

```
output/
├── {jobId}.pptx           # File PPTX gốc
└── previews/
    └── {jobId}/
        ├── {jobId}.png    # Slide đầu tiên
        ├── {jobId}-1.png  # Slide thứ 2
        ├── {jobId}-2.png  # Slide thứ 3
        └── ...
```

## Troubleshooting

### LibreOffice không convert được

Kiểm tra logs:
```bash
docker-compose logs -f
# hoặc
docker logs -f rikai-slide-maker
```

### Font chữ hiển thị không đúng

Dockerfile đã cài đặt:
- **LibreOffice** - Convert PPTX to PDF
- **poppler-utils** (pdftoppm) - Convert PDF to PNG images
- **Fonts**:
  - DejaVu fonts
  - Liberation fonts
  - Noto fonts (CJK cho tiếng Việt, tiếng Trung, tiếng Nhật, tiếng Hàn)
  - Microsoft TrueType core fonts

Nếu cần thêm font, thêm vào Dockerfile:
```dockerfile
RUN apk add --no-cache font-your-font-name
```

### Container chạy nhưng API không hoạt động

1. Kiểm tra container đang chạy:
   ```bash
   docker ps
   ```

2. Kiểm tra port 3000 có bị chiếm không:
   ```bash
   lsof -i :3000
   ```

3. Kiểm tra logs để xem lỗi:
   ```bash
   docker-compose logs -f
   ```

## Performance

- **Thời gian convert**: ~2-5 giây cho presentation 10-15 slides
- **Resolution**: Mặc định 150 DPI (có thể điều chỉnh trong code)
- **Cache**: Các ảnh preview được cache với max-age 1 năm

## Development

Để test local không dùng Docker:

1. Cài LibreOffice và poppler-utils:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install libreoffice poppler-utils

   # macOS
   brew install --cask libreoffice
   brew install poppler

   # Alpine Linux
   apk add libreoffice poppler-utils
   ```

2. Chạy app bình thường:
   ```bash
   npm run dev
   ```

## Notes

- Images được tự động cache, không cần convert lại nếu PPTX không thay đổi
- Mỗi slide sẽ là một file PNG riêng biệt
- API tự động sắp xếp slides theo đúng thứ tự