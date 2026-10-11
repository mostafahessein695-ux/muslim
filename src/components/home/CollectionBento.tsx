import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface CollectionBentoProps {
  onSelectCategory: (categoryName: string) => void;
}

export const CollectionBento: React.FC<CollectionBentoProps> = ({ onSelectCategory }) => {
  const collections = [
    {
      title: '480GSM Hoodies',
      category: 'Hoodies & Sweatshirts',
      subtitle: 'Unbrushed Egyptian Combed Cotton',
      image: '/src/assets/images/product_hoodie_heavyweight_1791725317370.jpg',
      aspect: 'col-span-1 md:col-span-2'
    },
    {
      title: 'Modular Cargos',
      category: 'Pants & Cargos',
      subtitle: 'Ripstop & Tactical Straps',
      image: '/src/assets/images/product_cargo_pants_1791725327850.jpg',
      aspect: 'col-span-1'
    },
    {
      title: 'Acid Wash Tops',
      category: 'T-Shirts & Tops',
      subtitle: '280GSM Heavy Boxy Cut',
      image: '/src/assets/images/product_acid_tee_1791725337324.jpg',
      aspect: 'col-span-1'
    },
    {
      title: 'Tactical Rigs & Bags',
      category: 'Accessories & Bags',
      subtitle: '1000D Ballistic Cordura',
      image: '/src/assets/images/product_crossbody_bag_1791725347793.jpg',
      aspect: 'col-span-1 md:col-span-2'
    }
  ];

  return (
    <section className="py-20 bg-[#06080d] border-b border-[#1b1f2e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="text-xs font-mono text-[#00f0ff] uppercase tracking-widest block mb-1">
            ARCHITECTURAL SILHOUETTES
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
            Curated Categories
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.map(item => (
            <div
              key={item.title}
              onClick={() => onSelectCategory(item.category)}
              className={`group relative h-72 sm:h-84 overflow-hidden rounded-xl border border-[#1d2232] cursor-pointer ${item.aspect}`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter brightness-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/40 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <span className="text-[11px] font-mono text-[#00f0ff] tracking-wider uppercase block mb-1">
                    {item.subtitle}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight group-hover:text-[#00f0ff] transition-colors">
                    {item.title}
                  </h3>
                </div>

                <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-[#0066ff] text-white flex items-center justify-center backdrop-blur-md transition-colors shrink-0">
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
