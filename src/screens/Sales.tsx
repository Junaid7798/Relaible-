import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../components/Button';

export default function Sales() {
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UDHARI'>('CASH');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [saleData, setSaleData] = useState({ customer: '', qty: '', price: '' });
  
  const [queue, setQueue] = useState([
    { id: 'q1', num: '01', plate: 'MH-12-AB-9281', desc: 'M-Sand • 6 Brass', wait: '14M', highlight: false },
    { id: 'q2', num: '02', plate: 'MH-14-MX-0045', desc: 'G-1 Aggregate • 4 Brass', wait: '08M', highlight: true },
    { id: 'q3', num: '03', plate: 'MH-12-Z-4411', desc: 'Blue Metal • 5 Brass', wait: '02M', highlight: false }
  ]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleData.customer || !saleData.qty || !saleData.price) return;
    
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    setIsGenerated(true);
    setSaleData({ customer: '', qty: '', price: '' });
    setTimeout(() => setIsGenerated(false), 3000);
  };

  const handleDragEnd = (event: any, info: any, id: string) => {
    if (info.offset.x > 100 || info.offset.x < -100) {
      setQueue(prev => prev.filter(q => q.id !== id));
    }
  };

  const isFormValid = saleData.customer !== '' && saleData.qty !== '' && saleData.price !== '';

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 overflow-x-hidden pb-8">
      {/* Metrics Bar (Asymmetric Top Row) */}
      <section className="md:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-primary text-on-primary p-6 md:p-8 rounded-2xl flex flex-col justify-between h-36 relative overflow-hidden shadow-floating">
          <div className="absolute -right-4 -bottom-4 opacity-10 mix-blend-overlay">
            <span className="material-symbols-outlined text-9xl">payments</span>
          </div>
          <p className="text-white/70 font-semibold text-[13px] uppercase tracking-wider z-10">Cash in Hand</p>
          <h2 className="text-4xl font-bold tracking-tight leading-none mt-2 z-10">₹48,250<span className="text-2xl text-white/70">.00</span></h2>
        </div>
        <div className="bg-surface p-6 md:p-8 rounded-2xl flex flex-col justify-between h-36 border border-border shadow-card">
          <p className="text-text-muted font-semibold text-[13px] uppercase tracking-wider">Pending Receipts</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h2 className="text-4xl font-bold text-accent tracking-tight leading-none">{queue.length}</h2>
            <span className="text-text-muted text-[14px] font-medium uppercase tracking-wider">Trucks</span>
          </div>
        </div>
        <div className="bg-surface p-6 md:p-8 rounded-2xl flex flex-col justify-between h-36 border border-border shadow-card">
          <p className="text-text-muted font-semibold text-[13px] uppercase tracking-wider">Today's Volume</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h2 className="text-4xl font-bold text-text-main tracking-tight leading-none">240</h2>
            <span className="text-text-muted text-[14px] font-medium uppercase tracking-wider">Brass</span>
          </div>
        </div>
      </section>

      {/* Main Transaction Grid */}
      <div className="md:col-span-7 space-y-6">
        {/* New Customer Sale Form */}
        <section className="bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-card relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
            </div>
            <h3 className="font-bold text-2xl tracking-tight text-text-main">New Party Sale</h3>
          </div>
          <form className="space-y-6" onSubmit={handleGenerate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Search Party / Customer</label>
                <div className="relative">
                  <input 
                    className="w-full h-14 bg-surface-hover border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl text-[16px] font-medium placeholder:text-text-tertiary px-4 transition-all outline-none text-text-main" 
                    placeholder="Name or Phone..." 
                    type="text" 
                    value={saleData.customer}
                    onChange={e => setSaleData({...saleData, customer: e.target.value})}
                  />
                  <span className="material-symbols-outlined absolute right-4 top-4 text-text-tertiary">search</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Material</label>
                <div className="relative">
                  <select className="w-full h-14 bg-surface-hover border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl text-[16px] font-medium appearance-none px-4 transition-all outline-none text-text-main">
                    <option>G-1 Crushed Aggregate</option>
                    <option>M-Sand (Washed)</option>
                    <option>P-Sand</option>
                    <option>20mm Blue Metal</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-4 text-text-tertiary pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Qty (Brass)</label>
                <input 
                  className="w-full h-14 bg-surface-hover border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl text-xl font-bold px-4 transition-all outline-none text-text-main placeholder:text-text-tertiary" 
                  placeholder="0.00" 
                  type="number" 
                  value={saleData.qty}
                  onChange={e => setSaleData({...saleData, qty: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Unit Price</label>
                <input 
                  className="w-full h-14 bg-surface-hover border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl text-xl font-bold px-4 transition-all outline-none text-text-main placeholder:text-text-tertiary" 
                  placeholder="450" 
                  type="number" 
                  value={saleData.price}
                  onChange={e => setSaleData({...saleData, price: e.target.value})}
                />
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Payment</label>
                <div className="flex gap-2 h-14">
                  <Button 
                    variant={paymentMethod === 'CASH' ? 'primary' : 'secondary'}
                    className={`flex-1 ${paymentMethod !== 'CASH' ? 'bg-surface-hover border-border' : ''}`}
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                  >
                    Cash
                  </Button>
                  <Button 
                    variant={paymentMethod === 'UDHARI' ? 'danger' : 'secondary'}
                    className={`flex-1 ${paymentMethod !== 'UDHARI' ? 'bg-surface-hover border-border text-text-main' : 'bg-error text-white shadow-floating'}`}
                    type="button"
                    onClick={() => setPaymentMethod('UDHARI')}
                  >
                    Udhari (Credit)
                  </Button>
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-border mt-6">
              <Button 
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isGenerating}
                disabled={!isFormValid || isGenerated}
                variant={isGenerated ? "secondary" : "primary"}
                rightIcon={isGenerated ? "check" : undefined}
              >
                {isGenerated ? "Invoice Generated" : "Generate Invoice & Print"}
              </Button>
            </div>
          </form>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-6">
          <Button variant="secondary" className="h-24 flex-col gap-2 bg-surface border border-border shadow-sm hover:bg-surface-hover" size="lg">
            <span className="material-symbols-outlined text-accent text-2xl">receipt_long</span>
            <span className="text-[13px] font-semibold tracking-wide">Day End Report</span>
          </Button>
          <Button variant="secondary" className="h-24 flex-col gap-2 bg-surface border border-border shadow-sm hover:bg-surface-hover" size="lg">
            <span className="material-symbols-outlined text-primary text-2xl">account_balance_wallet</span>
            <span className="text-[13px] font-semibold tracking-wide">Petty Cash Out</span>
          </Button>
        </section>
      </div>

      {/* Awaiting Receipt Queue */}
      <div className="md:col-span-5">
        <section className="bg-surface rounded-2xl overflow-hidden flex flex-col h-full min-h-[600px] border border-border shadow-card">
          <div className="p-6 md:p-8 bg-text-main text-white flex justify-between items-center">
            <div>
              <h3 className="font-bold text-2xl tracking-tight">Awaiting Receipt</h3>
              <p className="text-[13px] text-white/60 font-semibold uppercase tracking-wider mt-1">Active Weighment Queue</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-warning text-2xl">pending_actions</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 relative custom-scrollbar">
            <AnimatePresence>
              {queue.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: -100 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.8}
                  onDragEnd={(e, info) => handleDragEnd(e, info, item.id)}
                  className={`bg-surface border p-5 rounded-xl flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer shadow-sm touch-pan-y hover:shadow-md ${item.highlight ? 'border-accent ring-1 ring-accent/20' : 'border-border'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center font-bold text-[16px] ${item.highlight ? 'bg-accent/10 text-accent' : 'bg-surface-hover text-text-muted border border-border'}`}>
                      {item.num}
                    </div>
                    <div>
                      <h4 className="font-bold text-[16px] text-text-main tracking-tight">{item.plate}</h4>
                      <p className="text-[13px] font-medium text-text-muted mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className={`text-[12px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${item.highlight ? 'bg-accent/10 text-accent' : 'bg-surface-hover text-text-muted'}`}>Wait {item.wait}</span>
                    <span className="material-symbols-outlined text-text-tertiary text-[18px] mt-1">arrow_forward_ios</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {queue.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-2 border-dashed border-border rounded-xl h-40 flex flex-col items-center justify-center text-text-muted bg-surface-hover/50"
              >
                <span className="material-symbols-outlined text-4xl mb-3 text-text-tertiary">local_shipping</span>
                <p className="text-[13px] font-semibold uppercase tracking-wider">Awaiting next truck...</p>
              </motion.div>
            )}
          </div>
          <div className="p-6 bg-surface border-t border-border">
            <Button variant="secondary" size="md" className="w-full bg-surface-hover border-border">
              View All History
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
