
import React, { useState, useEffect, useMemo } from 'react';
import { Partner, Car, ProfitStats } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Partners from './components/Partners';
import GeminiAdvisor from './components/GeminiAdvisor';
import Login from './components/Login';
import SalesHistory from './components/SalesHistory';
import { api } from './services/api';

const STORAGE_KEY_AUTH = 'autoprofit_logged_in';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem(STORAGE_KEY_AUTH) === 'true';
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'partners' | 'advisor' | 'sales'>('dashboard');
  
  const [partners, setPartners] = useState<Partner[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial Data Fetch from MongoDB
  useEffect(() => {
    if (isLoggedIn) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const [fetchedPartners, fetchedCars] = await Promise.all([
            api.getPartners(),
            api.getCars()
          ]);
          setPartners(fetchedPartners);
          setCars(fetchedCars);
          setError(null);
        } catch (err) {
          console.error("Data fetch error:", err);
          setError("Failed to connect to database. Please check backend status.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [isLoggedIn]);

  const stats: ProfitStats = useMemo(() => {
    let totalRevenue = 0;
    let totalPurchase = 0;
    let totalExpenses = 0;
    const profitByPartner: Record<string, number> = {};
    const withdrawnByPartner: Record<string, number> = {};

    partners.forEach(p => { 
      profitByPartner[p.id] = 0; 
      withdrawnByPartner[p.id] = p.profitTaken || 0;
    });

    cars.forEach(car => {
      if (car.isSold) {
        const carExpenses = car.expenses.reduce((sum, e) => sum + e.amount, 0);
        const grossProfit = car.sellingPrice - car.purchasePrice - carExpenses;
        
        totalRevenue += car.sellingPrice;
        totalPurchase += car.purchasePrice;
        totalExpenses += carExpenses;

        partners.forEach(p => {
          const partnerShare = grossProfit * (p.splitPercentage / 100);
          profitByPartner[p.id] += partnerShare;
          
          if (car.paidPartnerIds?.includes(p.id)) {
            withdrawnByPartner[p.id] += partnerShare;
          }
        });
      }
    });

    const totalWithdrawn = Object.values(withdrawnByPartner).reduce((a, b) => a + b, 0);

    return {
      totalRevenue,
      totalExpenses: totalExpenses + totalPurchase,
      totalGrossProfit: totalRevenue - totalPurchase,
      netProfit: totalRevenue - totalPurchase - totalExpenses,
      profitByPartner,
      withdrawnByPartner,
      totalWithdrawn
    };
  }, [cars, partners]);

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsLoggedIn(true);
      sessionStorage.setItem(STORAGE_KEY_AUTH, 'true');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem(STORAGE_KEY_AUTH);
  };

  // API Syncing Wrappers
  const addCar = async (car: Car) => {
    const newCar = await api.createCar({ ...car, paidPartnerIds: [] });
    setCars(prev => [...prev, newCar]);
  };

  const updateCar = async (id: string, updated: Partial<Car>) => {
    const updatedCar = await api.updateCar(id, updated);
    setCars(prev => prev.map(c => c.id === id ? updatedCar : c));
  };

  const deleteCar = async (id: string) => {
    await api.deleteCar(id);
    setCars(prev => prev.filter(c => c.id !== id));
  };

  const toggleCarPayment = async (carId: string, partnerId: string) => {
    const car = cars.find(c => c.id === carId);
    if (!car) return;
    const alreadyPaid = car.paidPartnerIds?.includes(partnerId);
    const newPaidIds = alreadyPaid 
      ? car.paidPartnerIds.filter(id => id !== partnerId)
      : [...(car.paidPartnerIds || []), partnerId];
    
    await updateCar(carId, { paidPartnerIds: newPaidIds });
  };

  const addPartner = async (p: Partner) => {
    const newPartner = await api.createPartner({ ...p, profitTaken: 0 });
    setPartners(prev => [...prev, newPartner]);
  };

  const updatePartner = async (id: string, updated: Partial<Partner>) => {
    const updatedPartner = await api.updatePartner(id, updated);
    setPartners(prev => prev.map(p => p.id === id ? updatedPartner : p));
  };

  const deletePartner = async (id: string) => {
    await api.deletePartner(id);
    setPartners(prev => prev.filter(p => p.id !== id));
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {activeTab === 'dashboard' && 'Business Overview'}
              {activeTab === 'inventory' && 'Car Inventory'}
              {activeTab === 'partners' && 'Partnership Splits'}
              {activeTab === 'advisor' && 'AI Financial Advisor'}
              {activeTab === 'sales' && 'Sales Performance History'}
            </h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></span>
              {isLoading ? 'Syncing with MongoDB...' : 'V.T Partnership Management System'}
            </p>
          </div>
          {error && (
            <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold border border-rose-100 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              {error}
            </div>
          )}
        </header>

        <div className="max-w-7xl mx-auto">
          {isLoading && activeTab === 'dashboard' ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-40">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-bold text-slate-600">Loading your data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && <Dashboard stats={stats} cars={cars} partners={partners} />}
              {activeTab === 'inventory' && (
                <Inventory 
                  cars={cars} 
                  addCar={addCar} 
                  updateCar={updateCar} 
                  deleteCar={deleteCar} 
                  partners={partners}
                />
              )}
              {activeTab === 'partners' && (
                <Partners 
                  partners={partners} 
                  addPartner={addPartner} 
                  updatePartner={updatePartner} 
                  deletePartner={deletePartner}
                  cars={cars}
                  toggleCarPayment={toggleCarPayment}
                />
              )}
              {activeTab === 'advisor' && <GeminiAdvisor cars={cars} partners={partners} />}
              {activeTab === 'sales' && <SalesHistory cars={cars} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
