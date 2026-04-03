import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../components/Button';

interface DriverDelivery {
  id: string;
  customerName: string;
  address: string;
  material: string;
  quantity: string;
  vehicle: string;
  vehicleReg: string;
  managerNote: string;
  status: 'pending' | 'assigned' | 'departed' | 'delivered' | 'issue';
}

interface DriverProps {
  userName: string;
  onLogout: () => void;
}

export default function Driver({ userName, onLogout }: DriverProps) {
  const [activeDelivery, setActiveDelivery] = useState<DriverDelivery | null>(null);
  const [deliveryHistory, setDeliveryHistory] = useState<DriverDelivery[]>([]);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueType, setIssueType] = useState('');
  const [issueNote, setIssueNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Demo data
  useEffect(() => {
    setActiveDelivery({
      id: 'd1',
      customerName: 'Patil Construction',
      address: 'Plot 12, Nashik Road, Sinnar',
      material: 'VSI 20mm',
      quantity: '2 brass',
      vehicle: 'Tata 709',
      vehicleReg: 'MH-14-MX-0045',
      managerNote: 'Call before arriving',
      status: 'assigned'
    });
    
    setDeliveryHistory([
      { id: 'd2', customerName: 'Shinde Builders', address: 'Sinnar MIDC', material: '10MM', quantity: '4 brass', vehicle: 'Tata Hywa', vehicleReg: 'MH-12-AB-1234', managerNote: '', status: 'delivered' },
      { id: 'd3', customerName: 'Rajesh Steel', address: 'Nashik', material: 'Crush Sand', quantity: '1 brass', vehicle: 'Tata Chanchat', vehicleReg: 'MH-12-Z-4411', managerNote: '', status: 'delivered' },
    ]);
  }, []);

  const handleDepart = async () => {
    if (!activeDelivery) return;
    setIsUpdating(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    setActiveDelivery({ ...activeDelivery, status: 'departed' });
    setIsUpdating(false);
  };

  const handleDelivered = async () => {
    if (!activeDelivery) return;
    setIsUpdating(true);
    await new Promise(r => setTimeout(r, 1000));
    setDeliveryHistory([activeDelivery, ...deliveryHistory]);
    setActiveDelivery(null);
    setIsUpdating(false);
  };

  const handleIssue = async () => {
    if (!activeDelivery || !issueType) return;
    setIsUpdating(true);
    await new Promise(r => setTimeout(r, 1000));
    setActiveDelivery({ ...activeDelivery, status: 'issue' });
    setShowIssueModal(false);
    setIssueType('');
    setIssueNote('');
    setIsUpdating(false);
  };

  // No active delivery screen
  if (!activeDelivery) {
    return (
      <div className="min-h-screen bg-background p-6 flex flex-col">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-xl font-bold text-text-main">Welcome, {userName}</h1>
            <p className="text-text-muted text-sm">No trip assigned</p>
          </div>
          <button onClick={onLogout} className="p-2 rounded-full bg-surface-hover">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-5xl text-text-tertiary">directions_car</span>
          </div>
          <h2 className="text-2xl font-bold text-text-main mb-2">No trip assigned</h2>
          <p className="text-text-muted mb-8">कोणताही ट्रिप नाही</p>
          
          <div className="w-full max-w-sm bg-surface rounded-2xl border border-border p-6">
            <h3 className="font-semibold text-text-main mb-4">Vehicle Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Fuel Level</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-border rounded-full overflow-hidden">
                    <div className="bg-success h-full w-[70%]" />
                  </div>
                  <span className="text-sm font-medium">70%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Odometer</span>
                <span className="font-medium">128,450 km</span>
              </div>
            </div>
            <Button variant="secondary" size="md" className="w-full mt-6">
              Update Fuel / Mileage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-surface border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
            {userName.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-text-main">{userName}</p>
            <p className="text-xs text-text-muted">{activeDelivery.vehicleReg}</p>
          </div>
        </div>
        <button onClick={onLogout} className="p-2 rounded-full bg-surface-hover">
          <span className="material-symbols-outlined text-text-muted">logout</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <AnimatePresence>
          {showIssueModal && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-primary/40 z-40"
                onClick={() => setShowIssueModal(false)}
              />
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="fixed bottom-0 left-0 w-full z-50 bg-surface rounded-t-[24px] p-6 pb-8"
              >
                <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6" />
                <h3 className="text-xl font-bold text-text-main mb-4">Report Issue</h3>
                <div className="space-y-3">
                  <select 
                    className="w-full h-12 bg-surface-hover border border-border rounded-xl px-4"
                    value={issueType}
                    onChange={e => setIssueType(e.target.value)}
                  >
                    <option value="">Select issue type</option>
                    <option value="traffic">Traffic delay</option>
                    <option value="customer">Customer not available</option>
                    <option value="vehicle">Vehicle problem</option>
                    <option value="road">Road blocked</option>
                    <option value="other">Other</option>
                  </select>
                  <textarea 
                    className="w-full h-24 bg-surface-hover border border-border rounded-xl p-4"
                    placeholder="Additional notes (optional)"
                    value={issueNote}
                    onChange={e => setIssueNote(e.target.value)}
                  />
                </div>
                <Button 
                  variant="danger" 
                  size="lg" 
                  className="w-full mt-6"
                  onClick={handleIssue}
                  disabled={!issueType || isUpdating}
                  isLoading={isUpdating}
                >
                  Submit Issue
                </Button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Delivery Card */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-card">
          <div className="bg-primary/5 p-4 border-b border-border">
            <span className="text-xs
