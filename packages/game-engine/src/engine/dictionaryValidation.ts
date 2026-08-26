import type { DictionaryProvider } from '@ordel/dictionary';
import type { WordCandidate } from './wordExtraction';
import { wordText } from './wordExtraction';

export type DictionaryCheckResult = { valid: true } | { valid: false; invalidWords: string[] };

/**
 * Validates every candidate word against the injected dictionary. If ANY
 * word is invalid, the whole move is invalid (GAME_RULES.md section 23 —
 * no partial acceptance). Collects every invalid word, not just the first,
 * so future UI can explain all of them at once (sections 14, 32).
 *
 * Case is ignored and Å/Ä/Ö are never collapsed (GAME_RULES.md sections
 * 14-15) — `wordText` already preserves the exact letters chosen, so
 * normalization here is uppercasing only.
 */
export function validateWords(
  candidates: WordCandidate[],
  dictionary: DictionaryProvider,
): DictionaryCheckResult {
  const invalidWords: string[] = [];

  for (const candidate of candidates) {
    const word = wordText(candidate).toUpperCase();
    if (!dictionary.validateWord(word)) {
      invalidWords.push(word);
    }
  }

  if (invalidWords.length > 0) {
    return { valid: false, invalidWords };
  }

  return { valid: true };
}
