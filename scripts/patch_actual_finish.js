'use strict';
const fs   = require('fs');
const path = require('path');

// ── Confirmed fight finish methods (sourced from Wikipedia / UFC.com) ─────────
// Keys are canonical sorted fighter pair: sort([fA, fB]).join('|')
// Values: 'KO/TKO' | 'SUB' | 'DEC'
// Skipped (logged as warning): Alex Perez vs Sumudaerji (NC – illegal foul),
//   Chris Padilla vs MarQuel Mederos (NC/draw – ambiguous method).
const FINISH_MAP = {
  // ── UFC Fight Night Baku — 2026-06-27 ────────────────────────────────────
  // canonical keys: [fA,fB].sort().join('|')
  'Abdul Rakhman Yakhyaev|Julius Walker':   'KO/TKO', // KO punches R1
  'Abus Magomedov|Michal Oleksiejczuk':     'SUB',    // guillotine choke R1
  'Asu Almabayev|Charles Johnson':          'SUB',    // Suloev stretch R3
  'Bekzat Almakhan|Jean Matsumoto':         'DEC',    // unanimous
  'Brunno Ferreira|Ikram Aliskerov':        'DEC',    // unanimous
  'Javier Reyes|Kaan Ofli':                'SUB',    // arm-triangle R1
  'Manuel Torres|Rafael Fiziev':            'KO/TKO', // spinning wheel kick R2
  'Michel Pereira|Shara Magomedov':         'DEC',    // unanimous
  'Matheus Camilo|Nazim Sadykhov':          'KO/TKO', // TKO punches R1
  'Andrey Pulyaev|Nursulton Ruziboev':      'SUB',    // neck crank R1

  // ── UFC Vegas 119 — 2026-06-20 ───────────────────────────────────────────
  'Allan Nascimento|Mitch Raposo':          'DEC',    // split decision
  'Andre Fili|Vinicius Oliveira':           'KO/TKO', // TKO punches/elbows R2
  'Andre Lima|Kevin Borjas':               'DEC',    // unanimous
  'Bia Mesquita|Melissa Mullins':          'SUB',    // armbar R1
  'Gaston Bolanos|Michael Aswell Jr.':     'DEC',    // unanimous
  'Christian Rodriguez|Hyder Amil':        'SUB',    // guillotine choke R1
  'Ion Cutelaba|Navajo Stirling':          'KO/TKO', // TKO punches R2
  'Karol Rosa|Luana Santos':              'DEC',    // unanimous
  'Kyoji Horiguchi|Manel Kape':           'KO/TKO', // TKO punches R3

  // ── UFC Freedom 250 — 2026-06-14 ─────────────────────────────────────────
  'Aiemann Zahabi|Sean O\'Malley':          'KO/TKO', // TKO punches R2
  'Alex Pereira|Ciryl Gane':               'KO/TKO', // TKO punches R2
  'Bo Nickal|Kyle Daukaus':                'KO/TKO', // TKO punches/elbows R1
  'Derrick Lewis|Josh Hokit':              'KO/TKO', // TKO punches R2
  'Diego Lopes|Steve Garcia':              'KO/TKO', // KO punches R2
  'Ilia Topuria|Justin Gaethje':           'KO/TKO', // TKO corner stoppage R4
  'Mauricio Ruffy|Michael Chandler':       'KO/TKO', // TKO spinning wheel kick R1

  // ── UFC Vegas 118 — 2026-06-06 ───────────────────────────────────────────
  'Alessandro Costa|Matt Schnell':         'KO/TKO', // TKO punches
  'Ariane Carnelossi|Ketlen Souza':        'KO/TKO', // KO punches/head kick
  'Belal Muhammad|Gabriel Bonfim':         'DEC',    // unanimous (50-45)
  'Brendan Allen|Edmen Shahbazyan':        'DEC',    // unanimous
  'Bruno Silva|Edgar Chairez':             'SUB',    // rear-naked choke
  'Chelsea Chandler|Priscila Cachoeira':   'SUB',    // armbar
  'Fares Ziam|Tom Nolan':                 'DEC',    // unanimous
  'Iwo Baraniewski|Junior Tafa':           'KO/TKO', // TKO leg kick and punches
  'Joanderson Brito|Jordan Leavitt':       'SUB',    // ninja choke
  'John Yannis|Marcus McGhee':            'DEC',    // unanimous
  'Bryce Mitchell|Santiago Luna':          'SUB',    // arm-triangle choke

  // ── UFC Macau — 2026-05-23 ───────────────────────────────────────────────
  // Alex Perez vs Sumudaerji → NC (illegal foul) — SKIPPED (no finish method)
  'Alonzo Menifield|Zhang Mingyang':       'KO/TKO', // TKO punches
  'Cameron Smotherman|Kai Asakura':        'KO/TKO', // KO punch
  'Deiveson Figueiredo|Song Yadong':       'SUB',    // guillotine choke
  'Jaqueline Amorim|Loma Lookboonmee':     'SUB',    // armbar
  'Sergei Pavlovich|Tallison Teixeira':    'KO/TKO', // KO punches

  // ── UFC Vegas 117 — 2026-05-16 ───────────────────────────────────────────
  'Alice Ardelean|Polyana Viana':          'SUB',    // capsule lock
  'Arnold Allen|Melquizael Costa':         'DEC',    // unanimous (50-45)
  'Benardo Sopaj|Timmy Cuamba':            'SUB',    // rear-naked choke
  'Andre Petroski|Cody Brundage':          'KO/TKO', // TKO punches
  'Daniel Barez|Luis Gurule':             'DEC',    // unanimous
  'Daniel Santos|Dooho Choi':             'KO/TKO', // TKO punches
  'Ivan Erslan|Tuco Tokkos':              'DEC',    // unanimous
  'Jacqueline Cavalcanti|Ketlen Vieira':   'DEC',    // unanimous
  'Khaos Williams|Nikolay Veretennikov':   'KO/TKO', // TKO punches
  'Nicolle Caliari|Shauna Bannon':         'SUB',    // arm-triangle choke

  // ── UFC 328 — 2026-05-09 ─────────────────────────────────────────────────
  'Alexander Volkov|Waldo Cortes Acosta':  'DEC',    // unanimous
  'Ateba Gautier|Ozzy Diaz':              'KO/TKO', // TKO punches
  'Baisangur Susurkaev|Djorden Santos':    'SUB',    // rear-naked choke (tech sub)
  'Clayton Carpenter|Jose Ochoa':         'DEC',    // unanimous
  'Grant Dawson|Mateusz Rebecki':         'SUB',    // rear-naked choke
  'Jared Gordon|Jim Miller':              'SUB',    // guillotine choke
  'Joel Alvarez|Yaroslav Amosov':         'SUB',    // arm-triangle choke
  'Joaquin Buckley|Sean Brady':           'DEC',    // unanimous
  'Jeremy Stephens|King Green':           'SUB',    // rear-naked choke
  'Khamzat Chimaev|Sean Strickland':      'DEC',    // split decision
  'Marco Tulio|Roman Kopylov':            'DEC',    // unanimous
  'Pat Sabatini|William Gomis':           'DEC',    // unanimous
  'Joshua Van|Tatsuro Taira':             'KO/TKO', // TKO front kick to body + punches

  // ── UFC Perth — 2026-05-02 ───────────────────────────────────────────────
  'Ben Johnston|Wes Schultz':             'SUB',    // guillotine choke R3
  'Beneil Dariush|Quillan Salkilld':      'KO/TKO', // TKO punches R1
  'Brando Pericic|Shamil Gaziev':         'KO/TKO', // KO punch R2
  'Cam Rowston|Robert Bryczek':           'DEC',    // unanimous
  'Carlos Prates|Jack Della Maddalena':   'KO/TKO', // TKO leg kicks/elbows R3
  'Colby Thicknesse|Vince Morales':       'DEC',    // unanimous
  'Dom Mar Fan|Kody Steele':              'SUB',    // inverted heel hook R1
  'Gerald Meerschaert|Jacob Malkoun':     'DEC',    // unanimous
  'Jonathan Micallef|Themba Gorimbo':     'DEC',    // split decision
  'Junior Tafa|Kevin Christian':          'KO/TKO', // KO punches/elbows R1
  'Louie Sutherland|Tai Tuivasa':         'DEC',    // unanimous
  'Marwan Rahiki|Ollie Schmid':           'KO/TKO', // TKO punches R1
  'Steve Erceg|Tim Elliott':              'DEC',    // unanimous

  // ── UFC Vegas 116 — 2026-04-25 ───────────────────────────────────────────
  'Adrian Luna Martinetti|Davey Grant':   'DEC',    // unanimous
  'Alexander Hernandez|Rafa Garcia':      'DEC',    // unanimous
  'Aljamain Sterling|Youssef Zalal':      'DEC',    // unanimous (49-45)
  'Cody Durden|Jafel Filho':              'DEC',    // unanimous
  'Eric McConico|Rodolfo Vieira':         'DEC',    // unanimous
  'Francis Marshall|Lucas Brennan':       'DEC',    // unanimous
  'Jackson McVey|Sedriques Dumas':        'SUB',    // brabo choke R1
  'Joselyne Edwards|Norma Dumont':        'DEC',    // unanimous
  'Julia Polastri|Talita Alencar':        'DEC',    // unanimous
  'Marcus Buchecha|Ryan Spann':           'KO/TKO', // KO punches R2
  'Max Griffin|Victor Valenzuela':        'DEC',    // unanimous
  'Mayra Bueno Silva|Michelle Montague':  'DEC',    // unanimous
  'Montel Jackson|Raoni Barcelos':        'DEC',    // split decision

  // ── UFC Winnipeg — 2026-04-18 ────────────────────────────────────────────
  // John Castaneda vs Mark Vologdin → majority DRAW; fought to full rounds → DEC
  'Dennis Buzukja|Marcio Barbosa':        'KO/TKO', // KO punch R1
  'Daria Zhelezniakova|Melissa Croden':   'DEC',    // unanimous
  'Gilbert Burns|Mike Malott':            'KO/TKO', // TKO punches R3
  'JJ Aldrich|Jamey-Lyn Horth':           'DEC',    // unanimous
  'Jamie Siraj|John Yannis':              'KO/TKO', // TKO punches/elbows R1
  'John Castaneda|Mark Vologdin':         'DEC',    // majority draw – went to decision
  'Julien Leblanc|Robert Valentin':       'SUB',    // rear-naked choke R1
  'Jasmine Jasudavicius|Karine Silva':    'DEC',    // unanimous
  'Charles Jourdain|Kyler Phillips':      'DEC',    // unanimous
  'Jai Herbert|Mandel Nallo':             'KO/TKO', // TKO punches R1
  'Gokhan Saricam|Tanner Boser':          'KO/TKO', // TKO punches R2
  'Gauge Young|Thiago Moises':            'DEC',    // split decision

  // ── UFC 327 — 2026-04-11 ─────────────────────────────────────────────────
  // Chris Padilla vs MarQuel Mederos → NC in ROI but was majority draw — SKIPPED
  'Aaron Pico|Patricio Freire':           'DEC',    // unanimous
  'Azamat Murzakanov|Paulo Costa':        'KO/TKO', // TKO head kick
  'Carlos Ulberg|Jiri Prochazka':         'KO/TKO', // KO punches
  'Charles Radtke|Francisco Prado':       'DEC',    // unanimous
  'Cub Swanson|Nate Landwehr':            'KO/TKO', // TKO punches
  'Curtis Blaydes|Josh Hokit':            'DEC',    // unanimous
  'Dominick Reyes|Johnny Walker':         'DEC',    // split decision
  'Esteban Ribovics|Mateusz Gamrot':      'SUB',    // arm-triangle choke
  'Kelvin Gastelum|Vicente Luque':        'SUB',    // anaconda choke
  'Kevin Holland|Randy Brown':            'DEC',    // unanimous
  'Loopy Godinez|Tatiana Suarez':         'SUB',    // rear-naked choke

  // ── UFC Vegas 115 — 2026-04-04 ───────────────────────────────────────────
  'Alessandro Costa|Stewart Nicoll':      'KO/TKO', // KO body shot R2
  'Alice Pereira|Hailey Cowan':           'KO/TKO', // KO knee R2
  'Azamat Bekoev|Tresean Gore':           'SUB',    // guillotine choke R3 (tech sub)
  'Abdul Rakhman Yakhyaev|Brendson Ribeiro': 'SUB', // rear-naked choke R1
  'Chris Duncan|Renato Moicano':          'SUB',    // face crank R2
  'Darrius Flowers|Lando Vannata':        'KO/TKO', // TKO slam/punches R2
  'Dione Barbosa|Melissa Gatto':          'DEC',    // majority decision
  'Ethyn Ewing|Rafael Estevam':           'KO/TKO', // KO body shot R3
  'Guilherme Pat|Thomas Petersen':        'DEC',    // majority decision
  'Tabatha Ricci|Virna Jandiroba':        'DEC',    // unanimous
};

