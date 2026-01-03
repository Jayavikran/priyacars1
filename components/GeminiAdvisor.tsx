
import React, { useState } from 'react';
import { getFinancialAdvice, AdviceResult } from '../services/geminiService';
import { Car, Partner } from '../types';

interface GeminiAdvisorProps {
  cars: Car[];
  partners: Partner[];
}

const GeminiAdvisor: React.FC<GeminiAdvisorProps> = ({ cars, partners }) => {
  const [advice, setAdvice] = useState<AdviceResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateAdvice = async () => {
    setLoading(true);
    const result = await getFinancialAdvice(cars, partners);
    setAdvice(result);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">Live Backend Connected</span>
          </div>
          <h2 className="text-2xl font-bold mb-4">Strategic Partnership Advisor</h2>
          <p className="text-indigo-100 mb-6 text-lg leading-relaxed">
            Harness real-time market data via Google Search grounding to analyze your inventory health and sales velocity.
          </p>
          <button 
            onClick={handleGenerateAdvice}
            disabled={loading}
            className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                Searching Market...
              </>
            ) : (
              'Generate Business Insights'
            )}
          </button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full -mr-20 -mt-20 opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400 rounded-full -ml-16 -mb-16 opacity-30 blur-2xl"></div>
      </div>

      {advice && (
        <div className="bg-white p-8 rounded-3xl border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="flex items-center gap-2 text-indigo-600 font-bold mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .52 8.248 4 4 0 0 0 6.953 1.835 4 4 0 0 0 6.953-1.835 4 4 0 0 0 .52-8.248 4 4 0 0 0-2.526-5.77A3 3 0 1 0 12 5z"/></svg>
            Advisor Insights
          </div>
          <div className="prose prose-indigo max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
            {advice.text}
          </div>

          {advice.sources.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-50">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Sources & References</h4>
              <div className="flex flex-wrap gap-2">
                {advice.sources.map((source, idx) => (
                  <a 
                    key={idx} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all font-medium"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    {source.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Grounded with Google Search
            </span>
            <span>Refreshed {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      )}

      {!advice && !loading && (
        <div className="text-center py-12 text-slate-400">
          <p>Click the button above to receive customized business recommendations based on current used car market trends.</p>
        </div>
      )}
    </div>
  );
};

export default GeminiAdvisor;
