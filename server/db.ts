import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  salt: string;
  role: 'customer' | 'admin';
  mustChangePassword?: boolean;
  provider?: 'local' | 'google' | 'apple';
  whatsappConsent?: boolean;
  createdAt: string;
}

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
  price: number; // in EGP
  salePrice?: number | null; // in EGP
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

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    governorate: string;
    city: string;
    street: string;
    buildingApartment?: string;
    postalCode?: string;
    notes?: string;
  };
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

export interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: User[];
  products: Product[];
  categories: Category[];
  collections: Collection[];
  orders: Order[];
  discounts: DiscountCode[];
  settings: StoreSettings;
  notifications: NotificationLog[];
  subscribers: NewsletterSubscriber[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Password hashing utilities using Node.js crypto
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const checkHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(checkHash), Buffer.from(hash));
  } catch {
    return false;
  }
}

function getInitialData(): DatabaseSchema {
  // Pre-seed admin: Mustafa with temporary password "12345"
  const adminAuth = hashPassword('12345');

  return {
    users: [
      {
        id: 'usr_admin_mustafa',
        name: 'Mustafa',
        email: 'admin@kairodistrict.com',
        phone: '+201000000000',
        passwordHash: adminAuth.hash,
        salt: adminAuth.salt,
        role: 'admin',
        mustChangePassword: true, // Requires changing temporary password before production use
        whatsappConsent: true,
        createdAt: new Date().toISOString()
      }
    ],
    categories: [
      { id: 'cat_hoodies', name: 'Hoodies & Sweatshirts', slug: 'hoodies' },
      { id: 'cat_tshirts', name: 'T-Shirts & Tops', slug: 't-shirts' },
      { id: 'cat_pants', name: 'Pants & Cargos', slug: 'pants' },
      { id: 'cat_accessories', name: 'Accessories & Bags', slug: 'accessories' },
      { id: 'cat_headwear', name: 'Headwear', slug: 'headwear' }
    ],
    collections: [
      { id: 'col_cyber20', name: 'District Cyber 20', slug: 'district-cyber-20', season: 'Drop 01 / SS26' },
      { id: 'col_mirage', name: 'Electric Mirage', slug: 'electric-mirage', season: 'Summer 2026' },
      { id: 'col_essentials', name: 'Heavyweight Core', slug: 'core-essentials', season: 'All-Year' }
    ],
    products: [
      {
        id: 'prod_hoodie_01',
        name: 'CYAN HORIZON 480GSM Oversized Hoodie',
        slug: 'cyan-horizon-480gsm-oversized-hoodie',
        description: 'Engineered from ultra-heavyweight 480 GSM unbrushed Egyptian cotton French terry. Cut in an aggressive oversized boxy silhouette with dropped shoulders, raw twin-needle stitching, and custom electric blue typography.',
        price: 2450,
        salePrice: 2150,
        category: 'Hoodies & Sweatshirts',
        collection: 'District Cyber 20',
        images: ['/src/assets/images/product_hoodie_heavyweight_1791725317370.jpg'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Washed Charcoal', 'Electric Cobalt'],
        variants: [
          { size: 'S', color: 'Washed Charcoal', stock: 12 },
          { size: 'M', color: 'Washed Charcoal', stock: 24 },
          { size: 'L', color: 'Washed Charcoal', stock: 18 },
          { size: 'XL', color: 'Washed Charcoal', stock: 8 },
          { size: 'XXL', color: 'Washed Charcoal', stock: 5 },
          { size: 'M', color: 'Electric Cobalt', stock: 15 },
          { size: 'L', color: 'Electric Cobalt', stock: 10 }
        ],
        totalStock: 92,
        status: 'Published',
        isFeatured: true,
        isNewArrival: true,
        details: [
          '480 GSM 100% Egyptian combed cotton',
          'Enzyme & mineral vintage washed',
          'Heavy-gauge double-layered hood without drawstrings',
          'Reinforced rib cuffs and hem',
          'Screen-printed with water-based electric cyan ink'
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod_cargo_02',
        name: 'SHADOW OPERATOR Modular Parachute Pants',
        slug: 'shadow-operator-modular-parachute-pants',
        description: 'Multi-pocket tactical streetwear pants constructed from durable high-density nylon ripstop with weather-resistant coating. Features adjustable magnetic snap straps, articulated knee darts, and shock-cord bungee ankle toggles.',
        price: 2200,
        salePrice: 1950,
        category: 'Pants & Cargos',
        collection: 'District Cyber 20',
        images: ['/src/assets/images/product_cargo_pants_1791725327850.jpg'],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Matte Black', 'Shadow Slate'],
        variants: [
          { size: 'S', color: 'Matte Black', stock: 14 },
          { size: 'M', color: 'Matte Black', stock: 20 },
          { size: 'L', color: 'Matte Black', stock: 16 },
          { size: 'XL', color: 'Matte Black', stock: 6 },
          { size: 'M', color: 'Shadow Slate', stock: 12 },
          { size: 'L', color: 'Shadow Slate', stock: 8 }
        ],
        totalStock: 76,
        status: 'Published',
        isFeatured: true,
        isNewArrival: false,
        details: [
          'High-density 240 GSM water-repellent nylon ripstop',
          '6 modular utility cargo compartments with waterproof zippers',
          'Built-in quick-release cobra webbing belt',
          'Elasticated ankle cuffs with electric blue toggle locks',
          'Relaxed tapered silhouette'
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod_tee_03',
        name: 'ELECTRIC CHAOS 280GSM Boxy Graphic Tee',
        slug: 'electric-chaos-280gsm-boxy-graphic-tee',
        description: 'The definitive Gen Z streetwear tee. 280 GSM heavyweight jersey woven in Alexandria from long-staple Egyptian cotton. Relaxed dropped-shoulder boxy cut with ribbed crewneck collar and cyber-circuit electric cyan print.',
        price: 1250,
        salePrice: 990,
        category: 'T-Shirts & Tops',
        collection: 'Electric Mirage',
        images: ['/src/assets/images/product_acid_tee_1791725337324.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Vintage Stone Charcoal', 'Chalk White'],
        variants: [
          { size: 'XS', color: 'Vintage Stone Charcoal', stock: 10 },
          { size: 'S', color: 'Vintage Stone Charcoal', stock: 25 },
          { size: 'M', color: 'Vintage Stone Charcoal', stock: 35 },
          { size: 'L', color: 'Vintage Stone Charcoal', stock: 30 },
          { size: 'XL', color: 'Vintage Stone Charcoal', stock: 15 },
          { size: 'XXL', color: 'Vintage Stone Charcoal', stock: 8 },
          { size: 'M', color: 'Chalk White', stock: 20 },
          { size: 'L', color: 'Chalk White', stock: 15 }
        ],
        totalStock: 158,
        status: 'Published',
        isFeatured: true,
        isNewArrival: true,
        details: [
          '280 GSM heavyweight carded Egyptian cotton',
          'Single jersey knit with acid stone wash finish',
          'Oversized boxy streetwear drape',
          'High 1.25" thick ribbed collar that holds shape',
          'Distressed screenprint graphic in cyan 01'
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod_bag_04',
        name: 'TACTICAL RIG Ballistic Crossbody Bag',
        slug: 'tactical-rig-ballistic-crossbody-bag',
        description: 'Multi-configuration industrial chest rig and crossbody bag made from 1000D Cordura nylon. Equipped with matte black anodized hardware, electric blue tactical webbing, and dual zippered organizing pockets.',
        price: 1600,
        salePrice: 1400,
        category: 'Accessories & Bags',
        collection: 'District Cyber 20',
        images: ['/src/assets/images/product_crossbody_bag_1791725347793.jpg'],
        sizes: ['One Size'],
        colors: ['Stealth Black', 'Electric Blue Accent'],
        variants: [
          { size: 'One Size', color: 'Stealth Black', stock: 45 },
          { size: 'One Size', color: 'Electric Blue Accent', stock: 30 }
        ],
        totalStock: 75,
        status: 'Published',
        isFeatured: true,
        isNewArrival: true,
        details: [
          '1000D ballistic nylon exterior shell',
          'YKK Aquaguard weather-sealed dual zippers',
          'Modular chest harness convertibility',
          'Padded air-mesh back panel for heat ventilation',
          'Custom laser-etched KAIRØ zinc alloy buckles'
        ],
        createdAt: new Date().toISOString()
      }
    ],
    orders: [],
    discounts: [
      { id: 'disc_genz15', code: 'GENZ15', percentage: 15, minSpend: 1000, isActive: true, usedCount: 14 },
      { id: 'disc_welcome10', code: 'WELCOME10', percentage: 10, minSpend: 500, isActive: true, usedCount: 38 },
      { id: 'disc_district20', code: 'DISTRICT20', percentage: 20, minSpend: 2500, isActive: true, usedCount: 7 }
    ],
    settings: {
      brandName: 'KAIRØ DISTRICT',
      brandSlogan: 'Raw Architectural Streetwear Crafted from Egyptian Heavyweight Cotton',
      logoText: 'KAIRØ // 20',
      announcementBar: '⚡ SS26 DROP 01 LIVE · FREE SHIPPING IN EGYPT OVER EGP 2,500 · CAIRO SAME-DAY DELIVERY',
      heroHeadline: 'DISTRICT CYBER 20 // SS26',
      heroSubheadline: 'Engineered heavyweight garments tailored for underground night culture. Handcrafted in Egypt from 480GSM combed cotton with industrial finishes.',
      promoBannerTitle: 'THE ARCHITECTURAL CUT',
      promoBannerSubtitle: 'Every piece is produced in strictly limited runs of 100 units. No re-stocks. Never mass produced.',
      currency: 'EGP',
      supportPhone: '+20 100 892 4410',
      supportEmail: 'contact@kairodistrict.com',
      address: 'Zamalek District, Cairo, Egypt',
      shippingRates: {
        cairoGiza: 60,
        alexandria: 75,
        deltaCanal: 85,
        upperEgypt: 110,
        freeShippingThreshold: 2500
      },
      whatsappIntegrationConfigured: false,
      resendIntegrationConfigured: false
    },
    notifications: [],
    subscribers: []
  };
}

class StoreDB {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('[DB] Failed reading database.json, initializing defaults:', err);
    }
    const initial = getInitialData();
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave: DatabaseSchema) {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('[DB] Failed writing database.json:', err);
    }
  }

  public get<K extends keyof DatabaseSchema>(key: K): DatabaseSchema[K] {
    return this.data[key];
  }

  public update<K extends keyof DatabaseSchema>(key: K, value: DatabaseSchema[K]): void {
    this.data[key] = value;
    this.saveData(this.data);
  }

  public mutate(fn: (data: DatabaseSchema) => void): void {
    fn(this.data);
    this.saveData(this.data);
  }

  public getAll(): DatabaseSchema {
    return this.data;
  }
}

export const db = new StoreDB();
