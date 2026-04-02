import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../components/Button';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'system' | 'local'>('system');
  const [isReordering, setIsReordering] = useState(false);
  const [reorderSuccess, setReorderSuccess] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const [alerts, setAlerts] = useState([
    { id: 'a1', type: 'error', title: 'Critical Low', desc: 'GBS 40MM below safety threshold', icon: 'warning' },
    { id: 'a2', type: 'success', title: 'Surplus Detected', desc: 'VSI 20MM optimization required', icon: 'trending_up' }
  ]);

  const handleReorderClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmReorder = async () => {
    setIsReordering(true);
    setReorderSuccess(false);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsReordering(false);
    setReorderSuccess(true);
    setShowConfirmDialog(false);
    setTimeout(() => setReorderSuccess(false), 3000);
  };

  const handleCancelReorder = () => {
    setShowConfirmDialog(false);
  };

  const handleDragEnd = (event: any, info: any, id: string) => {
    if (info.offset.x > 100 || info.offset.x < -100) {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }
  };

  return (
    <div className="space-y-8 relative overflow-x-hidden pb-8">
      {/* Confirmation Dialog Overlay / Bottom Sheet */}
      <AnimatePresence>
        {showConfirmDialog && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-sm"
              onClick={handleCancelReorder}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 w-full z-50 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 md:w-full md:max-w-md"
            >
              <div className="bg-surface border-t md:border border-border p-6 md:p-8 rounded-t-[24px] md:rounded-[24px] shadow-modal pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:pb-8">
                <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6 md:hidden" />
                <div className="flex items-center gap-3 mb-4 text-error">
                  <div className="w-10 h-10 rounded-full bg-error-bg flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">warning</span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-text-main">Confirm Bulk Reorder</h3>
                </div>
                <p className="text-text-muted text-[15px] mb-8 leading-relaxed">
                  You are about to issue a bulk reorder for all critical and low-stock supplies. This action will generate purchase orders automatically and cannot be undone.
                </p>
                <div className="flex flex-col md:flex-row gap-3 justify-end">
                  <Button 
                    variant="ghost" 
                    onClick={handleCancelReorder}
                    className="w-full md:w-auto"
                    disabled={isReordering}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={handleConfirmReorder}
                    className="w-full md:w-auto"
                    isLoading={isReordering}
                  >
                    {isReordering ? "Reordering..." : "Confirm Reorder"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-accent font-semibold tracking-wider text-[13px] uppercase">
            <span className="material-symbols-outlined text-[16px]">inventory_2</span>
            Master Logistics
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-text-main leading-none">Inventory & Pricing</h2>
        </div>
        {/* Pricing Master Toggle */}
        <div className="bg-surface-hover p-1 rounded-xl flex items-center gap-1 self-start w-full md:w-auto border border-border">
          <Button 
            variant={activeTab === 'system' ? 'primary' : 'ghost'} 
            size="sm"
            className="flex-1 md:flex-none"
            onClick={() => setActiveTab('system')}
          >
            System Price
          </Button>
          <Button 
            variant={activeTab === 'local' ? 'primary' : 'ghost'} 
            size="sm"
            className="flex-1 md:flex-none"
            onClick={() => setActiveTab('local')}
          >
            Local Override
          </Button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Current Stock Levels - Large Block */}
        <section className="md:col-span-8 bg-surface rounded-2xl p-6 md:p-8 overflow-hidden relative shadow-card border border-border">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-bold text-text-main tracking-tight">Live Stock Volume</h3>
              <p className="text-text-muted text-[14px] font-medium mt-1">Real-time aggregate across all pits</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <span className="material-symbols-outlined text-[20px]">bar_chart</span>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stock Card */}
            <div className="bg-surface-hover p-5 rounded-xl space-y-4 border border-border">
              <div className="flex justify-between items-center">
                <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">VSI 20MM</span>
                <span className="material-symbols-outlined text-text-tertiary text-[18px]">layers</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-text-main">4,280<span className="text-[13px] ml-1 text-text-muted font-medium">T</span></div>
                <div className="w-full bg-border h-1.5 mt-3 rounded-full overflow-hidden">
                  <div className="bg-success h-full w-[85%] rounded-full"></div>
                </div>
              </div>
            </div>
            {/* Stock Card */}
            <div className="bg-surface-hover p-5 rounded-xl space-y-4 border border-border">
              <div className="flex justify-between items-center">
                <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Stone Dust</span>
                <span className="material-symbols-outlined text-text-tertiary text-[18px]">texture</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-text-main">1,150<span className="text-[13px] ml-1 text-text-muted font-medium">T</span></div>
                <div className="w-full bg-border h-1.5 mt-3 rounded-full overflow-hidden">
                  <div className="bg-warning h-full w-[40%] rounded-full"></div>
                </div>
              </div>
            </div>
            {/* Stock Card */}
            <div className="bg-error-bg p-5 rounded-xl space-y-4 border border-error/20">
              <div className="flex justify-between items-center">
                <span className="text-[12px] font-semibold text-error uppercase tracking-wider">GBS 40MM</span>
                <span className="material-symbols-outlined text-error text-[18px]">grid_view</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-error">940<span className="text-[13px] ml-1 text-error/70 font-medium">T</span></div>
                <div className="w-full bg-error/20 h-1.5 mt-3 rounded-full overflow-hidden">
                  <div className="bg-error h-full w-[15%] rounded-full"></div>
                </div>
              </div>
            </div>
            {/* Stock Card */}
            <div className="bg-surface-hover p-5 rounded-xl space-y-4 border border-border">
              <div className="flex justify-between items-center">
                <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Crushed 10MM</span>
                <span className="material-symbols-outlined text-text-tertiary text-[18px]">grain</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-text-main">2,800<span className="text-[13px] ml-1 text-text-muted font-medium">T</span></div>
                <div className="w-full bg-border h-1.5 mt-3 rounded-full overflow-hidden">
                  <div className="bg-success h-full w-[65%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions / Status - Small Block */}
        <section className="md:col-span-4 bg-primary rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-floating">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Stock Alerts</h3>
            </div>
            <div className="space-y-3 relative">
              <AnimatePresence>
                {alerts.map(alert => (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: -50 }}
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.8}
                    onDragEnd={(e, info) => handleDragEnd(e, info, alert.id)}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 touch-pan-y"
                  >
                    <span className={`material-symbols-outlined text-[20px] ${alert.type === 'error' ? 'text-error' : 'text-success'}`}>{alert.icon}</span>
                    <div>
                      <div className="text-[14px] font-bold text-white tracking-tight">{alert.title}</div>
                      <div className="text-[13px] text-white/60 mt-0.5">{alert.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {alerts.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 text-center text-white/50 border border-dashed border-white/20 rounded-xl"
                >
                  <p className="text-[13px] font-semibold uppercase tracking-wider">No active alerts</p>
                </motion.div>
              )}
            </div>
          </div>
          <Button 
            className="w-full mt-8 bg-white text-primary hover:bg-surface-hover shadow-none" 
            size="lg" 
            isLoading={isReordering}
            disabled={reorderSuccess}
            onClick={handleReorderClick}
          >
            {isReordering ? "Reordering..." : reorderSuccess ? "Reordered" : "Reorder Supplies"}
          </Button>
        </section>

        {/* Material Pricing Master - Wide Block */}
        <section className="md:col-span-12 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <span className="material-symbols-outlined text-[20px]">sell</span>
              </div>
              <h3 className="text-xl font-bold text-text-main tracking-tight">Material Pricing Master</h3>
              <span className="px-2.5 py-1 bg-success-bg text-success rounded-full text-[11px] font-bold uppercase tracking-wider hidden sm:block ml-2">Active Market</span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="md" className="w-11 h-11 p-0 rounded-full">
                <span className="material-symbols-outlined text-[20px]">filter_list</span>
              </Button>
              <Button variant="secondary" size="md" className="w-11 h-11 p-0 rounded-full">
                <span className="material-symbols-outlined text-[20px]">download</span>
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pricing Card: VSI 20mm */}
            <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden hover:shadow-floating transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-surface-hover rounded-xl flex items-center justify-center text-text-tertiary">
                    <span className="material-symbols-outlined">diamond</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Current System</div>
                    <div className="text-2xl font-bold text-text-main mt-1">₹840.00 <span className="text-[14px] text-text-muted font-medium">/T</span></div>
                  </div>
                </div>
                <h4 className="text-[16px] font-bold text-text-main tracking-tight mb-5">VSI 20MM (Crushed)</h4>
                <div className="space-y-3 pt-5 border-t border-border">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-text-muted font-medium">Local Override</span>
                    <span className="text-text-main font-bold">₹865.00</span>
                  </div>
                  <div className="flex justify-between text-[14px]">
                    <span className="text-text-muted font-medium">Margin Gap</span>
                    <span className="text-success font-bold bg-success-bg px-2 py-0.5 rounded-md">+2.9%</span>
                  </div>
                  <div className="flex justify-between text-[14px]">
                    <span className="text-text-muted font-medium">Last Modified</span>
                    <span className="text-text-main">12h ago</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Pricing Card: Stone Dust */}
            <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden hover:shadow-floating transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-surface-hover rounded-xl flex items-center justify-center text-text-tertiary">
                    <span className="material-symbols-outlined">grain</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Current System</div>
                    <div className="text-2xl font-bold text-text-main mt-1">₹450.00 <span className="text-[14px] text-text-muted font-medium">/T</span></div>
                  </div>
                </div>
                <h4 className="text-[16px] font-bold text-text-main tracking-tight mb-5">Fine Stone Dust</h4>
                <div className="space-y-3 pt-5 border-t border-border">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-text-muted font-medium">Local Override</span>
                    <span className="text-text-tertiary font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">lock</span> Locked
                    </span>
                  </div>
                  <div className="flex justify-between text-[14px]">
                    <span className="text-text-muted font-medium">Margin Gap</span>
                    <span className="text-text-main font-bold bg-surface-hover px-2 py-0.5 rounded-md">0.0%</span>
                  </div>
                  <div className="flex justify-between text-[14px]">
                    <span className="text-text-muted font-medium">Last Modified</span>
                    <span className="text-text-main">2d ago</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Pricing Card: GBS 40mm */}
            <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden hover:shadow-floating transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-surface-hover rounded-xl flex items-center justify-center text-text-tertiary">
                    <span className="material-symbols-outlined">square</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Current System</div>
                    <div className="text-2xl font-bold text-text-main mt-1">₹920.00 <span className="text-[14px] text-text-muted font-medium">/T</span></div>
                  </div>
                </div>
                <h4 className="text-[16px] font-bold text-text-main tracking-tight mb-5">GBS 40MM Sub-Base</h4>
                <div className="space-y-3 pt-5 border-t border-border">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-text-muted font-medium">Local Override</span>
                    <span className="text-text-main font-bold">₹890.00</span>
                  </div>
                  <div className="flex justify-between text-[14px]">
                    <span className="text-text-muted font-medium">Margin Gap</span>
                    <span className="text-error font-bold bg-error-bg px-2 py-0.5 rounded-md">-3.2%</span>
                  </div>
                  <div className="flex justify-between text-[14px]">
                    <span className="text-text-muted font-medium">Last Modified</span>
                    <span className="text-text-main">5h ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Data Context */}
        <section className="md:col-span-12 flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-surface rounded-2xl p-6 md:p-8 flex items-center gap-6 border border-border shadow-sm">
            <img 
              alt="Machinery detail" 
              className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover grayscale opacity-80" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAss0Jxmvx2PnT2hKkC6B5ojrkEoNSF-Iry9DOo0X_Jx-slurBerCSOePT7IgLRCve-1l1AJF1dJ3oVP6S07PtSEytiPhlYignKCfdSkgU-7ueomCU3gm0zS980UItc9bSZr2PWpPyQwqVUVj3GENhL-8JdFEeVGIq0-ocdTgV-hvsRdCEhti4SCK-wK4a7h0SWC1jxpPbk2vhRYjdWct8wnyVQMOhGVVZ1iPojg3KsQlTOk47coDJsazoYoikasFJ6cmsubN3IHM"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
            <div>
              <h4 className="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-2">Production Efficiency</h4>
              <p className="text-[14px] text-text-main max-w-sm leading-relaxed">Pricing is automatically weighted against daily fuel costs and electricity tariffs synced at 06:00 IST.</p>
            </div>
          </div>
          <div className="md:w-72 bg-accent/10 rounded-2xl p-6 md:p-8 flex flex-col justify-center items-center text-center border border-accent/20">
            <div className="text-accent font-bold text-4xl md:text-5xl tracking-tight">98%</div>
            <div className="text-[12px] font-semibold text-accent/80 uppercase tracking-wider mt-2">Data Accuracy</div>
          </div>
        </section>
      </div>
    </div>
  );
}
