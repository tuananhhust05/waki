# Waki Platform - Nền tảng Thanh Toán Số & Quản Lý Tài Chính Gia Đình

Dự án Waki bao gồm 4 giải pháp độc lập, mỗi giải pháp có database riêng, user table riêng, và luồng riêng. Tất cả được triển khai trong **1 dự án BE duy nhất** và **1 dự án FE duy nhất**, chia thành các modules.

## Cấu trúc dự án

```
.
├── BE/                          # 1 dự án Node.js duy nhất
│   ├── package.json
│   ├── server.js               # Server chính
│   └── modules/                # Các modules cho từng giải pháp
│       ├── family-wallet/      # Module 1: Digital Family Wallet
│       ├── pos-management/     # Module 2: POS Management
│       ├── ai-technologies/    # Module 3: AI Technologies
│       └── school-services/    # Module 4: School Services
├── FE/                          # 1 dự án Angular duy nhất
│   ├── package.json
│   ├── angular.json
│   └── src/app/
│       └── modules/             # Các modules cho từng giải pháp
│           ├── family-wallet/
│           ├── pos-management/
│           ├── ai-technologies/
│           └── school-services/
└── docker-compose.yml
```

## Công nghệ sử dụng

- **Frontend**: Angular 17, Bootstrap 5, HTML5, CSS3
- **Backend**: Express.js, Node.js 22
- **Database**: MongoDB 7.0 (Docker) - 4 databases riêng biệt
- **Containerization**: Docker, Docker Compose

## Yêu cầu hệ thống

- Docker và Docker Compose
- Node.js 22 (nếu chạy local không dùng Docker)

## Cài đặt và chạy

### 1. Clone repository

```bash
git clone <repository-url>
cd source
```

### 2. Chạy tất cả với Docker Compose

```bash
docker-compose up -d
```

Lệnh này sẽ:
- Tạo 4 database MongoDB riêng biệt (mỗi giải pháp 1 database)
- Build và chạy 1 backend service (với 4 modules)
- Build và chạy 1 frontend application (với 4 modules)

### 3. Truy cập ứng dụng

Sau khi Docker Compose khởi động xong:

- **Frontend**: http://localhost:4200
  - Family Wallet: http://localhost:4200/family-wallet
  - POS Management: http://localhost:4200/pos-management
  - AI Technologies: http://localhost:4200/ai-technologies
  - School Services: http://localhost:4200/school-services

- **Backend API**: http://localhost:3301
  - Family Wallet: https://waki.autos/api/family-wallet
  - POS Management: https://waki.autos/api/pos-management
  - AI Technologies: https://waki.autos/api/ai-technologies
  - School Services: https://waki.autos/api/school-services

- **Databases** (MongoDB):
  - Family Wallet DB: mongodb://admin:admin123@localhost:27020/family_wallet_db?authSource=admin
  - POS DB: mongodb://admin:admin123@localhost:27018/pos_db?authSource=admin
  - AI DB: mongodb://admin:admin123@localhost:27019/ai_db?authSource=admin
  - School DB: mongodb://admin:admin123@localhost:27020/school_db?authSource=admin

### 4. Dừng các ứng dụng

```bash
docker-compose down
```

Để xóa cả volumes (database data):

```bash
docker-compose down -v
```

## Các giải pháp

### 1. Digital Family Wallet (Ví gia đình kỹ thuật số)

**Module**: `BE/modules/family-wallet`, `FE/src/app/modules/family-wallet`

**Database**: `family_wallet_db` (MongoDB, port 27017)

**Tính năng**:
- Quản lý tài chính gia đình
- Tạo tài khoản cho thành viên gia đình
- Phân bổ ngân sách và giới hạn chi tiêu
- Quản lý ví và giao dịch
- Thông báo tức thì

**API Endpoints**:
- `POST /api/family-wallet/auth/register` - Đăng ký
- `POST /api/family-wallet/auth/login` - Đăng nhập
- `GET /api/family-wallet/families/my-family` - Lấy thông tin gia đình
- `POST /api/family-wallet/families/members` - Thêm thành viên
- `GET /api/family-wallet/wallets/my-wallet` - Lấy thông tin ví
- `POST /api/family-wallet/wallets/add-funds` - Nạp tiền
- `GET /api/family-wallet/wallets/transactions` - Lấy lịch sử giao dịch

### 2. POS Management (Quản lý điểm bán)

**Module**: `BE/modules/pos-management`, `FE/src/app/modules/pos-management`

**Database**: `pos_db` (MongoDB, port 27018)

**Tính năng**:
- Quản lý sản phẩm và hàng tồn kho
- Xử lý bán hàng (QR, thẻ, ví Waki)
- Quản lý doanh thu và lịch sử bán hàng
- Báo cáo theo thời gian thực

**API Endpoints**:
- `POST /api/pos-management/auth/register` - Đăng ký merchant
- `POST /api/pos-management/auth/login` - Đăng nhập
- `GET /api/pos-management/products` - Lấy danh sách sản phẩm
- `POST /api/pos-management/products` - Tạo sản phẩm
- `POST /api/pos-management/sales` - Tạo đơn bán hàng
- `GET /api/pos-management/sales` - Lấy lịch sử bán hàng

### 3. AI Technologies (Công nghệ AI)

**Module**: `BE/modules/ai-technologies`, `FE/src/app/modules/ai-technologies`

**Database**: `ai_db` (MongoDB, port 27019)

**Tính năng**:
- Phân tích giao dịch và phát hiện bất thường
- Dự đoán xu hướng chi tiêu
- Báo cáo thông minh
- Hỗ trợ ra quyết định kinh doanh

**API Endpoints**:
- `POST /api/ai-technologies/auth/register` - Đăng ký
- `POST /api/ai-technologies/auth/login` - Đăng nhập
- `POST /api/ai-technologies/ai/analyze-transaction` - Phân tích giao dịch
- `GET /api/ai-technologies/ai/insights` - Lấy insights

### 4. School Services (Dịch vụ trường học)

**Module**: `BE/modules/school-services`, `FE/src/app/modules/school-services`

**Database**: `school_db` (MongoDB, port 27020)

**Tính năng**:
- Gọi đón học sinh (Dismissal Call)
- Ghi nhận điểm danh (Attendance Records)
- Quản lý học sinh và phụ huynh

**API Endpoints**:
- `POST /api/school-services/auth/register` - Đăng ký
- `POST /api/school-services/auth/login` - Đăng nhập
- `GET /api/school-services/students/my-students` - Lấy danh sách học sinh
- `POST /api/school-services/attendance/check-in` - Điểm danh vào
- `POST /api/school-services/dismissal/call` - Tạo lời gọi đón
- `GET /api/school-services/dismissal/my-calls` - Lấy lịch sử gọi đón

## Development

### Chạy Backend local

```bash
cd BE
npm install
npm start
```

### Chạy Frontend local

```bash
cd FE
npm install
npm start
```

## Đặc điểm kiến trúc

- **1 dự án BE**: Tất cả modules chạy trên cùng 1 Express server (port 3301)
- **1 dự án FE**: Tất cả modules chạy trên cùng 1 Angular app (port 4200)
- **4 databases riêng**: Mỗi giải pháp có database MongoDB riêng
- **4 user collections riêng**: Mỗi database có collection users riêng
- **MongoDB với Mongoose**: Sử dụng Mongoose ODM cho tất cả modules
- **JWT riêng**: Mỗi module có JWT secret riêng
- **Luồng riêng**: Mỗi module hoàn toàn độc lập về business logic

## License

Copyright © Waki Information Systems Technology Company
