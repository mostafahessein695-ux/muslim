import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

export interface Translations {
  // Nav
  home: string;
  shop: string;
  collections: string;
  story: string;
  contact: string;
  signIn: string;
  myAccount: string;
  admin: string;
  searchPlaceholder: string;
  bag: string;
  
  // Hero
  heroKicker: string;
  shopNow: string;
  exploreLookbook: string;
  egyptCotton: string;
  perRun: string;
  cairoDelivery: string;

  // Catalog & Product
  featuredDrops: string;
  viewCatalog: string;
  allCategories: string;
  addToBag: string;
  quickBag: string;
  outOfStock: string;
  inStock: string;
  size: string;
  color: string;
  quantity: string;
  price: string;
  currency: string;
  freeShippingAlert: string;
  freeShippingUnlocked: string;

  // Cart & Checkout
  checkout: string;
  subtotal: string;
  discount: string;
  shipping: string;
  total: string;
  promoCode: string;
  apply: string;
  emptyBag: string;
  startExploring: string;
  cashOnDelivery: string;
  instaPayCard: string;
  confirmOrder: string;
  fullName: string;
  emailAddress: string;
  phoneEgypt: string;
  governorate: string;
  city: string;
  street: string;

  // Auth & Gate
  welcomeTitle: string;
  welcomeSubtitle: string;
  chooseLanguage: string;
  continueWithGoogle: string;
  continueWithApple: string;
  orWithEmail: string;
  enterAsGuest: string;
  login: string;
  register: string;
  password: string;
  haveAccount: string;
  needAccount: string;
  switchLanguage: string;
}

