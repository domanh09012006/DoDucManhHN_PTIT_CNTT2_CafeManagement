# CALENDAR / MASTER PLAN
# Dự án: CoffeeManagement System (CMS)
# Ngày bắt đầu: 08/07/2026
# Dùng để điền vào Calendar.xlsx

---

## THÔNG TIN DỰ ÁN

| Mục | Thông tin |
|---|---|
| Tên dự án | CoffeeManagement System |
| Ngày bắt đầu | 08/07/2026 |
| Ngày kết thúc | 08/08/2026 |
| Thời gian thực hiện | ~4 tuần (31 ngày) |
| Người thực hiện | Đỗ Đức Mạnh – PTIT CNTT2 |

---

## TIMELINE TỔNG QUAN

| Phase | Tên | Từ ngày | Đến ngày | Số ngày | Trạng thái |
|---|---|---|---|---|---|
| 1 | Requirement Analysis & SRS | 08/07/2026 | 11/07/2026 | 4 | DONE |
| 2 | Database Design | 12/07/2026 | 13/07/2026 | 2 | DONE |
| 3 | Backend Core Setup | 14/07/2026 | 16/07/2026 | 3 | DONE |
| 4 | Authentication & Authorization | 17/07/2026 | 18/07/2026 | 2 | DONE |
| 5 | Backend APIs – Core Modules | 19/07/2026 | 24/07/2026 | 6 | DONE |
| 6 | Backend APIs – Order & Payment | 25/07/2026 | 27/07/2026 | 3 | DONE |
| 7 | Backend APIs – Inventory & Supplier | 28/07/2026 | 29/07/2026 | 2 | DONE |
| 8 | Backend APIs – Reservation & Dashboard | 30/07/2026 | 31/07/2026 | 2 | DONE |
| 9 | Frontend Admin Portal | 01/08/2026 | 05/08/2026 | 5 | DONE |
| 10 | Customer Portal | 05/08/2026 | 07/08/2026 | 3 | DONE |
| 11 | Documentation & Finalization | 07/08/2026 | 08/08/2026 | 2 | DONE |

---

## CHI TIẾT TỪNG PHASE

### Phase 1: Requirement Analysis & SRS (08/07 – 11/07/2026)

| Ngày | Công việc | Trạng thái |
|---|---|---|
| 08/07 | Phân tích nghiệp vụ quán cafe | DONE |
| 09/07 | Xác định 4 roles: ADMIN, MANAGER, CASHIER, CUSTOMER | DONE |
| 10/07 | Viết SRS phiên bản đầu | DONE |
| 11/07 | Review và hoàn thiện SRS v0.1 | DONE |

### Phase 2: Database Design (12/07 – 13/07/2026)

| Ngày | Công việc | Trạng thái |
|---|---|---|
| 12/07 | Thiết kế ERD – 11 bảng | DONE |
| 12/07 | Xác định các enum: OrderStatus, ReservationStatus, ... | DONE |
| 13/07 | Tạo seed_data.sql | DONE |
| 13/07 | Review database schema | DONE |

### Phase 3: Backend Core Setup (14/07 – 16/07/2026)

| Ngày | Công việc | Trạng thái |
|---|---|---|
| 14/07 | Khởi tạo Spring Boot 3 với Gradle | DONE |
| 14/07 | Cấu hình application.yml, MySQL connection | DONE |
| 15/07 | Tạo 11 Entity classes (User, CafeTable, Category, Product, Order, OrderItem, Payment, Reservation, Supplier, Ingredient, InventoryTransaction) | DONE |
| 15/07 | Tạo 10 Enum classes | DONE |
| 16/07 | Cấu hình Swagger/OpenAPI 3.0 | DONE |
| 16/07 | Tạo cấu trúc DTO (request/response) | DONE |

### Phase 4: Authentication & Authorization (17/07 – 18/07/2026)

| Ngày | Công việc | Trạng thái |
|---|---|---|
| 17/07 | Implement JwtService | DONE |
| 17/07 | Implement CustomUserDetailsService | DONE |
| 17/07 | Cấu hình Spring Security với JWT filter | DONE |
| 18/07 | AuthController: POST /login, /register, /logout, GET /me | DONE |
| 18/07 | Test authentication flow | DONE |

### Phase 5: Backend APIs – Core Modules (19/07 – 24/07/2026)

| Ngày | Công việc | Trạng thái |
|---|---|---|
| 19/07 | UserController + UserService (CRUD + toggle-status + profile) | DONE |
| 20/07 | CustomerController + service | DONE |
| 20/07 | TableController + TableService + booking-search | DONE |
| 21/07 | CategoryController + CategoryService | DONE |
| 21/07 | ProductController + ProductService (CRUD + featured + status) | DONE |
| 22/07 | Cài đặt Global Exception Handler | DONE |
| 23/07 | Test và fix Core APIs | DONE |
| 24/07 | SupplierController + SupplierService | DONE |

### Phase 6: Backend APIs – Order & Payment (25/07 – 27/07/2026)

