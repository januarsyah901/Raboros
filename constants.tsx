
import React from 'react';
import { ShoppingCart, Wrench, Coffee, HeartPulse, Package } from 'lucide-react';
import { CategoryType, CategoryMetadata } from './types';

export const CATEGORIES: Record<CategoryType, CategoryMetadata> = {
  [CategoryType.POKOK]: { 
    icon: <ShoppingCart size={20} />, 
    color: "bg-blue-50 text-blue-600", 
    border: "border-blue-100",
    accent: "bg-blue-500",
    budget: 2000000
  },
  [CategoryType.TRANSPORT]: { 
    icon: <Wrench size={20} />, 
    color: "bg-orange-50 text-orange-600", 
    border: "border-orange-100",
    accent: "bg-orange-500",
    budget: 1000000
  },
  [CategoryType.GAYA_HIDUP]: { 
    icon: <Coffee size={20} />, 
    color: "bg-purple-50 text-purple-600", 
    border: "border-purple-100",
    accent: "bg-purple-500",
    budget: 1500000
  },
  [CategoryType.KESEHATAN]: { 
    icon: <HeartPulse size={20} />, 
    color: "bg-rose-50 text-rose-600", 
    border: "border-rose-100",
    accent: "bg-rose-500",
    budget: 500000
  },
  [CategoryType.LAINNYA]: { 
    icon: <Package size={20} />, 
    color: "bg-slate-50 text-slate-600", 
    border: "border-slate-100",
    accent: "bg-slate-500",
    budget: 300000
  }
};