const translationsData: Record<Language, Translations> = {
  en: {
    home: 'Home',
    shop: 'Shop All',
    collections: 'Collections',
    story: 'Story',
    contact: 'Contact',
    signIn: 'Sign In',
    myAccount: 'My Account',
    admin: 'ADMIN',
    searchPlaceholder: 'Search hoodie, cargos...',
    bag: 'Bag',

    heroKicker: 'LIMITED RUN DROP 01 / 100% EGYPTIAN COTTON',
    shopNow: 'Shop New Drop',
    exploreLookbook: 'Explore Lookbook',
    egyptCotton: 'Heavy French Terry',
    perRun: 'Units Per Edition Run',
    cairoDelivery: 'Cairo Express Delivery',

    featuredDrops: 'Featured Heavyweight Pieces',
    viewCatalog: 'View Full Catalog',
    allCategories: 'All Categories',
    addToBag: 'Add to Bag',
    quickBag: 'Quick Bag',
    outOfStock: 'Sold Out',
    inStock: 'In Stock',
    size: 'Size',
    color: 'Colorway',
    quantity: 'Quantity',
    price: 'Price',
    currency: 'EGP',
    freeShippingAlert: 'Add EGP {amount} for Free Shipping across Egypt!',
    freeShippingUnlocked: 'You unlocked FREE Express Shipping in Egypt!',

    checkout: 'Proceed to Checkout',
    subtotal: 'Subtotal',
    discount: 'Discount',
    shipping: 'Shipping',
    total: 'Total',
    promoCode: 'Promo Code (e.g. GENZ15)',
    apply: 'Apply',
    emptyBag: 'Your bag is empty',
    startExploring: 'Start Exploring',
    cashOnDelivery: 'Cash on Delivery (COD)',
    instaPayCard: 'InstaPay / Bank Card',
    confirmOrder: 'Confirm Order',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    phoneEgypt: 'Phone Number (Egypt +20)',
    governorate: 'Governorate',
    city: 'City / District',
    street: 'Street & Building Address',

    welcomeTitle: 'DISTRICT CYBER 20 // SS26',
    welcomeSubtitle: 'Raw Architectural Streetwear Crafted from 480GSM Egyptian Heavyweight Cotton.',
    chooseLanguage: 'Select Language',
    continueWithGoogle: 'Continue with Google',
    continueWithApple: 'Continue with Apple',
    orWithEmail: 'Or sign in with email',
    enterAsGuest: 'Enter Store as Guest',
    login: 'Sign In',
    register: 'Create Account',
    password: 'Password',
    haveAccount: 'Already have an account? Sign In',
    needAccount: "Don't have an account? Register",
    switchLanguage: 'العربية'
  },
  ar: {
    home: 'الرئيسية',
    shop: 'المتجر بالكامل',
    collections: 'التشكيلات',
    story: 'قصة البراند',
    contact: 'تواصل معنا',
    signIn: 'تسجيل الدخول',
    myAccount: 'حسابي',
    admin: 'لوحة التحكم',
    searchPlaceholder: 'ابحث عن هودي، كارجو...',
    bag: 'الحقيبة',

    heroKicker: 'إصدار محدود رقم 01 / قطن مصري 100%',
    shopNow: 'تسوق الإصدار الجديد',
    exploreLookbook: 'استكشف لوك بوك',
    egyptCotton: 'ميلتون قطن مصري ثقيل',
    perRun: 'قطعة فقط لكل إصدار',
    cairoDelivery: 'توصيل سريع داخل القاهرة',

    featuredDrops: 'أبرز القطع الثقيلة الحصرية',
    viewCatalog: 'عرض كافة القطع',
    allCategories: 'جميع الأقسام',
    addToBag: 'إضافة إلى الحقيبة',
    quickBag: 'إضافة سريعة',
    outOfStock: 'نفد من المخزون',
    inStock: 'متوفر الآن',
    size: 'المقاس',
    color: 'اللون',
    quantity: 'الكمية',
    price: 'السعر',
    currency: 'ج.م',
    freeShippingAlert: 'أضف بقيمة {amount} ج.م للحصول على شحن مجاني لكافة محافظات مصر!',
    freeShippingUnlocked: 'مبروك! حصلت على شحن سريع مجاني لجميع محافظات مصر!',

    checkout: 'إتمام الطلب والدفع',
    subtotal: 'المجموع الفرعي',
    discount: 'الخصم',
    shipping: 'الشحن',
    total: 'الإجمالي النهائي',
    promoCode: 'كود الخصم (مثال GENZ15)',
    apply: 'تطبيق',
    emptyBag: 'حقيبة التسوق فارغة',
    startExploring: 'ابدأ الاستكشاف',
    cashOnDelivery: 'الدفع عند الاستلام (COD)',
    instaPayCard: 'انستاباي / بطاقة بنكية',
    confirmOrder: 'تأكيد الطلب الآن',
    fullName: 'الاسم بالكامل',
    emailAddress: 'البريد الإلكتروني',
    phoneEgypt: 'رقم الهاتف (مصر +20)',
    governorate: 'المحافظة',
    city: 'المدينة / الحي',
    street: 'العنوان ورقم المبنى',

    welcomeTitle: 'كايرو ديستريكت 20 // صيف 2026',
    welcomeSubtitle: 'ملابس ستريت وير معمارية مصنوعة من القطن المصري الثقيل 480 جرام.',
    chooseLanguage: 'اختر لغة العرض',
    continueWithGoogle: 'متابعة باستخدام Google',
    continueWithApple: 'متابعة باستخدام Apple',
    orWithEmail: 'أو تسجيل الدخول بالبريد الإلكتروني',
    enterAsGuest: 'الدخول كزائر وتصفح المتجر',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب جديد',
    password: 'كلمة المرور',
    haveAccount: 'لديك حساب بالفعل؟ تسجيل الدخول',
    needAccount: 'ليس لديك حساب؟ إنشاء حساب جديد',
    switchLanguage: 'English'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('kd_language') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kd_language', lang);
  };

  const toggleLanguage = () => {
    const nextLang: Language = language === 'en' ? 'ar' : 'en';
    setLanguage(nextLang);
  };

  const isRtl = language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRtl]);

  const t = translationsData[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
