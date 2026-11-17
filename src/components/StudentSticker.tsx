import React from 'react';
import {
  Bird,
  Cat,
  Crown,
  Fish,
  Flower2,
  Heart,
  Leaf,
  Music,
  Rocket,
  Star,
  Sun,
  Umbrella,
} from 'lucide-react';
import { STICKER_OPTIONS } from '../data/stepLibrary';
import { StickerId } from '../types/writing';

export function StickerIcon({
  sticker,
  className = 'w-4 h-4',
}: {
  sticker: StickerId;
  className?: string;
}) {
  switch (sticker) {
    case 'star':
      return <Star className={className} aria-hidden="true" />;
    case 'sun':
      return <Sun className={className} aria-hidden="true" />;
    case 'rocket':
      return <Rocket className={className} aria-hidden="true" />;
    case 'heart':
      return <Heart className={className} aria-hidden="true" />;
    case 'flower':
      return <Flower2 className={className} aria-hidden="true" />;
    case 'leaf':
      return <Leaf className={className} aria-hidden="true" />;
    case 'fish':
      return <Fish className={className} aria-hidden="true" />;
    case 'bird':
      return <Bird className={className} aria-hidden="true" />;
    case 'cat':
      return <Cat className={className} aria-hidden="true" />;
    case 'crown':
      return <Crown className={className} aria-hidden="true" />;
    case 'music':
      return <Music className={className} aria-hidden="true" />;
    case 'umbrella':
      return <Umbrella className={className} aria-hidden="true" />;
  }
}

export function StudentSticker({
  sticker,
  size = 'md',
}: {
  sticker: StickerId;
  size?: 'sm' | 'md' | 'lg';
}) {
  const option =
    STICKER_OPTIONS.find((item) => item.id === sticker) ?? STICKER_OPTIONS[0];

  const sizeClasses =
    size === 'sm'
      ? 'w-7 h-7 rounded-lg'
      : size === 'lg'
        ? 'w-11 h-11 rounded-xl'
        : 'w-9 h-9 rounded-lg';

  const iconClasses =
    size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <span
      className={`${sizeClasses} ${option.bg} ${option.text} inline-flex items-center justify-center shrink-0`}
      title={option.label}
    >
      <StickerIcon sticker={option.id} className={iconClasses} />
    </span>
  );
}
