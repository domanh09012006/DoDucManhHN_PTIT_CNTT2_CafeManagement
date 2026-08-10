# BÁO CÁO DỰ ÁN
# HỆ THỐNG QUẢN LÝ QUÁN CAFE
# (CoffeeManagement System – CMS)

---

**Sinh viên thực hiện:** Đỗ Đức Mạnh  
**Lớp:** CNTT2 – Học viện Công nghệ Bưu chính Viễn thông (PTIT)  
**Ngày hoàn thành:** 08/08/2026  
**Mã dự án:** CMS-2026  

---

## MỤC LỤC

1. Giới thiệu dự án
2. Phát biểu bài toán
3. Mục tiêu dự án
4. Phạm vi hệ thống
5. Phân tích yêu cầu
6. Phân tích hệ thống
7. Kiến trúc hệ thống
8. Thiết kế cơ sở dữ liệu
9. Use Case
10. Luồng hệ thống
11. API Specification
12. Cài đặt và triển khai
13. Kết quả đạt được
14. Hạn chế
15. Hướng phát triển tương lai
16. Kết luận

---

## 1. GIỚI THIỆU DỰ ÁN

**CoffeeManagement System (CMS)** là một hệ thống quản lý quán cafe toàn diện được xây dựng theo kiến trúc web application full-stack. Hệ thống bao gồm:

1. **CMS Admin Portal**: Giao diện quản trị nội bộ dành cho nhân viên (ADMIN, MANAGER, CASHIER)
2. **Customer Portal**: Giao diện dành cho khách hàng (CUSTOMER) để xem thực đơn, đặt bàn và đặt hàng online

Hệ thống được xây dựng với mục tiêu số hóa toàn bộ hoạt động vận hành của quán cafe, từ quản lý bàn, gọi món, thanh toán đến quản lý kho nguyên liệu và báo cáo doanh thu.

---

## 2. PHÁT BIỂU BÀI TOÁN

Các quán cafe truyền thống gặp nhiều khó khăn trong vận hành:

- **Quản lý bàn thủ công**: Không theo dõi được trạng thái bàn real-time
- **Gọi món lạc hậu**: Nhân viên ghi giấy, dễ sai sót
- **Thanh toán chậm**: Tổng hợp bill thủ công mất thời gian
- **Thiếu báo cáo**: Không có số liệu doanh thu theo thời gian thực
- **Kho nguyên liệu mù**: Không biết khi nào hết nguyên liệu
- **Khách hàng không tương tác được**: Không có kênh đặt bàn/đặt hàng online

---

## 3. MỤC TIÊU DỰ ÁN

| STT | Mục tiêu | Trạng thái |
|---|---|---|
| 1 | Xây dựng hệ thống quản lý bàn theo trạng thái real-time | ✅ DONE |
| 2 | Tạo luồng gọi món POS cho thu ngân | ✅ DONE |
| 3 | Hỗ trợ đặt hàng ONLINE qua Customer Portal | ✅ DONE |
| 4 | Tích hợp thanh toán nhiều phương thức (CASH/CARD/MOMO/VNPAY/...) | ✅ DONE |
| 5 | Hệ thống đặt bàn trước với workflow 5 trạng thái | ✅ DONE |
| 6 | Quản lý kho nguyên liệu với cảnh báo tồn kho thấp | ✅ DONE |
| 7 | Quản lý nhà cung cấp | ✅ DONE |
| 8 | Dashboard và báo cáo doanh thu theo ngày | ✅ DONE |
| 9 | Phân quyền 4 vai trò: ADMIN, MANAGER, CASHIER, CUSTOMER | ✅ DONE |
| 10 | Customer Portal với trang chủ, thực đơn, hồ sơ | ✅ DONE |

---

## 4. PHẠM VI HỆ THỐNG

### Trong phạm vi

| Module | Mô tả |
|---|---|
| Xác thực & Tài khoản | Đăng nhập, đăng ký (JWT stateless), quản lý profile |
| Quản lý Users | CRUD nhân viên, phân quyền 4 roles |
| Quản lý Khách hàng | Xem và quản lý tài khoản CUSTOMER |
| Quản lý Bàn | 5 trạng thái bàn, tìm bàn trống |
| Quản lý Thực đơn | Danh mục + sản phẩm (3 trạng thái) |
| Gọi món & Đặt hàng | POS và ONLINE (7 trạng thái đơn) |
| Thanh toán | 6 phương thức, hoàn tiền |
| Đặt bàn | 5 trạng thái, workflow hoàn chỉnh |
| Kho nguyên liệu | 4 loại giao dịch, cảnh báo tồn kho |
| Nhà cung cấp | CRUD, liên kết nguyên liệu |
| Báo cáo | Dashboard + doanh thu theo ngày |
| Customer Portal | 7 trang, đặt hàng và đặt bàn online |

