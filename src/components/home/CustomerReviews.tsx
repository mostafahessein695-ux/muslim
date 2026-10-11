import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';

export const CustomerReviews: React.FC = () => {
  const reviews = [
    {
      author: 'Karim N.',
      handle: '@karim_cairo',
      location: 'Zamalek, Cairo',
      product: 'CYAN HORIZON 480GSM Hoodie',
      rating: 5,
      date: 'April 2026',
      content:
        'The hood structure is ridiculous—it stays upright without drawstrings just like Yeezy Season and Balenciaga pieces. Heaviest cotton I have ever worn in Egypt. Cairo delivery arrived in under 24 hours.'
    },
    {
      author: 'Nouran E.',
      handle: '@nouran_street',
      location: 'New Cairo (Fifth Settlement)',
      product: 'ELECTRIC CHAOS 280GSM Tee',
      rating: 5,
      date: 'March 2026',
      content:
        'Finally a local streetwear brand that actually understands boxy cropped proportions instead of just slapping a graphic on a thin blank. The cyan screen print has deep saturation and hasn’t faded through 10 washes.'
    },
    {
      author: 'Tarek S.',
      handle: '@tarek.opt',
      location: 'Maadi, Cairo',
      product: 'SHADOW OPERATOR Parachute Pants',
      rating: 5,
      date: 'April 2026',
      content:
        'The magnetic cargo straps and ripstop material are insane in person. Wore them to a rave in Dahab and got asked about them 15 times. Quality easily matches ACRONYM or Represent.'
    }
  ];

  return (
    <section className="py-20 bg-[#06080e] border-b border-[#1b1f2e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-mono text-[#00f0ff] uppercase tracking-widest block mb-1">
              VERIFIED TASTEMAKERS
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
              Community Field Reports
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <span>4.9 / 5.0 RATING (240+ REVIEWS)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-[#0b0e17] border border-[#1a2030] rounded-xl p-6 flex flex-col justify-between hover:border-[#2f3954] transition-colors"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Buyer</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  "{rev.content}"
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#161c2a] flex items-center justify-between text-xs">
                <div>
                  <h4 className="text-white font-bold">{rev.author}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">{rev.location}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-[#00f0ff] font-medium block truncate max-w-[130px]">
                    {rev.product}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{rev.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
