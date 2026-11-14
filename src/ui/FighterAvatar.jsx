import { useState } from 'react';
import { FIGHTER_PHOTOS } from '../fighterPhotos.js';

/**
 * A fighter's round avatar: their freely licensed Commons photo when the
 * sourcing pipeline found one (scripts/fighter_photos/), otherwise their
 * initials. A photo that fails to load falls back to initials too. The photo
 * is decorative next to the visible name, so it carries an empty alt.
 */

export const initialsOf = (name) => {
  const words = String(name ?? '')
    .replace(/\b(Jr|Sr|II|III|IV)\.?$/i, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

export const photoFor = (name) => FIGHTER_PHOTOS[name] ?? null;

export default function FighterAvatar({ name, size = 40, className = '' }) {
  const photo = photoFor(name);
  const [failed, setFailed] = useState(false);
  const box = { width: size, height: size };

  if (photo && !failed) {
    return (
      <img
        src={photo.src}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={`shrink-0 rounded-full object-cover bg-surface-3 ring-1 ring-line-strong ${className}`}
        style={box}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`shrink-0 inline-flex items-center justify-center rounded-full bg-surface-3 ring-1 ring-line-strong text-secondary font-semibold select-none ${className}`}
      style={{ ...box, fontSize: Math.max(10, Math.round(size * 0.36)) }}
    >
      {initialsOf(name)}
    </span>
  );
}
