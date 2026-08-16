// src/components/PremiumIcon.jsx
import React from 'react';

const ICON_POSITIONS = {
  createTrip: { col: 0, row: 0 },
  myTrips: { col: 1, row: 0 },
  howItWorks: { col: 2, row: 0 },
  totalSpent: { col: 0, row: 1 },
  hotelStay: { col: 1, row: 1 },
  carRental: { col: 2, row: 1 },
  food: { col: 0, row: 2 },
  activities: { col: 1, row: 2 },
  addExpense: { col: 2, row: 2 },
  analytics: { col: 0, row: 3 },
  notification: { col: 1, row: 3 },
};

export default function PremiumIcon({ name, size = 48, className = '' }) {
  // Check for standalone custom single-file icons
  if (name === 'airplane3D') {
    return (
      <div
        className={`rounded-2xl shrink-0 shadow-lg ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundImage: 'url("/assets/airplane_3d.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        aria-hidden="true"
      />
    );
  }

  if (name === 'biplane3D') {
    return (
      <div
        className={`rounded-2xl shrink-0 shadow-lg ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundImage: 'url("/assets/biplane_3d.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        aria-hidden="true"
      />
    );
  }

  const pos = ICON_POSITIONS[name];
  if (!pos) return null;

  // Grid is 3 columns (col 0, 1, 2) and 4 rows (row 0, 1, 2, 3)
  const bgSizeX = 300; 
  const bgSizeY = 400; 

  const posX = pos.col === 0 ? 0 : pos.col === 1 ? 50 : 100;
  const posY = pos.row === 0 ? 0 : pos.row === 1 ? 33.333 : pos.row === 2 ? 66.666 : 100;

  return (
    <div
      className={`rounded-2xl shrink-0 shadow-lg ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundImage: 'url("/assets/3d_icons.jpg")',
        backgroundSize: `${bgSizeX}% ${bgSizeY}%`,
        backgroundPosition: `${posX}% ${posY}%`,
        backgroundRepeat: 'no-repeat',
      }}
      aria-hidden="true"
    />
  );
}
