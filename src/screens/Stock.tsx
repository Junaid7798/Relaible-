import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../components/Button';

export default function Stock() {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productionData, setProductionData] = useState({
    material: 'VSI 20MM',
    qty: '',
    date: new Date().toISOString().split('T')[0],
    shift: 'Day Shift',
    notes: ''
  });

  const handleLogProduction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productionData.qty) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setShowForm(false);
    setProductionData({
      material: 'VSI 20MM',
      qty: '',
      date: new Date().toISOString().split('T')[0],
      shift: 'Day Shift',
      notes: ''
    });
  };

  return (
    <div className="space-y-8 overflow-x-hidden pb-8">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-accent font-semibold tracking-wider text-[13px] uppercase">
            <span className="material-symbols-outlined text-[16px]">inventory</span>
            Operations / Inventory
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-text-main leading-none">Stock Management</h2>
        </div>
        <Button 
          variant={showForm ? "secondary" : "primary"} 
          size="md" 
          leftIcon={showForm ? "close" : "add"}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Log Production"}
        </Button>
      </section>

      <AnimatePresence>
        {showForm && (
          <motion.section 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-card mb-8">
              <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">precision_manufacturing</span>
                </div>
                <h3 className="font-bold text-xl tracking-tight text-text-main">Log Plant Production</h3>
              </div>
              
              <form onSubmit={handleLogProduction} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Material</label>
                    <div className="relative">
                      <select 
                        className="w-full h-14 bg-surface-hover border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl text-[16px] font-medium appearance-none px-4 transition-all outline-none text-text-main"
                        value={productionData.material}
                        onChange={e => setProductionData({...productionData, material: e.target.value})}
                      >
                        <option>VSI 20MM</option>
                        <option>10MM Aggregate</option>
                        <option>Crush Sand</option>
                        <option>Dust</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-4 text-text-tertiary pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Quantity Produced (Brass)</label>
                    <input 
                      type="number"
                      className="w-full h-14 bg-surface-hover border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl text-xl font-bold px-4 transition-all outline-none text-text-main placeholder:text-text-tertiary" 
                      placeholder="0.00"
                      value={productionData.qty}
                      onChange={e => setProductionData({...productionData, qty: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Date</label>
                    <input 
                      type="date"
                      className="w-full h-14 bg-surface-hover border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl text-[16px] font-medium px-4 transition-all outline-none text-text-main" 
                      value={productionData.date}
                      onChange={e => setProductionData({...productionData, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Shift</label>
                    <div className="relative">
                      <select 
                        className="w-full h-14 bg-surface-hover border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl text-[16px] font-medium appearance-none px-4 transition-all outline-none text-text-main"
                        value={productionData.shift}
                        onChange={e => setProductionData({...productionData, shift: e.target.value})}
                      >
                        <option>Day Shift</option>
                        <option>Night Shift</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-4 text-text-tertiary pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Notes</label>
                    <input 
                      type="text"
                      className="w-full h-14 bg-surface-hover border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl text-[16px] font-medium px-4 transition-all outline-none text-text-main placeholder:text-text-tertiary" 
                      placeholder="Optional notes..."
                      value={productionData.notes}
                      onChange={e => setProductionData({...productionData, notes: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" size="lg" isLoading={isSubmitting} rightIcon="check">
                    Save Production
                  </Button>
                </div>
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Plant Stock */}
      <section>
        <h3 className="font-bold text-xl tracking-tight text-text-main mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">factory</span>
          Plant Aggregates
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'VSI 20MM', stock: '4,280', unit: 'Brass', trend: '+120 today', color: 'bg-primary text-white', icon: 'diamond' },
            { name: '10MM Aggregate', stock: '2,800', unit: 'Brass', trend: '+80 today', color: 'bg-surface border border-border', icon: 'grain' },
            { name: 'Crush Sand', stock: '1,150', unit: 'Brass', trend: '-45 today', color: 'bg-surface border border-border', icon: 'texture' },
            { name: 'Dust', stock: '940', unit: 'Brass', trend: 'Low Stock', color: 'bg-error-bg border border-error/20 text-error', icon: 'blur_on' },
          ].map((item, i) => (
            <div key={i} className={`p-6 rounded-2xl shadow-sm flex flex-col justify-between h-40 ${item.color}`}>
              <div className="flex justify-between items-start">
                <span className="text-[13px] font-bold uppercase tracking-wider opacity-80">{item.name}</span>
                <span className="material-symbols-outlined opacity-80">{item.icon}</span>
              </div>
              <div>
                <div className="text-3xl font-bold tracking-tight">{item.stock} <span className="text-[14px] font-medium opacity-80">{item.unit}</span></div>
                <div className="text-[12px] font-semibold uppercase tracking-wider mt-2 opacity-80">{item.trend}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Retail Stock */}
      <section>
        <h3 className="font-bold text-xl tracking-tight text-text-main mb-4 flex items-center gap-2 mt-8">
          <span className="material-symbols-outlined text-accent">storefront</span>
          Retail Shop 1
        </h3>
        <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-surface-hover/50 text-[13px] text-text-muted font-semibold uppercase tracking-wider border-b border-border">
                <th className="p-5">Product</th>
                <th className="p-5">Opening</th>
                <th className="p-5">Added</th>
                <th className="p-5">Sold</th>
                <th className="p-5 text-right">Closing Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-surface-hover transition-colors">
                <td className="p-5 font-bold text-text-main">UltraTech Cement</td>
                <td className="p-5 text-text-muted">450 Bags</td>
                <td className="p-5 text-success font-medium">+200</td>
                <td className="p-5 text-error font-medium">-120</td>
                <td className="p-5 text-right font-bold text-text-main text-lg">530 <span className="text-[13px] text-text-muted font-medium">Bags</span></td>
              </tr>
              <tr className="hover:bg-surface-hover transition-colors">
                <td className="p-5 font-bold text-text-main">Red Bricks</td>
                <td className="p-5 text-text-muted">12,000 Pcs</td>
                <td className="p-5 text-success font-medium">0</td>
                <td className="p-5 text-error font-medium">-4,500</td>
                <td className="p-5 text-right font-bold text-text-main text-lg">7,500 <span className="text-[13px] text-text-muted font-medium">Pcs</span></td>
              </tr>
              <tr className="hover:bg-surface-hover transition-colors">
                <td className="p-5 font-bold text-text-main">River Sand</td>
                <td className="p-5 text-text-muted">45 Brass</td>
                <td className="p-5 text-success font-medium">+10</td>
                <td className="p-5 text-error font-medium">-8</td>
                <td className="p-5 text-right font-bold text-text-main text-lg">47 <span className="text-[13px] text-text-muted font-medium">Brass</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
