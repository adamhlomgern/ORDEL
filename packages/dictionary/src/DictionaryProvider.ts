/**
 * Dictionary abstraction per MASTER_PRODUCT_BRIEF.md section 13.
 * Never hardcode vocabulary in UI components — the game engine and app must
 * depend only on this interface, never on a specific data source.
 */
export interface WordMetadata {
  category?: string;
  register?: string;
  source?: string;
}

export interface DictionaryProvider {
  /** Case-insensitive; must never collapse Å/Ä/Ö (DICTIONARY_POLICY.md sections 36-37). */
  validateWord(word: string): boolean;
  getDefinition(word: string): string | null;
  getMetadata(word: string): WordMetadata | null;
  getDictionaryVersion(): string;
}
