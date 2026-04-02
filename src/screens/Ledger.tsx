import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../components/Button';

export default function Ledger() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState({
    party: '',
    amount: '',
    mode: 'Cash',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    notes: ''
  });
  
  const customers = [
    { id: 1, name: 'Larsen & Toubro', phone: '+91 98765 43210', outstanding: 245000, status: 'OVERDUE', daysOverdue: 12, lastPayment: '12/03/2026' },
    { id: 2, name: 'Apex Constructions', phone: '+91 99887 76655', outstanding: 85000, status: 'ON_TRACK', daysOverdue: 0, lastPayment: '28/03/2026' },
    { id: 3, name: 'Ramesh Builders', phone: '+91 91234 56789', outstanding: 12400, status: 'OVERDUE', daysOverdue: 4, lastPayment: '15/03/2026' },
    { id: 4, name: 'Metro Infrastructure', phone: '+91 98765 12345', outstanding: 450000, status: 'ON_TRACK', daysOverdue: 0, lastPayment: '01/04/2026' },
  ];

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentData.party || !paymentData.amount) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setShowForm(false);
    setPaymentData({
      party: '',
      amount: '',
      mode: 'Cash',
      date: new Date().toISOString().split('T')[0],
      reference: '',
      notes: ''
    });
  };

  return (
    <div className="space-y-8 overflow-x-hidden pb-8">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-accent font-semibold tracking-wider text-[13px] uppercase">
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            Finance / Ledger
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-text-main leading-none">Party Khata</h2>
        </div>
        <Button 
          variant={showForm ? "secondary" : "primary"} 
          size="md" 
          leftIcon={showForm ? "close" : "add"}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Record Payment"}
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
                <div className="w-10 h-10 rounded-full bg-success-bg flex items-center justify-center text-success">
                  <span className="material-symbols-outlined text-[20px]">payments</span>
                </div>
                <h3 className="font-bold text-xl tracking-tight text-text-main">Record Party Payment</h3>
              </div>
              
              <form onSubmit={handleRecordPayment} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Select Party</label>
                    <div className="relative">
                      <select 
                        className="w-full h-14 bg-surface-hover border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl text-[16px] font-medium appearance-none px-4 transition-all outline-none text-text-main"
                        value={paymentData.party}
                        onChange={e => setPaymentData({...paymentData, party: e.target.value})}
                        required
                      >
                        <option value="" disabled>Select a party...</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.name}>{c.name} (Bal: ₹{c.outstanding.toLocaleString('en-IN')})</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-4 text-text-tertiary pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Amount Received (₹)</label>
                    <input 
                      type="number"
                      className="w-full h-14 bg-surface-hover border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl text-xl font-bold px-4 transition-all outline-none text-text-main placeholder:text-text-tertiary" 
                      placeholder="0.00"
                      value={paymentData.amount}
                      onChange={e => setPaymentData({...paymentData, amount: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Payment Mode</label>
                    <div className="relative">
                      <select 
                        className="w-full h-14 bg-surface-hover border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl text-[16px] font-medium appearance-none px-4 transition-all outline-none text-text-main"
                        value={paymentData.mode}
                        onChange={e => setPaymentData({...paymentData, mode: e.target.value})}
                      >
                        <option>Cash</option>
                        <option>UPI</option>
                        <option>NEFT / RTGS</option>
                        <option>Cheque</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-4 text-text-tertiary pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Date</label>
                    <input 
                      type="date"
                      className="w-full h-14 bg-surface-hover border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl text-[16px] font-medium px-4 transition-all outline-none text-text-main" 
                      value={paymentData.date}
                      onChange={e => setPaymentData({...paymentData, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Reference / Notes</label>
                    <input 
                      type="text"
                      className="w-full h-14 bg-surface-hover border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl text-[16px] font-medium px-4 transition-all outline-none text-text-main placeholder:text-text-tertiary" 
                      placeholder={paymentData.mode === 'Cash' ? "Optional notes..." : "Txn ID / Cheque No..."}
                      value={paymentData.reference}
                      onChange={e => setPaymentData({...paymentData, reference: e.target.value})}
                      required={paymentData.mode !== 'Cash'}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" size="lg" isLoading={isSubmitting} rightIcon="check">
                    Save Payment
                  </Button>
                </div>
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Consolidated Outstanding */}
      <section className="bg-error-bg text-error p-6 md:p-8 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-sm border border-error/20">
        <div className="absolute -right-4 -bottom-4 opacity-10 mix-blend-overlay">
          <span className="material-symbols-outlined text-9xl">account_balance</span>
        </div>
        <p className="font-semibold text-[13px] uppercase tracking-wider z-10 text-error/80">Total Outstanding Credit</p>
        <div className="flex items-baseline gap-3 mt-2 z-10">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-none">₹7,92,400</h2>
          <span className="text-[16px] font-bold uppercase tracking-wider text-error/80">Across all units</span>
        </div>
        <div className="mt-6 flex gap-4 z-10">
          <div className="bg-white/40 px-4 py-2 rounded-lg backdrop-blur-sm">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-error/80">Overdue</span>
            <span className="text-xl font-bold">₹2,57,400</span>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-error/80">On Track</span>
            <span className="text-xl font-bold">₹5,35,000</span>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="flex gap-4">
        <div className="relative flex-1">
          <input 
            className="w-full h-14 bg-surface border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl text-[16px] font-medium placeholder:text-text-tertiary px-12 transition-all outline-none text-text-main shadow-sm" 
            placeholder="Search party name or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="material-symbols-outlined absolute left-4 top-4 text-text-tertiary">search</span>
        </div>
        <Button variant="secondary" className="h-14 w-14 p-0 shrink-0 bg-surface border border-border shadow-sm">
          <span className="material-symbols-outlined">filter_list</span>
        </Button>
      </section>

      {/* Customer List */}
      <section className="space-y-4">
        {customers.map(customer => (
          <motion.div 
            key={customer.id}
            whileTap={{ scale: 0.98 }}
            className="bg-surface p-5 md:p-6 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5 cursor-pointer hover:shadow-md transition-all hover:border-primary/30"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center text-text-muted font-bold text-lg border border-border shrink-0">
                {customer.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-[17px] text-text-main tracking-tight">{customer.name}</h4>
                <p className="text-[13px] font-medium text-text-muted mt-0.5">{customer.phone}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 w-full sm:w-auto border-t sm:border-t-0 border-border pt-4 sm:pt-0">
              <div className="text-left sm:text-right">
                <p className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-1">Outstanding</p>
                <p className={`font-bold text-xl ${customer.status === 'OVERDUE' ? 'text-error' : 'text-text-main'}`}>
                  ₹{customer.outstanding.toLocaleString('en-IN')}
                </p>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                {customer.status === 'OVERDUE' ? (
                  <span className="bg-error-bg text-error px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    {customer.daysOverdue} Days Overdue
                  </span>
                ) : (
                  <span className="bg-success-bg text-success px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    On Track
                  </span>
                )}
                <span className="text-[12px] font-medium text-text-muted">Last paid: {customer.lastPayment}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
