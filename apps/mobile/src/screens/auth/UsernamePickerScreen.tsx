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
import { useAuth } from '../../auth/AuthProvider';
import { getSupabase } from '../../lib/supabase';
import { colors, radii, spacing, typography } from '../../design/tokens';

const USERNAME_PATTERN = /^[a-zA-ZåäöÅÄÖ0-9_]{3,20}$/;
const UNIQUE_VIOLATION = '23505';

type SaveStatus = { kind: 'idle' } | { kind: 'saving' } | { kind: 'error'; message: string };

export function UsernamePickerScreen() {
  const { status: authStatus, refreshProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<SaveStatus>({ kind: 'idle' });

  if (authStatus.kind !== 'needsProfile') {
    return null;
  }
  const userId = authStatus.session.user.id;

  const handleSave = async () => {
    const trimmed = username.trim();
    if (!USERNAME_PATTERN.test(trimmed)) {
      setStatus({
        kind: 'error',
        message: '3-20 tecken: bokstäver, siffror eller understreck.',
      });
      return;
    }

    setStatus({ kind: 'saving' });
    const { error } = await getSupabase()
      .from('profiles')
      .insert({ id: userId, username: trimmed });

    if (error) {
      setStatus({
        kind: 'error',
        message:
          error.code === UNIQUE_VIOLATION
            ? 'Användarnamnet är upptaget, välj ett annat.'
            : error.message,
      });
      return;
    }

    await refreshProfile();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.heading}>Välj användarnamn</Text>
      <Text style={styles.body}>Det här visas för dina motståndare.</Text>
      <TextInput
        style={styles.input}
        placeholder="Användarnamn"
        placeholderTextColor={colors.inkMuted}
        autoCapitalize="none"
        autoCorrect={false}
        value={username}
        onChangeText={setUsername}
        editable={status.kind !== 'saving'}
        testID="username-input"
      />
      {status.kind === 'error' && (
        <Text style={styles.error} testID="username-error">
          {status.message}
        </Text>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={status.kind === 'saving'}
        testID="save-username-button"
      >
        {status.kind === 'saving' ? (
          <ActivityIndicator color={colors.surface} />
        ) : (
          <Text style={styles.buttonText}>Spara</Text>
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