### Ngoài phạm vi

- Tích hợp phần cứng máy in POS
- Tích hợp cổng thanh toán thực tế (sandbox only)
- Ứng dụng mobile native
- Hệ thống tích điểm thành viên

---

## 5. PHÂN TÍCH YÊU CẦU

### 5.1 Yêu cầu chức năng theo Role

**ADMIN:** Toàn quyền – quản lý users, khách hàng, bàn, sản phẩm, đơn hàng, thanh toán, kho, NCC, báo cáo, đặt bàn

**MANAGER:** Quản lý vận hành – bàn, sản phẩm, đơn hàng, thanh toán, kho, NCC, báo cáo, khách hàng, đặt bàn; **không quản lý users nhân viên**

**CASHIER:** Vận hành trực tiếp – bàn, đơn hàng POS, thanh toán, đặt bàn (duyệt/check-in); **không truy cập kho và báo cáo**

**CUSTOMER:** Tự phục vụ qua Portal – xem thực đơn, đặt hàng ONLINE, đặt bàn, xem lịch sử cá nhân

### 5.2 Yêu cầu phi chức năng

| Yêu cầu | Mô tả |
|---|---|
| Performance | API response <= 500ms |
| Security | JWT stateless, BCrypt, RBAC, CORS |
| Usability | Responsive, UI tiếng Việt |
| Maintainability | Layered architecture, Swagger docs |

---

## 6. PHÂN TÍCH HỆ THỐNG

### 6.1 Các Actor

| Actor | Mô tả |
|---|---|
| ADMIN | Quản trị viên hệ thống |
| MANAGER | Quản lý vận hành |
| CASHIER | Thu ngân tại quầy |
| CUSTOMER | Khách hàng online |

### 6.2 Các Enum quan trọng

| Enum | Giá trị |
|---|---|
| Role | ADMIN, MANAGER, CASHIER, CUSTOMER |
| UserStatus | ACTIVE, INACTIVE |
| TableStatus | AVAILABLE, OCCUPIED, RESERVED, CLEANING, OUT_OF_SERVICE |
| OrderStatus | PENDING, CONFIRMED, PREPARING, READY, SERVED, COMPLETED, CANCELLED |
| OrderSource | POS, ONLINE |
| ProductStatus | AVAILABLE, OUT_OF_STOCK, DISCONTINUED |
| PaymentMethod | CASH, CARD, BANK_TRANSFER, MOMO, VNPAY, ZALOPAY |
| PaymentStatus | PENDING, PAID, FAILED, REFUNDED |
| ReservationStatus | PENDING, CONFIRMED, CHECKED_IN, COMPLETED, CANCELLED |
| TransactionType | IMPORT, EXPORT, ADJUSTMENT, RETURN |

---

## 7. KIẾN TRÚC HỆ THỐNG

### 7.1 Tổng quan kiến trúc

Hệ thống sử dụng kiến trúc **3-Tier Architecture** với RESTful API:

```
Tier 1 (Presentation):
  - CMS Admin Portal (React SPA)
  - Customer Portal (React SPA)

Tier 2 (Application/Business Logic):
  - Spring Boot 3 Backend
  - REST API (77 endpoints)
  - Spring Security + JWT

Tier 3 (Data):
  - MySQL 8.x Database
  - 11 bảng dữ liệu
```

### 7.2 Backend Architecture (Layered)

```
[HTTP Request]
      ↓
[Controller Layer]     — 12 controllers, request/response mapping
      ↓
[Service Layer]        — Business logic, validation
      ↓
[Repository Layer]     — JPA repositories, database queries
      ↓
[Entity Layer]         — 11 JPA entities
      ↓
[MySQL Database]
```

### 7.3 Frontend Architecture

```
App.tsx (Router)
  ├── Customer Portal Routes (public + CUSTOMER)
  │   ├── HomePage (/)
  │   ├── AboutPage (/about)
  │   ├── MenuPage (/customer-menu)
  │   ├── PromotionsPage (/promotions)
  │   ├── ContactPage (/contact)
  │   ├── CustomerLoginPage (/customer/login)
  │   └── CustomerProfilePage (/customer/profile)
  │
  └── CMS Admin Portal Routes
      ├── Public: /login, /register
      ├── Protected (ALL STAFF): /tables, /orders, /payments, /reservations
      ├── Admin+Manager: /dashboard, /categories, /customers, /inventory, /suppliers, /reports
      └── Admin Only: /users
```

