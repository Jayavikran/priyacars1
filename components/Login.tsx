
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (success: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Default admin credentials
    setTimeout(() => {
      if (username === 'admin' && password === 'password123') {
        onLogin(true);
      } else {
        setError('Invalid username or password');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">V.T AutoProfit</h1>
          <p className="text-slate-500 mt-2 font-medium italic">Partnership Management Secure Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Administrator Access</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Username</label>
              <input 
                type="text"
                required
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <input 
                type="password"
                required
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Secure Login'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Authorized personnel only. Sessions are monitored.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-slate-400 text-xs mt-8">
          V.T Partnership: Ramesh Ram & Thangaraj
        </p>
      </div>
    </div>
  );
};

export default Login;
