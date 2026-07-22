// ─── Common Types ─────────────────────────────────────────────────────────────

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface CategoryResponse {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  productCount: number;
  createdAt: string;
}

export interface CategoryRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  active?: boolean;
}

// ─── Product ──────────────────────────────────────────────────────────────────

export type ProductStatus = 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED';

export interface ProductResponse {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  status: ProductStatus;
  categoryId?: number;
  categoryName?: string;
  featured?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  status?: ProductStatus;
  categoryId?: number;
}

// ─── Table ────────────────────────────────────────────────────────────────────

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'OUT_OF_SERVICE';

export interface TableResponse {
  id: number;
  tableNumber: string;
  capacity: number;
  area?: string;
  status: TableStatus;
  notes?: string;
}

export interface BookingSearchResponse {
  availableTables: TableResponse[];
  suggestedSlots: {
    time: string;
    availableCount: number;
  }[];
}

export interface TableRequest {
  tableNumber: string;
  capacity: number;
  area?: string;
  status?: TableStatus;
  notes?: string;
}

// ─── Order ────────────────────────────────────────────────────────────────────

export type OrderSource = 'POS' | 'ONLINE';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

export interface OrderResponse {
  id: number;
  orderCode: string;
  tableId?: number;
  tableNumber?: string;
  userId?: number;
  staffName?: string;
  status: OrderStatus;
  orderSource: OrderSource;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
  notes?: string;
}

export interface OrderRequest {
  tableId?: number;
  items: OrderItemRequest[];
  discountAmount?: number;
  notes?: string;
  orderSource?: OrderSource;
}

// ─── Reservation ──────────────────────────────────────────────────────────────

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';

export interface ReservationRequest {
  tableId?: number;
  reservationTime: string;
  numberOfGuests: number;
  contactName: string;
  contactPhone: string;
  notes?: string;
}

export interface ReservationResponse {
  id: number;
  tableId?: number;
  tableNumber?: string;
  customerId?: number;
  customerName?: string;
  reservationTime: string;
  numberOfGuests: number;
  status: ReservationStatus;
  contactName: string;
  contactPhone: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'E_WALLET';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';

export interface PaymentResponse {
  id: number;
  paymentCode: string;
  orderId: number;
  orderCode: string;
  cashierId?: number;
  cashierName?: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  amountReceived: number;
  changeAmount: number;
  transactionRef?: string;
  notes?: string;
  paidAt?: string;
  createdAt: string;
}

export interface PaymentRequest {
  orderId: number;
  method: PaymentMethod;
  amountReceived: number;
  transactionRef?: string;
  notes?: string;
}

// ─── Supplier ─────────────────────────────────────────────────────────────────

export interface SupplierResponse {
  id: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  active: boolean;
  createdAt: string;
}

export interface SupplierRequest {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  active?: boolean;
}

// ─── Ingredient / Inventory ───────────────────────────────────────────────────

export interface IngredientResponse {
  id: number;
  name: string;
  unit: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel?: number;
  costPerUnit?: number;
  description?: string;
  active: boolean;
  lowStock: boolean;
  supplierId?: number;
  supplierName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IngredientRequest {
  name: string;
  unit: string;
  minStockLevel?: number;
  maxStockLevel?: number;
  costPerUnit?: number;
  description?: string;
  supplierId?: number;
}

export type TransactionType = 'IMPORT' | 'EXPORT' | 'ADJUSTMENT' | 'RETURN';

export interface InventoryTransactionResponse {
  id: number;
  ingredientId: number;
  ingredientName: string;
  unit: string;
  type: TransactionType;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  stockBefore: number;
  stockAfter: number;
  performedById?: number;
  performedByName?: string;
  supplierId?: number;
  supplierName?: string;
  referenceCode?: string;
  notes?: string;
  createdAt: string;
}

export interface InventoryTransactionRequest {
  ingredientId: number;
  type: TransactionType;
  quantity: number;
  unitCost?: number;
  supplierId?: number;
  referenceCode?: string;
  notes?: string;
}

// ─── Shift ────────────────────────────────────────────────────────────────────

export interface ShiftResponse {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ShiftRequest {
  name: string;
  startTime: string;
  endTime: string;
  description?: string;
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EARLY_LEAVE' | 'HALF_DAY';

export interface AttendanceResponse {
  id: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  shiftId: number;
  shiftName: string;
  workDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: AttendanceStatus;
  overtimeHours: number;
  notes?: string;
  recordedById?: number;
  recordedByName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AttendanceRequest {
  employeeId: number;
  shiftId: number;
  workDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  status?: AttendanceStatus;
  overtimeHours?: number;
  notes?: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface RevenueReportResponse {
  date: string;
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
}

export interface DashboardResponse {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  revenueGrowthPercent: number;
  todayOrderCount: number;
  todayPosOrderCount: number;
  todayOnlineOrderCount: number;
  todayReservationCount: number;
  pendingOrderCount: number;
  completedOrderCount: number;
  totalTables: number;
  availableTables: number;
  occupiedTables: number;
  totalEmployees: number;
  activeEmployees: number;
  lowStockIngredientCount: number;
  topProducts: TopProductResponse[];
  recentRevenue: RevenueReportResponse[];
}

export interface TopProductResponse {
  productId: number;
  productName: string;
  quantitySold: number;
  revenue: number;
}