### 7.4 Security Architecture

```
Request → JwtAuthFilter → SecurityContext
                ↓
        JWT valid? → Extract user + role → @PreAuthorize check
```

---

## 8. THIẾT KẾ CƠ SỞ DỮ LIỆU

### 8.1 Danh sách bảng (11 bảng)

| Bảng | Entity | Số trường | Mô tả |
|---|---|---|---|
| users | User | 12 | Tài khoản 4 roles |
| cafe_tables | CafeTable | 8 | Bàn quán, 5 trạng thái |
| categories | Category | 8 | Danh mục thực đơn |
| products | Product | 12 | Sản phẩm, 3 trạng thái |
| orders | Order | 11 | Đơn hàng, 7 trạng thái, 2 nguồn |
| order_items | OrderItem | 6 | Chi tiết đơn |
| payments | Payment | 14 | Thanh toán, 6 PP, 4 trạng thái |
| reservations | Reservation | 11 | Đặt bàn, 5 trạng thái |
| suppliers | Supplier | 10 | Nhà cung cấp |
| ingredients | Ingredient | 12 | Nguyên liệu |
| inventory_transactions | InventoryTransaction | 13 | Giao dịch kho, 4 loại |

### 8.2 Quan hệ chính

- **users** → **orders** (1-N): Một user có nhiều đơn hàng
- **users** → **reservations** (1-N): Một user có nhiều đặt bàn
- **users** → **payments** (1-N, cashier): Một thu ngân xử lý nhiều thanh toán
- **cafe_tables** → **orders** (1-N): Một bàn có nhiều đơn
- **cafe_tables** → **reservations** (1-N): Một bàn có nhiều đặt bàn
- **categories** → **products** (1-N): Một danh mục có nhiều sản phẩm
- **orders** → **order_items** (1-N): Một đơn có nhiều món
- **orders** → **payments** (1-1): Một đơn có một thanh toán
- **suppliers** → **ingredients** (1-N): Một NCC cung cấp nhiều NL
- **ingredients** → **inventory_transactions** (1-N): Một NL có nhiều giao dịch

### 8.3 Đặc điểm thiết kế

- Sử dụng **ENUM** cho tất cả trạng thái (đảm bảo data integrity)
- **order_code** và **payment_code**: unique string codes (dễ tra cứu)
- **soft delete**: products dùng status=DISCONTINUED thay vì xóa vật lý
- **nullable fields**: table_id trong orders (hỗ trợ ONLINE order); user_id trong reservations (hỗ trợ đặt vãng lai)
- **audit fields**: created_at, updated_at cho tất cả bảng chính

---

## 9. USE CASE

### 9.1 Luồng POS (Thu ngân)

1. Thu ngân đăng nhập → Vào /tables
2. Chọn bàn AVAILABLE → Tạo Order POS (PENDING)
3. Thêm Order Items (productId, quantity, notes)
4. Xác nhận đơn → Order CONFIRMED → PREPARING → READY → SERVED
5. Tạo Payment → chọn phương thức → nhập tiền → PAID
6. Order → COMPLETED, Bàn → CLEANING → AVAILABLE

### 9.2 Luồng ONLINE (Khách hàng)

1. Khách đăng nhập /customer/login
2. Vào /customer-menu → xem thực đơn theo danh mục
3. Thêm món vào giỏ hàng
4. Đặt hàng → POST /api/orders với orderSource=ONLINE
5. Order PENDING hiển thị trên POS của staff
6. Staff xác nhận → CONFIRMED → ... → COMPLETED

### 9.3 Luồng Đặt bàn

1. Khách điền form đặt bàn (thời gian, số khách, liên hệ)
2. POST /api/reservations → PENDING
3. Staff (ADMIN/MANAGER/CASHIER) duyệt → CONFIRMED
4. Khách đến → Staff check-in → CHECKED_IN; Bàn → OCCUPIED
5. Hoàn thành → COMPLETED

---

## 10. LUỒNG HỆ THỐNG

### 10.1 Luồng xác thực

```
User → POST /api/auth/login
     → Spring Security AuthenticationManager
     → CustomUserDetailsService.loadUserByUsername()
     → Verify BCrypt password
     → JwtService.generateToken()
     → Return JWT + UserInfo
     → Frontend: localStorage.setItem('token', jwt)
     → Next request: Authorization: Bearer {jwt}
     → JwtAuthFilter validates token
     → Set SecurityContext
     → @PreAuthorize checks role
```

