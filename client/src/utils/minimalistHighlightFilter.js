/**
 * Minimalist preset — emphasis word selector
 *
 * Always runs algorithmic selection (no AI density gating):
 *   1. POWER words → always highlighted, no matter where they fall.
 *   2. FREQUENCY   → every STEP-th non-power qualifying word fills out density.
 *   3. AI BOOST    → if rawHighlights are available, any fuzzy-matched word is
 *                    also highlighted (additive on top of the above two).
 *
 * Returns Set<number> of transcript-array indices to highlight yellow.
 */

const STEP    = 3; // every Nth non-power qualifying word
const MIN_GAP = 0; // no forced gap — let density be fully driven by STEP + power words

// Words that are ALWAYS highlighted regardless of the frequency step
const POWER_WORDS = new Set([
  'biggest', 'smallest', 'fastest', 'slowest', 'worst', 'best', 'greatest',
  'massive', 'huge', 'insane', 'crazy', 'brutal', 'extreme', 'epic',
  'real', 'true', 'fake', 'raw', 'full', 'zero', 'free', 'new', 'old',
  'secret', 'truth', 'lie', 'proof', 'fact', 'mistake', 'problem', 'solution',
  'money', 'cash', 'profit', 'loss', 'risk', 'deal', 'result', 'life', 'death',
  'million', 'billion', 'thousand', 'hundred', 'percent', 'double', 'triple',
  'win', 'won', 'lose', 'lost', 'fail', 'failed', 'quit', 'quits',
  'build', 'built', 'break', 'broke', 'broken', 'destroy', 'destroyed',
  'earn', 'earned', 'save', 'saved', 'kill', 'killed', 'change', 'changed',
  'stop', 'stopped', 'start', 'started', 'launch', 'launched',
  'grow', 'grew', 'grown', 'scale', 'scaled', 'crush', 'crushed',
  'dominate', 'dominated', 'hack', 'hacked', 'reach', 'hit',
  'never', 'always', 'finally', 'literally', 'actually', 'exactly', 'only',
  'instantly', 'immediately', 'suddenly', 'forever', 'already',
  'wrong', 'right', 'bad', 'good', 'toxic', 'powerful', 'weak',
  'important', 'critical', 'dangerous', 'safe', 'easy', 'hard', 'fast',
  'first', 'last', 'every', 'each', 'whole', 'entire',
]);

const STOP_WORDS = new Set([
  'a', 'an', 'the',
  'and', 'but', 'or', 'nor', 'for', 'yet', 'so',
  'because', 'since', 'although', 'while', 'if', 'unless', 'until',
  'when', 'where', 'whether', 'though', 'once', 'as',
  'in', 'on', 'at', 'to', 'of', 'with', 'by', 'from', 'up',
  'about', 'into', 'through', 'during', 'above', 'below', 'between',
  'among', 'under', 'over', 'out', 'off', 'down', 'without', 'within',
  'along', 'against', 'around', 'near', 'behind', 'beyond', 'across',
  'i', 'me', 'my', 'myself',
  'you', 'your', 'yourself',
  'he', 'him', 'his', 'himself',
  'she', 'her', 'hers', 'herself',
  'it', 'its', 'itself',
  'we', 'us', 'our', 'ourselves',
  'they', 'them', 'their', 'theirs', 'themselves',
  'this', 'that', 'these', 'those',
  'which', 'who', 'whom', 'whose', 'what', 'how', 'why',
  'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had',
  'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might',
  'shall', 'must', 'can', 'am',
  'not', 'no', 'yes', 'ok', 'okay', 'yeah', 'um', 'uh',
  'also', 'even', 'however', 'just', 'already', 'again',
  'back', 'then', 'now', 'here', 'there', 'very', 'really',
  'like', 'get', 'got', 'gonna', 'wanna', 'kinda', 'sorta',
]);

function normalize(str) {
  return String(str).replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();
}

function isStop(w)  { return STOP_WORDS.has(w); }

function isPower(w) {
  if (/^\d/.test(w)) return true; // any number/stat
  if (POWER_WORDS.has(w)) return true;
  for (const p of POWER_WORDS) {
    if (p.length >= 4 && w.startsWith(p)) return true; // inflections: "launch" → "launching"
  }
  return false;
}

function fuzzyMatch(w, set) {
  if (set.has(w)) return true;
  for (const h of set) {
    if (Math.min(h.length, w.length) >= 4 && (w.startsWith(h) || h.startsWith(w))) return true;
  }
  return false;
}

/**
 * @param {Array} orderedWords  — state.transcription
 * @param {Array} rawHighlights — state.rawAiHighlights (may be empty / sparse)
 * @returns {Set<number>}
 */
export function filterMinimalistHighlights(orderedWords, rawHighlights) {
  const aiBoost = new Set((rawHighlights || []).map(normalize));
  const result  = new Set();
  let freqCounter = 0; // counts non-power qualifying words seen

  orderedWords.forEach((wordObj, idx) => {
    const cleaned = normalize(wordObj.word || wordObj.text || '');
    if (!cleaned || isStop(cleaned) || cleaned.length < 2) return;

    const power       = isPower(cleaned);
    const aiSuggested = aiBoost.size > 0 && fuzzyMatch(cleaned, aiBoost);

    if (power || aiSuggested) {
      // Tier 1 & 2: always highlight
      result.add(idx);
      freqCounter = 0; // reset so the word right after a power/AI word isn't double-highlighted
    } else {
      // Tier 3: frequency fill — every STEP-th non-priority word
      if (freqCounter % STEP === 0) {
        result.add(idx);
      }
      freqCounter++;
    }
  });

  console.log(`[Minimalist Filter] ${result.size} / ${orderedWords.length} words highlighted (power+freq+ai)`);
  return result;
}
