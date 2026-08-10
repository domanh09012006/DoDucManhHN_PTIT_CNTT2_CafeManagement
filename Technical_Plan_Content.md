# NỘI DUNG TECHNICAL PLAN
# Dự án: CoffeeManagement System (CMS)
# Dùng để điền vào Template-Technical.xlsx

---

## THÔNG TIN DỰ ÁN

| Mục | Thông tin |
|---|---|
| Tên dự án | CoffeeManagement System (CMS) |
| Mã dự án | CMS-2026 |
| Người thực hiện | Đỗ Đức Mạnh – PTIT CNTT2 |
| Ngày bắt đầu | 08/07/2026 |
| Ngày hoàn thành | 08/08/2026 |
| Trạng thái | COMPLETED |

---

## 1. TECHNOLOGY STACK

### Backend

| Công nghệ | Version | Mục đích |
|---|---|---|
| Java | 21 (LTS) | Ngôn ngữ lập trình backend |
| Spring Boot | 3.x | Framework backend chính |
| Spring Security | 6.x | Bảo mật + phân quyền |
| Spring Data JPA | 3.x | ORM layer |
| Hibernate | 6.x | JPA Implementation |
| JWT (jjwt) | 0.11+ | Xác thực stateless |
| Lombok | Latest | Giảm boilerplate code |
| Gradle | 8.x | Build tool |
| Swagger / SpringDoc | 2.x | API Documentation |

### Frontend

| Công nghệ | Version | Mục đích |
|---|---|---|
| React | 18.x | UI Framework |
| TypeScript | 5.x | Type-safe JavaScript |
| Vite | 5.x | Build tool frontend |
| Tailwind CSS | 3.x | Utility-first CSS |
| React Router DOM | 6.x | Client-side routing |
| Axios | Latest | HTTP client |
| React Hot Toast | Latest | Notifications |
| Recharts | Latest | Charts/Dashboard |

### Database & Infrastructure

| Thành phần | Công nghệ | Ghi chú |
|---|---|---|
| Cơ sở dữ liệu | MySQL 8.0+ | Relational DB |
| IDE | IntelliJ IDEA 2023+ | Backend development |
| Code Editor | VS Code | Frontend development |
| API Testing | Swagger UI | Tại /swagger-ui.html |

---

## 2. KIẾN TRÚC HỆ THỐNG

### Kiến trúc tổng thể: 3-Tier Architecture

```
[Customer Portal]      [CMS Admin Portal]
   React SPA              React SPA
       |                      |
       └──────────────────────┘
                  |
            HTTP/REST API
                  |
         [Spring Boot Backend]
         Controller Layer
         Service Layer  
         Repository Layer
                  |
            [MySQL 8.x]
```

### Layered Architecture (Backend)

| Layer | Package | Mô tả |
|---|---|---|
| Controller | controller/ | REST endpoints, request/response mapping |
| Service | service/ | Business logic |
| Repository | repository/ | Data access (JPA repositories) |
| Entity | entity/ | JPA entities (11 entities) |
| DTO | dto/ | Data Transfer Objects |
| Enum | enums/ | Các enum type |
| Security | security/ | JWT, UserDetailsService |
| Config | config/ | CORS, Security config |
| Exception | exception/ | Global exception handler |

---

## 3. BACKEND MODULES & APIS

### Controllers thực tế (12 controllers)

| Controller | Base Path | Số endpoint | Phân quyền chính |
|---|---|---|---|
| AuthController | /api/auth | 4 | Public / Any |
| UserController | /api/users | 7 | ADMIN |
| CustomerController | /api/customers | 5 | ADMIN, MANAGER |
| TableController | /api/tables | 9 | ADMIN/MANAGER/CASHIER |
| CategoryController | /api/categories | 5 | ADMIN/MANAGER + Any |
| ProductController | /api/products | 9 | ADMIN/MANAGER + Any |
| OrderController | /api/orders | 9 | ADMIN/MANAGER/CASHIER + Any |
| PaymentController | /api/payments | 6 | ADMIN/MANAGER + Any |
| ReservationController | /api/reservations | 5 | ADMIN/MANAGER/CASHIER + Any |
| InventoryController | /api/inventory | 9 | ADMIN/MANAGER + Any |
| SupplierController | /api/suppliers | 7 | ADMIN/MANAGER + Any |
| DashboardController | /api/dashboard | 2 | ADMIN, MANAGER |

**Tổng: 77 endpoints**

---

## 4. DATABASE DESIGN

### 11 bảng dữ liệu (Entity thực tế)

| Bảng | Entity Java | Mô tả |
|---|---|---|
| users | User | Tài khoản (4 roles) |
| cafe_tables | CafeTable | Bàn quán (5 trạng thái) |
| categories | Category | Danh mục thực đơn |
| products | Product | Sản phẩm (3 trạng thái) |
| orders | Order | Đơn hàng (7 trạng thái, 2 nguồn) |
| order_items | OrderItem | Chi tiết đơn hàng |
| payments | Payment | Thanh toán (4 trạng thái, 6 phương thức) |
| reservations | Reservation | Đặt bàn (5 trạng thái) |
| suppliers | Supplier | Nhà cung cấp |
| ingredients | Ingredient | Nguyên liệu |
| inventory_transactions | InventoryTransaction | Giao dịch kho (4 loại) |

### Các Enum quan trọng

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

## 5. AUTHENTICATION & AUTHORIZATION

| Mục | Chi tiết |
|---|---|
| Cơ chế | JWT (JSON Web Token) – Stateless |
| Token storage | Frontend localStorage |
| Password hashing | BCrypt |
| Authorization | Spring Security @PreAuthorize với Role-based |
| Roles | ADMIN > MANAGER > CASHIER > CUSTOMER |
| Account lock | lockedUntil field – tạm khóa khi sai nhiều lần |
| CORS | Cấu hình cho phép domain frontend |

