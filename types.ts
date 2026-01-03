
import React from 'react';

export enum CategoryType {
  POKOK = "Kebutuhan Pokok",
  TRANSPORT = "Transportasi & Servis",
  GAYA_HIDUP = "Gaya Hidup",
  KESEHATAN = "Kesehatan",
  TABUNGAN = "Tabungan",
  LAINNYA = "Lainnya"
}

export interface ExpenseItem {
  id: string;
  item: string;
  price: number;
  category: CategoryType;
  source: string;
  date: string;
}

export interface CategoryMetadata {
  icon: React.ReactNode;
  color: string;
  border: string;
  accent: string;
  budget: number; // Menambahkan limit budget bulanan
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
