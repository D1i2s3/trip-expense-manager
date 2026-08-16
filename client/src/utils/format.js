// src/utils/format.js — Currency and date helpers

export const formatINR = (amount) => {
  if (amount == null || isNaN(amount)) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

export const formatDateInput = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

export const CATEGORY_ICONS = {
  Food: '🍽️',
  Hotel: '🏨',
  Transport: '🚗',
  Activities: '🎯',
  Shopping: '🛍️',
  Entertainment: '🎬',
  Medical: '⚕️',
  Other: '📦',
};

export const CATEGORY_COLORS = {
  Food: '#F59E0B',
  Hotel: '#8B5CF6',
  Transport: '#3B82F6',
  Activities: '#10B981',
  Shopping: '#EC4899',
  Entertainment: '#F97316',
  Medical: '#EF4444',
  Other: '#64748B',
};

export const CATEGORIES = Object.keys(CATEGORY_ICONS);
