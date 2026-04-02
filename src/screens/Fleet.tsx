import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../components/Button';

export default function Fleet() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [payingDriver, setPayingDriver] = useState<string | null>(null);
  const [fuelData, setFuelData] = useState({ odo: '', qty: '', cost: '' });
  
  const [drivers, setDrivers] = useState([
    { id: 'RS', initials: 'R.S.', name: 'Rajesh Sharma', shift: 'MH-12-AB-1234 • Night Shift', amount: '₹450', paid: false },
    { id: 'VK', initials: 'V.K.', name: 'Vikram Kumar', shift: 'MH-14-MX-0045 • Double Shift', amount: '₹800', paid: true },
    { id: 'SP', initials: 'S.P.', name: 'Sunil Pal', shift: 'MH-12-Z-4411 • Day Shift', amount: '₹450', paid: false }
  ]);

  const handleSubmitLog = async () => {
    if (!fuelData.odo || !fuelData.qty || !fuelData.cost) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setFuelData({ odo: '', qty: '', cost: '' });
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const handlePay = async (driverId: string) => {
    setPayingDriver(driverId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setPayingDriver(null);
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, paid: true } : d));
  };

  const handleDragEnd = (event: any, info: any, id: string) => {
    if (info.offset.x > 100) {
      const driver = drivers.find(d => d.id === id);
      if (driver && !driver.paid) {
        handlePay(id);
      }
    }
  };

  const isFormValid = fuelData.odo !== '' && fuelData.qty !== '' && fuelData.cost !== '';

  return (
    <div className="space-y-8 overflow-x-hidden pb-8">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-accent font-semibold tracking-wider text-[13px] uppercase">
            <span className="material-symbols-outlined text-[16px]">local_shipping</span>
            Operations / Fleet
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-text-main leading-none">Fleet & Fuel</h2>
        </div>
        <div className="flex gap-2">
          <div className="bg-surface border border-border px-5 py-3 rounded-xl flex flex-col justify-center shadow-sm">
            <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Fleet Efficiency</span>
            <span className="text-2xl font-bold text-text-main mt-1">14.2 <span className="text-[14px] text-text-muted font-medium">KM/L</span></span>
          </div>
        </div>
      </section>

      {/* Vehicle Selector - Bento Style */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-primary text-on-primary p-6 md:p-8 rounded-2xl flex flex-col justify-between min-h-[200px] relative overflow-hidden shadow-floating">
          <img 
            className="absolute right-[-20px] bottom-[-20px] w-64 opacity-20 grayscale pointer-events-none mix-blend-overlay" 
            alt="side view of a heavy-duty industrial dump truck" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeRD3v4nzmC4BRnBouIkupG_RgFcxvw2mFTOmV-BCjezW45rz_WL6vljXpAHs-oAKJk_3yq0FtaPQnw5ZxfGXgi6uQWP496B2DCL8stO4oveRrYiSf3z8Jap3qXQoO-E1WvzKv0sKiPGQXWPBLWtPV-22iGOGLX7PVbDI2n5q1oJhAwNrznMl85ABvyfYmBX8UXhB3VlPL670SzbvPTegqYZFZn4vmBYiirTJc8YgdDf92nxHK8aup2shP4qffXvqNb-EsAfDvnyI"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
          <div className="z-10">
            <h3 className="text-white/70 font-semibold text-[13px] uppercase tracking-wider mb-2">Active Unit</h3>
            <div className="flex items-center gap-4">
              <span className="text-4xl md:text-5xl font-bold tracking-tight leading-none">MH-12-AB-1234</span>
              <span className="bg-white/20 text-white px-2.5 py-1 text-[12px] font-bold rounded-md uppercase tracking-wider backdrop-blur-sm">Tata Hywa</span>
            </div>
          </div>
          <div className="z-10 flex gap-8 mt-8">
            <div className="flex flex-col">
              <span className="text-[12px] font-semibold text-white/70 uppercase tracking-wider">Current Odo</span>
              <span className="font-bold text-xl mt-1">128,450 <span className="text-[14px] font-medium text-white/70">KM</span></span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-semibold text-white/70 uppercase tracking-wider">Avg Fuel Exp</span>
              <span className="font-bold text-xl mt-1">₹42.5<span className="text-[14px] font-medium text-white/70">/KM</span></span>
            </div>
          </div>
        </div>
        
        <div className="bg-surface p-6 md:p-8 rounded-2xl flex flex-col justify-between border border-border shadow-card">
          <div>
            <h3 className="text-text-muted font-semibold text-[13px] uppercase tracking-wider mb-5">Quick Switch</h3>
            <div className="space-y-3">
              <Button variant="secondary" size="md" className="w-full justify-between bg-surface-hover border-border" rightIcon="chevron_right">
                MH-14-MX-0045 (Tata 709)
              </Button>
              <Button variant="secondary" size="md" className="w-full justify-between opacity-50 bg-surface-hover border-border" rightIcon="lock" disabled>
                MH-12-Z-4411 (Tata Chanchat)
              </Button>
            </div>
          </div>
          <Button variant="outline" size="md" className="w-full mt-6">View Full Fleet</Button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Entry Form */}
        <section className="bg-surface p-6 md:p-8 rounded-2xl space-y-6 border border-border shadow-card">
          <div className="flex items-center gap-3 border-b border-border pb-5">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <span className="material-symbols-outlined text-[20px]">local_gas_station</span>
            </div>
            <h3 className="font-bold text-xl tracking-tight text-text-main">Fuel Logging</h3>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2 space-y-2">
              <label className="text-[13px] font-semibold text-text-muted uppercase tracking-wider">Odometer (KM)</label>
              <input 
                className="w-full h-14 bg-surface-hover border border-border rounded-xl text-xl font-bold px-4 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all text-text-main placeholder:text-text-tertiary" 
                placeholder="128,450" 
                type="number" 
                value={fuelData.odo}
                onChange={e => setFuelData({...fuelData, odo: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-text-muted uppercase tracking-wider">Fuel Qty (Litres)</label>
              <input 
                className="w-full h-14 bg-surface-hover border border-border rounded-xl text-xl font-bold px-4 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all text-text-main placeholder:text-text-tertiary" 
                placeholder="450.00" 
                type="number" 
                value={fuelData.qty}
                onChange={e => setFuelData({...fuelData, qty: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-text-muted uppercase tracking-wider">Total Cost (₹)</label>
              <input 
                className="w-full h-14 bg-surface-hover border border-border rounded-xl text-xl font-bold px-4 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all text-text-main placeholder:text-text-tertiary" 
                placeholder="42,500" 
                type="number" 
                value={fuelData.cost}
                onChange={e => setFuelData({...fuelData, cost: e.target.value})}
              />
            </div>
          </div>
          <div className="p-5 bg-surface-hover border border-border rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-5 mt-2">
            <div className="flex flex-col">
              <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Predicted Efficiency</span>
              <span className="font-bold text-xl text-accent mt-1">4.2 <span className="text-[14px] font-medium text-accent/70">KM/L</span></span>
            </div>
            <Button 
              variant={submitSuccess ? "secondary" : "primary"}
              size="lg"
              className="w-full sm:w-auto"
              onClick={handleSubmitLog}
              isLoading={isSubmitting}
              disabled={!isFormValid || submitSuccess}
              rightIcon={submitSuccess ? "check" : undefined}
            >
              {submitSuccess ? "Logged" : "Submit Log"}
            </Button>
          </div>
        </section>

        {/* Bhatta (Driver Allowance) Disbursal */}
        <section className="bg-surface p-6 md:p-8 rounded-2xl space-y-6 flex flex-col border border-border shadow-card">
          <div className="flex items-center justify-between border-b border-border pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success-bg flex items-center justify-center text-success">
                <span className="material-symbols-outlined text-[20px]">payments</span>
              </div>
              <h3 className="font-bold text-xl tracking-tight text-text-main">Driver Allowance</h3>
            </div>
            <div className="text-right">
              <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider block">Today's Total</span>
              <span className="text-[16px] font-bold text-text-main">₹4,200</span>
            </div>
          </div>
          <div className="flex-grow space-y-3 overflow-y-auto max-h-[360px] pr-2 custom-scrollbar">
            <AnimatePresence>
              {drivers.map(driver => (
                <div key={driver.id} className="relative overflow-hidden rounded-xl bg-success-bg">
                  {/* Background Action (Swipe to Pay) */}
                  {!driver.paid && (
                    <div className="absolute inset-0 flex items-center px-6 text-success font-bold text-[13px] tracking-wider uppercase">
                      <span className="material-symbols-outlined mr-2 text-[18px]">payments</span>
                      Swipe to Pay
                    </div>
                  )}
                  
                  <motion.div
                    drag={!driver.paid ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={{ left: 0, right: 0.8 }}
                    onDragEnd={(e, info) => handleDragEnd(e, info, driver.id)}
                    className="bg-surface border border-border p-4 md:p-5 rounded-xl flex items-center justify-between active:scale-[0.98] transition-transform relative z-10 touch-pan-y"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 shrink-0 rounded-full bg-surface-hover flex items-center justify-center font-bold text-text-muted border border-border">{driver.initials}</div>
                      <div>
                        <p className="font-bold text-[16px] text-text-main">{driver.name}</p>
                        <p className="text-[13px] text-text-muted font-medium mt-0.5">{driver.shift}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className={`font-bold text-xl mb-2 ${driver.paid ? 'text-success' : 'text-text-main'}`}>{driver.amount}</p>
                      {driver.paid ? (
                        <span className="material-symbols-outlined text-success text-[24px] filled-icon h-9 flex items-center">check_circle</span>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-accent hover:text-accent-hover hover:bg-accent/5 h-9"
                          isLoading={payingDriver === driver.id}
                          onClick={() => handlePay(driver.id)}
                        >
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </motion.div>
                </div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </div>

      {/* Efficiency History */}
      <section className="bg-surface p-6 md:p-8 rounded-2xl overflow-hidden border border-border shadow-card">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <span className="material-symbols-outlined text-[20px]">analytics</span>
          </div>
          <h3 className="font-bold text-xl tracking-tight text-text-main">Efficiency Trend</h3>
        </div>
        <div className="grid grid-cols-7 gap-3 h-40 items-end">
          <div className="bg-surface-hover border border-border border-b-0 h-[40%] rounded-t-lg relative group transition-all hover:bg-accent/10 hover:border-accent/30">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[13px] font-bold text-text-main opacity-0 group-hover:opacity-100 transition-opacity">3.8</div>
          </div>
          <div className="bg-surface-hover border border-border border-b-0 h-[55%] rounded-t-lg relative group transition-all hover:bg-accent/10 hover:border-accent/30">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[13px] font-bold text-text-main opacity-0 group-hover:opacity-100 transition-opacity">4.1</div>
          </div>
          <div className="bg-surface-hover border border-border border-b-0 h-[50%] rounded-t-lg relative group transition-all hover:bg-accent/10 hover:border-accent/30">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[13px] font-bold text-text-main opacity-0 group-hover:opacity-100 transition-opacity">4.0</div>
          </div>
          <div className="bg-warning-bg border border-warning/20 border-b-0 h-[35%] rounded-t-lg relative group transition-all hover:bg-warning/20">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[13px] font-bold text-warning opacity-0 group-hover:opacity-100 transition-opacity">3.4</div>
          </div>
          <div className="bg-surface-hover border border-border border-b-0 h-[65%] rounded-t-lg relative group transition-all hover:bg-accent/10 hover:border-accent/30">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[13px] font-bold text-text-main opacity-0 group-hover:opacity-100 transition-opacity">4.5</div>
          </div>
          <div className="bg-surface-hover border border-border border-b-0 h-[60%] rounded-t-lg relative group transition-all hover:bg-accent/10 hover:border-accent/30">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[13px] font-bold text-text-main opacity-0 group-hover:opacity-100 transition-opacity">4.3</div>
          </div>
          <div className="bg-accent border border-accent border-b-0 h-[70%] rounded-t-lg relative group shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[13px] font-bold text-accent opacity-100">4.8</div>
          </div>
        </div>
        <div className="flex justify-between mt-4 text-[12px] font-semibold text-text-muted uppercase tracking-wider">
          <span className="text-center w-full">Mon</span>
          <span className="text-center w-full">Tue</span>
          <span className="text-center w-full">Wed</span>
          <span className="text-center w-full">Thu</span>
          <span className="text-center w-full">Fri</span>
          <span className="text-center w-full">Sat</span>
          <span className="text-center w-full text-text-main">Today</span>
        </div>
      </section>
    </div>
  );
}
