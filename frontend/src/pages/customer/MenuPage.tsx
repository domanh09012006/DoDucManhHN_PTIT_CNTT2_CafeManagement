import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/CustomerLayout';
import { ProductService, CategoryService, OrderService, ReservationService, TableService } from '../../services';
import type { ProductResponse, CategoryResponse, OrderItemRequest, TableResponse } from '../../types';
import { Coffee, Search, FolderOpen, Star, ShoppingCart, Trash2, Calendar, Users, Clock, X, Plus, Minus, ArrowLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { validatePhone } from '../../utils/validation';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

interface CartItem {
  product: ProductResponse;
  quantity: number;
  notes: string;
}

const MenuPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [activeTab, setActiveTab] = useState<number | 'all'>('all');
  
  // Shopping Cart states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartNotes, setCartNotes] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  // Reservation Modal states
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingForm, setBookingForm] = useState({
    numberOfGuests: 2,
    contactName: '',
    contactPhone: '',
    notes: '',
  });
  const [availableTables, setAvailableTables] = useState<TableResponse[]>([]);
  const [suggestedSlots, setSuggestedSlots] = useState<{ time: string; availableCount: number }[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [searchingTables, setSearchingTables] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingErrors, setBookingErrors] = useState<Record<string, string>>({});
  const [bookingTouched, setBookingTouched] = useState<Record<string, boolean>>({});

  const validateBookingField = (name: string, value: any) => {
    let errorMsg = '';
    if (name === 'numberOfGuests') {
      const val = Number(value);
      if (isNaN(val) || val <= 0) errorMsg = 'Số lượng khách phải lớn hơn 0';
    } else if (name === 'contactName') {
      const val = String(value).trim();
      if (!val) errorMsg = 'Tên liên hệ không được để trống';
      else if (val.length < 2 || val.length > 50) errorMsg = 'Tên liên hệ phải từ 2 đến 50 ký tự';
    } else if (name === 'contactPhone') {
      errorMsg = validatePhone(value) || '';
    }
    return errorMsg;
  };

  const handleBookingInputChange = (name: string, value: any) => {
    setBookingForm(prev => {
      const updated = { ...prev, [name]: value };
      if (bookingTouched[name]) {
        const errorMsg = validateBookingField(name, value);
        setBookingErrors(prevErrors => ({ ...prevErrors, [name]: errorMsg }));
      }
      return updated;
    });
  };

  const handleBookingInputBlur = (name: string, value: any) => {
    setBookingTouched(prev => ({ ...prev, [name]: true }));
    const errorMsg = validateBookingField(name, value);
    setBookingErrors(prevErrors => ({ ...prevErrors, [name]: errorMsg }));
  };

  const openBookingModal = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập trước khi đặt bàn');
      navigate('/customer/login');
      return;
    }
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    
    setBookingDate(`${yyyy}-${mm}-${dd}`);
    setBookingTime('12:00');
    setBookingForm({
      numberOfGuests: 2,
      contactName: user?.fullName || '',
      contactPhone: user?.phone || '',
      notes: '',
    });
    setBookingStep(1);
    setAvailableTables([]);
    setSuggestedSlots([]);
    setSelectedTableId(null);
    setBookingErrors({});
    setBookingTouched({});
    setShowBookModal(true);
  };

  const handleSearchTables = async () => {
    const errors: Record<string, string> = {};
    if (!bookingDate) errors.bookingDate = 'Vui lòng chọn ngày đặt bàn';
    if (!bookingTime) errors.bookingTime = 'Vui lòng chọn giờ đặt bàn';
    
    const guests = Number(bookingForm.numberOfGuests);
    if (isNaN(guests) || guests <= 0) {
      errors.numberOfGuests = 'Số lượng khách phải lớn hơn 0';
    }

    if (bookingDate && bookingTime) {
      const selectedDateTime = new Date(`${bookingDate}T${bookingTime}`);
      if (selectedDateTime <= new Date()) {
        errors.bookingTime = 'Thời gian đặt bàn phải ở tương lai';
      }
    }

    setBookingErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSearchingTables(true);
    try {
      const datetimeString = `${bookingDate}T${bookingTime}:00`;
      const res = await TableService.searchAvailable(datetimeString, guests);
      if (res.success) {
        setAvailableTables(res.data.availableTables as any);
        setSuggestedSlots(res.data.suggestedSlots);
        setBookingStep(2);
        setSelectedTableId(null);
      } else {
        toast.error(res.message || 'Không thể tìm kiếm bàn trống');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tìm kiếm bàn');
    } finally {
      setSearchingTables(false);
    }
  };

  const handleSelectSuggestedSlot = async (isoString: string) => {
    const parts = isoString.split('T');
    if (parts.length === 2) {
      const dateVal = parts[0];
      const timeVal = parts[1].substring(0, 5);
      setBookingDate(dateVal);
      setBookingTime(timeVal);
      
      setSearchingTables(true);
      try {
        const datetimeString = `${dateVal}T${timeVal}:00`;
        const res = await TableService.searchAvailable(datetimeString, bookingForm.numberOfGuests);
        if (res.success) {
          setAvailableTables(res.data.availableTables as any);
          setSuggestedSlots(res.data.suggestedSlots);
          setSelectedTableId(null);
          setBookingStep(2);
        } else {
          toast.error(res.message || 'Không thể tìm kiếm bàn trống');
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tìm kiếm bàn');
      } finally {
        setSearchingTables(false);
      }
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const catRes = await CategoryService.getAll({ active: true });
      if (catRes.success) setCategories(catRes.data);

      const prodRes = await ProductService.getAvailable();
      if (prodRes.success) setProducts(prodRes.data);
    } catch {
      toast.error('Không thể tải thực đơn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Autofill booking contact info if customer is logged in
  useEffect(() => {
    if (user) {
      setBookingForm(prev => ({
        ...prev,
        contactName: user.fullName || '',
        contactPhone: user.phone || '',
      }));
    }
  }, [user]);

  // Cart operations
  const addToCart = (product: ProductResponse) => {
    const existingIndex = cart.findIndex(item => item.product.id === product.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, { product, quantity: 1, notes: '' }]);
    }
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
  };

  const updateQuantity = (productId: number, delta: number) => {
    const updated = cart.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[];
    setCart(updated);
  };

  const updateItemNotes = (productId: number, notes: string) => {
    setCart(cart.map(item => item.product.id === productId ? { ...item, notes } : item));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id !== productId));
    toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  // Submit Order
  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập tài khoản thành viên để đặt món');
      navigate('/customer/login');
      return;
    }

    if (cart.length === 0) {
      toast.error('Giỏ hàng của bạn đang trống');
      return;
    }

    setCheckingOut(true);
    try {
      const items: OrderItemRequest[] = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        notes: item.notes || undefined,
      }));

      const orderRequest = {
        items,
        notes: cartNotes,
        orderSource: 'ONLINE' as const, // Online order source
      };

      const res = await OrderService.create(orderRequest);
      if (res.success) {
        toast.success('Đặt hàng thành công! Đang chờ cửa hàng phê duyệt.');
        setCart([]);
        setCartNotes('');
        setShowCart(false);
        navigate('/customer/profile');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể đặt món. Vui lòng thử lại.');
    } finally {
      setCheckingOut(false);
    }
  };

  // Submit Table Booking
  const handleBookTable = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thực hiện đặt bàn');
      navigate('/customer/login');
      return;
    }

    if (!selectedTableId) {
      toast.error('Vui lòng chọn một bàn trống');
      return;
    }

    const errors: Record<string, string> = {};
    const contactName = bookingForm.contactName.trim();
    const contactPhone = bookingForm.contactPhone.trim();

    if (!contactName) {
      errors.contactName = 'Tên liên hệ không được để trống';
    } else if (contactName.length < 2 || contactName.length > 50) {
      errors.contactName = 'Tên liên hệ phải từ 2 đến 50 ký tự';
    }

    const phoneError = validatePhone(contactPhone);
    if (phoneError) {
      errors.contactPhone = phoneError;
    }

    setBookingErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setBookingLoading(true);
    try {
      const datetimeString = `${bookingDate}T${bookingTime}:00`;
      const res = await ReservationService.create({
        tableId: selectedTableId,
        reservationTime: datetimeString,
        numberOfGuests: bookingForm.numberOfGuests,
        contactName,
        contactPhone,
        notes: bookingForm.notes.trim() || undefined,
      });
      if (res.success) {
        toast.success('Gửi yêu cầu đặt bàn thành công! Quý khách vui lòng đợi duyệt.');
        setShowBookModal(false);
        setBookingForm({
          numberOfGuests: 2,
          contactName: user?.fullName || '',
          contactPhone: user?.phone || '',
          notes: '',
        });
        setBookingErrors({});
        setBookingTouched({});
        navigate('/customer/profile');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra. Không thể đặt bàn.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Filtering products
  const filteredProducts = products.filter(p => {
    const matchesKeyword = p.name.toLowerCase().includes(keyword.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(keyword.toLowerCase()));

    const matchesCategory = activeTab === 'all' || p.categoryId === activeTab;

    return matchesKeyword && matchesCategory;
  });

  return (
    <CustomerLayout>
      {/* Title */}
      <section className="py-16 text-center space-y-4">
        <h1 className="text-4xl font-black text-white tracking-tight">Thực Đơn Đặc Biệt</h1>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">
          Khám phá các dòng cà phê phin truyền thống, cà phê máy cao cấp và bánh ngọt nướng thơm lừng.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <button
            onClick={openBookingModal}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-2xl flex items-center gap-2 shadow-lg cursor-pointer text-sm transition-all"
          >
            <Calendar className="w-4 h-4" />
            Đặt bàn trực tuyến
          </button>
          
          <button
            onClick={() => setShowCart(true)}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl flex items-center gap-2 text-sm transition-all relative cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 text-amber-500" />
            Giỏ hàng của tôi
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center font-bold">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </section>

      {/* Filters & Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full sm:w-auto custom-scrollbar">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex-shrink-0 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-coffee-500 text-white shadow-lg shadow-coffee-500/15'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              Tất cả món
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveTab(c.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex-shrink-0 cursor-pointer ${
                  activeTab === c.id
                    ? 'bg-coffee-500 text-white shadow-lg shadow-coffee-500/15'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72 flex-shrink-0">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm đồ uống, bánh ngọt..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-coffee-500/40 text-xs sm:text-sm w-full bg-gray-900"
            />
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-3 border-coffee-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">Đang chuẩn bị thức uống...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white/3 border border-white/5 rounded-3xl">
            <Coffee className="w-12 h-12 text-coffee-500/20 mx-auto mb-4" />
            <p className="text-gray-400 text-sm font-semibold">Không tìm thấy món nước nào phù hợp</p>
            <p className="text-gray-500 text-xs mt-1">Vui lòng thử từ khóa tìm kiếm khác hoặc đổi danh mục</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <div key={p.id} className="bg-white/3 border border-white/5 rounded-[28px] overflow-hidden hover:bg-white/6 hover:-translate-y-1 transition-all duration-300 group shadow-md flex flex-col h-full bg-white/5">
                {/* Image */}
                <div className="h-44 sm:h-48 bg-gradient-to-br from-coffee-900/30 to-orange-950/10 flex items-center justify-center relative overflow-hidden flex-shrink-0">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <Coffee className="w-14 h-14 text-coffee-400/20" />
                  )}
                  {p.featured && (
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-coffee-500 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                      <Star className="w-3 h-3 fill-white" /> Bestseller
                    </span>
                  )}
                </div>
                {/* Info */}
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-white font-bold text-base truncate mb-1">{p.name}</h3>
                  {p.categoryName && (
                    <p className="text-gray-500 text-[10px] uppercase font-bold flex items-center gap-1 mb-2.5">
                      <FolderOpen className="w-3.5 h-3.5" /> {p.categoryName}
                    </p>
                  )}
                  <p className="text-gray-400 text-xs leading-relaxed mb-4 line-clamp-2">{p.description || 'Thức uống ngon mát lạnh.'}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-coffee-400 font-extrabold text-lg">{formatCurrency(p.price)}</span>
                    <button
                      onClick={() => addToCart(p)}
                      className="px-4 py-2 bg-coffee-500 hover:bg-coffee-400 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-coffee-500/10 cursor-pointer"
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-gray-900 border-l border-white/10 h-full flex flex-col shadow-2xl p-6 relative animate-slide-left">
            <button
              onClick={() => setShowCart(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-white text-xl font-bold flex items-center gap-2 mb-6">
              <ShoppingCart className="w-5 h-5 text-amber-500" /> Giỏ hàng trực tuyến
            </h2>

            {cart.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500 space-y-4">
                <ShoppingCart className="w-16 h-16 text-white/5" />
                <p className="text-sm">Giỏ hàng của bạn đang trống</p>
                <button
                  onClick={() => setShowCart(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs"
                >
                  Tiếp tục xem menu
                </button>
              </div>
            ) : (
              <>
                <div className="flex-grow overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                  {cart.map(item => (
                    <div key={item.product.id} className="p-4 bg-white/3 border border-white/5 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-white text-sm font-semibold">{item.product.name}</h4>
                          <span className="text-amber-500 text-xs">{formatCurrency(item.product.price)}</span>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/5 p-1">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="p-1 hover:bg-white/10 rounded-lg text-white"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-white text-xs w-6 text-center font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="p-1 hover:bg-white/10 rounded-lg text-white"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-white text-sm font-bold">{formatCurrency(item.product.price * item.quantity)}</span>
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Ghi chú món này (ít đá, nhiều đường...)"
                          value={item.notes}
                          onChange={e => updateItemNotes(item.product.id, e.target.value)}
                          className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-gray-950"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4 mt-4 space-y-4 flex-shrink-0">
                  <div>
                    <label className="text-gray-400 text-xs font-semibold mb-1 block">Ghi chú giao hàng / chuẩn bị</label>
                    <textarea
                      placeholder="Ghi chú thêm cho đơn hàng..."
                      value={cartNotes}
                      onChange={e => setCartNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-gray-950 resize-none"
                    />
                  </div>

                  <div className="flex justify-between items-center text-white font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-amber-400 text-lg">{formatCurrency(getCartTotal())}</span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={checkingOut}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-extrabold rounded-2xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {checkingOut ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Đặt món online'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Reservation Booking Modal */}
      {showBookModal && (
        <div className="modal-backdrop">
          <div className={`modal-content transition-all duration-300 ${bookingStep === 2 && availableTables.length > 0 ? 'max-w-xl' : 'max-w-md'}`}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" /> Đặt bàn trực tuyến
              </h2>
              <button onClick={() => setShowBookModal(false)} className="text-gray-400 hover:text-white transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Wizard Header */}
            <div className="flex items-center justify-between mb-6 px-1">
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${bookingStep >= 1 ? 'bg-amber-500 text-black' : 'bg-white/10 text-gray-400'}`}>1</div>
                <span className={`text-[11px] font-bold ${bookingStep >= 1 ? 'text-white' : 'text-gray-500'}`}>Tìm bàn</span>
              </div>
              <div className="flex-1 h-[1px] bg-white/10 mx-2" />
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${bookingStep >= 2 ? 'bg-amber-500 text-black' : 'bg-white/10 text-gray-400'}`}>2</div>
                <span className={`text-[11px] font-bold ${bookingStep >= 2 ? 'text-white' : 'text-gray-500'}`}>Chọn bàn</span>
              </div>
              <div className="flex-1 h-[1px] bg-white/10 mx-2" />
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${bookingStep >= 3 ? 'bg-amber-500 text-black' : 'bg-white/10 text-gray-400'}`}>3</div>
                <span className={`text-[11px] font-bold ${bookingStep >= 3 ? 'text-white' : 'text-gray-500'}`}>Xác nhận</span>
              </div>
            </div>

            {/* Step 1: Input Details */}
            {bookingStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 text-xs font-semibold">Chọn ngày *</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={e => {
                        setBookingDate(e.target.value);
                        setBookingErrors(prev => ({ ...prev, bookingDate: '' }));
                      }}
                      className={`input-field mt-1.5 text-gray-300 ${bookingErrors.bookingDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                    />
                    {bookingErrors.bookingDate && (
                      <p className="text-red-500 text-[10px] mt-1">{bookingErrors.bookingDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs font-semibold">Chọn giờ đến *</label>
                    <input
                      type="time"
                      value={bookingTime}
                      onChange={e => {
                        setBookingTime(e.target.value);
                        setBookingErrors(prev => ({ ...prev, bookingTime: '' }));
                      }}
                      className={`input-field mt-1.5 text-gray-300 ${bookingErrors.bookingTime ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                    />
                    {bookingErrors.bookingTime && (
                      <p className="text-red-500 text-[10px] mt-1">{bookingErrors.bookingTime}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-xs font-semibold">Số lượng khách *</label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <button
                      type="button"
                      onClick={() => handleBookingInputChange('numberOfGuests', Math.max(1, bookingForm.numberOfGuests - 1))}
                      className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 flex items-center justify-center text-white transition-all cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={bookingForm.numberOfGuests}
                      onChange={e => handleBookingInputChange('numberOfGuests', Number(e.target.value))}
                      className={`input-field text-center font-bold !py-2 ${bookingErrors.numberOfGuests ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleBookingInputChange('numberOfGuests', bookingForm.numberOfGuests + 1)}
                      className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 flex items-center justify-center text-white transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {bookingErrors.numberOfGuests && (
                    <p className="text-red-500 text-[10px] mt-1">{bookingErrors.numberOfGuests}</p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowBookModal(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all text-sm cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSearchTables}
                    disabled={searchingTables}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer text-sm"
                  >
                    {searchingTables ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Tìm kiếm bàn trống'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Table Selection */}
            {bookingStep === 2 && (
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 mb-2 flex items-center justify-between text-xs text-gray-400">
                  <div>
                    <span className="font-semibold text-white">Thời gian:</span> {bookingDate} lúc {bookingTime}
                  </div>
                  <div>
                    <span className="font-semibold text-white">Số khách:</span> {bookingForm.numberOfGuests} người
                  </div>
                </div>

                {searchingTables ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-400 text-xs font-semibold animate-pulse">Đang tìm kiếm bàn trống...</span>
                  </div>
                ) : availableTables.length > 0 ? (
                  <>
                    <p className="text-xs text-gray-400 font-semibold mb-2">Vui lòng chọn một bàn trống phù hợp bên dưới:</p>
                    
                    <div className="grid grid-cols-2 gap-3 max-h-[260px] overflow-y-auto p-0.5 custom-scrollbar">
                      {availableTables.map((table: any) => (
                        <div
                          key={table.id}
                          onClick={() => setSelectedTableId(table.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between h-[90px] ${
                            selectedTableId === table.id
                              ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/15 scale-[1.01]'
                              : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white font-bold text-sm">Bàn {table.tableNumber}</span>
                            {selectedTableId === table.id && (
                              <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                                <Check className="w-3 h-3 text-black stroke-[3px]" />
                              </div>
                            )}
                          </div>
                          <div className="text-[11px] space-y-0.5">
                            <div className="text-gray-400 flex items-center gap-1">
                              <Users className="w-3 h-3 text-amber-500/80" />
                              <span>Sức chứa: {table.capacity} người</span>
                            </div>
                            {table.area && (
                              <div className="text-gray-400 truncate">
                                <span className="text-amber-500/80 mr-1">📍</span>
                                <span>{table.area}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="py-6 text-center space-y-4">
                    <div className="text-amber-500/90 text-4xl">⚠️</div>
                    <p className="text-gray-300 text-sm font-medium px-4">
                      Không tìm thấy bàn phù hợp với thời gian và số lượng khách yêu cầu.
                    </p>
                    
                    {suggestedSlots.length > 0 && (
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mt-4 text-left">
                        <p className="text-amber-500 text-xs font-bold mb-2.5">Quý khách có thể tham khảo các khung giờ khác:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {suggestedSlots.map((slot, idx) => {
                            const parts = slot.time.split('T');
                            const displayTime = parts.length === 2 ? parts[1].substring(0, 5) : slot.time;
                            return (
                              <button
                                type="button"
                                key={idx}
                                onClick={() => handleSelectSuggestedSlot(slot.time)}
                                className="px-3 py-2 bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500 text-gray-300 hover:text-amber-500 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer"
                              >
                                <span>{displayTime}</span>
                                <span className="text-[10px] text-gray-500 font-normal">Còn {slot.availableCount} bàn</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-6">
                  <button
                    type="button"
                    onClick={() => setBookingStep(1)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all text-sm flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Quay lại
                  </button>
                  
                  {availableTables.length > 0 && (
                    <button
                      type="button"
                      disabled={selectedTableId === null}
                      onClick={() => setBookingStep(3)}
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black font-extrabold rounded-xl shadow-lg transition-all text-sm cursor-pointer"
                    >
                      Tiếp tục
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Contact & Confirm */}
            {bookingStep === 3 && (
              <form onSubmit={handleBookTable} className="space-y-4" noValidate>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-2 space-y-2 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span className="font-semibold text-white">Bàn đã chọn:</span>
                    <span className="font-bold text-amber-500">
                      Bàn {availableTables.find((t: any) => t.id === selectedTableId)?.tableNumber || ''} ({availableTables.find((t: any) => t.id === selectedTableId)?.area || 'Sảnh chung'})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-white">Thời gian:</span>
                    <span>{bookingDate} lúc {bookingTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-white">Số khách:</span>
                    <span>{bookingForm.numberOfGuests} người</span>
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-xs font-semibold">Tên liên hệ *</label>
                  <input
                    type="text"
                    value={bookingForm.contactName}
                    onChange={e => handleBookingInputChange('contactName', e.target.value)}
                    onBlur={e => handleBookingInputBlur('contactName', e.target.value)}
                    placeholder="Họ tên người đến"
                    className={`input-field mt-1.5 ${bookingErrors.contactName && bookingTouched.contactName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  />
                  {bookingErrors.contactName && bookingTouched.contactName && (
                    <p className="text-red-500 text-[10px] mt-1">{bookingErrors.contactName}</p>
                  )}
                </div>

                <div>
                  <label className="text-gray-400 text-xs font-semibold">Số điện thoại *</label>
                  <input
                    type="text"
                    value={bookingForm.contactPhone}
                    onChange={e => handleBookingInputChange('contactPhone', e.target.value)}
                    onBlur={e => handleBookingInputBlur('contactPhone', e.target.value)}
                    placeholder="Số điện thoại liên lạc"
                    className={`input-field mt-1.5 ${bookingErrors.contactPhone && bookingTouched.contactPhone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  />
                  {bookingErrors.contactPhone && bookingTouched.contactPhone && (
                    <p className="text-red-500 text-[10px] mt-1">{bookingErrors.contactPhone}</p>
                  )}
                </div>

                <div>
                  <label className="text-gray-400 text-xs font-semibold">Ghi chú đặc biệt</label>
                  <textarea
                    value={bookingForm.notes}
                    onChange={e => handleBookingInputChange('notes', e.target.value)}
                    placeholder="Lời nhắn (Ví dụ: bàn yên tĩnh, tầng 2, có nôi trẻ em...)"
                    rows={3}
                    className="input-field mt-1.5 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-6">
                  <button
                    type="button"
                    onClick={() => setBookingStep(2)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all text-sm flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer text-sm"
                  >
                    {bookingLoading ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Xác nhận đặt bàn'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </CustomerLayout>
  );
};

export default MenuPage;
