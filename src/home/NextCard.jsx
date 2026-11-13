import { Link } from 'react-router-dom';
import { resolveFrozenDecisionView } from '../domain/betting';
import { Card, SectionLabel, Tag } from '../ui/kit.jsx';

/**
 * Home's "next card" panel: the nearest pending event in Upcoming, every
 * fight in card order (main event first, as stored), the model's frozen pick
 * and the frozen bet call. Everything shown is read from values frozen on the
 * entry at save time -- nothing here runs the model -- so it always matches
 * the Upcoming tab.
 */

const isPending = (e) => !e.actualWinner;

const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** The pending event to feature: the earliest one dated today or later, else the earliest pending at all. */
export function pickNextEvent(entries, today = localToday()) {
  const events = new Map();
  for (const e of entries ?? []) {
    if (!isPending(e) || !e.eventName) continue;
    const key = `${e.eventDate ?? ''}|${e.eventName}`;
    if (!events.has(key)) events.set(key, { name: e.eventName, date: e.eventDate ?? null, fights: [] });
    events.get(key).fights.push(e);
  }
  const list = [...events.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  return list.find((ev) => ev.date && ev.date >= today) ?? list[0] ?? null;
}

/** "Today", "Tomorrow", or "Sat, Nov 14". */
export function eventDateLabel(iso, today = localToday()) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  const days = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ty, tm - 1, td)) / 86400000);
  const pretty = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC',
  });
  if (days === 0) return `Today · ${pretty}`;
  if (days === 1) return `Tomorrow · ${pretty}`;
  return pretty;
}

/** The frozen pick for one entry: C6 decision when the entry is C6-driven, else raw v2. */
export function frozenPick(entry) {
  const c6 = resolveFrozenDecisionView(entry);
  if (c6) return { name: c6.winner, prob: c6.probability, source: 'C6' };
  if (entry.v2pA != null && entry.v2pB != null) {
    const aWins = entry.v2pA >= entry.v2pB;
    return { name: aWins ? entry.fighterA : entry.fighterB, prob: Math.max(entry.v2pA, entry.v2pB), source: 'v2' };
  }
  if (entry.trackedSide && entry.trackedProb != null) {
    return { name: entry.trackedSide, prob: entry.trackedProb, source: 'v2' };
  }
  return null;
}

const ACTION_TONE = { 'STRONG BET': 'good', BET: 'good', LEAN: 'warn' };
const isBet = (action) => action === 'BET' || action === 'STRONG BET';

const formatOdds = (o) => {
  if (o == null || o === '') return null;
  const n = Number(o);
  if (!Number.isFinite(n)) return String(o);
  return n > 0 ? `+${n}` : String(n);
};

function FightRow({ entry }) {
  const pick = frozenPick(entry);
  const action = entry.betAction || 'NO BET';
  const bet = isBet(action);
  const title = entry.boutContext?.isTitleBout;
  const rounds = entry.boutContext?.scheduledRounds;
  const division = entry.boutContext?.division || entry.division;
  const pickOdds = pick ? formatOdds(pick.name === entry.fighterA ? entry.oddsA : entry.oddsB) : null;
  const betOdds = formatOdds(entry.betRecommendedOdds);

  return (
    <li
      className={`grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-4 gap-y-1 px-5 py-3 ${
        bet ? 'bg-good/8 border-l-2 border-good' : 'border-l-2 border-transparent'
      }`}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-primary sm:truncate">
          {entry.fighterA} <span className="text-muted font-normal">vs</span> {entry.fighterB}
        </p>
        <p className="text-xs text-muted mt-0.5 flex items-center gap-1.5">
          {title && <Tag tone="accent">TITLE</Tag>}
          {[division, rounds ? `${rounds} rds` : null].filter(Boolean).join(' · ')}
        </p>
      </div>

      <div className="col-start-1 text-sm sm:col-start-2 sm:row-start-1 sm:text-right">
        {pick ? (
          <>
            <span className="text-muted text-xs mr-1.5">{pick.source}</span>
            <span className="font-semibold text-primary">{pick.name}</span>
            <span className="tabular text-secondary ml-1.5">{(pick.prob * 100).toFixed(1)}%</span>
            {pickOdds && <span className="tabular text-muted text-xs ml-1.5">{pickOdds}</span>}
          </>
        ) : (
          <span className="text-muted text-xs">No pick recorded</span>
        )}
        {bet && entry.betRecommendedFighter && (
          <p className="text-xs text-good mt-0.5">
            Bet {entry.betRecommendedFighter}
            {betOdds && <span className="tabular"> {betOdds}</span>}
          </p>
        )}
      </div>

      <div className="col-start-2 row-start-1 row-span-2 justify-self-end sm:col-start-3 sm:row-span-1">
        <Tag tone={ACTION_TONE[action] ?? 'muted'}>{action}</Tag>
      </div>
    </li>
  );
}

export default function NextCard({ entries }) {
  const event = pickNextEvent(entries);

  if (!event) {
    return (
      <Card className="px-5 py-6 mb-8">
        <SectionLabel className="mb-1">Next card</SectionLabel>
        <p className="text-primary font-semibold">No card entered yet</p>
        <p className="text-muted text-sm mt-1">
          When the next event&apos;s fights are saved to Upcoming, the model&apos;s picks and bets show up here.
        </p>
      </Card>
    );
  }

  const counts = event.fights.reduce(
    (c, e) => {
      const a = e.betAction || 'NO BET';
      if (isBet(a)) c.bets += 1;
      else if (a === 'LEAN') c.leans += 1;
      return c;
    },
    { bets: 0, leans: 0 }
  );
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

  return (
    <Card className="mb-8 overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-3 px-5 pt-5 pb-4">
        <div className="min-w-0">
          <SectionLabel className="mb-1 text-accent-hover">Next card</SectionLabel>
          <h2 className="text-xl font-bold tracking-tight text-primary">{event.name}</h2>
          <p className="text-sm text-muted mt-0.5">
            {[eventDateLabel(event.date), plural(event.fights.length, 'fight'), plural(counts.bets, 'bet'), plural(counts.leans, 'lean')]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <Link to="/upcoming" className="text-sm font-semibold text-secondary hover:text-primary">
          Open Upcoming →
        </Link>
      </div>
      <ul className="divide-y divide-line border-t border-line">
        {event.fights.map((e) => (
          <FightRow key={e.id} entry={e} />
        ))}
      </ul>
    </Card>
  );
}