### 10.2 Luồng thanh toán

```
Staff → POST /api/payments {orderId, method, amount, amountReceived}
      → PaymentService.processPayment()
      → Validate: order tồn tại, chưa có payment PAID
      → Tính changeAmount = amountReceived - amount
      → Tạo Payment (PENDING)
      → Cập nhật Payment.status = PAID
      → Cập nhật Order.status = COMPLETED
      → Cập nhật Table.status = CLEANING (nếu là POS)
      → Ghi paidAt = LocalDateTime.now()
      → Return PaymentResponse
```

---

## 11. API SPECIFICATION

### 11.1 Tổng quan endpoints

| Controller | Base Path | Số endpoints |
|---|---|---|
| AuthController | /api/auth | 4 |
| UserController | /api/users | 7 |
| CustomerController | /api/customers | 5 |
| TableController | /api/tables | 9 |
| CategoryController | /api/categories | 5 |
| ProductController | /api/products | 9 |
| OrderController | /api/orders | 9 |
| PaymentController | /api/payments | 6 |
| ReservationController | /api/reservations | 5 |
| InventoryController | /api/inventory | 9 |
| SupplierController | /api/suppliers | 7 |
| DashboardController | /api/dashboard | 2 |
| **TOTAL** | | **77 endpoints** |

### 11.2 Ví dụ Request/Response

**Login:**
```
POST /api/auth/login
{
  "username": "admin",
  "password": "123456"
}
→
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "userId": 1,
    "username": "admin",
    "fullName": "Admin User",
    "role": "ADMIN"
  }
}
```

**Create Order (POS):**
```
POST /api/orders
Authorization: Bearer {token}
{
  "tableId": 5,
  "orderSource": "POS",
  "items": [
    {"productId": 1, "quantity": 2, "notes": "ít đường"},
    {"productId": 3, "quantity": 1, "notes": ""}
  ]
}
→
{
  "success": true,
  "data": {
    "id": 101,
    "orderCode": "ORD-20260808-001",
    "status": "PENDING",
    "orderSource": "POS",
    "subtotal": 120000,
    "totalAmount": 120000
  }
}
```

**Process Payment:**
```
POST /api/payments
Authorization: Bearer {token}
{
  "orderId": 101,
  "method": "CASH",
  "amount": 120000,
  "amountReceived": 150000
}
→
{
  "success": true,
  "data": {
    "id": 50,
    "paymentCode": "PAY-20260808-001",
    "status": "PAID",
    "amount": 120000,
    "amountReceived": 150000,
    "changeAmount": 30000,
    "paidAt": "2026-08-08T14:30:00"
  }
}
```

---

## 12. CÀI ĐẶT VÀ TRIỂN KHAI

### 12.1 Công nghệ sử dụng

| Thành phần | Công nghệ | Version |
|---|---|---|
| Backend Language | Java | 21 (LTS) |
| Backend Framework | Spring Boot | 3.x |
| ORM | Spring Data JPA + Hibernate | 3.x |
| Security | Spring Security + JWT | 6.x |
| Build Tool | Gradle | 8.x |
| Database | MySQL | 8.0+ |
| Frontend Framework | React + TypeScript | 18.x / 5.x |
| Frontend Build | Vite | 5.x |
| CSS Framework | Tailwind CSS | 3.x |
| API Docs | Swagger/OpenAPI 3.0 | springdoc 2.x |

### 12.2 Cấu trúc project

**Backend:**
```
src/main/java/com/example/coffeemanagement/
├── controller/     (12 controllers)
├── service/        (business logic)
├── repository/     (JPA repositories)
├── entity/         (11 entities)
├── dto/            (request + response DTOs)
│   ├── request/
│   └── response/
├── enums/          (10 enums)
├── security/       (JWT + UserDetails)
├── config/         (CORS, Security config)
└── exception/      (Global handler)
```

**Frontend:**
```
frontend/src/
├── pages/          (14 Admin pages + customer/ dir)
│   └── customer/   (7 Customer Portal pages)
├── components/     (shared components)
├── context/        (AuthContext)
├── api/            (axios API calls)
├── services/       (business services)
├── types/          (TypeScript types)
└── utils/          (utility functions)
```

### 12.3 Chạy dự án

