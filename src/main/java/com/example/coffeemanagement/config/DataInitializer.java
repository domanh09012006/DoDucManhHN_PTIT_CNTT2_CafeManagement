package com.example.coffeemanagement.config;

import com.example.coffeemanagement.entity.*;
import com.example.coffeemanagement.enums.*;
import com.example.coffeemanagement.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final IngredientRepository ingredientRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final TableRepository tableRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        log.info("Starting database seeding process...");
        initUsers();
        initCategoriesAndProducts();
        initSuppliersAndIngredients();
        initTables();
        initOrdersAndPayments();
        initReservations();
        log.info("Database seeding process finished successfully!");
    }

    private void initUsers() {
        // Migrate STAFF to CUSTOMER role native updates first
        try {
            userRepository.migrateStaffToCustomer();
        } catch (Exception e) {
            log.warn("STAFF to CUSTOMER migration skipped: {}", e.getMessage());
        }

        // Default Admin (if not exists)
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("Admin@123"))
                    .fullName("System Administrator")
                    .email("admin@coffeemanagement.com")
                    .phone("0900000000")
                    .role(Role.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(admin);
            log.info("✅ Seeded Admin user: admin/Admin@123");
        }

        // Manager
        if (!userRepository.existsByUsername("manager1")) {
            User manager = User.builder()
                    .username("manager1")
                    .password(passwordEncoder.encode("Manager@123"))
                    .fullName("Cafe Manager")
                    .email("manager@coffeemanagement.com")
                    .phone("0911111111")
                    .role(Role.MANAGER)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(manager);
            log.info("✅ Seeded Manager user: manager1/Manager@123");
        }

        // Customer
        if (!userRepository.existsByUsername("customer1")) {
            User customer = User.builder()
                    .username("customer1")
                    .password(passwordEncoder.encode("Customer@123"))
                    .fullName("Loyalty Customer")
                    .email("customer@coffeemanagement.com")
                    .phone("0922222222")
                    .role(Role.CUSTOMER)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(customer);
            log.info("✅ Seeded Customer user: customer1/Customer@123");
        }

        // Cashier
        if (!userRepository.existsByUsername("cashier1")) {
            User cashier = User.builder()
                    .username("cashier1")
                    .password(passwordEncoder.encode("Cashier@123"))
                    .fullName("Cashier Desk")
                    .email("cashier@coffeemanagement.com")
                    .phone("0933333333")
                    .role(Role.CASHIER)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(cashier);
            log.info("✅ Seeded Cashier user: cashier1/Cashier@123");
        }
    }

    private void initCategoriesAndProducts() {
        if (categoryRepository.count() > 0) {
            log.info("Categories and products already initialized. Skipping.");
            return;
        }

        Category c1 = Category.builder().name("Cà phê máy").description("Espresso, Cappuccino, Latte, Latte Art").active(true).build();
        Category c2 = Category.builder().name("Cà phê truyền thống").description("Cà phê sữa đá, bạc xỉu, đen đá").active(true).build();
        Category c3 = Category.builder().name("Trà & Nước ép").description("Trà đào cam sả, nước ép tươi").active(true).build();
        Category c4 = Category.builder().name("Bánh ngọt").description("Bánh ngọt ăn kèm thức uống").active(true).build();

        categoryRepository.saveAll(List.of(c1, c2, c3, c4));
        log.info("✅ Seeded 4 categories.");

        // Products for Cà phê máy
        Product p1 = Product.builder().name("Espresso").description("Cà phê Espresso chuẩn Ý nguyên chất").price(BigDecimal.valueOf(35000)).costPrice(BigDecimal.valueOf(8000)).category(c1).status(ProductStatus.AVAILABLE).featured(true).displayOrder(1).build();
        Product p2 = Product.builder().name("Cappuccino").description("Espresso phối hợp bọt sữa nóng dày mịn").price(BigDecimal.valueOf(45000)).costPrice(BigDecimal.valueOf(12000)).category(c1).status(ProductStatus.AVAILABLE).featured(true).displayOrder(2).build();
        Product p3 = Product.builder().name("Latte").description("Espresso kết hợp sữa nóng vẽ hình nghệ thuật").price(BigDecimal.valueOf(45000)).costPrice(BigDecimal.valueOf(12000)).category(c1).status(ProductStatus.AVAILABLE).featured(false).displayOrder(3).build();

        // Products for Cà phê truyền thống
        Product p4 = Product.builder().name("Cà phê sữa đá").description("Cà phê đen pha phin truyền thống thơm ngọt sữa đặc và đá").price(BigDecimal.valueOf(29000)).costPrice(BigDecimal.valueOf(6000)).category(c2).status(ProductStatus.AVAILABLE).featured(true).displayOrder(1).build();
        Product p5 = Product.builder().name("Bạc xỉu").description("Sữa đặc nóng pha sữa tươi kèm chút cà phê Việt đậm đà").price(BigDecimal.valueOf(32000)).costPrice(BigDecimal.valueOf(7000)).category(c2).status(ProductStatus.AVAILABLE).featured(false).displayOrder(2).build();
        Product p6 = Product.builder().name("Cà phê đen đá").description("Cà phê phin đen truyền thống đậm vị và đá viên").price(BigDecimal.valueOf(25000)).costPrice(BigDecimal.valueOf(4000)).category(c2).status(ProductStatus.AVAILABLE).featured(false).displayOrder(3).build();

        // Products for Trà & Nước ép
        Product p7 = Product.builder().name("Trà đào cam sả").description("Trà đào thảo mộc cam tươi vắt kết hợp vị sả ấm nồng").price(BigDecimal.valueOf(39000)).costPrice(BigDecimal.valueOf(10000)).category(c3).status(ProductStatus.AVAILABLE).featured(true).displayOrder(1).build();
        Product p8 = Product.builder().name("Nước cam vắt").description("Cam sành nguyên chất vắt tươi mọng nước").price(BigDecimal.valueOf(35000)).costPrice(BigDecimal.valueOf(12000)).category(c3).status(ProductStatus.AVAILABLE).featured(false).displayOrder(2).build();

        // Products for Bánh ngọt
        Product p9 = Product.builder().name("Bánh sừng bò").description("Croissant nướng bơ thơm lừng kiểu Pháp").price(BigDecimal.valueOf(25000)).costPrice(BigDecimal.valueOf(10000)).category(c4).status(ProductStatus.AVAILABLE).featured(false).displayOrder(1).build();
        Product p10 = Product.builder().name("Tiramisu").description("Bánh kem cà phê truyền thống ngọt dịu của Ý").price(BigDecimal.valueOf(39000)).costPrice(BigDecimal.valueOf(15000)).category(c4).status(ProductStatus.AVAILABLE).featured(true).displayOrder(2).build();

        productRepository.saveAll(List.of(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10));
        log.info("✅ Seeded 10 products.");
    }

    private void initSuppliersAndIngredients() {
        if (supplierRepository.count() > 0) {
            log.info("Suppliers and ingredients already initialized. Skipping.");
            return;
        }

        Supplier s1 = Supplier.builder().name("Nhà cung cấp cà phê Trung Nguyên").contactPerson("Nguyễn Văn Đạt").phone("0901234567").email("trungnguyen@gmail.com").address("Buôn Ma Thuột, Đắk Lắk").active(true).build();
        Supplier s2 = Supplier.builder().name("Vinamilk Việt Nam").contactPerson("Trần Thị Lan").phone("0918765432").email("sales@vinamilk.com").address("Quận 7, TP. Hồ Chí Minh").active(true).build();
        Supplier s3 = Supplier.builder().name("Đá Sạch Hải Âu").contactPerson("Phan Văn Minh").phone("0934567890").email("contact@haiau.com").address("Hoàng Mai, Hà Nội").active(true).build();

        supplierRepository.saveAll(List.of(s1, s2, s3));
        log.info("✅ Seeded 3 suppliers.");

        Ingredient i1 = Ingredient.builder().name("Hạt cà phê Robusta").unit("kg").currentStock(BigDecimal.valueOf(50.0)).minStockLevel(BigDecimal.valueOf(10.0)).costPerUnit(BigDecimal.valueOf(150000)).supplier(s1).active(true).build();
        Ingredient i2 = Ingredient.builder().name("Hạt cà phê Arabica").unit("kg").currentStock(BigDecimal.valueOf(30.0)).minStockLevel(BigDecimal.valueOf(5.0)).costPerUnit(BigDecimal.valueOf(250000)).supplier(s1).active(true).build();
        Ingredient i3 = Ingredient.builder().name("Sữa đặc Ông Thọ").unit("lon").currentStock(BigDecimal.valueOf(40.0)).minStockLevel(BigDecimal.valueOf(8.0)).costPerUnit(BigDecimal.valueOf(22000)).supplier(s2).active(true).build();
        Ingredient i4 = Ingredient.builder().name("Sữa tươi không đường").unit("hộp").currentStock(BigDecimal.valueOf(2.0)).minStockLevel(BigDecimal.valueOf(10.0)).costPerUnit(BigDecimal.valueOf(30000)).supplier(s2).active(true).build();
        Ingredient i5 = Ingredient.builder().name("Đường cát trắng").unit("kg").currentStock(BigDecimal.valueOf(15.0)).minStockLevel(BigDecimal.valueOf(5.0)).costPerUnit(BigDecimal.valueOf(20000)).supplier(s3).active(true).build();

        ingredientRepository.saveAll(List.of(i1, i2, i3, i4, i5));
        log.info("✅ Seeded 5 ingredients (with low-stock item).");

        // Seed initial IMPORT transactions for inventory log
        User admin = userRepository.findByUsername("admin").orElse(null);

        List<InventoryTransaction> transactions = List.of(
                InventoryTransaction.builder().ingredient(i1).type(TransactionType.IMPORT).quantity(BigDecimal.valueOf(50.0)).unitCost(BigDecimal.valueOf(150000)).totalCost(BigDecimal.valueOf(7500000)).stockBefore(BigDecimal.ZERO).stockAfter(BigDecimal.valueOf(50.0)).performedBy(admin).supplier(s1).referenceCode("TX-INIT-001").notes("Nhập kho ban đầu").build(),
                InventoryTransaction.builder().ingredient(i2).type(TransactionType.IMPORT).quantity(BigDecimal.valueOf(30.0)).unitCost(BigDecimal.valueOf(250000)).totalCost(BigDecimal.valueOf(7500000)).stockBefore(BigDecimal.ZERO).stockAfter(BigDecimal.valueOf(30.0)).performedBy(admin).supplier(s1).referenceCode("TX-INIT-002").notes("Nhập kho ban đầu").build(),
                InventoryTransaction.builder().ingredient(i3).type(TransactionType.IMPORT).quantity(BigDecimal.valueOf(40.0)).unitCost(BigDecimal.valueOf(22000)).totalCost(BigDecimal.valueOf(880000)).stockBefore(BigDecimal.ZERO).stockAfter(BigDecimal.valueOf(40.0)).performedBy(admin).supplier(s2).referenceCode("TX-INIT-003").notes("Nhập kho ban đầu").build(),
                InventoryTransaction.builder().ingredient(i4).type(TransactionType.IMPORT).quantity(BigDecimal.valueOf(20.0)).unitCost(BigDecimal.valueOf(30000)).totalCost(BigDecimal.valueOf(600000)).stockBefore(BigDecimal.ZERO).stockAfter(BigDecimal.valueOf(20.0)).performedBy(admin).supplier(s2).referenceCode("TX-INIT-004").notes("Nhập kho ban đầu").build(),
                InventoryTransaction.builder().ingredient(i5).type(TransactionType.IMPORT).quantity(BigDecimal.valueOf(15.0)).unitCost(BigDecimal.valueOf(20000)).totalCost(BigDecimal.valueOf(300000)).stockBefore(BigDecimal.ZERO).stockAfter(BigDecimal.valueOf(15.0)).performedBy(admin).supplier(s3).referenceCode("TX-INIT-005").notes("Nhập kho ban đầu").build()
        );

        inventoryTransactionRepository.saveAll(transactions);
        log.info("✅ Seeded initial inventory import transactions.");
    }

    private void initTables() {
        if (tableRepository.count() > 0) {
            log.info("Tables already initialized. Skipping.");
            return;
        }

        CafeTable t1 = CafeTable.builder().tableNumber("101").area("Tầng 1").capacity(2).status(TableStatus.AVAILABLE).notes("Bàn nhỏ cạnh cửa sổ").build();
        CafeTable t2 = CafeTable.builder().tableNumber("102").area("Tầng 1").capacity(4).status(TableStatus.AVAILABLE).notes("Bàn tiêu chuẩn").build();
        CafeTable t3 = CafeTable.builder().tableNumber("103").area("Tầng 1").capacity(4).status(TableStatus.AVAILABLE).notes("Bàn tiêu chuẩn").build();
        CafeTable t4 = CafeTable.builder().tableNumber("104").area("Tầng 1").capacity(6).status(TableStatus.AVAILABLE).notes("Bàn lớn gia đình").build();
        CafeTable t5 = CafeTable.builder().tableNumber("201").area("Tầng 2").capacity(4).status(TableStatus.AVAILABLE).notes("Bàn có ổ cắm laptop").build();
        CafeTable t6 = CafeTable.builder().tableNumber("202").area("Tầng 2").capacity(8).status(TableStatus.AVAILABLE).notes("Bàn họp nhóm lớn").build();
        CafeTable t7 = CafeTable.builder().tableNumber("301").area("Ngoài trời").capacity(2).status(TableStatus.AVAILABLE).notes("Bàn ban công view phố").build();
        CafeTable t8 = CafeTable.builder().tableNumber("302").area("Ngoài trời").capacity(4).status(TableStatus.AVAILABLE).notes("Bàn ngoài sân vườn").build();

        tableRepository.saveAll(List.of(t1, t2, t3, t4, t5, t6, t7, t8));
        log.info("✅ Seeded 8 tables.");
    }

    private void initOrdersAndPayments() {
        if (orderRepository.count() > 0) {
            log.info("Orders and payments already initialized. Skipping.");
            return;
        }

        User customer = userRepository.findByUsername("customer1").orElse(null);
        User cashier = userRepository.findByUsername("cashier1").orElse(null);
        User admin = userRepository.findByUsername("admin").orElse(null);
        List<CafeTable> tables = tableRepository.findAll();
        List<Product> products = productRepository.findAll();

        if (customer == null || cashier == null || admin == null || tables.isEmpty() || products.isEmpty()) {
            log.warn("Missing references to seed orders. Skipping.");
            return;
        }

        Random random = new Random();
        DateTimeFormatter codeFormatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        int totalDays = 7;

        log.info("Generating completed orders and payments for the last 7 days...");

        for (int i = 0; i < totalDays; i++) {
            LocalDateTime dayBaseTime = LocalDateTime.now().minusDays(i).withHour(8).withMinute(0).withSecond(0);
            int ordersTodayCount = 4 + random.nextInt(5); // 4 to 8 orders per day

            for (int j = 0; j < ordersTodayCount; j++) {
                LocalDateTime orderTime = dayBaseTime.plusHours(random.nextInt(12)).plusMinutes(random.nextInt(60));
                CafeTable table = tables.get(random.nextInt(tables.size()));

                boolean isOnline = random.nextBoolean();
                OrderSource source = isOnline ? OrderSource.ONLINE : OrderSource.POS;
                User creator = isOnline ? customer : cashier;
                OrderStatus orderStatus = isOnline && random.nextBoolean() ? OrderStatus.PENDING : OrderStatus.COMPLETED;

                String orderCode = "ORD-" + orderTime.format(codeFormatter) + "-" + String.format("%04d", random.nextInt(10000));
                Order order = Order.builder()
                        .orderCode(orderCode)
                        .table(isOnline ? null : table)
                        .user(creator)
                        .status(orderStatus)
                        .orderSource(source)
                        .notes(random.nextBoolean() ? "Khách yêu cầu nhiều đá" : "Không đường")
                        .createdAt(orderTime)
                        .updatedAt(orderTime)
                        .build();

                // Select 1 to 3 random items
                int numItems = 1 + random.nextInt(3);
                BigDecimal subtotal = BigDecimal.ZERO;
                List<OrderItem> items = new ArrayList<>();

                for (int k = 0; k < numItems; k++) {
                    Product product = products.get(random.nextInt(products.size()));
                    int quantity = 1 + random.nextInt(2);
                    BigDecimal price = product.getPrice();
                    BigDecimal itemSubtotal = price.multiply(BigDecimal.valueOf(quantity));

                    OrderItem item = OrderItem.builder()
                            .order(order)
                            .product(product)
                            .quantity(quantity)
                            .unitPrice(price)
                            .subtotal(itemSubtotal)
                            .build();

                    items.add(item);
                    subtotal = subtotal.add(itemSubtotal);
                }

                order.setOrderItems(items);
                order.setSubtotal(subtotal);

                BigDecimal discount = BigDecimal.ZERO;
                if (random.nextBoolean()) {
                    discount = subtotal.multiply(BigDecimal.valueOf(0.05)).setScale(0, BigDecimal.ROUND_HALF_UP);
                }
                order.setDiscountAmount(discount);
                order.setTotalAmount(subtotal.subtract(discount));

                orderRepository.save(order);
                orderRepository.updateOrderTimestamps(order.getId(), orderTime);

                if (orderStatus == OrderStatus.COMPLETED) {
                    // Create Payment
                    String paymentCode = "PAY-" + orderTime.format(codeFormatter) + "-" + String.format("%04d", random.nextInt(10000));
                    PaymentMethod method = PaymentMethod.values()[random.nextInt(PaymentMethod.values().length)];

                    BigDecimal amount = order.getTotalAmount();
                    BigDecimal amountReceived = amount;
                    BigDecimal change = BigDecimal.ZERO;

                    if (method == PaymentMethod.CASH) {
                        int intAmount = amount.intValue();
                        int roundUp = ((intAmount + 9999) / 10000) * 10000;
                        amountReceived = BigDecimal.valueOf(roundUp);
                        change = amountReceived.subtract(amount);
                    }

                    Payment payment = Payment.builder()
                            .paymentCode(paymentCode)
                            .order(order)
                            .cashier(cashier)
                            .method(method)
                            .status(PaymentStatus.PAID)
                            .amount(amount)
                            .amountReceived(amountReceived)
                            .changeAmount(change)
                            .paidAt(orderTime)
                            .createdAt(orderTime)
                            .updatedAt(orderTime)
                            .notes("Đã thanh toán hóa đơn")
                            .build();

                    paymentRepository.save(payment);
                    paymentRepository.updatePaymentTimestamps(payment.getId(), orderTime);
                }
            }
        }
        log.info("✅ Successfully generated completed orders and payments for the last 7 days.");
    }

    private void initReservations() {
        if (reservationRepository.count() > 0) {
            log.info("Reservations already initialized. Skipping.");
            return;
        }

        User customer = userRepository.findByUsername("customer1").orElse(null);
        List<CafeTable> tables = tableRepository.findAll();

        if (customer == null || tables.isEmpty()) {
            log.warn("Missing customer or tables to seed reservations.");
            return;
        }

        LocalDateTime tomorrow = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0);
        LocalDateTime nextWeek = LocalDateTime.now().plusDays(5).withHour(19).withMinute(0);
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1).withHour(15).withMinute(0);

        Reservation r1 = Reservation.builder()
                .customer(customer)
                .table(tables.get(0))
                .reservationTime(tomorrow)
                .numberOfGuests(2)
                .status(ReservationStatus.PENDING)
                .contactName(customer.getFullName())
                .contactPhone(customer.getPhone())
                .notes("Hẹn ăn trưa cùng bạn")
                .build();

        Reservation r2 = Reservation.builder()
                .customer(customer)
                .table(tables.get(4))
                .reservationTime(nextWeek)
                .numberOfGuests(4)
                .status(ReservationStatus.CONFIRMED)
                .contactName(customer.getFullName())
                .contactPhone(customer.getPhone())
                .notes("Đặt tiệc sinh nhật nhỏ")
                .build();

        Reservation r3 = Reservation.builder()
                .customer(customer)
                .table(tables.get(2))
                .reservationTime(yesterday)
                .numberOfGuests(3)
                .status(ReservationStatus.COMPLETED)
                .contactName(customer.getFullName())
                .contactPhone(customer.getPhone())
                .notes("Đã ghé quán hôm qua")
                .build();

        reservationRepository.saveAll(List.of(r1, r2, r3));
        log.info("✅ Seeded 3 reservations.");
    }
}
