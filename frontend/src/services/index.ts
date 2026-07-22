import axiosInstance from '../api/axiosInstance';
import type { ApiResponse, UserResponse, UserRequest } from '../types/auth.types';
import type {
  CategoryResponse, CategoryRequest,
  ProductResponse, ProductRequest,
  TableResponse, TableRequest,
  OrderResponse, OrderRequest,
  PaymentResponse, PaymentRequest,
  SupplierResponse, SupplierRequest,
  IngredientResponse, IngredientRequest,
  InventoryTransactionResponse, InventoryTransactionRequest,
  DashboardResponse, RevenueReportResponse,
  PageResponse,
  TableStatus, OrderStatus, PaymentStatus, TransactionType,
  ReservationRequest, ReservationResponse, ReservationStatus,
  BookingSearchResponse,
} from '../types';



// ─── Category Service ─────────────────────────────────────────────────────────

export const CategoryService = {
  getAll: (params?: { keyword?: string; active?: boolean }) => {
    if (params?.active) {
      return axiosInstance.get<ApiResponse<CategoryResponse[]>>('/api/categories/active').then(r => r.data);
    }
    return axiosInstance.get<ApiResponse<CategoryResponse[]>>('/api/categories', { params }).then(r => r.data);
  },
  
  getById: (id: number) =>
    axiosInstance.get<ApiResponse<CategoryResponse>>(`/api/categories/${id}`).then(r => r.data),
  
  create: (data: CategoryRequest) =>
    axiosInstance.post<ApiResponse<CategoryResponse>>('/api/categories', data).then(r => r.data),
  
  update: (id: number, data: CategoryRequest) =>
    axiosInstance.put<ApiResponse<CategoryResponse>>(`/api/categories/${id}`, data).then(r => r.data),
  
  toggleActive: (id: number) =>
    axiosInstance.patch<ApiResponse<void>>(`/api/categories/${id}/toggle-active`).then(r => r.data),
  
  delete: (id: number) =>
    axiosInstance.delete<ApiResponse<void>>(`/api/categories/${id}`).then(r => r.data),
};

// ─── Product Service ──────────────────────────────────────────────────────────

export const ProductService = {
  getAll: (params?: { keyword?: string; categoryId?: number; status?: string; page?: number; size?: number }) =>
    axiosInstance.get<ApiResponse<PageResponse<ProductResponse>>>('/api/products', { params }).then(r => r.data),
  
  getById: (id: number) =>
    axiosInstance.get<ApiResponse<ProductResponse>>(`/api/products/${id}`).then(r => r.data),
  
  getByCategory: (categoryId: number) =>
    axiosInstance.get<ApiResponse<ProductResponse[]>>(`/api/products/category/${categoryId}`).then(r => r.data),
  
  getAvailable: () =>
    axiosInstance.get<ApiResponse<ProductResponse[]>>('/api/products/available').then(r => r.data),
  
  getFeatured: () =>
    axiosInstance.get<ApiResponse<ProductResponse[]>>('/api/products/featured').then(r => r.data),
  
  create: (data: ProductRequest) =>
    axiosInstance.post<ApiResponse<ProductResponse>>('/api/products', data).then(r => r.data),
  
  update: (id: number, data: ProductRequest) =>
    axiosInstance.put<ApiResponse<ProductResponse>>(`/api/products/${id}`, data).then(r => r.data),
  
  updateStatus: (id: number, status: string) =>
    axiosInstance.patch<ApiResponse<void>>(`/api/products/${id}/status`, null, { params: { status } }).then(r => r.data),
  
  delete: (id: number) =>
    axiosInstance.delete<ApiResponse<void>>(`/api/products/${id}`).then(r => r.data),
};

// ─── Table Service ────────────────────────────────────────────────────────────

export const TableService = {
  getAll: () =>
    axiosInstance.get<ApiResponse<TableResponse[]>>('/api/tables').then(r => r.data),
  
  getById: (id: number) =>
    axiosInstance.get<ApiResponse<TableResponse>>(`/api/tables/${id}`).then(r => r.data),
  
  getByStatus: (status: TableStatus) =>
    axiosInstance.get<ApiResponse<TableResponse[]>>(`/api/tables/status/${status}`).then(r => r.data),
  
  getByArea: (area: string) =>
    axiosInstance.get<ApiResponse<TableResponse[]>>(`/api/tables/area/${area}`).then(r => r.data),
  
  create: (data: TableRequest) =>
    axiosInstance.post<ApiResponse<TableResponse>>('/api/tables', data).then(r => r.data),
  
  update: (id: number, data: TableRequest) =>
    axiosInstance.put<ApiResponse<TableResponse>>(`/api/tables/${id}`, data).then(r => r.data),
  
  updateStatus: (id: number, status: TableStatus) =>
    axiosInstance.patch<ApiResponse<void>>(`/api/tables/${id}/status`, null, { params: { status } }).then(r => r.data),
  
  delete: (id: number) =>
    axiosInstance.delete<ApiResponse<void>>(`/api/tables/${id}`).then(r => r.data),

  searchAvailable: (reservationTime: string, numberOfGuests: number) =>
    axiosInstance.get<ApiResponse<BookingSearchResponse>>('/api/tables/booking-search', { params: { reservationTime, numberOfGuests } }).then(r => r.data),
};