// ── Load ES module as CommonJS via temp file ──────────────────────────────────
function loadESModuleAsCommonJS(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const cjs = raw.replace(/^export\s+const\s+\w+\s*=/, 'module.exports =');
  const tempPath = filePath + '.__tmp__.js';
  fs.writeFileSync(tempPath, cjs);
  try {
    delete require.cache[require.resolve(tempPath)];
    return require(tempPath);
  } finally {
    fs.unlinkSync(tempPath);
  }
}

const roiDataPath = path.join(__dirname, '../src/roiData.js');
const roiRaw      = fs.readFileSync(roiDataPath, 'utf8');
const entries     = loadESModuleAsCommonJS(roiDataPath);

function canonicalKey(a, b) {
  return [a, b].sort().join('|');
}

let updated_count = 0;
let skipped_count = 0;
const warnings = [];

const updated = entries.map((entry) => {
  // Only process entries that have a winner but no finish method
  if (!entry.actualWinner || entry.actualFinish) {
    skipped_count++;
    return entry;
  }

  const key = canonicalKey(entry.fighterA, entry.fighterB);
  const method = FINISH_MAP[key];

  if (!method) {
    warnings.push(`  NO MATCH: ${entry.fighterA} vs ${entry.fighterB} [${entry.eventDate}] — leaving blank`);
    skipped_count++;
    return entry;
  }

  updated_count++;
  return { ...entry, actualFinish: method };
});

console.log(`\nPatch complete: ${updated_count} updated, ${skipped_count} skipped`);
if (warnings.length > 0) {
  console.log('\nWarnings:');
  warnings.forEach((w) => console.log(w));
}

const exportName = roiRaw.match(/export\s+const\s+(\w+)\s*=/)?.[1] ?? 'ROI_ENTRIES';
fs.writeFileSync(roiDataPath, `export const ${exportName} = ${JSON.stringify(updated, null, 2)};\n`);
console.log('\nroiData.js written successfully.');

// Spot-check
console.log('\nSpot-check (3 updated entries):');
updated
  .filter((e) => e.actualFinish)
  .slice(0, 3)
  .forEach((e) => {
    console.log(`  ${e.fighterA} vs ${e.fighterB} → winner: ${e.actualWinner}, finish: ${e.actualFinish}`);
  });

// Summary of remaining gaps
const stillMissing = updated.filter((e) => e.actualWinner && !e.actualFinish);
if (stillMissing.length > 0) {
  console.log(`\nStill missing actualFinish (${stillMissing.length}):`);
  stillMissing.forEach((e) => console.log(`  ${e.fighterA} vs ${e.fighterB} | winner: ${e.actualWinner}`));
}
