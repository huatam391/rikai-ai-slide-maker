# HƯỚNG DẪN CHẠY ỨNG DỤNG RIKAI AI GENERATE SLIDE

**Image Docker:** `kazzan/rikai-ai-generate-slide`
**Creator:** tam.hua@rikai.technology

---

## 1. Mục đích tài liệu

Tài liệu này hướng dẫn **từng bước bằng thao tác tay** để chạy ứng dụng **Rikai AI Generate Slide** bằng **Docker Desktop**, không cần dùng lệnh (command line).

Ứng dụng cho phép tạo slide tự động bằng AI (Google Gemini).

---

## 2. Chuẩn bị trước khi chạy

### 2.1. Cài đặt Docker Desktop

1. Mở trình duyệt và truy cập:
   [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Tải Docker Desktop phù hợp với hệ điều hành (Windows hoặc macOS)
3. Cài đặt và **mở Docker Desktop**
4. Kiểm tra góc trên bên trái hiển thị trạng thái:
   **Docker Desktop is running**

---

### 2.2. Tạo Google API Key (AI Studio)

Ứng dụng sử dụng **Google Gemini (AI Studio)** nên cần **Google API Key**.

#### Các bước tạo API Key:

1. Truy cập: [https://aistudio.google.com/](https://aistudio.google.com/)
2. Đăng nhập tài khoản Google
3. Tạo **API Key** mới
4. Sao chép (copy) API Key để dùng ở bước sau

---

## 3. Lưu ý quan trọng về Billing (Thanh toán)

### ⚠️ Trường hợp **KHÔNG setup Billing**

API Key **vẫn dùng được**, nhưng bị giới hạn:

* Chỉ tạo được **1 file slide / ngày**
* Tối đa **10 trang slide / ngày**
* Chỉ sử dụng được model:

  ```
  gemini-flash-2.5
  ```
* Phù hợp cho **test / dùng thử**

---

### ✅ Trường hợp **ĐÃ setup Billing** (Khuyến nghị)

* Không bị giới hạn số slide theo ngày (theo quota Google)
* Tạo được slide nhiều trang
* Phù hợp cho sử dụng thực tế, demo khách hàng, production

📌 **Khuyến nghị:** Nếu dùng cho công việc hoặc demo chính thức → **nên bật Billing** cho Google API Key

---

## 4. Tải image từ Docker Hub (không dùng lệnh)

1. Mở **Docker Desktop**
2. Chọn tab **Images** (menu bên trái)
3. Bấm **Search** (góc trên)
4. Nhập:

   ```
   kazzan/rikai-ai-generate-slide
   ```
5. Khi thấy image → bấm **Pull**
6. Đợi quá trình tải hoàn tất

---

## 5. Chạy container bằng Docker Desktop

### Bước 1: Run image

1. Trong Docker Desktop → tab **Images**
2. Tìm image `kazzan/rikai-ai-generate-slide`
3. Bấm nút **Run**

---

### Bước 2: Cấu hình container

Một cửa sổ cấu hình sẽ hiện ra. Vui lòng điền **đầy đủ các mục sau**.

---

#### 5.1. Container Name

Nhập:

```
rikai-ai-generate-slide
```

---

#### 5.2. Ports (Cổng truy cập)

1. Mở mục **Ports**
2. Nhập:

| Host Port | Container Port |
| --------- | -------------- |
| 3000      | 3000           |

📌 **Lưu ý:** Container **luôn chạy ở port 3000**, host cũng map vào port **3000:3000**

---

#### 5.3. Environment Variables (BẮT BUỘC)

1. Mở mục **Environment variables**
2. Bấm **Add**
3. Nhập:

| Key                 | Value                |
| ------------------- | -------------------- |
| NUXT_GOOGLE_API_KEY | API Key từ AI Studio |

📌 Ví dụ:

```
NUXT_GOOGLE_API_KEY = AIzaSyDxxxxxxxxxxxxx
```

---

### Bước 3: Chạy container

* Sau khi cấu hình xong → bấm **Run**

---

## 6. Truy cập ứng dụng

1. Mở trình duyệt (Chrome / Edge / Safari)
2. Truy cập địa chỉ:

```
http://localhost:3000
```

Nếu thấy giao diện ứng dụng → chạy thành công 🎉

---

## 7. Kiểm tra container đang chạy

1. Docker Desktop → tab **Containers**
2. Kiểm tra container:

    * Name: `rikai-ai-generate-slide`
    * Status: **Running (màu xanh)**

---

## 8. Xem log khi gặp lỗi

Khi ứng dụng không hoạt động hoặc tạo slide bị lỗi:

1. Docker Desktop → **Containers**
2. Click vào `rikai-ai-generate-slide`
3. Chọn tab **Logs**
4. Copy nội dung log để gửi cho bộ phận kỹ thuật hỗ trợ

---

## 9. Các lỗi thường gặp

### ❌ Không mở được website

**Nguyên nhân:**

* Port 3000 đang bị ứng dụng khác sử dụng

**Cách xử lý:**

* Stop container
* Run lại container
* Đổi **Host Port** thành `8080`
* Truy cập:

```
http://localhost:8080
```

---

### ❌ Không tạo được slide / lỗi AI

**Nguyên nhân:**

* API Key sai
* Chưa setup Billing

**Cách xử lý:**

* Kiểm tra lại API Key
* Bật Billing trong Google Cloud Console nếu cần dùng đầy đủ tính năng

---

## 10. Tóm tắt nhanh cho người dùng

* Cài Docker Desktop
* Tạo Google API Key
* (Tuỳ chọn) Bật Billing để không bị giới hạn
* Pull image `kazzan/rikai-ai-generate-slide`
* Khi Run:

    * Port: `3000 → 3000`
    * Env:

      ```
      NUXT_GOOGLE_API_KEY = API_KEY_CỦA_BẠN
      ```
* Mở trình duyệt: `http://localhost:3000`

---

**End of Document**