// ─── Order Service ────────────────────────────────────────────────────────────

export const OrderService = {
  getAll: (params?: { status?: OrderStatus; tableId?: number; from?: string; to?: string; page?: number; size?: number }) =>
    axiosInstance.get<ApiResponse<PageResponse<OrderResponse>>>('/api/orders', { params }).then(r => r.data),
  
  getById: (id: number) =>
    axiosInstance.get<ApiResponse<OrderResponse>>(`/api/orders/${id}`).then(r => r.data),
  
  getByTable: (tableId: number) =>
    axiosInstance.get<ApiResponse<OrderResponse[]>>(`/api/orders/table/${tableId}/active`).then(r => r.data),
  
  create: (data: OrderRequest) =>
    axiosInstance.post<ApiResponse<OrderResponse>>('/api/orders', data).then(r => r.data),
  
  update: (id: number, data: OrderRequest) =>
    axiosInstance.put<ApiResponse<OrderResponse>>(`/api/orders/${id}`, data).then(r => r.data),
  
  updateStatus: (id: number, status: OrderStatus) =>
    axiosInstance.patch<ApiResponse<void>>(`/api/orders/${id}/status`, null, { params: { status } }).then(r => r.data),
  
  cancel: (id: number) =>
    axiosInstance.patch<ApiResponse<void>>(`/api/orders/${id}/cancel`).then(r => r.data),

  getByCustomer: (params?: { page?: number; size?: number }) =>
    axiosInstance.get<ApiResponse<PageResponse<OrderResponse>>>('/api/orders/customer', { params }).then(r => r.data),
};

// ─── Payment Service ──────────────────────────────────────────────────────────

export const PaymentService = {
  getAll: (params?: { status?: PaymentStatus; from?: string; to?: string; page?: number; size?: number }) =>
    axiosInstance.get<ApiResponse<PageResponse<PaymentResponse>>>('/api/payments', { params }).then(r => r.data),
  
  getById: (id: number) =>
    axiosInstance.get<ApiResponse<PaymentResponse>>(`/api/payments/${id}`).then(r => r.data),
  
  getByOrderId: (orderId: number) =>
    axiosInstance.get<ApiResponse<PaymentResponse>>(`/api/payments/order/${orderId}`).then(r => r.data),
  
  process: (data: PaymentRequest) =>
    axiosInstance.post<ApiResponse<PaymentResponse>>('/api/payments', data).then(r => r.data),
  
  refund: (id: number, reason: string) =>
    axiosInstance.patch<ApiResponse<void>>(`/api/payments/${id}/refund`, null, { params: { reason } }).then(r => r.data),
};

// ─── Supplier Service ─────────────────────────────────────────────────────────

export const SupplierService = {
  getAll: (params?: { keyword?: string; active?: boolean; page?: number; size?: number }) =>
    axiosInstance.get<ApiResponse<PageResponse<SupplierResponse>>>('/api/suppliers', { params }).then(r => r.data),
  
  getActive: () =>
    axiosInstance.get<ApiResponse<SupplierResponse[]>>('/api/suppliers/active').then(r => r.data),
  
  getById: (id: number) =>
    axiosInstance.get<ApiResponse<SupplierResponse>>(`/api/suppliers/${id}`).then(r => r.data),
  
  create: (data: SupplierRequest) =>
    axiosInstance.post<ApiResponse<SupplierResponse>>('/api/suppliers', data).then(r => r.data),
  
  update: (id: number, data: SupplierRequest) =>
    axiosInstance.put<ApiResponse<SupplierResponse>>(`/api/suppliers/${id}`, data).then(r => r.data),
  
  toggleActive: (id: number) =>
    axiosInstance.patch<ApiResponse<void>>(`/api/suppliers/${id}/toggle-active`).then(r => r.data),
  
  delete: (id: number) =>
    axiosInstance.delete<ApiResponse<void>>(`/api/suppliers/${id}`).then(r => r.data),
};

// ─── Inventory Service ────────────────────────────────────────────────────────

