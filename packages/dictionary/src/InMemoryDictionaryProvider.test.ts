import { describe, expect, it } from 'vitest';
import { InMemoryDictionaryProvider } from './InMemoryDictionaryProvider';
import { DEV_DICTIONARY_VERSION } from './devWordList';

describe('InMemoryDictionaryProvider', () => {
  const dictionary = new InMemoryDictionaryProvider();

  it('validates a known word case-insensitively', () => {
    expect(dictionary.validateWord('HUND')).toBe(true);
    expect(dictionary.validateWord('hund')).toBe(true);
    expect(dictionary.validateWord('Hund')).toBe(true);
  });

  it('rejects an unknown word', () => {
    expect(dictionary.validateWord('XYZZY')).toBe(false);
  });

  it('preserves Å/Ä/Ö as distinct letters (DICTIONARY_POLICY.md section 37)', () => {
    expect(dictionary.validateWord('ÅKA')).toBe(true);
    expect(dictionary.validateWord('AKA')).toBe(false);
    expect(dictionary.validateWord('ÖRA')).toBe(true);
    expect(dictionary.validateWord('ORA')).toBe(false);
  });

  it('returns metadata for accepted proper nouns and slang (FULL ORDEL policy)', () => {
    expect(dictionary.getMetadata('VOLVO')).toEqual({ category: 'brand', source: 'dev-fixture' });
    expect(dictionary.getMetadata('DEFFA')).toEqual({
      category: 'slang',
      register: 'informal',
      source: 'dev-fixture',
    });
  });

  it('returns null metadata/definition for unknown words', () => {
    expect(dictionary.getMetadata('XYZZY')).toBeNull();
    expect(dictionary.getDefinition('XYZZY')).toBeNull();
  });

  it('reports the dev dictionary version, clearly distinct from ordel-sv-1.0', () => {
    expect(dictionary.getDictionaryVersion()).toBe(DEV_DICTIONARY_VERSION);
    expect(dictionary.getDictionaryVersion()).not.toBe('ordel-sv-1.0');
  });
});
