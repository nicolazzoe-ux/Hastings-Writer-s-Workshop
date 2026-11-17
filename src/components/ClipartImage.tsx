import React, { useState } from 'react';
import {
  BookOpenCheck,
  CheckCircle2,
  FolderCheck,
  Laptop,
  Lightbulb,
  Palette,
  Pencil,
  Search,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { STEP_COLOR_THEMES } from '../data/stepLibrary';
import { StepColorKey, StepIconKey } from '../types/writing';

export function StepGlyph({
  iconKey,
  className = 'w-5 h-5',
}: {
  iconKey: StepIconKey;
  className?: string;
}) {
  switch (iconKey) {
    case 'lightbulb':
      return <Lightbulb className={className} aria-hidden="true" />;
    case 'pencil':
      return <Pencil className={className} aria-hidden="true" />;
    case 'search':
      return <Search className={className} aria-hidden="true" />;
    case 'check-circle':
      return <CheckCircle2 className={className} aria-hidden="true" />;
    case 'laptop':
      return <Laptop className={className} aria-hidden="true" />;
    case 'palette':
      return <Palette className={className} aria-hidden="true" />;
    case 'user-round':
      return <UserRound className={className} aria-hidden="true" />;
    case 'book-open-check':
      return <BookOpenCheck className={className} aria-hidden="true" />;
    case 'folder-check':
      return <FolderCheck className={className} aria-hidden="true" />;
    case 'sparkles':
    default:
      return <Sparkles className={className} aria-hidden="true" />;
  }
}

interface ClipartImageProps {
  src: string;
  alt: string;
  iconKey: StepIconKey;
  colorKey: StepColorKey;
  className?: string;
  imgClassName?: string;
}

export function ClipartImage({
  src,
  alt,
  iconKey,
  colorKey,
  className = 'w-16 h-16',
  imgClassName = 'w-full h-full object-contain',
}: ClipartImageProps) {
  const [hasError, setHasError] = useState(false);
  const theme = STEP_COLOR_THEMES[colorKey];

  if (hasError || !src) {
    return (
      <div
        className={`${className} ${theme.softBg} ${theme.border} border rounded-xl flex items-center justify-center shrink-0`}
        role="img"
        aria-label={alt}
      >
        <StepGlyph iconKey={iconKey} className={`w-1/2 h-1/2 ${theme.badgeText}`} />
      </div>
    );
  }

  return (
    <div
      className={`${className} bg-white rounded-xl overflow-hidden flex items-center justify-center shrink-0`}
    >
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={imgClassName}
        loading="lazy"
      />
    </div>
  );
}
