import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, Collection, StoreSettings } from '../types';

interface StoreContextType {
  settings: StoreSettings;
  products: Product[];
  categories: Category[];
  collections: Collection[];
  isLoading: boolean;
  refreshProducts: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedCollection: string;
  setSelectedCollection: (col: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (prod: Product | null) => void;
}

const defaultSettings: StoreSettings = {
  brandName: 'KAIRØ DISTRICT',
  brandSlogan: 'Raw Architectural Streetwear Crafted from Egyptian Heavyweight Cotton',
  logoText: 'KAIRØ // 20',
  announcementBar: '⚡ SS26 DROP 01 LIVE · FREE SHIPPING IN EGYPT OVER EGP 2,500 · SAME-DAY DISPATCH IN CAIRO',
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
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCollection, setSelectedCollection] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchTaxonomies = async () => {
    try {
      const [catsRes, colsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/collections')
      ]);
      if (catsRes.ok) setCategories(await catsRes.json());
      if (colsRes.ok) setCollections(await colsRes.json());
    } catch (err) {
      console.error('Error fetching categories/collections:', err);
    }
  };

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await Promise.all([fetchSettings(), fetchProducts(), fetchTaxonomies()]);
      setIsLoading(false);
    }
    init();
  }, []);

  return (
    <StoreContext.Provider
      value={{
        settings,
        products,
        categories,
        collections,
        isLoading,
        refreshProducts: fetchProducts,
        refreshSettings: fetchSettings,
        selectedCategory,
        setSelectedCategory,
        selectedCollection,
        setSelectedCollection,
        searchQuery,
        setSearchQuery,
        quickViewProduct,
        setQuickViewProduct
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
