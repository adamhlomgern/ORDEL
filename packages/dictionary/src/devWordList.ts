import type { WordMetadata } from './DictionaryProvider';

/**
 * DEVELOPMENT-ONLY word list. This is NOT the real Ordel Swedish dictionary
 * (`ordel-sv-1.0`). The real dictionary pipeline (SALDO, Sprakradet new words,
 * Swedish names >=100 threshold, Lantmateriet place names, Ordel Extended) is
 * explicitly out of scope until the V0.1 release gate defined in
 * GAME_RULES.md sections 79-80 and DICTIONARY_POLICY.md.
 *
 * This tiny fixture exists only so packages/dictionary and the app have
 * something real to compile and test against during V0.0.
 */
export const DEV_DICTIONARY_VERSION = 'ordel-sv-dev-0.0.0';

export interface DevWordEntry {
  word: string;
  definition?: string;
  metadata: WordMetadata;
}

export const DEV_WORD_LIST: DevWordEntry[] = [
  {
    word: 'HUND',
    definition: 'Domesticerat rovdjur.',
    metadata: { category: 'standard', source: 'dev-fixture' },
  },
  { word: 'HUNDAR', metadata: { category: 'standard', source: 'dev-fixture' } },
  { word: 'KATT', metadata: { category: 'standard', source: 'dev-fixture' } },
  { word: 'KATTER', metadata: { category: 'standard', source: 'dev-fixture' } },
  { word: 'BIL', metadata: { category: 'standard', source: 'dev-fixture' } },
  { word: 'BOK', metadata: { category: 'standard', source: 'dev-fixture' } },
  { word: 'ORD', metadata: { category: 'standard', source: 'dev-fixture' } },
  { word: 'SPEL', metadata: { category: 'standard', source: 'dev-fixture' } },
  { word: 'BRICKA', metadata: { category: 'standard', source: 'dev-fixture' } },
  { word: 'JA', metadata: { category: 'standard', source: 'dev-fixture' } },
  { word: 'NEJ', metadata: { category: 'standard', source: 'dev-fixture' } },
  { word: 'ÖRA', metadata: { category: 'standard', source: 'dev-fixture' } },
  { word: 'ÄTA', metadata: { category: 'standard', source: 'dev-fixture' } },
  { word: 'ÅKA', metadata: { category: 'standard', source: 'dev-fixture' } },
  { word: 'ADA', metadata: { category: 'name', source: 'dev-fixture' } },
  { word: 'ZLATAN', metadata: { category: 'name', source: 'dev-fixture' } },
  { word: 'STOCKHOLM', metadata: { category: 'place', source: 'dev-fixture' } },
  { word: 'SVERIGE', metadata: { category: 'place', source: 'dev-fixture' } },
  { word: 'VÄNERN', metadata: { category: 'place', source: 'dev-fixture' } },
  { word: 'VOLVO', metadata: { category: 'brand', source: 'dev-fixture' } },
  { word: 'IKEA', metadata: { category: 'brand', source: 'dev-fixture' } },
  { word: 'DEFFA', metadata: { category: 'slang', register: 'informal', source: 'dev-fixture' } },
  { word: 'AI', metadata: { category: 'abbreviation', source: 'dev-fixture' } },
  { word: 'VD', metadata: { category: 'abbreviation', source: 'dev-fixture' } },
];
