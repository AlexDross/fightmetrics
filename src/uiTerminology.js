export const CSI_DESCRIPTION =
  'Competitive Standing Index combines 65% of a fighter’s current ranking tier with 35% of their Elo strength into a 0–1 standing indicator. It is a proxy for where a fighter currently sits competitively. It is not an average of past opponents or a historical strength-of-schedule score, and it does not directly affect v2 predictions.';

export const V2_OPPONENT_QUALITY_DESCRIPTION =
  'V2 does not include a direct strength-of-schedule feature. Opponent quality is represented indirectly through Elo, which accounts for the opponent’s rating when each fight occurred. That historical Elo credit does not change retroactively if the opponent later improves or declines.';

export const MASTER_RATING_DESCRIPTION =
  'Master Rating normalizes current Elo from 0–100 between the lowest- and highest-rated fighters in the weight class. It is a display ranking and does not add a direct opponent-quality or schedule adjustment.';