**Backend:**
```bash
cd CoffeeManagement
./gradlew bootRun
# Server chạy tại: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

**Frontend:**
```bash
cd CoffeeManagement/frontend
npm install
npm run dev
# Portal chạy tại: http://localhost:5173
```

---

## 13. KẾT QUẢ ĐẠT ĐƯỢC

### 13.1 Backend

| Hạng mục | Số lượng |
|---|---|
| REST API Controllers | 12 |
| Total Endpoints | 77 |
| JPA Entities | 11 |
| Enum Types | 10 |
| DTO Classes | ~20+ |

### 13.2 Frontend

| Hạng mục | Số lượng |
|---|---|
| Admin Portal Pages | 14 |
| Customer Portal Pages | 7 |
| Total Pages | 21 |
| Route Guards | 3 (ProtectedRoute, AdminRoute, OnlyAdminRoute) |

### 13.3 Modules hoàn thành

| Module | Backend | Frontend | Trạng thái |
|---|---|---|---|
| Authentication | ✅ | ✅ | DONE |
| User Management | ✅ | ✅ | DONE |
| Customer Management | ✅ | ✅ | DONE |
| Table Management | ✅ | ✅ | DONE |
| Category Management | ✅ | ✅ | DONE |
| Product Management | ✅ | ✅ | DONE |
| Order Management (POS + ONLINE) | ✅ | ✅ | DONE |
| Payment | ✅ | ✅ | DONE |
| Reservation | ✅ | ✅ | DONE |
| Inventory | ✅ | ✅ | DONE |
| Supplier | ✅ | ✅ | DONE |
| Dashboard & Report | ✅ | ✅ | DONE |
| Customer Portal | ✅ | ✅ | DONE |

---

## 14. HẠN CHẾ

| Hạn chế | Mô tả |
|---|---|
| Thanh toán online | Chưa tích hợp cổng thanh toán thực tế (sandbox only) |
| Real-time | Chưa dùng WebSocket để cập nhật bàn real-time |
| Upload ảnh | imageUrl là URL string, chưa có upload server thực |
| Mobile | Chưa có ứng dụng mobile native |
| Tích điểm | Chưa có hệ thống tích điểm khách hàng thành viên |
| Notification | Chưa có push notification |
| Test coverage | Unit test chưa đầy đủ toàn bộ |

---

## 15. HƯỚNG PHÁT TRIỂN TƯƠNG LAI

| Tính năng | Mô tả |
|---|---|
| WebSocket | Cập nhật trạng thái bàn real-time trên Dashboard |
| Payment Gateway | Tích hợp VNPay/Momo SDK thực tế |
| File Upload | Hệ thống upload ảnh sản phẩm (S3/CloudStorage) |
| Mobile App | Ứng dụng mobile React Native |
| Loyalty Program | Tích điểm và đổi quà |
| Kitchen Display | Màn hình bếp hiển thị đơn cần pha chế |
| Analytics | Báo cáo nâng cao: sản phẩm bán chạy, giờ cao điểm |
| Multi-branch | Hỗ trợ nhiều chi nhánh |
| Push Notification | Thông báo khi đơn hàng sẵn sàng |

---

## 16. KẾT LUẬN

Dự án **CoffeeManagement System (CMS)** đã được xây dựng và hoàn thiện thành công trong vòng **31 ngày** (08/07/2026 – 08/08/2026).

**Những gì đã đạt được:**
- Hệ thống quản lý quán cafe toàn diện với **77 REST API endpoints**
- Phân quyền rõ ràng 4 roles: ADMIN, MANAGER, CASHIER, CUSTOMER
- 2 luồng đặt hàng: **POS** (tại quầy) và **ONLINE** (qua Customer Portal)
- Hệ thống đặt bàn trước với vòng đời 5 trạng thái hoàn chỉnh
- Quản lý kho nguyên liệu với cảnh báo tồn kho thấp
- **Customer Portal** với 7 trang cho trải nghiệm khách hàng
- Tài liệu đầy đủ: SRS, Technical Plan, Calendar, Final Report

**Ý nghĩa của dự án:**
- Áp dụng được kiến thức Java/Spring Boot, React/TypeScript trong dự án thực tế
- Hiểu rõ quy trình phát triển phần mềm từ analysis đến deployment
- Làm quen với JWT, Spring Security, JPA/Hibernate
- Xây dựng được hệ thống full-stack hoàn chỉnh độc lập

---

*Báo cáo được hoàn thiện dựa trên source code thực tế của dự án*  
*Phiên bản: 1.0 – 08/08/2026*  
*© 2026 – Đỗ Đức Mạnh – PTIT CNTT2*
