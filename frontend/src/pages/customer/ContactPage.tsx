import React, { useState } from 'react';
import CustomerLayout from '../../components/CustomerLayout';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { validateEmail } from '../../utils/validation';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const [form, setForm] = useState<ContactForm>({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [sending, setSending] = useState(false);

  const validateField = (name: string, value: string) => {
    let errorMsg = '';
    const val = value.trim();
    if (name === 'name') {
      if (!val) errorMsg = 'Họ và tên không được để trống';
      else if (val.length < 2 || val.length > 50) errorMsg = 'Họ và tên phải từ 2 đến 50 ký tự';
    } else if (name === 'email') {
      errorMsg = validateEmail(value) || '';
    } else if (name === 'message') {
      if (!val) errorMsg = 'Nội dung tin nhắn không được để trống';
    }
    return errorMsg;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const errorMsg = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: errorMsg }));
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const errorMsg = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fields = ['name', 'email', 'message'];
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};

    fields.forEach(field => {
      newTouched[field] = true;
      const errorMsg = validateField(field, form[field as keyof typeof form]);
      if (errorMsg) {
        newErrors[field] = errorMsg;
      }
    });

    setErrors(newErrors);
    setTouched(newTouched);

    const hasError = Object.values(newErrors).some(err => err !== '');
    if (hasError) {
      return;
    }

    setSending(true);
    setTimeout(() => {
      toast.success('Cảm ơn bạn! Thông tin liên hệ đã được gửi thành công.');
      setForm({ name: '', email: '', subject: '', message: '' });
      setErrors({});
      setTouched({});
      setSending(false);
    }, 800);
  };

  const contactInfos = [
    { icon: <MapPin className="w-5 h-5 text-coffee-400" />, label: 'Địa chỉ quán', value: '123 Đường Cà Phê, Quận Hoàn Kiếm, Hà Nội' },
    { icon: <Phone className="w-5 h-5 text-coffee-400" />, label: 'Số điện thoại', value: '+84 90 123 4567' },
    { icon: <Mail className="w-5 h-5 text-coffee-400" />, label: 'Hộp thư điện tử', value: 'contact@coffeems.com' },
    { icon: <Clock className="w-5 h-5 text-coffee-400" />, label: 'Giờ mở cửa', value: '07:00 – 22:30 hàng ngày (Cả ngày lễ)' }
  ];

  return (
    <CustomerLayout>
      {/* Title */}
      <section className="py-20 text-center space-y-4">
        <h1 className="text-4xl font-black text-white tracking-tight">Liên Hệ Với Chúng Tôi</h1>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">Mọi ý kiến đóng góp, phản hồi hoặc yêu cầu nhượng quyền xin vui lòng gửi tin nhắn trực tiếp</p>
      </section>

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Details */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-coffee-400" /> Thông Tin Cửa Hàng
            </h2>

            <div className="space-y-6">
              {contactInfos.map((info, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    {info.icon}
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{info.label}</p>
                    <p className="text-white text-sm sm:text-base mt-1 font-medium">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Map Placeholder */}
            <div className="h-56 bg-white/3 border border-white/5 rounded-3xl overflow-hidden flex items-center justify-center relative shadow-inner">
              <div className="absolute inset-0 bg-coffee-950/20 backdrop-blur-[1px] pointer-events-none" />
              <MapPin className="w-8 h-8 text-coffee-500/40 absolute animate-bounce" />
              <span className="text-gray-500 text-xs font-semibold z-10">[Bản đồ chỉ đường Google Maps]</span>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white/3 border border-white/5 rounded-3xl p-8 shadow-md">
            <h2 className="text-2xl font-bold text-white tracking-tight mb-6">Gửi Tin Nhắn</h2>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="text-gray-400 text-sm">Họ và tên *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  placeholder="Nguyễn Văn A"
                  className={`input-field mt-1.5 ${errors.name && touched.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                />
                {errors.name && touched.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="text-gray-400 text-sm">Địa chỉ Email *</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  placeholder="email@example.com"
                  className={`input-field mt-1.5 ${errors.email && touched.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                />
                {errors.email && touched.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="text-gray-400 text-sm">Chủ đề phản hồi</label>
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleInputChange}
                  placeholder="Gợi ý, đóng góp ý kiến..."
                  className="input-field mt-1.5"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Nội dung tin nhắn *</label>
                <textarea
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  placeholder="Nhập nội dung phản hồi của bạn..."
                  className={`input-field mt-1.5 resize-none ${errors.message && touched.message ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                />
                {errors.message && touched.message && (
                  <p className="text-red-500 text-xs mt-1">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={sending}
                className="btn-primary mt-4 flex items-center justify-center gap-2"
              >
                {sending ? 'Đang gửi phản hồi...' : (
                  <>
                    Gửi tin nhắn <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </CustomerLayout>
  );
};

export default ContactPage;
