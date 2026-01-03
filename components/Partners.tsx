
import React, { useState, useMemo } from 'react';
import { Partner, Car } from '../types';

interface PartnersProps {
  partners: Partner[];
  addPartner: (p: Partner) => void;
  updatePartner: (id: string, updated: Partial<Partner>) => void;
  deletePartner: (id: string) => void;
  cars: Car[];
  toggleCarPayment: (carId: string, partnerId: string) => void;
}

const Partners: React.FC<PartnersProps> = ({ partners, addPartner, updatePartner, deletePartner, cars, toggleCarPayment }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [deletingPartner, setDeletingPartner] = useState<Partner | null>(null);
  const [ledgerPartner, setLedgerPartner] = useState<Partner | null>(null);
  const [newPartner, setNewPartner] = useState({ name: '', email: '', splitPercentage: 0 });

  const totalSplit = partners.reduce((sum, p) => sum + p.splitPercentage, 0);

  const partnerData = useMemo(() => {
    const data: Record<string, { totalEarned: number; carPayouts: number }> = {};
    partners.forEach(p => { data[p.id] = { totalEarned: 0, carPayouts: 0 }; });
    cars.forEach(car => {
      if (car.isSold) {
        const carExpenses = car.expenses.reduce((sum, e) => sum + e.amount, 0);
        const profit = car.sellingPrice - car.purchasePrice - carExpenses;
        partners.forEach(p => {
          const share = profit * (p.splitPercentage / 100);
          data[p.id].totalEarned += share;
          if (car.paidPartnerIds?.includes(p.id)) {
            data[p.id].carPayouts += share;
          }
        });
      }
    });
    return data;
  }, [cars, partners]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalSplit + newPartner.splitPercentage > 100) {
      alert("Total split cannot exceed 100%");
      return;
    }
    addPartner({ id: crypto.randomUUID(), ...newPartner, profitTaken: 0 });
    setNewPartner({ name: '', email: '', splitPercentage: 0 });
    setShowForm(false);
  };

  const handleUpdatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;
    updatePartner(editingPartner.id, editingPartner);
    setEditingPartner(null);
  };

  const handleDeletePartner = () => {
    if (deletingPartner) {
      deletePartner(deletingPartner.id);
      setDeletingPartner(null);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Partnership Roster</h2>
          <p className="text-sm text-slate-500">Split total: <span className={totalSplit === 100 ? 'text-emerald-600' : 'text-rose-500'}>{totalSplit}%</span></p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
          {showForm ? 'Close' : '+ Add Partner'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" required placeholder="Name" className="px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" value={newPartner.name} onChange={e => setNewPartner({...newPartner, name: e.target.value})} />
            <input type="email" required placeholder="Email" className="px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" value={newPartner.email} onChange={e => setNewPartner({...newPartner, email: e.target.value})} />
            <input type="number" required placeholder="Split %" className="px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" value={newPartner.splitPercentage} onChange={e => setNewPartner({...newPartner, splitPercentage: Number(e.target.value)})} />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors">Register Partner</button>
        </form>
      )}

      {/* Edit Modal */}
      {editingPartner && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between">
              <h3 className="text-xl font-bold">Edit Partner</h3>
              <button onClick={() => setEditingPartner(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleUpdatePartner} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Name</label>
                <input type="text" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={editingPartner.name} onChange={e => setEditingPartner({...editingPartner, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email</label>
                <input type="email" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={editingPartner.email} onChange={e => setEditingPartner({...editingPartner, email: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingPartner(null)} className="flex-1 p-3 border border-slate-200 rounded-xl font-medium text-slate-600">Cancel</button>
                <button type="submit" className="flex-1 p-3 bg-indigo-600 text-white rounded-xl font-bold">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ledger Slide-over / Modal */}
      {ledgerPartner && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{ledgerPartner.name}'s Ledger</h3>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-0.5">{ledgerPartner.splitPercentage}% Ownership Stake</p>
              </div>
              <button onClick={() => setLedgerPartner(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Total Share Earned</p>
                  <p className="text-lg font-bold text-indigo-700">{formatCurrency(partnerData[ledgerPartner.id].totalEarned)}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Share Taken/Paid</p>
                  <p className="text-lg font-bold text-emerald-700">{formatCurrency(partnerData[ledgerPartner.id].carPayouts + ledgerPartner.profitTaken)}</p>
                </div>
              </div>

              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vehicle Split Breakdown</h4>
              <div className="space-y-2">
                {cars.filter(c => c.isSold).map(car => {
                  const expenses = car.expenses.reduce((s, e) => s + e.amount, 0);
                  const totalProfit = car.sellingPrice - car.purchasePrice - expenses;
                  const partnerShare = totalProfit * (ledgerPartner.splitPercentage / 100);
                  const isPaid = car.paidPartnerIds?.includes(ledgerPartner.id);

                  return (
                    <div key={car.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors group">
                      <div className="flex-1">
                        <div className="font-bold text-slate-900">{car.year} {car.make} {car.model}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1.5">
                          <span>Profit: {formatCurrency(totalProfit)}</span>
                          <span>•</span>
                          <span>Share: {formatCurrency(partnerShare)} ({ledgerPartner.splitPercentage}%)</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => toggleCarPayment(car.id, ledgerPartner.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          isPaid 
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                            : 'bg-white text-amber-600 border-amber-200 hover:bg-amber-50'
                        }`}
                      >
                        {isPaid ? '✓ Paid' : 'Pending Payment'}
                      </button>
                    </div>
                  );
                })}
                {cars.filter(c => c.isSold).length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-sm">No sales recorded yet.</div>
                )}
              </div>

              {ledgerPartner.profitTaken > 0 && (
                <div className="mt-4 p-4 bg-slate-50 border border-slate-200 border-dashed rounded-2xl flex justify-between items-center">
                  <div className="text-sm font-bold text-slate-600">Manual Adjustments / Previous Withdrawals</div>
                  <div className="font-bold text-slate-900">{formatCurrency(ledgerPartner.profitTaken)}</div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 bg-white">
              <button 
                onClick={() => setLedgerPartner(null)}
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-colors"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPartner && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Remove Partner</h3>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Are you sure you want to remove <span className="font-bold text-slate-700">{deletingPartner.name}</span> from the partnership? This will permanently erase their split history in this session.
              </p>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleDeletePartner}
                  className="w-full bg-rose-600 text-white py-3.5 rounded-xl font-bold hover:bg-rose-700 transition-colors"
                >
                  Confirm Removal
                </button>
                <button 
                  onClick={() => setDeletingPartner(null)}
                  className="w-full bg-slate-100 text-slate-600 py-3.5 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Keep Partner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {partners.map(p => {
          const stats = partnerData[p.id];
          const balance = stats.totalEarned - (stats.carPayouts + p.profitTaken);
          return (
            <div key={p.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-indigo-200 transition-colors">
              <div className="flex justify-between mb-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700 uppercase">{p.name[0]}</div>
                  <div>
                    <h3 className="font-bold text-slate-900">{p.name}</h3>
                    <p className="text-xs text-slate-400">{p.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingPartner(p)} className="text-xs text-indigo-600 font-bold hover:underline">Edit</button>
                  <button onClick={() => setDeletingPartner(p)} className="text-xs text-rose-500 font-bold hover:underline">Delete</button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Split Share</span>
                  <span className="font-bold text-slate-800">{p.splitPercentage}%</span>
                </div>
                <div className="flex justify-between p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Balance Due</span>
                  <span className="font-bold text-indigo-600">{formatCurrency(balance)}</span>
                </div>
                
                <button 
                  onClick={() => setLedgerPartner(p)}
                  className="w-full py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                  View Sales Ledger
                </button>

                <div className="pt-2">
                  <input 
                    type="range" 
                    className="w-full accent-indigo-600 h-1.5 rounded-lg appearance-none bg-slate-100 cursor-pointer" 
                    value={p.splitPercentage} 
                    onChange={e => updatePartner(p.id, { splitPercentage: Number(e.target.value) })} 
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-slate-400 font-bold">0%</span>
                    <span className="text-[10px] text-slate-400 font-bold">100%</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Partners;
