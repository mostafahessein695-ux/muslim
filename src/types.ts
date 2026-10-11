export interface ProductVariant {
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'One Size';
  color: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number | null;
  category: string;
  collection: string;
  images: string[];
  sizes: ('XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'One Size')[];
  colors: string[];
  variants: ProductVariant[];
  totalStock: number;
  status: 'Published' | 'Draft' | 'Out of Stock';
  isFeatured: boolean;
  isNewArrival: boolean;
  details: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  season?: string;
  bannerImage?: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ShippingAddress {
  governorate: string;
  city: string;
  street: string;
  buildingApartment?: string;
  postalCode?: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  discountCode?: string;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: 'cod' | 'card_instapay';
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  mustChangePassword?: boolean;
  createdAt: string;
}

export interface StoreSettings {
  brandName: string;
  brandSlogan: string;
  logoText: string;
  announcementBar: string;
  heroHeadline: string;
  heroSubheadline: string;
  promoBannerTitle: string;
  promoBannerSubtitle: string;
  currency: string;
  supportPhone: string;
  supportEmail: string;
  address: string;
  shippingRates: {
    cairoGiza: number;
    alexandria: number;
    deltaCanal: number;
    upperEgypt: number;
    freeShippingThreshold: number;
  };
  whatsappIntegrationConfigured: boolean;
  resendIntegrationConfigured: boolean;
}

export interface DiscountCode {
  id: string;
  code: string;
  percentage: number;
  minSpend: number;
  isActive: boolean;
  usedCount: number;
  expiresAt?: string;
}

export interface NotificationLog {
  id: string;
  channel: 'email' | 'whatsapp';
  recipient: string;
  subject?: string;
  content: string;
  status: 'delivered' | 'delivered_simulated' | 'failed' | 'pending_setup';
  providerNote?: string;
  createdAt: string;
}