| Ngày | Công việc | Trạng thái |
|---|---|---|
| 25/07 | OrderController + OrderService (POS flow) | DONE |
| 25/07 | Order items management | DONE |
| 26/07 | PaymentController + PaymentService | DONE |
| 26/07 | Payment methods: CASH, CARD, BANK_TRANSFER, MOMO, VNPAY, ZALOPAY | DONE |
| 27/07 | ONLINE order flow (Customer) | DONE |
| 27/07 | Refund endpoint | DONE |

### Phase 7: Backend APIs – Inventory & Supplier (28/07 – 29/07/2026)

| Ngày | Công việc | Trạng thái |
|---|---|---|
| 28/07 | InventoryController – Ingredient CRUD | DONE |
| 28/07 | InventoryController – Transactions (IMPORT/EXPORT/ADJUSTMENT/RETURN) | DONE |
| 29/07 | Low-stock alert endpoint | DONE |
| 29/07 | Toggle active ingredient | DONE |

### Phase 8: Backend APIs – Reservation & Dashboard (30/07 – 31/07/2026)

| Ngày | Công việc | Trạng thái |
|---|---|---|
| 30/07 | ReservationController (create, status update, cancel) | DONE |
| 30/07 | Customer reservation history | DONE |
| 31/07 | DashboardController – GET /dashboard | DONE |
| 31/07 | DashboardController – GET /revenue (ngày/khoảng thời gian) | DONE |

### Phase 9: Frontend Admin Portal (01/08 – 05/08/2026)

| Ngày | Công việc | Trạng thái |
|---|---|---|
| 01/08 | Vite + React + TypeScript + Tailwind setup | DONE |
| 01/08 | AuthContext + JWT localStorage | DONE |
| 01/08 | ProtectedRoute, AdminRoute, OnlyAdminRoute | DONE |
| 01/08 | LoginPage | DONE |
| 02/08 | DashboardPage với Recharts | DONE |
| 02/08 | TablesPage – hiển thị bàn, cập nhật trạng thái | DONE |
| 03/08 | OrdersPage – tạo đơn POS, xem đơn ONLINE | DONE |
| 03/08 | PaymentsPage – thanh toán, lịch sử | DONE |
| 03/08 | ReservationsPage – duyệt, check-in, hủy | DONE |
| 04/08 | ProductsPage + CategoriesPage | DONE |
| 04/08 | InventoryPage – nguyên liệu + giao dịch kho | DONE |
| 05/08 | SuppliersPage – nhà cung cấp | DONE |
| 05/08 | CustomersPage – khách hàng | DONE |
| 05/08 | ReportsPage – báo cáo doanh thu | DONE |
| 05/08 | UsersPage – quản lý users (Admin only) | DONE |

### Phase 10: Customer Portal (05/08 – 07/08/2026)

| Ngày | Công việc | Trạng thái |
|---|---|---|
| 05/08 | HomePage – trang chủ quán cafe | DONE |
| 06/08 | MenuPage – thực đơn + đặt hàng ONLINE | DONE |
| 06/08 | CustomerLoginPage – đăng nhập riêng | DONE |
| 06/08 | CustomerProfilePage – hồ sơ + lịch sử | DONE |
| 07/08 | AboutPage, ContactPage, PromotionsPage | DONE |
| 07/08 | Test Customer Portal flow | DONE |

### Phase 11: Documentation & Finalization (07/08 – 08/08/2026)

| Ngày | Công việc | Trạng thái |
|---|---|---|
| 07/08 | Cập nhật SRS v2.0 theo source code thực tế | DONE |
| 07/08 | Viết Technical Plan | DONE |
| 08/08 | Cập nhật Calendar/Master Plan | DONE |
| 08/08 | Hoàn thiện Final Report | DONE |
| 08/08 | Review đồng bộ tài liệu | DONE |

---

## GANTT CHART (Text Format)

```
Phase                              Jul     Aug
                                   08 15 22 29 05 08
Phase 1: Requirement & SRS         ████
Phase 2: Database Design               ██
Phase 3: Backend Core Setup              ███
Phase 4: Auth & Authorization              ██
Phase 5: Backend Core APIs               ██████
Phase 6: Order & Payment                       ███
Phase 7: Inventory & Supplier                    ██
Phase 8: Reservation & Dashboard                  ██
Phase 9: Frontend Admin Portal                     █████
Phase 10: Customer Portal                              ███
Phase 11: Documentation                                  ██
```

---

## PHÂN CÔNG (Solo Project)

| Người thực hiện | Vai trò | Công việc |
|---|---|---|
| Đỗ Đức Mạnh | Full-stack Developer | Backend (Java/Spring Boot), Frontend (React/TypeScript), Database (MySQL), Documentation |

---

## TỔNG KẾT TIMELINE

| Hạng mục | Giá trị |
|---|---|
| Tổng thời gian | 31 ngày (08/07 – 08/08/2026) |
| Tổng số tasks | ~65 tasks |
| Tasks hoàn thành | 65/65 (100%) |
| Trạng thái dự án | COMPLETED |

---

*Nội dung này dùng để điền vào Calendar.xlsx*
*Cập nhật: 08/08/2026*
