
import React from 'react';
import { Wallet, AlertCircle, Target, Zap } from 'lucide-react';
import { ExpenseItem, CategoryType } from '../types';
import { CATEGORIES } from '../constants';

interface Props {
  expenses: ExpenseItem[];
}

const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(number);
};

export const ExpenseDashboard: React.FC<Props> = ({ expenses }) => {
  const totalExpense = expenses.reduce((sum, item) => sum + item.price, 0);
  
  const getCategoryTotal = (cat: CategoryType) => 
    expenses.filter(e => e.category === cat).reduce((sum, item) => sum + item.price, 0);

  const lifestyleTotal = getCategoryTotal(CategoryType.GAYA_HIDUP);
  const basicTotal = getCategoryTotal(CategoryType.POKOK);

  return (
    <div className="space-y-6">
      {/* Total Card */}
      <div className="glass-dark p-8 rounded-[2.5rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
          <Zap size={120} className="text-indigo-400" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-[0.2em]">
              <Wallet size={16} className="text-indigo-400" />
              Total Ekosistem
            </h1>
            <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              {expenses.length} OPS
            </span>
          </div>
          <div className="text-5xl font-black text-white tracking-tighter gradient-text">
            {formatRupiah(totalExpense)}
          </div>
          <p className="text-[10px] text-slate-500 mt-4 uppercase tracking-widest font-semibold">Financial Overview • Raboros Intel</p>
        </div>
      </div>

      {/* Budget Monitor */}
      <div className="glass-dark p-8 rounded-[2.5rem]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Target size={14} className="text-purple-400" /> Alokasi Strategis
          </h2>
        </div>
        
        <div className="space-y-6">
            {(Object.keys(CATEGORIES) as CategoryType[]).map((cat) => {
               const amount = getCategoryTotal(cat);
               const metadata = CATEGORIES[cat];
               const percent = Math.min((amount / metadata.budget) * 100, 100);
               const isOverBudget = amount > metadata.budget;

               return (
                 <div key={cat} className="space-y-3">
                   <div className="flex justify-between items-end">
                     <div>
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{cat}</span>
                       <div className="text-sm font-bold text-slate-200">
                         {formatRupiah(amount)} 
                         <span className="text-slate-600 font-medium ml-1">/ {formatRupiah(metadata.budget)}</span>
                       </div>
                     </div>
                     <span className={`text-[10px] font-black ${isOverBudget ? 'text-rose-500' : 'text-indigo-400'}`}>
                       {percent.toFixed(0)}%
                     </span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
                     <div 
                       style={{ width: `${percent}%` }} 
                       className={`h-full transition-all duration-1000 ease-out ${isOverBudget ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                     />
                   </div>
                 </div>
               )
            })}
        </div>
      </div>

      {/* Anomaly / Insight */}
      {lifestyleTotal > basicTotal && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-[2rem] p-6 flex gap-5 items-start">
          <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
            <AlertCircle className="text-amber-500" size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-200">Anomali Pengeluaran Terdeteksi</h3>
            <p className="text-xs text-amber-500/70 mt-1 leading-relaxed font-medium">
              Struktur pengeluaran Anda didominasi oleh Gaya Hidup. Aktifkan <strong>Raboros Advisor</strong> untuk strategi optimalisasi.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
