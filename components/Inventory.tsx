
import React, { useState } from 'react';
import { Car, Partner, Expense } from '../types';
import { getMarketValue } from '../services/geminiService';

interface InventoryProps {
  cars: Car[];
  partners: Partner[];
  addCar: (car: Car) => void;
  updateCar: (id: string, updated: Partial<Car>) => void;
  deleteCar: (id: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ cars, partners, addCar, updateCar, deleteCar }) => {
  const [showForm, setShowForm] = useState(false);
  const [sellingCarId, setSellingCarId] = useState<string | null>(null);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [deletingCar, setDeletingCar] = useState<Car | null>(null);
  const [expenseCar, setExpenseCar] = useState<Car | null>(null);
  
  const [salePrice, setSalePrice] = useState<string>('');
  const [soldByPartnerId, setSoldByPartnerId] = useState<string>('');
  const [marketCheckingId, setMarketCheckingId] = useState<string | null>(null);
  
  const [expenseData, setExpenseData] = useState({
    category: '',
    description: '',
    amount: ''
  });

  const [formData, setFormData] = useState<Partial<Car>>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    purchasePrice: 0,
    expenses: [],
    isSold: false,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCar: Car = {
      id: crypto.randomUUID(),
      make: formData.make || 'Unknown',
      model: formData.model || 'Unknown',
      year: formData.year || 2024,
      purchasePrice: Number(formData.purchasePrice) || 0,
      sellingPrice: 0,
      expenses: [],
      soldById: '',
      soldAt: null,
      isSold: false,
      notes: formData.notes || '',
      paidPartnerIds: [],
    } as Car;
    addCar(newCar);
    setShowForm(false);
    setFormData({ make: '', model: '', year: new Date().getFullYear(), purchasePrice: 0, notes: '' });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCar) return;
    
    updateCar(editingCar.id, {
      make: editingCar.make,
      model: editingCar.model,
      year: editingCar.year,
      purchasePrice: editingCar.purchasePrice,
      notes: editingCar.notes
    });
    setEditingCar(null);
  };

  const handleConfirmSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellingCarId || !salePrice || isNaN(Number(salePrice))) return;
    
    updateCar(sellingCarId, {
      isSold: true,
      sellingPrice: Number(salePrice),
      soldAt: new Date().toISOString(),
      soldById: soldByPartnerId,
      paidPartnerIds: []
    });
    setSellingCarId(null);
    setSalePrice('');
    setSoldByPartnerId('');
  };

  const handleMarketCheck = async (car: Car) => {
    setMarketCheckingId(car.id);
    const valuation = await getMarketValue(car);
    alert(`Market Analysis for ${car.year} ${car.make} ${car.model}:\n\n${valuation}`);
    setMarketCheckingId(null);
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseCar || !expenseData.category || !expenseData.amount) return;

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      category: expenseData.category.trim(),
      description: expenseData.description.trim(),
      amount: Number(expenseData.amount)
    };

    updateCar(expenseCar.id, {
      expenses: [...expenseCar.expenses, newExpense]
    });

    setExpenseCar(null);
    setExpenseData({ category: '', description: '', amount: '' });
  };

  const removeExpense = (carId: string, expenseId: string) => {
    const car = cars.find(c => c.id === carId);
    if (!car) return;
    updateCar(carId, {
      expenses: car.expenses.filter(e => e.id !== expenseId)
    });
  };

  const handleDeleteCar = () => {
    if (deletingCar) {
      deleteCar(deletingCar.id);
      setDeletingCar(null);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Current Stock</h2>
        <div className="flex gap-2">
           <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            {showForm ? 'Cancel' : '+ Add New Car'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Make</label>
              <input 
                type="text" required placeholder="e.g. Toyota"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.make}
                onChange={e => setFormData({...formData, make: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Model</label>
              <input 
                type="text" required placeholder="e.g. Camry"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.model}
                onChange={e => setFormData({...formData, model: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Year</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.year}
                onChange={e => setFormData({...formData, year: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Purchase Price</label>
              <input 
                type="number" required
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.purchasePrice}
                onChange={e => setFormData({...formData, purchasePrice: Number(e.target.value)})}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Vehicle Notes</label>
            <textarea 
              rows={3}
              placeholder="Vehicle condition, history, or specific repairs needed..."
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors">
            Confirm Acquisition
          </button>
        </form>
      )}

      {/* Edit Modal */}
      {editingCar && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Edit Vehicle Details</h3>
              <button onClick={() => setEditingCar(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Make</label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={editingCar.make}
                    onChange={e => setEditingCar({...editingCar, make: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Model</label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={editingCar.model}
                    onChange={e => setEditingCar({...editingCar, model: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Year</label>
                  <input 
                    type="number" required
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={editingCar.year}
                    onChange={e => setEditingCar({...editingCar, year: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Purchase Price ($)</label>
                  <input 
                    type="number" required
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={editingCar.purchasePrice}
                    onChange={e => setEditingCar({...editingCar, purchasePrice: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Notes</label>
                <textarea 
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  value={editingCar.notes}
                  onChange={e => setEditingCar({...editingCar, notes: e.target.value})}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" onClick={() => setEditingCar(null)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {expenseCar && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Add Expense</h3>
                <p className="text-xs text-slate-500 font-medium">{expenseCar.year} {expenseCar.make} {expenseCar.model}</p>
              </div>
              <button onClick={() => setExpenseCar(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleAddExpenseSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Category</label>
                <input 
                  list="expense-categories"
                  required
                  placeholder="e.g. Repairs"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={expenseData.category}
                  onChange={e => setExpenseData({...expenseData, category: e.target.value})}
                />
                <datalist id="expense-categories">
                  <option value="Repairs" />
                  <option value="Maintenance" />
                  <option value="Detailing" />
                  <option value="Parts" />
                  <option value="Registration" />
                  <option value="Towing" />
                  <option value="Fuel" />
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Short Description</label>
                <input 
                  type="text"
                  placeholder="e.g. New tires for rear axle"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={expenseData.description}
                  onChange={e => setExpenseData({...expenseData, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Amount ($)</label>
                <input 
                  type="number" required step="0.01"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-bold"
                  value={expenseData.amount}
                  onChange={e => setExpenseData({...expenseData, amount: e.target.value})}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setExpenseCar(null)} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-medium">Cancel</button>
                <button type="submit" className="flex-[2] bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-indigo-700">Add to Car</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCar && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Deletion</h3>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Are you sure you want to remove the <span className="font-bold text-slate-700">{deletingCar.year} {deletingCar.make} {deletingCar.model}</span> from your inventory? This action cannot be undone.
              </p>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleDeleteCar}
                  className="w-full bg-rose-600 text-white py-3.5 rounded-xl font-bold hover:bg-rose-700 transition-colors"
                >
                  Yes, Delete Record
                </button>
                <button 
                  onClick={() => setDeletingCar(null)}
                  className="w-full bg-slate-100 text-slate-600 py-3.5 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sell Modal */}
      {sellingCarId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Finalize Sale</h3>
            </div>
            <form onSubmit={handleConfirmSale} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Sale Price ($)</label>
                <input 
                  autoFocus type="number" required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-semibold"
                  value={salePrice}
                  onChange={e => setSalePrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Selling Partner</label>
                <select 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={soldByPartnerId}
                  onChange={e => setSoldByPartnerId(e.target.value)}
                >
                  <option value="">Select partner...</option>
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setSellingCarId(null)} className="flex-1 px-4 py-3 rounded-xl border border-slate-200">Cancel</button>
                <button type="submit" className="flex-[2] bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold">Confirm Sale</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map(car => {
          const totalExpenses = car.expenses.reduce((s, e) => s + e.amount, 0);
          const currentInvestment = car.purchasePrice + totalExpenses;
          const profit = car.isSold ? car.sellingPrice - currentInvestment : 0;
          const isMarketChecking = marketCheckingId === car.id;

          return (
            <div key={car.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full hover:shadow-md transition-all group/card">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-slate-900">{car.year} {car.make} {car.model}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${car.isSold ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {car.isSold ? 'Sold' : 'Active'}
                  </span>
                </div>
                
                <div className="space-y-3 text-sm mt-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Purchase Basis:</span>
                    <span className="font-medium text-slate-700">{formatCurrency(car.purchasePrice)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Expenses:</span>
                    {!car.isSold && (
                      <button 
                        onClick={() => setExpenseCar(car)} 
                        className="text-indigo-600 hover:text-indigo-700 text-xs font-bold transition-colors bg-indigo-50 px-2 py-1 rounded-md"
                      >
                        + Add New
                      </button>
                    )}
                  </div>
                  <div className="pl-4 border-l-2 border-slate-100 space-y-2">
                    {car.expenses.map(e => (
                      <div key={e.id} className="flex flex-col text-xs text-slate-500 relative group/expense">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-700">{e.category}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{formatCurrency(e.amount)}</span>
                            {!car.isSold && (
                              <button 
                                onClick={() => removeExpense(car.id, e.id)}
                                className="text-rose-400 hover:text-rose-600 opacity-0 group-hover/expense:opacity-100 transition-opacity"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                              </button>
                            )}
                          </div>
                        </div>
                        {e.description && (
                          <span className="text-[10px] text-slate-400 italic line-clamp-1">{e.description}</span>
                        )}
                      </div>
                    ))}
                    {car.expenses.length === 0 && (
                      <p className="text-xs text-slate-400 italic">No expenses recorded yet.</p>
                    )}
                  </div>

                  {!car.isSold && (
                    <button 
                      onClick={() => handleMarketCheck(car)}
                      disabled={isMarketChecking}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      {isMarketChecking ? (
                        <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                      )}
                      Check Market Value
                    </button>
                  )}

                  <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="flex justify-between text-indigo-900 font-bold">
                      <span className="text-xs uppercase tracking-wider opacity-60">Total Cost:</span>
                      <span>{formatCurrency(currentInvestment)}</span>
                    </div>
                    {car.isSold && (
                      <div className="flex justify-between text-emerald-700 font-black mt-1 border-t border-indigo-100 pt-1">
                        <span className="text-xs uppercase tracking-wider opacity-60">Net Profit:</span>
                        <span>{formatCurrency(profit)}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-50">
                    <p className="text-xs text-slate-500 italic line-clamp-2">{car.notes || 'No notes...'}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 flex gap-2">
                {!car.isSold && (
                  <button onClick={() => setSellingCarId(car.id)} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700 transition-colors">Sold</button>
                )}
                <button onClick={() => setEditingCar(car)} className="px-3 py-2 text-indigo-600 border border-indigo-200 rounded-lg text-sm font-medium hover:bg-white transition-colors">Edit</button>
                <button onClick={() => setDeletingCar(car)} className="px-3 py-2 text-rose-600 border border-rose-200 rounded-lg text-sm opacity-60 hover:opacity-100 transition-opacity">Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Inventory;
