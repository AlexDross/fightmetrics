import { FIGHTER_PHOTOS } from '../fighterPhotos.js';

/**
 * Attribution for every fighter photo, as their licenses require: author,
 * license (linked) and the Wikimedia Commons source page. Collapsed by default
 * so the Info tab stays readable.
 */
export default function PhotoCredits() {
  const entries = Object.entries(FIGHTER_PHOTOS).sort(([a], [b]) => a.localeCompare(b));
  if (entries.length === 0) return null;
  return (
    <div>
      <h2 className="text-white font-black text-xl mb-1">Photo Credits</h2>
      <div className="bg-surface border border-line rounded-xl p-5">
        <p className="text-xs text-secondary leading-relaxed">
          Fighter photos are freely licensed images from{' '}
          <a className="text-info underline underline-offset-2" href="https://commons.wikimedia.org/" target="_blank" rel="noreferrer">
            Wikimedia Commons
          </a>
          , cropped to a head-and-shoulders avatar. Fighters without a free photo show their initials.
        </p>
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-semibold text-primary">
            Show all {entries.length} photo credits
          </summary>
          <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {entries.map(([name, p]) => (
              <li key={name} className="text-xs text-secondary leading-snug">
                <span className="text-primary font-semibold">{name}</span>
                {' — '}
                {p.artist ? `${p.artist}, ` : ''}
                {p.licenseUrl ? (
                  <a className="text-info underline underline-offset-2" href={p.licenseUrl} target="_blank" rel="noreferrer">
                    {p.license}
                  </a>
                ) : (
                  p.license
                )}
                {p.source && (
                  <>
                    {' · '}
                    <a className="text-info underline underline-offset-2" href={p.source} target="_blank" rel="noreferrer">
                      source
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
}
