// What the Upcoming card's "Market odds" box prints.
//
// The card's headline and its market box can be about different fighters: on a
// v3 entry the headline is v2's opinion, while the saved price, EV and bet call
// belong to the C6 side. Printing one bare price ("-230") under a headline
// naming the other fighter read as that fighter's line. So the box names every
// number it shows: both corners' prices, and which fighter the EV/edge is for.
//
// Display only: reads the frozen entry, never recomputes anything.

export function lastName(name) {
  const parts = String(name || '').trim().split(/\s+/);
  return parts.length > 1 ? parts.slice(1).join(' ') : parts[0] || '';
}

const signedPct = (x) => `${x >= 0 ? '+' : ''}${(x * 100).toFixed(1)}%`;

// entry: a saved Upcoming entry.
// view:  { isV3, predictedWinner, pickEdge } as the card derives them.
// Returns { sides: [{ fighter, odds }], valueLine }.
export function upcomingMarketDisplay(entry, { isV3, predictedWinner, pickEdge }) {
  const sides = [
    { fighter: entry.fighterA, odds: entry.oddsA || '' },
    { fighter: entry.fighterB, odds: entry.oddsB || '' },
  ];

  let valueLine;
  if (isV3 && entry.gateEV != null) {
    // gateEV is priced on the side the gate evaluated: the tracked (C6) side.
    const side = entry.trackedSide || predictedWinner;
    valueLine = `EV ${signedPct(entry.gateEV)} on ${lastName(side)}`;
  } else if (pickEdge != null) {
    valueLine = `${signedPct(pickEdge)} edge on ${lastName(predictedWinner)}`;
  } else {
    valueLine = 'No saved market edge';
  }
  return { sides, valueLine };
}
