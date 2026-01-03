
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
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

export const ExpenseList: React.FC<Props> = ({ expenses }) => {
  const [expandedCat, setExpandedCat] = useState<CategoryType | null>(null);

  const getCategoryTotal = (cat: CategoryType) => 
    expenses.filter(e => e.category === cat).reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="space-y-4 pb-40">
      {(Object.keys(CATEGORIES) as CategoryType[]).map((cat) => {
        const catExpenses = expenses.filter(e => e.category === cat);
        if (catExpenses.length === 0) return null;

        const isExpanded = expandedCat === cat;
        const metadata = CATEGORIES[cat];

        return (
          <div key={cat} className={`glass-dark rounded-[2rem] overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-1 ring-white/10' : ''}`}>
            <button 
              onClick={() => setExpandedCat(isExpanded ? null : cat)}
              className="w-full flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-300`}>
                  {metadata.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-100 text-sm tracking-tight uppercase tracking-widest">{cat}</h3>
                  <p className="text-xs font-semibold text-slate-500 mt-1">{formatRupiah(getCategoryTotal(cat))}</p>
                </div>
              </div>
              <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                {isExpanded ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
              </div>
            </button>

            {isExpanded && (
              <div className="px-6 pb-6 pt-2 space-y-4">
                {catExpenses.map((item) => (
                  <div key={item.id} className="flex justify-between items-center group">
                    <div className="flex-1">
                      <span className="text-sm text-slate-300 font-bold block leading-tight group-hover:text-white transition-colors">{item.item}</span>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">{item.source}</span>
                        <div className="w-1 h-1 bg-slate-700 rounded-full" />
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          {new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end pl-4">
                      <span className="text-sm font-black text-white tracking-tight">{formatRupiah(item.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
