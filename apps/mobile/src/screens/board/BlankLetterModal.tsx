import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Letter } from '@ordel/types';
import { colors, radii, spacing, typography } from '../../design/tokens';

const LETTERS: Letter[] = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  'Å',
  'Ä',
  'Ö',
];

interface Props {
  visible: boolean;
  onSelect: (letter: Letter) => void;
  onCancel: () => void;
}

export function BlankLetterModal({ visible, onSelect, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.heading}>Välj bokstav</Text>
          <View style={styles.grid}>
            {LETTERS.map((letter) => (
              <TouchableOpacity
                key={letter}
                style={styles.letterButton}
                onPress={() => onSelect(letter)}
                testID={`blank-letter-${letter}`}
              >
                <Text style={styles.letterText}>{letter}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={onCancel} testID="blank-letter-cancel">
            <Text style={styles.cancelText}>Avbryt</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
    maxWidth: 320,
  },
  heading: {
    ...typography.heading,
    fontSize: 20,
    color: colors.ink,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  letterButton: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.ink,
  },
  cancelText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
  },
});
