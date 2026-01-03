
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { ProfitStats, Car, Partner } from '../types';

interface DashboardProps {
  stats: ProfitStats;
  cars: Car[];
  partners: Partner[];
}

const Dashboard: React.FC<DashboardProps> = ({ stats, cars, partners }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const kpis = [
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), color: 'text-emerald-600' },
    { label: 'Net Profit', value: formatCurrency(stats.netProfit), color: 'text-indigo-600' },
    { label: 'Total Withdrawn', value: formatCurrency(stats.totalWithdrawn), color: 'text-rose-500' },
    { label: 'In Business Pool', value: formatCurrency(stats.netProfit - stats.totalWithdrawn), color: 'text-slate-900' },
  ];

  const barData = partners.map(p => ({
    name: p.name,
    profit: stats.profitByPartner[p.id] || 0,
    taken: stats.withdrawnByPartner[p.id] || 0
  }));

  const pieData = partners.map(p => ({
    name: p.name,
    value: p.splitPercentage
  }));

  const expenseCategoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    cars.forEach(car => {
      car.expenses.forEach(exp => {
        const cat = exp.category || 'Uncategorized';
        categories[cat] = (categories[cat] || 0) + exp.amount;
      });
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [cars]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];

  const formatDateShort = (isoString: string | null) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
            <p className={`text-2xl font-bold mt-2 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit vs Taken Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Earnings vs Withdrawals</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="profit" name="Total Earned" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="taken" name="Profit Taken" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Partner Payout Breakdown Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800">Partner Payout Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Partner</th>
                  <th className="px-6 py-4">Total Earned</th>
                  <th className="px-6 py-4">Profit Taken</th>
                  <th className="px-6 py-4">Outstanding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {partners.map(p => {
                  const earned = stats.profitByPartner[p.id] || 0;
                  const taken = stats.withdrawnByPartner[p.id] || 0;
                  const balance = earned - taken;
                  const percentTaken = earned > 0 ? (taken / earned) * 100 : 0;
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{p.splitPercentage}% Split</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                        {formatCurrency(earned)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-rose-600">{formatCurrency(taken)}</div>
                        <div className="w-16 bg-slate-100 h-1 rounded-full mt-1 overflow-hidden">
                          <div className="bg-rose-500 h-full" style={{ width: `${Math.min(percentTaken, 100)}%` }} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${balance > 0.01 ? 'text-indigo-600' : 'text-slate-400'}`}>
                          {formatCurrency(balance)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ownership/Split Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Agreed Profit Split %</h3>
          <div className="h-[250px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Inventory Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden lg:col-span-2">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800">Recent Inventory</h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">Latest 5 Cars</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Car Details</th>
                  <th className="px-6 py-4">Sold Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Purchase</th>
                  <th className="px-6 py-4">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cars.slice(-5).reverse().map((car) => {
                  const profit = car.isSold 
                    ? car.sellingPrice - car.purchasePrice - car.expenses.reduce((s, e) => s + e.amount, 0)
                    : 0;
                  return (
                    <tr key={car.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{car.year} {car.make} {car.model}</div>
                        <div className="text-xs text-slate-500">ID: {car.id.slice(0, 8)}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                        {formatDateShort(car.soldAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${car.isSold ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {car.isSold ? 'Sold' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {formatCurrency(car.purchasePrice)}
                      </td>
                      <td className="px-6 py-4 font-bold text-indigo-600">
                        {car.isSold ? formatCurrency(profit) : '-'}
                      </td>
                    </tr>
                  );
                })}
                {cars.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      No cars in inventory yet. Add your first car!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
