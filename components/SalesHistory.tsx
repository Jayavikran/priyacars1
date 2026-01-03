
import React, { useState, useMemo } from 'react';
import { Car } from '../types';

interface SalesHistoryProps {
  cars: Car[];
}

type SortField = 'date' | 'profit' | 'price';
type SortOrder = 'asc' | 'desc';

const SalesHistory: React.FC<SalesHistoryProps> = ({ cars }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const formatDate = (isoString: string | null) => {
    if (!isoString) return 'Unknown';
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateNetProfit = (car: Car) => {
    const expenses = car.expenses.reduce((sum, e) => sum + e.amount, 0);
    return car.sellingPrice - car.purchasePrice - expenses;
  };

  const filteredAndSortedCars = useMemo(() => {
    return cars
      .filter(car => car.isSold)
      .filter(car => {
        // Search filter
        const searchStr = `${car.make} ${car.model} ${car.year}`.toLowerCase();
        const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
        
        // Date range filter
        let matchesDate = true;
        if (car.soldAt) {
          const soldDate = new Date(car.soldAt);
          soldDate.setHours(0, 0, 0, 0);
          
          if (dateFrom) {
            const from = new Date(dateFrom);
            from.setHours(0, 0, 0, 0);
            if (soldDate < from) matchesDate = false;
          }
          if (dateTo) {
            const to = new Date(dateTo);
            to.setHours(23, 59, 59, 999);
            if (soldDate > to) matchesDate = false;
          }
        } else if (dateFrom || dateTo) {
          matchesDate = false;
        }

        return matchesSearch && matchesDate;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'date') {
          const dateA = a.soldAt ? new Date(a.soldAt).getTime() : 0;
          const dateB = b.soldAt ? new Date(b.soldAt).getTime() : 0;
          comparison = dateA - dateB;
        } else if (sortField === 'profit') {
          comparison = calculateNetProfit(a) - calculateNetProfit(b);
        } else if (sortField === 'price') {
          comparison = a.sellingPrice - b.sellingPrice;
        }
        return sortOrder === 'desc' ? -comparison : comparison;
      });
  }, [cars, searchTerm, sortField, sortOrder, dateFrom, dateTo]);

  const summary = useMemo(() => {
    const soldCars = filteredAndSortedCars;
    const totalSales = soldCars.reduce((sum, c) => sum + c.sellingPrice, 0);
    const totalProfit = soldCars.reduce((sum, c) => sum + calculateNetProfit(c), 0);
    return {
      count: soldCars.length,
      totalSales,
      totalProfit,
      avgProfit: soldCars.length > 0 ? totalProfit / soldCars.length : 0
    };
  }, [filteredAndSortedCars]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filter Results</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{summary.count} Sold</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Revenue (Filtered)</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(summary.totalSales)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Profit (Filtered)</p>
          <p className="text-xl font-bold text-indigo-600 mt-1">{formatCurrency(summary.totalProfit)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg Profit / Unit</p>
          <p className="text-xl font-bold text-slate-700 mt-1">{formatCurrency(summary.avgProfit)}</p>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 w-full lg:w-auto">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Search Inventory</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Make, model, or year..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="w-5 h-5 absolute left-3 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>

          <div className="w-full lg:w-48">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Sold From</label>
            <input 
              type="date" 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="w-full lg:w-48">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Sold To</label>
            <input 
              type="date" 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <button 
            onClick={clearFilters}
            className="w-full lg:w-auto px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
          >
            Clear
          </button>
        </div>

        <div className="pt-4 border-t border-slate-50 flex flex-wrap gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 py-2">Sort By:</span>
          <button 
            onClick={() => toggleSort('date')}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all flex items-center gap-2 ${sortField === 'date' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
          >
            Sale Date {sortField === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button 
            onClick={() => toggleSort('profit')}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all flex items-center gap-2 ${sortField === 'profit' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
          >
            Profit {sortField === 'profit' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button 
            onClick={() => toggleSort('price')}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all flex items-center gap-2 ${sortField === 'price' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
          >
            Selling Price {sortField === 'price' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vehicle Details</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sale Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Acquisition</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Sale Price</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedCars.map(car => {
                const profit = calculateNetProfit(car);
                const totalExpenses = car.expenses.reduce((sum, e) => sum + e.amount, 0);
                const totalInvestment = car.purchasePrice + totalExpenses;
                const roi = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;
                
                return (
                  <tr key={car.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{car.year} {car.make} {car.model}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-bold">INVESTMENT: {formatCurrency(totalInvestment)}</span>
                        <span>•</span>
                        <span>{car.expenses.length} EXPENSES</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {formatDate(car.soldAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-medium text-slate-500">{formatCurrency(car.purchasePrice)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-bold text-slate-900">{formatCurrency(car.sellingPrice)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`text-sm font-black ${profit > 0 ? 'text-indigo-600' : 'text-rose-500'}`}>
                        {formatCurrency(profit)}
                      </div>
                      <div className={`text-[10px] font-black uppercase inline-block px-1.5 py-0.5 rounded ${roi >= 20 ? 'bg-emerald-50 text-emerald-600' : roi > 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                        {roi.toFixed(1)}% ROI
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredAndSortedCars.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <svg className="w-12 h-12 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                      <p className="text-slate-500 font-medium">No sales history found for the selected filters.</p>
                      <button 
                        onClick={clearFilters}
                        className="mt-4 text-indigo-600 text-sm font-bold hover:underline"
                      >
                        Reset all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;
