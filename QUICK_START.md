# Quick Start Guide

## Bắt đầu trong 3 bước

### 1️⃣ Install Dependencies

```bash
cd migrate-to-nodejs
npm install
```

### 2️⃣ Setup Environment

```bash
# Copy env file
cp .env.example .env

# Edit .env và thêm Google API Key
# GOOGLE_API_KEY=your_api_key_here
```

**Lấy API Key:**
- Truy cập: https://aistudio.google.com/app/apikey
- Tạo API Key mới
- Copy và paste vào file .env

### 3️⃣ Run Development Server

```bash
npm run dev
```

Mở http://localhost:3000 trong trình duyệt.

---

## Demo Flow

### Tạo Presentation đầu tiên

**Bước 1: Vào tab "Design Slide Structure"**

Nhập vào textbox:
```
Tạo presentation 5 slides về công ty công nghệ ABC:
- Slide 1: Giới thiệu công ty
- Slide 2: Sản phẩm chính
- Slide 3: Thị trường mục tiêu
- Slide 4: Kế hoạch phát triển
- Slide 5: Liên hệ
```

Click **"Generate Structure"** và đợi AI tạo structure.

**Bước 2: Review và Edit**

- Xem danh sách slides AI đã tạo
- Chỉnh sửa title hoặc description nếu cần
- Click **"Save Structure & Create Job"**
- Lưu lại Job ID (ví dụ: `abc123-...`)

**Bước 3: Vào tab "Create Slide"**

- Click **"Refresh Jobs"**
- Chọn job vừa tạo từ dropdown
- Chọn ngôn ngữ: **Vietnamese**
- Click **"Generate PPTX"**

**Bước 4: Download**

- Đợi AI generate (có thể mất 1-2 phút)
- Click **"Download PPTX"** khi hoàn thành
- Mở file PowerPoint và kiểm tra

---

## Các lệnh hữu ích

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check types
npx nuxi typecheck

# Clean build
rm -rf .nuxt .output
```

---

## Folder quan trọng

```
migrate-to-nodejs/
├── structure/        # Structure JSON files (auto-created)
├── output/           # Generated PPTX files (auto-created)
├── jobs.db           # SQLite database (auto-created)
└── .env              # Your API keys (create this!)
```

**Lưu ý:** Các folder `structure/` và `output/` sẽ được tạo tự động khi bạn chạy app lần đầu.

---

## Troubleshooting nhanh

### ❌ Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ Error: "GOOGLE_API_KEY not configured"
Kiểm tra file `.env`:
```bash
cat .env
# Phải có dòng: GOOGLE_API_KEY=xxx...
```

### ❌ Port 3000 đã được sử dụng
```bash
# Dùng port khác
PORT=3001 npm run dev
```

### ❌ Database locked
```bash
# Xóa database và tạo lại
rm jobs.db
npm run dev
```

---

## Tips

1. **Mô tả càng chi tiết → Kết quả càng tốt**
   - ❌ "Tạo presentation về marketing"
   - ✅ "Tạo presentation 8 slides về chiến lược marketing Q4 2024 cho sản phẩm SaaS B2B, bao gồm phân tích đối thủ, kế hoạch ngân sách và KPI"

2. **Ngôn ngữ hỗ trợ tốt nhất:**
   - Vietnamese: Times New Roman
   - Japanese: Yu Mincho
   - English: Helvetica Neue

3. **AI có thể thêm emojis để làm slide sinh động hơn**

4. **Nếu kết quả không như ý:**
   - Edit lại slide description ở tab 1
   - Save lại (tạo job mới)
   - Generate lại

---

## Cần thêm trợ giúp?

- Đọc [README.md](./README.md) để hiểu chi tiết hơn
- Xem [MIGRATION_NOTES.md](./MIGRATION_NOTES.md) nếu muốn hiểu technical details
- Check console trong browser (F12) để xem errors