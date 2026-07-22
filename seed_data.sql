-- =============================================================================
-- SCRIPT SEED DỮ LIỆU MẪU DỰ ÁN CAFE MANAGEMENT SYSTEM (NGOẠI TRỪ TÀI KHOẢN)
-- Đảm bảo đã có ít nhất 1 tài khoản trong bảng users (admin hoặc nhân viên)
-- =============================================================================

USE coffee_management;

-- Tắt kiểm tra khóa ngoại để dọn dẹp dữ liệu cũ an toàn
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE payments;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE inventory_transactions;
TRUNCATE TABLE ingredients;
TRUNCATE TABLE suppliers;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
TRUNCATE TABLE cafe_tables;
SET FOREIGN_KEY_CHECKS = 1;

-- ─── 1. SEED BÀN CAFE (cafe_tables) ──────────────────────────────────────────
INSERT INTO cafe_tables (id, table_number, area, capacity, status, qr_code_url, notes, created_at) VALUES
(1, 'T101', 'Tầng 1', 4, 'AVAILABLE', 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=T101', 'Gần cửa sổ', NOW()),
(2, 'T102', 'Tầng 1', 2, 'AVAILABLE', 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=T102', 'Gần quầy bar', NOW()),
(3, 'T103', 'Tầng 1', 6, 'AVAILABLE', 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=T103', 'Bàn sofa lớn', NOW()),
(4, 'T201', 'Tầng 2', 4, 'AVAILABLE', 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=T201', 'View ban công', NOW()),
(5, 'T202', 'Tầng 2', 4, 'AVAILABLE', 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=T202', 'Gần kệ sách', NOW()),
(6, 'T203', 'Tầng 2', 2, 'AVAILABLE', 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=T203', 'Không gian yên tĩnh', NOW()),
(7, 'O101', 'Ngoài trời', 4, 'AVAILABLE', 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=O101', 'Dưới tán cây', NOW()),
(8, 'O102', 'Ngoài trời', 2, 'AVAILABLE', 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=O102', 'Cạnh hồ cá', NOW());

-- ─── 2. SEED DANH MỤC (categories) ──────────────────────────────────────────
INSERT INTO categories (id, name, description, image_url, display_order, active, created_at) VALUES
(1, 'Cà phê truyền thống', 'Hương vị đậm đà từ hạt Robusta và Arabica Việt Nam sạch nguyên chất.', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600', 1, 1, NOW()),
(2, 'Trà Trái Cây & Trà Sữa', 'Sự kết hợp thanh mát giữa lá trà cao nguyên và các loại trái cây nhiệt đới.', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600', 2, 1, NOW()),
(3, 'Đá xay & Sinh tố', 'Giải nhiệt cực sảng khoái với kem béo ngậy và đá xay mát lạnh.', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600', 3, 1, NOW()),
(4, 'Bánh ngọt ăn kèm', 'Bánh nướng nóng hổi mỗi ngày giúp trải nghiệm thưởng thức trọn vẹn hơn.', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600', 4, 1, NOW());

-- ─── 3. SEED SẢN PHẨM (products) ─────────────────────────────────────────────
INSERT INTO products (id, name, description, price, cost_price, category_id, status, image_url, is_featured, display_order, created_at) VALUES
-- Cà phê (category_id = 1)
(1, 'Cà phê đen đá', 'Robusta rang mộc đậm đặc vị đắng tự nhiên pha phin.', 25000.00, 8000.00, 1, 'AVAILABLE', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600', 0, 1, NOW()),
(2, 'Cà phê sữa đá', 'Cà phê phin truyền thống hòa quyện cùng sữa đặc béo ngậy.', 29000.00, 10000.00, 1, 'AVAILABLE', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600', 1, 2, NOW()),
(3, 'Bạc xỉu nóng/đá', 'Cà phê pha nhạt nhiều sữa tươi dành cho người thích hương ngọt dịu.', 29000.00, 9500.00, 1, 'AVAILABLE', 'https://images.unsplash.com/photo-1570968915860-54d5c301fc9f?w=600', 0, 3, NOW()),
(4, 'Cappuccino thơm ngậy', 'Một shot espresso phủ bọt sữa mịn màng kèm bột cacao.', 45000.00, 18000.00, 1, 'AVAILABLE', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600', 1, 4, NOW()),
-- Trà (category_id = 2)
(5, 'Trà đào cam sả', 'Trà đen thanh mát kết hợp đào miếng ngâm ngọt giòn, sả thơm nồng và cam tươi.', 39000.00, 12000.00, 2, 'AVAILABLE', 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600', 1, 1, NOW()),
(6, 'Trà sen vàng', 'Trà oolong hòa quyện hạt sen dẻo thơm và kem mặn phô mai.', 45000.00, 15000.00, 2, 'AVAILABLE', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600', 0, 2, NOW()),
-- Đá xay & Sinh tố (category_id = 3)
(7, 'Matcha đá xay kem béo', 'Trà xanh Uji Nhật Bản xay đá nhuyễn mịn bọc lớp kem tươi ngọt thơm.', 49000.00, 20000.00, 3, 'AVAILABLE', 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600', 1, 1, NOW()),
(8, 'Sinh tố bơ sáp dừa', 'Bơ sáp Daklak xay nhuyễn dừa xiêm béo thơm.', 49000.00, 18000.00, 3, 'AVAILABLE', 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600', 0, 2, NOW()),
-- Bánh (category_id = 4)
(9, 'Bánh sừng bò Pháp', 'Bánh nướng giòn rụm thơm bơ hảo hạng ăn kèm mật ong.', 29000.00, 12000.00, 4, 'AVAILABLE', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600', 0, 1, NOW()),
(10, 'Bánh Tiramisu Ý', 'Cốt bánh cà phê đắng xen lẫn lớp kem phô mai mascarpone mềm mịn.', 39000.00, 15000.00, 4, 'AVAILABLE', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600', 1, 2, NOW());

-- ─── 4. SEED NHÀ CUNG CẤP (suppliers) ────────────────────────────────────────
INSERT INTO suppliers (id, name, contact_person, phone, email, address, tax_code, notes, active, created_at) VALUES
(1, 'Đại lý Cà phê Buôn Ma Thuột', 'Nguyễn Văn Hùng', '0912345678', 'hungbmt@gmail.com', '12 Lê Duẩn, TP. Buôn Ma Thuột', '0315487954', 'Nhà cung cấp hạt Robusta và Arabica chính', 1, NOW()),
(2, 'Nhà Phân Phối Sữa Phương Nam', 'Trần Thị Mai', '0987654321', 'maivinamilk@gmail.com', '78 Đại lộ Bình Dương, Bình Dương', '0300481254', 'Cung cấp sữa đặc Ngôi Sao và sữa tươi', 1, NOW()),
(3, 'Tổng kho nguyên liệu King Lợi', 'Lý Tiểu Long', '0909999888', 'contact@kingloi.vn', '145 Chợ Lớn, Quận 5, TP. HCM', '0311223344', 'Cung cấp đào hộp, bột matcha, siro', 1, NOW());

-- ─── 5. SEED NGUYÊN LIỆU KHO (ingredients) ───────────────────────────────────
-- Sữa tươi (id=3) cố ý để tồn kho hiện tại (4.000) nhỏ hơn mức tối thiểu (5.000) để kích hoạt cảnh báo tồn kho thấp trên dashboard
INSERT INTO ingredients (id, name, unit, current_stock, min_stock_level, max_stock_level, cost_per_unit, description, supplier_id, active, created_at) VALUES
(1, 'Hạt cà phê Robusta rang mộc', 'kg', 55.500, 10.000, 100.000, 120000.00, 'Robusta nguyên hạt mộc sạch rang vừa', 1, 1, NOW()),
(2, 'Sữa đặc Phương Nam', 'lon', 48.000, 12.000, 96.000, 22000.00, 'Sữa đặc Ngôi Sao Phương Nam xanh lá', 2, 1, NOW()),
(3, 'Sữa tươi không đường Vinamilk', 'hộp 1L', 4.000, 10.000, 40.000, 32000.00, 'Sữa tươi tiệt trùng Vinamilk', 2, 1, NOW()),
(4, 'Đào miếng Kronos đóng hộp', 'lon', 15.000, 5.000, 30.000, 45000.00, 'Đào Hy Lạp ngâm đường ngọt', 3, 1, NOW()),
(5, 'Bột Matcha trà xanh nguyên chất', 'kg', 3.500, 1.000, 10.000, 450000.00, 'Matcha nhập khẩu Nhật Bản', 3, 1, NOW());

-- ─── 6. SEED LỊCH SỬ GIAO DỊCH KHO (inventory_transactions) ──────────────────
INSERT INTO inventory_transactions (id, ingredient_id, type, quantity, unit_cost, total_cost, stock_before, stock_after, user_id, supplier_id, reference_code, notes, created_at) VALUES
(1, 1, 'IMPORT', 55.500, 120000.00, 6660000.00, 0.000, 55.500, (SELECT id FROM users LIMIT 1), 1, 'TRX-IMP001', 'Nhập kho lô cà phê đầu kỳ', NOW()),
(2, 2, 'IMPORT', 48.000, 22000.00, 1056000.00, 0.000, 48.000, (SELECT id FROM users LIMIT 1), 2, 'TRX-IMP002', 'Nhập kho sữa đặc đầu kỳ', NOW()),
(3, 3, 'IMPORT', 4.000, 32000.00, 128000.00, 0.000, 4.000, (SELECT id FROM users LIMIT 1), 2, 'TRX-IMP003', 'Nhập sữa tươi gấp, hàng bán chạy', NOW()),
(4, 4, 'IMPORT', 15.000, 45000.00, 675000.00, 0.000, 15.000, (SELECT id FROM users LIMIT 1), 3, 'TRX-IMP004', 'Nhập kho đào hộp pha chế trà đào', NOW());

-- ─── 7. SEED ĐƠN HÀNG (orders) ────────────────────────────────────────────────
-- Tạo các đơn hàng COMPLETED để làm dữ liệu thống kê biểu đồ trong 7 ngày gần đây.
-- Gồm: Ngày 9, 10, 11, 12, 13, 14 và hôm nay 15 tháng 7 năm 2026.
INSERT INTO orders (id, order_code, table_id, user_id, status, subtotal, discount_amount, total_amount, notes, created_at, updated_at) VALUES
-- Ngày 9/7/2026
(1, 'ORD-260709001', 1, (SELECT id FROM users LIMIT 1), 'COMPLETED', 54000.00, 0.00, 54000.00, 'Ít đá', '2026-07-09 09:15:00', '2026-07-09 09:30:00'),
(2, 'ORD-260709002', 3, (SELECT id FROM users LIMIT 1), 'COMPLETED', 142000.00, 10000.00, 132000.00, '', '2026-07-09 15:00:00', '2026-07-09 15:30:00'),
-- Ngày 10/7/2026
(3, 'ORD-260710001', 2, (SELECT id FROM users LIMIT 1), 'COMPLETED', 83000.00, 0.00, 83000.00, '', '2026-07-10 10:20:00', '2026-07-10 10:45:00'),
(4, 'ORD-260710002', 7, (SELECT id FROM users LIMIT 1), 'COMPLETED', 119000.00, 5000.00, 114000.00, 'Không lấy mật ong', '2026-07-10 20:00:00', '2026-07-10 20:30:00'),
-- Ngày 11/7/2026
(5, 'ORD-260711001', 1, (SELECT id FROM users LIMIT 1), 'COMPLETED', 50000.00, 0.00, 50000.00, '', '2026-07-11 08:00:00', '2026-07-11 08:20:00'),
(6, 'ORD-260711002', 5, (SELECT id FROM users LIMIT 1), 'COMPLETED', 123000.00, 10000.00, 113000.00, '', '2026-07-11 14:10:00', '2026-07-11 14:40:00'),
-- Ngày 12/7/2026
(7, 'ORD-260712001', 3, (SELECT id FROM users LIMIT 1), 'COMPLETED', 158000.00, 8000.00, 150000.00, 'Nhiều bọt sữa', '2026-07-12 11:30:00', '2026-07-12 12:15:00'),
(8, 'ORD-260712002', 8, (SELECT id FROM users LIMIT 1), 'COMPLETED', 98000.00, 0.00, 98000.00, '', '2026-07-12 16:45:00', '2026-07-12 17:05:00'),
-- Ngày 13/7/2026
(9, 'ORD-260713001', 4, (SELECT id FROM users LIMIT 1), 'COMPLETED', 113000.00, 5000.00, 108000.00, '', '2026-07-13 13:00:00', '2026-07-13 13:40:00'),
(10, 'ORD-260713002', 2, (SELECT id FROM users LIMIT 1), 'COMPLETED', 78000.00, 0.00, 78000.00, 'Không ngọt', '2026-07-13 19:30:00', '2026-07-13 19:50:00'),
-- Ngày 14/7/2026
(11, 'ORD-260714001', 1, (SELECT id FROM users LIMIT 1), 'COMPLETED', 73000.00, 0.00, 73000.00, '', '2026-07-14 09:00:00', '2026-07-14 09:20:00'),
(12, 'ORD-260714002', 6, (SELECT id FROM users LIMIT 1), 'COMPLETED', 137000.00, 12000.00, 125000.00, '', '2026-07-14 15:30:00', '2026-07-14 16:05:00'),
-- Ngày hôm nay 15/7/2026
(13, 'ORD-260715001', 3, (SELECT id FROM users LIMIT 1), 'COMPLETED', 89000.00, 0.00, 89000.00, '', '2026-07-15 08:30:00', '2026-07-15 08:45:00'),
(14, 'ORD-260715002', 5, (SELECT id FROM users LIMIT 1), 'COMPLETED', 176000.00, 16000.00, 160000.00, '', '2026-07-15 11:45:00', '2026-07-15 12:30:00');

-- ─── 8. SEED CHI TIẾT ĐƠN HÀNG (order_items) ──────────────────────────────────
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal) VALUES
-- Order 1: Đen đá (x1), Sữa đá (x1) = 25k + 29k = 54k
(1, 1, 1, 1, 25000.00, 25000.00),
(2, 1, 2, 1, 29000.00, 29000.00),
-- Order 2: Cappuccino (x2), Trà đào (x1), Bánh Tiramisu (x1) = 90k + 39k + 39k = 168k (Bớt 26k KM trước chiết khấu = 142k)
(3, 2, 4, 2, 45000.00, 90000.00),
(4, 2, 5, 1, 39000.00, 39000.00),
(5, 2, 10, 1, 39000.00, 39000.00),
-- Order 3: Trà sen vàng (x1), Matcha đá xay (x1) = 45k + 49k = 94k (bán lẻ km còn 83k)
(6, 3, 6, 1, 45000.00, 45000.00),
(7, 3, 7, 1, 49000.00, 49000.00),
-- Order 4: Trà đào (x2), Bánh sừng bò (x2) = 78k + 58k = 136k (bớt còn 119k)
(8, 4, 5, 2, 39000.00, 78000.00),
(9, 4, 9, 2, 29000.00, 58000.00),
-- Order 5: Đen đá (x2) = 50k
(10, 5, 1, 2, 25000.00, 50000.00),
-- Order 6: Matcha đá xay (x2), Bánh Tiramisu (x1) = 98k + 39k = 137k (bớt còn 123k)
(11, 6, 7, 2, 49000.00, 98000.00),
(12, 6, 10, 1, 39000.00, 39000.00),
-- Order 7: Cappuccino (x2), Bạc xỉu (x1), Trà sen vàng (x1) = 90k + 29k + 45k = 164k (bớt còn 158k)
(13, 7, 4, 2, 45000.00, 90000.00),
(14, 7, 3, 1, 29000.00, 29000.00),
(15, 7, 6, 1, 45000.00, 45000.00),
-- Order 8: Trà đào (x1), Sinh tố bơ (x1), Bánh sừng bò (x1) = 39k + 49k + 29k = 117k (bớt còn 98k)
(16, 8, 5, 1, 39000.00, 39000.00),
(17, 8, 8, 1, 49000.00, 49000.00),
(18, 8, 9, 1, 29000.00, 29000.00),
-- Order 9: Trà đào (x2), Matcha đá xay (x1) = 78k + 49k = 127k (bớt còn 113k)
(19, 9, 5, 2, 39000.00, 78000.00),
(20, 9, 7, 1, 49000.00, 49000.00),
-- Order 10: Sữa đá (x1), Matcha đá xay (x1) = 29k + 49k = 78k
(21, 10, 2, 1, 29000.00, 29000.00),
(22, 10, 7, 1, 49000.00, 49000.00),
-- Order 11: Đen đá (x1), Sinh tố bơ (x1) = 25k + 49k = 74k (bớt còn 73k)
(23, 11, 1, 1, 25000.00, 25000.00),
(24, 11, 8, 1, 49000.00, 49000.00),
-- Order 12: Cappuccino (x2), Bánh Tiramisu (x2) = 90k + 78k = 168k (bớt còn 137k)
(25, 12, 4, 2, 45000.00, 90000.00),
(26, 12, 10, 2, 39000.00, 78000.00),
-- Order 13: Bạc xỉu (x2), Bánh sừng bò (x1) = 58k + 29k = 87k (lên đơn 89k)
(27, 13, 3, 2, 29000.00, 58000.00),
(28, 13, 9, 1, 29000.00, 29000.00),
-- Order 14: Sinh tố bơ (x2), Trà sen vàng (x2) = 98k + 90k = 188k (bớt còn 176k)
(29, 14, 8, 2, 49000.00, 98000.00),
(30, 14, 6, 2, 45000.00, 90000.00);

-- ─── 9. SEED THANH TOÁN HOÁ ĐƠN (payments) ───────────────────────────────────
INSERT INTO payments (id, payment_code, order_id, cashier_id, method, status, amount, amount_received, change_amount, paid_at, created_at) VALUES
(1, 'PAY-260709001', 1, (SELECT id FROM users LIMIT 1), 'CASH', 'PAID', 54000.00, 100000.00, 46000.00, '2026-07-09 09:30:00', '2026-07-09 09:30:00'),
(2, 'PAY-260709002', 2, (SELECT id FROM users LIMIT 1), 'BANK_TRANSFER', 'PAID', 132000.00, 132000.00, 0.00, '2026-07-09 15:30:00', '2026-07-09 15:30:00'),
(3, 'PAY-260710001', 3, (SELECT id FROM users LIMIT 1), 'CASH', 'PAID', 83000.00, 100000.00, 17000.00, '2026-07-10 10:45:00', '2026-07-10 10:45:00'),
(4, 'PAY-260710002', 4, (SELECT id FROM users LIMIT 1), 'BANK_TRANSFER', 'PAID', 114000.00, 114000.00, 0.00, '2026-07-10 20:30:00', '2026-07-10 20:30:00'),
(5, 'PAY-260711001', 5, (SELECT id FROM users LIMIT 1), 'CASH', 'PAID', 50000.00, 50000.00, 0.00, '2026-07-11 08:20:00', '2026-07-11 08:20:00'),
(6, 'PAY-260711002', 6, (SELECT id FROM users LIMIT 1), 'BANK_TRANSFER', 'PAID', 113000.00, 113000.00, 0.00, '2026-07-11 14:40:00', '2026-07-11 14:40:00'),
(7, 'PAY-260712001', 7, (SELECT id FROM users LIMIT 1), 'BANK_TRANSFER', 'PAID', 150000.00, 150000.00, 0.00, '2026-07-12 12:15:00', '2026-07-12 12:15:00'),
(8, 'PAY-260712002', 8, (SELECT id FROM users LIMIT 1), 'CASH', 'PAID', 98000.00, 100000.00, 2000.00, '2026-07-12 17:05:00', '2026-07-12 17:05:00'),
(9, 'PAY-260713001', 9, (SELECT id FROM users LIMIT 1), 'BANK_TRANSFER', 'PAID', 108000.00, 108000.00, 0.00, '2026-07-13 13:40:00', '2026-07-13 13:40:00'),
(10, 'PAY-260713002', 10, (SELECT id FROM users LIMIT 1), 'CASH', 'PAID', 78000.00, 100000.00, 22000.00, '2026-07-13 19:50:00', '2026-07-13 19:50:00'),
(11, 'PAY-260714001', 11, (SELECT id FROM users LIMIT 1), 'CASH', 'PAID', 73000.00, 100000.00, 27000.00, '2026-07-14 09:20:00', '2026-07-14 09:20:00'),
(12, 'PAY-260714002', 12, (SELECT id FROM users LIMIT 1), 'BANK_TRANSFER', 'PAID', 125000.00, 125000.00, 0.00, '2026-07-14 16:05:00', '2026-07-14 16:05:00'),
(13, 'PAY-260715001', 13, (SELECT id FROM users LIMIT 1), 'CASH', 'PAID', 89000.00, 90000.00, 1000.00, '2026-07-15 08:45:00', '2026-07-15 08:45:00'),
(14, 'PAY-260715002', 14, (SELECT id FROM users LIMIT 1), 'BANK_TRANSFER', 'PAID', 160000.00, 160000.00, 0.00, '2026-07-15 12:30:00', '2026-07-15 12:30:00');