export const InventoryService = {
  getIngredients: (params?: { keyword?: string; active?: boolean; page?: number; size?: number }) =>
    axiosInstance.get<ApiResponse<PageResponse<IngredientResponse>>>('/api/inventory/ingredients', { params }).then(r => r.data),
  
  getIngredientById: (id: number) =>
    axiosInstance.get<ApiResponse<IngredientResponse>>(`/api/inventory/ingredients/${id}`).then(r => r.data),
  
  getLowStock: () =>
    axiosInstance.get<ApiResponse<IngredientResponse[]>>('/api/inventory/ingredients/low-stock').then(r => r.data),
  
  createIngredient: (data: IngredientRequest) =>
    axiosInstance.post<ApiResponse<IngredientResponse>>('/api/inventory/ingredients', data).then(r => r.data),
  
  updateIngredient: (id: number, data: IngredientRequest) =>
    axiosInstance.put<ApiResponse<IngredientResponse>>(`/api/inventory/ingredients/${id}`, data).then(r => r.data),
  
  toggleIngredientActive: (id: number) =>
    axiosInstance.patch<ApiResponse<void>>(`/api/inventory/ingredients/${id}/toggle-active`).then(r => r.data),
  
  getTransactions: (params?: { ingredientId?: number; type?: TransactionType; from?: string; to?: string; page?: number; size?: number }) =>
    axiosInstance.get<ApiResponse<PageResponse<InventoryTransactionResponse>>>('/api/inventory/transactions', { params }).then(r => r.data),
  
  recordTransaction: (data: InventoryTransactionRequest) =>
    axiosInstance.post<ApiResponse<InventoryTransactionResponse>>('/api/inventory/transactions', data).then(r => r.data),
};



// ─── Dashboard / Report Service ───────────────────────────────────────────────

export const DashboardService = {
  getDashboard: () =>
    axiosInstance.get<ApiResponse<DashboardResponse>>('/api/dashboard').then(r => r.data),
  
  getRevenueReport: (from?: string, to?: string) =>
    axiosInstance.get<ApiResponse<RevenueReportResponse[]>>('/api/dashboard/revenue', { params: { from, to } }).then(r => r.data),
};

// ─── User Service ─────────────────────────────────────────────────────────────

export const UserService = {
  getAll: () =>
    axiosInstance.get<ApiResponse<UserResponse[]>>('/api/users').then(r => r.data),

  getById: (id: number) =>
    axiosInstance.get<ApiResponse<UserResponse>>(`/api/users/${id}`).then(r => r.data),

  create: (data: UserRequest) =>
    axiosInstance.post<ApiResponse<UserResponse>>('/api/users', data).then(r => r.data),

  update: (id: number, data: UserRequest) =>
    axiosInstance.put<ApiResponse<UserResponse>>(`/api/users/${id}`, data).then(r => r.data),

  toggleStatus: (id: number) =>
    axiosInstance.patch<ApiResponse<void>>(`/api/users/${id}/toggle-status`).then(r => r.data),

  delete: (id: number) =>
    axiosInstance.delete<ApiResponse<void>>(`/api/users/${id}`).then(r => r.data),

  updateProfile: (data: Partial<UserRequest>) =>
    axiosInstance.put<ApiResponse<UserResponse>>('/api/users/profile', data).then(r => r.data),
};

// ─── Customer Service ─────────────────────────────────────────────────────────

export const CustomerService = {
  getAll: () =>
    axiosInstance.get<ApiResponse<UserResponse[]>>('/api/customers').then(r => r.data),

  getById: (id: number) =>
    axiosInstance.get<ApiResponse<UserResponse>>(`/api/customers/${id}`).then(r => r.data),

  update: (id: number, data: Partial<UserRequest>) =>
    axiosInstance.put<ApiResponse<UserResponse>>(`/api/customers/${id}`, data).then(r => r.data),

  toggleStatus: (id: number) =>
    axiosInstance.patch<ApiResponse<void>>(`/api/customers/${id}/toggle-status`).then(r => r.data),

  delete: (id: number) =>
    axiosInstance.delete<ApiResponse<void>>(`/api/customers/${id}`).then(r => r.data),
};

// ─── Reservation Service ──────────────────────────────────────────────────────

export const ReservationService = {
  create: (data: ReservationRequest) =>
    axiosInstance.post<ApiResponse<ReservationResponse>>('/api/reservations', data).then(r => r.data),

  getAll: (params?: { status?: ReservationStatus; tableId?: number; from?: string; to?: string; page?: number; size?: number }) =>
    axiosInstance.get<ApiResponse<PageResponse<ReservationResponse>>>('/api/reservations', { params }).then(r => r.data),

  getByCustomer: () =>
    axiosInstance.get<ApiResponse<ReservationResponse[]>>('/api/reservations/customer').then(r => r.data),

  updateStatus: (id: number, status: ReservationStatus) =>
    axiosInstance.patch<ApiResponse<ReservationResponse>>(`/api/reservations/${id}/status`, null, { params: { status } }).then(r => r.data),

  cancel: (id: number) =>
    axiosInstance.patch<ApiResponse<void>>(`/api/reservations/${id}/cancel`).then(r => r.data),
};