---

## 6. FRONTEND MODULES

### CMS Admin Portal (14 trang)

| Trang | Route | Phân quyền |
|---|---|---|
| LoginPage | /login | Public |
| RegisterPage | /register | Public |
| DashboardPage | /dashboard | ADMIN, MANAGER |
| TablesPage | /tables | ALL STAFF |
| OrdersPage | /orders | ALL STAFF |
| PaymentsPage | /payments | ALL STAFF |
| ReservationsPage | /reservations | ALL STAFF |
| ProductsPage | /products | ALL STAFF |
| CategoriesPage | /categories | ADMIN, MANAGER |
| InventoryPage | /inventory | ADMIN, MANAGER |
| SuppliersPage | /suppliers | ADMIN, MANAGER |
| CustomersPage | /customers | ADMIN, MANAGER |
| ReportsPage | /reports | ADMIN, MANAGER |
| UsersPage | /users | ADMIN only |

### Customer Portal (7 trang)

| Trang | Route | Phân quyền |
|---|---|---|
| HomePage | / | Public |
| AboutPage | /about | Public |
| MenuPage | /customer-menu | CUSTOMER |
| PromotionsPage | /promotions | Public |
| ContactPage | /contact | Public |
| CustomerLoginPage | /customer/login | Public |
| CustomerProfilePage | /customer/profile | CUSTOMER |

---

## 7. TASK LIST THỰC TẾ

### Phase 1: Requirement & Design (Tuần 1)
- [x] Phân tích yêu cầu nghiệp vụ quán cafe
- [x] Viết SRS phiên bản 1.0
- [x] Thiết kế Database Schema (11 bảng)
- [x] Thiết kế kiến trúc hệ thống

### Phase 2: Backend Core (Tuần 2–3)
- [x] Khởi tạo Spring Boot 3 project với Gradle
- [x] Cấu hình MySQL + JPA + Hibernate
- [x] Tạo 11 Entity classes với Lombok + JPA annotations
- [x] Tạo 10 Enum classes
- [x] Implement Spring Security + JWT stateless
- [x] CustomUserDetailsService + JwtService + JwtFilter
- [x] Cấu hình CORS

### Phase 3: Backend APIs (Tuần 3–4)
- [x] AuthController: login, register, logout, /me
- [x] UserController: CRUD + toggle-status + profile
- [x] CustomerController: CRUD + toggle-status
- [x] TableController: CRUD + booking-search + status update
- [x] CategoryController: CRUD
- [x] ProductController: CRUD + featured + available + status
- [x] OrderController: create + update + status + cancel + customer
- [x] PaymentController: process + refund + search
- [x] ReservationController: create + status + cancel + customer
- [x] InventoryController: ingredients + transactions + low-stock
- [x] SupplierController: CRUD + toggle-active
- [x] DashboardController: dashboard + revenue report
- [x] Global Exception Handler
- [x] Swagger/OpenAPI 3.0 configuration

### Phase 4: Frontend Admin Portal (Tuần 4–5)
- [x] Vite + React + TypeScript setup
- [x] Tailwind CSS configuration
- [x] AuthContext + JWT management
- [x] ProtectedRoute + AdminRoute + OnlyAdminRoute
- [x] LoginPage + RegisterPage
- [x] DashboardPage với charts
- [x] TablesPage – quản lý bàn
- [x] OrdersPage – quản lý đơn hàng POS
- [x] PaymentsPage – thanh toán
- [x] ReservationsPage – đặt bàn
- [x] ProductsPage + CategoriesPage
- [x] InventoryPage – kho nguyên liệu
- [x] SuppliersPage – nhà cung cấp
- [x] CustomersPage – quản lý khách hàng
- [x] ReportsPage – báo cáo doanh thu
- [x] UsersPage – quản lý users

### Phase 5: Customer Portal (Tuần 5–6)
- [x] HomePage – trang chủ quán cafe
- [x] AboutPage – giới thiệu
- [x] MenuPage – thực đơn + đặt hàng ONLINE
- [x] PromotionsPage – khuyến mãi
- [x] ContactPage – liên hệ
- [x] CustomerLoginPage – đăng nhập riêng
- [x] CustomerProfilePage – hồ sơ + lịch sử

### Phase 6: Documentation & Finalization (Tuần 6–7)
- [x] Cập nhật SRS v2.0 theo source code thực tế
- [x] Technical Plan document
- [x] Calendar / Master Plan
- [x] Final Report
- [x] Seed data SQL

---

## 8. SEED DATA

File `seed_data.sql` (16.8KB) chứa:
- Dữ liệu mẫu cho tất cả 11 bảng
- Tài khoản mẫu cho 4 roles
- Sản phẩm và danh mục mẫu
- Đơn hàng và thanh toán mẫu
- Nguyên liệu và nhà cung cấp mẫu

---

## 9. KẾT QUẢ ĐẠT ĐƯỢC

| Hạng mục | Kết quả |
|---|---|
| Tổng số endpoints API | 77 endpoints |
| Số Entity/Table | 11 |
| Số Enum | 10 |
| Số Frontend pages (Admin) | 14 |
| Số Frontend pages (Customer Portal) | 7 |
| Tổng trang Frontend | 21 |
| Tổng Controller | 12 |
| Source code Backend | ~100+ files |
| Source code Frontend | ~30+ files |
| Tài liệu | SRS, Technical, Calendar, Report |

---

*Nội dung này dùng để điền vào Template-Technical.xlsx*
*Phiên bản: 1.0 – 08/08/2026*
