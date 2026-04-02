import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../components/Button';

export default function Dashboard() {
  const [isResolving, setIsResolving] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [alerts, setAlerts] = useState([
    { id: 'alert-1', type: 'error', title: 'Weight Variance: MH-12-KP-5022', desc: 'Load Out: 6 Brass (24.5T) | Gate In: 5 Brass (21.2T)', icon: 'scale' },
    { id: 'alert-2', type: 'warning', title: 'Idle Timeout: MH-14-DT-1180', desc: 'Stationary for 45 minutes at Sector 4', icon: 'timer_off' }
  ]);

  const handleResolve = async (id: string) => {
    if (id === 'alert-1') {
      setIsResolving(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsResolving(false);
      setIsResolved(true);
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== id));
      }, 1000);
    } else {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleDragEnd = (event: any, info: any, id: string) => {
    if (info.offset.x > 100 || info.offset.x < -100) {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }
  };

  return (
    <div className="space-y-10 overflow-x-hidden pb-8">
      {/* Hero Metrics: Bento Layout */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        {/* Main Revenue Card */}
        <div className="md:col-span-6 lg:col-span-4 bg-surface p-6 md:p-8 flex flex-col justify-between min-h-[200px] rounded-2xl shadow-card border border-border">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wider text-text-muted mb-2">Today's Revenue</p>
            <h2 className="text-4xl md:text-5xl font-bold text-text-main tracking-tight leading-none">₹1,42,850</h2>
          </div>
          <div className="flex items-center gap-2 mt-6 text-success font-medium bg-success-bg/50 w-fit px-3 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-[18px]">trending_up</span>
            <span className="text-[13px]">+12.4% from yesterday</span>
          </div>
        </div>
        
        {/* Cash in Hand */}
        <div className="md:col-span-6 lg:col-span-4 bg-primary text-on-primary p-6 md:p-8 flex flex-col justify-between min-h-[200px] relative overflow-hidden rounded-2xl shadow-floating">
          <div className="z-10">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-primary-hover mb-2 text-white/70">Cash in Hand</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-none">₹84,500</h2>
          </div>
          <div className="z-10 flex items-center gap-2 mt-6 text-white/90 font-medium bg-white/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm">
            <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            <span className="text-[13px]">Pending Closing</span>
          </div>
          {/* Decorative Element */}
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[160px]">payments</span>
          </div>
        </div>
        
        {/* Outstanding Credit */}
        <div className="md:col-span-12 lg:col-span-4 bg-error-bg p-6 md:p-8 flex flex-col justify-between min-h-[200px] rounded-2xl shadow-card border border-error/20">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wider text-error/80 mb-2">Outstanding Credit</p>
            <h2 className="text-4xl md:text-5xl font-bold text-error tracking-tight leading-none">₹4,42,105</h2>
          </div>
          <div className="text-error/80 text-[14px] flex justify-between items-center mt-6 font-medium hover:text-error cursor-pointer transition-colors">
            <span>14 overdue parties</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </div>
        </div>
      </section>

      {/* Discrepancy Alerts */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning-bg flex items-center justify-center text-warning">
              <span className="material-symbols-outlined filled-icon text-[20px]">warning</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-text-main">Action Required</h3>
          </div>
        </div>
        
        <div className="space-y-4 relative">
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
                className="relative touch-pan-y"
              >
                {alert.id === 'alert-1' ? (
                  <div className="bg-error-bg p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-2xl border border-error/20 shadow-sm">
                    <div className="flex items-start sm:items-center gap-4 md:gap-5">
                      <div className="w-12 h-12 shrink-0 bg-error text-white flex items-center justify-center rounded-xl shadow-sm">
                        <span className="material-symbols-outlined">{alert.icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-error text-[16px] md:text-[17px] tracking-tight">{alert.title}</p>
                        <p className="text-[14px] text-error/80 mt-1 font-medium">{alert.desc}</p>
                      </div>
                    </div>
                    <Button 
                      variant={isResolved ? "secondary" : "danger"} 
                      size="md" 
                      onClick={() => handleResolve(alert.id)}
                      isLoading={isResolving}
                      disabled={isResolved}
                      className="w-full sm:w-auto shrink-0"
                    >
                      {isResolved ? "Resolved" : "Resolve Now"}
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="bg-surface p-5 md:p-6 flex items-center justify-between rounded-2xl border border-border shadow-sm active:bg-surface-hover transition-colors cursor-pointer group"
                    onClick={() => handleResolve(alert.id)}
                  >
                    <div className="flex items-center gap-4 md:gap-5">
                      <div className="w-12 h-12 shrink-0 bg-warning-bg text-warning flex items-center justify-center rounded-xl">
                        <span className="material-symbols-outlined">{alert.icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-text-main text-[16px] md:text-[17px] tracking-tight group-hover:text-primary transition-colors">{alert.title}</p>
                        <p className="text-[14px] text-text-muted mt-1 font-medium">{alert.desc}</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-text-tertiary group-hover:text-text-main transition-colors transform group-hover:translate-x-1 duration-200">arrow_forward</span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {alerts.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-12 text-center bg-surface border border-dashed border-border rounded-2xl flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 bg-success-bg rounded-full flex items-center justify-center text-success mb-4">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>
              <h3 className="text-lg font-bold text-text-main mb-1">All Clear</h3>
              <p className="text-[15px] text-text-muted">No active discrepancy alerts requiring your attention.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Active Shipments List */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <span className="material-symbols-outlined text-[20px]">local_shipping</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-text-main">Active Shipments</h3>
          </div>
          <Button variant="ghost" size="sm" className="text-accent hover:text-accent-hover hover:bg-accent/5">
            View All
          </Button>
        </div>
        
        <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface-hover/50 text-[13px] text-text-muted font-semibold uppercase tracking-wider border-b border-border">
                  <th className="p-5 font-semibold">ID</th>
                  <th className="p-5 font-semibold">Destination</th>
                  <th className="p-5 font-semibold">Material</th>
                  <th className="p-5 font-semibold">Status</th>
                  <th className="p-5 text-right font-semibold">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-surface-hover transition-colors cursor-pointer group">
                  <td className="p-5 font-bold text-text-main group-hover:text-primary">#SH-9022</td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-text-tertiary">location_on</span>
                      <span className="text-[14px] font-medium text-text-main">North Hub Terminal</span>
                    </div>
                  </td>
                  <td className="p-5 text-[14px] text-text-muted">Crushed Aggregate</td>
                  <td className="p-5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold bg-accent/10 text-accent">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mr-1.5 animate-pulse"></span>
                      In Transit
                    </span>
                  </td>
                  <td className="p-5 text-right font-bold text-text-main">14:30</td>
                </tr>
                <tr className="hover:bg-surface-hover transition-colors cursor-pointer group">
                  <td className="p-5 font-bold text-text-main group-hover:text-primary">#SH-9025</td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-text-tertiary">location_on</span>
                      <span className="text-[14px] font-medium text-text-main">South Quarry Stack</span>
                    </div>
                  </td>
                  <td className="p-5 text-[14px] text-text-muted">Washed Sand</td>
                  <td className="p-5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold bg-warning-bg text-warning">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning mr-1.5"></span>
                      Loading
                    </span>
                  </td>
                  <td className="p-5 text-right font-bold text-text-main">14:55</td>
                </tr>
                <tr className="hover:bg-surface-hover transition-colors cursor-pointer group">
                  <td className="p-5 font-bold text-text-main group-hover:text-primary">#SH-9028</td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-text-tertiary">location_on</span>
                      <span className="text-[14px] font-medium text-text-main">Central Mixing Plant</span>
                    </div>
                  </td>
                  <td className="p-5 text-[14px] text-text-muted">Ready-Mix Batch A</td>
                  <td className="p-5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold bg-accent/10 text-accent">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mr-1.5 animate-pulse"></span>
                      In Transit
                    </span>
                  </td>
                  <td className="p-5 text-right font-bold text-text-main">15:10</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
