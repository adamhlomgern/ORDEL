import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { createGame } from '../lib/edgeFunctions';
import { colors, radii, spacing, typography } from '../design/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateGame'>;

type CreateStatus = { kind: 'idle' } | { kind: 'creating' } | { kind: 'error'; message: string };

export function CreateGameScreen({ navigation }: Props) {
  const [opponentUsername, setOpponentUsername] = useState('');
  const [status, setStatus] = useState<CreateStatus>({ kind: 'idle' });

  const handleCreate = async () => {
    const trimmed = opponentUsername.trim();
    if (!trimmed) {
      setStatus({ kind: 'error', message: 'Ange motståndarens användarnamn.' });
      return;
    }

    setStatus({ kind: 'creating' });
    const result = await createGame(trimmed);

    if (!result.ok) {
      setStatus({ kind: 'error', message: result.message });
      return;
    }

    navigation.replace('GameDetail', { gameId: result.data.gameId });
  };

  const busy = status.kind === 'creating';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.heading}>Nytt parti</Text>
      <Text style={styles.body}>Ange användarnamnet på den du vill utmana.</Text>
      <TextInput
        style={styles.input}
        placeholder="Användarnamn"
        placeholderTextColor={colors.inkMuted}
        autoCapitalize="none"
        autoCorrect={false}
        value={opponentUsername}
        onChangeText={setOpponentUsername}
        editable={!busy}
        testID="opponent-username-input"
      />
      {status.kind === 'error' && (
        <Text style={styles.error} testID="create-game-error">
          {status.message}
        </Text>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={handleCreate}
        disabled={busy}
        testID="create-game-button"
      >
        {busy ? (
          <ActivityIndicator color={colors.surface} />
        ) : (
          <Text style={styles.buttonText}>Skapa parti</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  heading: {
    ...typography.heading,
    color: colors.ink,
  },
  body: {
    ...typography.body,
    color: colors.inkMuted,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    color: colors.ink,
    fontSize: 16,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
});
