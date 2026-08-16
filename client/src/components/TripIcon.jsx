import React from 'react';
import themesSheet from '../assets/icons/themes_sheet.jpg';
import categoriesSheet from '../assets/icons/categories_sheet.jpg';
import avatarsSheet from '../assets/icons/avatars_sheet.jpg';

export const EMOJI_TO_NAME = {
  '✈️': 'plane',
  '🏖️': 'umbrella',
  '🏔️': 'mountain',
  '🌴': 'palmTree',
  '🎒': 'backpack',
  '🗺️': 'map',
  '🚢': 'cruise',
  '🏕️': 'camping',
  '🌍': 'globe',
  '🎡': 'ferrisWheel',
};

const ICON_MAP = {
  // Themes
  plane: { sheet: 'themes', col: 0, row: 0 },
  umbrella: { sheet: 'themes', col: 1, row: 0 },
  mountain: { sheet: 'themes', col: 2, row: 0 },
  palmTree: { sheet: 'themes', col: 0, row: 1 },
  backpack: { sheet: 'themes', col: 1, row: 1 },
  map: { sheet: 'themes', col: 2, row: 1 },
  cruise: { sheet: 'themes', col: 0, row: 2 },
  globe: { sheet: 'themes', col: 0, row: 3 },
  camping: { sheet: 'themes', col: 1, row: 3 },
  ferrisWheel: { sheet: 'themes', col: 2, row: 3 },

  // Categories & Onboarding & Empty States
  hotel: { sheet: 'categories', col: 0, row: 0 },
  carRental: { sheet: 'categories', col: 1, row: 0 },
  food: { sheet: 'categories', col: 0, row: 1 },
  shopping: { sheet: 'categories', col: 1, row: 1 },
  activities: { sheet: 'categories', col: 2, row: 1 },
  creditCard: { sheet: 'categories', col: 0, row: 2 },
  onboardingSettle: { sheet: 'categories', col: 1, row: 2 },
  shakingHands: { sheet: 'categories', col: 2, row: 2 },
  emptyTrips: { sheet: 'categories', col: 2, row: 3 },

  // Avatars
  surfer: { sheet: 'avatars', col: 0, row: 0 },
  programmer: { sheet: 'avatars', col: 1, row: 0 },
  chef: { sheet: 'avatars', col: 2, row: 0 },
  photographer: { sheet: 'avatars', col: 0, row: 1 },
  hiker: { sheet: 'avatars', col: 1, row: 1 },
  traveler: { sheet: 'avatars', col: 2, row: 1 },
};

export default function TripIcon({ name, size = 48, className = '' }) {
  const icon = ICON_MAP[name];
  if (!icon) return null;

  let bgImage = '';
  let bgSizeX = 100;
  let bgSizeY = 100;
  let posX = 0;
  let posY = 0;

  if (icon.sheet === 'themes') {
    bgImage = themesSheet;
    bgSizeX = 300;
    bgSizeY = 400;
    posX = icon.col === 0 ? 0 : icon.col === 1 ? 50 : 100;
    posY = icon.row === 0 ? 0 : icon.row === 1 ? 33.333 : icon.row === 2 ? 66.666 : 100;
  } else if (icon.sheet === 'categories') {
    bgImage = categoriesSheet;
    bgSizeX = 300;
    bgSizeY = 400;
    posX = icon.col === 0 ? 0 : icon.col === 1 ? 50 : 100;
    posY = icon.row === 0 ? 0 : icon.row === 1 ? 33.333 : icon.row === 2 ? 66.666 : 100;
  } else if (icon.sheet === 'avatars') {
    bgImage = avatarsSheet;
    bgSizeX = 300;
    bgSizeY = 200;
    posX = icon.col === 0 ? 0 : icon.col === 1 ? 50 : 100;
    posY = icon.row === 0 ? 0 : 100;
  }

  return (
    <div
      className={`rounded-2xl shrink-0 ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundImage: `url(${bgImage})`,
        backgroundSize: `${bgSizeX}% ${bgSizeY}%`,
        backgroundPosition: `${posX}% ${posY}%`,
        backgroundRepeat: 'no-repeat',
      }}
      role="img"
      aria-label={`${name} icon`}
      loading="lazy"
    />
  );
}
