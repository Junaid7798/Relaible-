import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../components/Button';

export default function Expenses() {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expenseData, setExpenseData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Fuel',
    amount: '',
    mode: 'Cash',
    unit: 'Plant',
    desc: ''
  });

  const expenses = [
    { id: 1, date: '02 Apr 2026', category: 'Fuel', desc: 'Diesel for HD-204 & HD-205', amount: 42500, unit: 'Plant', mode: 'UPI' },
    { id: 2, date: '01 Apr 2026', category: 'Maintenance', desc: 'Tyre replacement EX-921', amount: 18000, unit: 'Fleet', mode: 'Bank Transfer' },
    { id: 3, date: '01 Apr 2026', category: 'Wages', desc: 'Weekly labour payout', amount: 35000, unit: 'Plant', mode: 'Cash' },
    { id: 4, date: '31 Mar 2026', category: 'Electricity', desc: 'MSEB Bill March', amount: 145000, unit: 'Plant', mode: 'Bank Transfer' },
  ];

  const handleLogExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseData.amount || !expenseData.desc) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setShowForm(false);
    setExpenseData({
      date: new Date().toISOString().split('T')[0],
      category: 'Fuel',
      amount: '',
      mode: 'Cash',
      unit: 'Plant',
      desc: ''
    });
  };

  return (
    <div className="space-y-8 overflow-x-hidden pb-8">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-accent font-semibold tracking-wider text-[13px] uppercase">
            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            Finance / Expenses
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-text-main leading-none">Expense Log</h2>
        </div>
        <Button 
          variant={showForm ? "secondary" : "primary"} 
          size="md" 
          leftIcon={showForm ? "close" : "add"}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Log Expense"}
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
                  <span className="material-symbols-outlined text-[20px]">post_add</span>
                </div>
                <h3 className="font-bold text-xl tracking-tight text-text-main">New Expense Entry</h3>
              </div>
              
              <form onSubmit={handleLogExpense} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Date</label>
                    <input 
                      type="date"
                      className="w-full h-14 bg-surface-hover border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl text-[16px] font-medium px-4 transition-all outline-none text-text-main" 
                      value={expenseData.date}
                      onChange={e => setExpenseData({...expenseData, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Category</label>
                    <div className="relative">
                      <select 
                        className="w-full h-14 bg-surface-hover border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl text-[16px] font-medium appearance-none px-4 transition-all outline-none text-text-main"
                        value={expenseData.category}
                        onChange={e => setExpenseData({...expenseData, category: e.target.value})}
                      >
                        <option>Fuel</option>
                        <option>Maintenance</option>
                        <option>Wages</option>
                        <option>Electricity</option>
                        <option>Office Supplies</option>
                        <option>Other</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-4 text-text-tertiary pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Amount (₹)</label>
                    <input 
                      type="number"
                      className="w-full h-14 bg-surface-hover border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl text-xl font-bold px-4 transition-all outline-none text-text-main placeholder:text-text-tertiary" 
                      placeholder="0.00"
                      value={expenseData.amount}
                      onChange={e => setExpenseData({...expenseData, amount: e.target.value})}
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
                        value={expenseData.mode}
                        onChange={e => setExpenseData({...expenseData, mode: e.target.value})}
                      >
                        <option>Cash</option>
                        <option>UPI</option>
                        <option>Bank Transfer</option>
                        <option>Cheque</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-4 text-text-tertiary pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Unit / Location</label>
                    <div className="relative">
                      <select 
                        className="w-full h-14 bg-surface-hover border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl text-[16px] font-medium appearance-none px-4 transition-all outline-none text-text-main"
                        value={expenseData.unit}
                        onChange={e => setExpenseData({...expenseData, unit: e.target.value})}
                      >
                        <option>Plant</option>
                        <option>Shop 1</option>
                        <option>Shop 2</option>
                        <option>Fleet</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-4 text-text-tertiary pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold uppercase tracking-wider text-text-muted ml-1">Description</label>
                    <input 
                      type="text"
                      className="w-full h-14 bg-surface-hover border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl text-[16px] font-medium px-4 transition-all outline-none text-text-main placeholder:text-text-tertiary" 
                      placeholder="What was this for?"
                      value={expenseData.desc}
                      onChange={e => setExpenseData({...expenseData, desc: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" size="lg" isLoading={isSubmitting} rightIcon="check">
                    Save Expense
                  </Button>
                </div>
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-2">This Month</p>
          <h3 className="text-3xl font-bold text-text-main">₹2,40,500</h3>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-2">Fuel (MTD)</p>
          <h3 className="text-3xl font-bold text-text-main">₹85,200</h3>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-2">Maintenance (MTD)</p>
          <h3 className="text-3xl font-bold text-text-main">₹24,000</h3>
        </div>
      </section>

      <section className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="font-bold text-xl tracking-tight text-text-main">Recent Expenses</h3>
          <Button variant="secondary" size="sm" leftIcon="filter_list">Filter</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-hover/50 text-[13px] text-text-muted font-semibold uppercase tracking-wider border-b border-border">
                <th className="p-5">Date</th>
                <th className="p-5">Category</th>
                <th className="p-5">Description</th>
                <th className="p-5">Unit</th>
                <th className="p-5">Mode</th>
                <th className="p-5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {expenses.map(exp => (
                <tr key={exp.id} className="hover:bg-surface-hover transition-colors">
                  <td className="p-5 text-[14px] font-medium text-text-muted">{exp.date}</td>
                  <td className="p-5">
                    <span className="bg-surface-hover border border-border px-2.5 py-1 rounded-md text-[12px] font-bold uppercase tracking-wider text-text-main">
                      {exp.category}
                    </span>
                  </td>
                  <td className="p-5 font-medium text-text-main">{exp.desc}</td>
                  <td className="p-5 text-[14px] text-text-muted">{exp.unit}</td>
                  <td className="p-5 text-[14px] text-text-muted">{exp.mode}</td>
                  <td className="p-5 text-right font-bold text-text-main text-lg">₹{exp.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
