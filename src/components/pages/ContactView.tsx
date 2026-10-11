import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const ContactView: React.FC = () => {
  const { settings } = useStore();
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setFormName('');
    setFormEmail('');
    setFormMessage('');
  };

  return (
    <div className="py-16 bg-[#090a0f] text-slate-300 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono text-[#00f0ff] uppercase tracking-widest block">
            CLIENT CONCIERGE & ATELIER
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            Connect With The District
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Inquiries regarding sizing, private appointments at our Zamalek showroom, or custom styling requests.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Details */}
          <div className="space-y-6 p-6 bg-[#0e111a] border border-[#1d2334] rounded-2xl">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-[#00f0ff]">
              Direct Channels
            </h3>

            <div className="space-y-4 text-xs font-mono">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#00f0ff] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Atelier Location</strong>
                  <span className="text-slate-400">{settings.address || 'Zamalek District, Cairo, Egypt'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#0066ff] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">WhatsApp & Hotline</strong>
                  <span className="text-slate-400">{settings.supportPhone || '+20 100 892 4410'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#00f0ff] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Electronic Mail</strong>
                  <span className="text-slate-400">{settings.supportEmail || 'contact@kairodistrict.com'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#121624] rounded-xl border border-[#212b3e] text-xs text-slate-300 space-y-1 font-mono">
              <p className="text-white font-bold">14-Day Exchanges Across Egypt:</p>
              <p className="text-slate-400 text-[11px]">
                Need a size exchange between S, M, L, or XL? Our courier will deliver your replacement and collect the original directly at your doorstep anywhere in Egypt.
              </p>
            </div>
          </div>

          {/* Message Form */}
          <div className="p-6 bg-[#0e111a] border border-[#1d2334] rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Send An Inquiry
            </h3>

            {sent ? (
              <div className="p-4 bg-emerald-950/40 border border-emerald-600/40 rounded-xl text-center space-y-2">
                <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-white">Message Dispatched</p>
                <p className="text-[11px] text-slate-400">
                  Our Cairo team will reply within 4 working hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-mono">Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-mono">Email</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-mono">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={formMessage}
                    onChange={e => setFormMessage(e.target.value)}
                    placeholder="Inquire about sizing, drops, or private showroom visits..."
                    className="w-full bg-[#121624] border border-[#232b3e] rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#0066ff] hover:bg-[#0052cc] text-white font-bold uppercase tracking-wider rounded-xl transition-colors shadow-lg active:scale-95"
                >
                  Send Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
