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
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { getSupabase } from '../../lib/supabase';
import { colors, radii, spacing, typography } from '../../design/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;
type Mode = 'signIn' | 'signUp';

type Status = { kind: 'idle' } | { kind: 'busy' } | { kind: 'error'; message: string };

const MIN_PASSWORD_LENGTH = 6;

export function LoginScreen(_props: Props) {
  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail.includes('@')) {
      setStatus({ kind: 'error', message: 'Ange en giltig e-postadress.' });
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setStatus({
        kind: 'error',
        message: `Lösenordet måste vara minst ${MIN_PASSWORD_LENGTH} tecken.`,
      });
      return;
    }

    setStatus({ kind: 'busy' });

    if (mode === 'signUp') {
      const { data, error } = await getSupabase().auth.signUp({
        email: trimmedEmail,
        password,
      });
      if (error) {
        setStatus({ kind: 'error', message: error.message });
        return;
      }
      // Supabase signals "already registered" via an empty identities array
      // rather than an error (anti-enumeration behavior), not a thrown error.
      if (data.user && data.user.identities?.length === 0) {
        setStatus({ kind: 'error', message: 'Kontot finns redan, logga in istället.' });
        return;
      }
      setStatus({ kind: 'idle' });
      return;
    }

    const { error } = await getSupabase().auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });
    if (error) {
      setStatus({ kind: 'error', message: error.message });
      return;
    }
    setStatus({ kind: 'idle' });
  };

  const busy = status.kind === 'busy';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.heading}>Ordel</Text>

      <TouchableOpacity
        style={styles.tabs}
        onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
        testID="mode-toggle"
      >
        <Text style={styles.tabLabel}>
          {mode === 'signIn' ? 'Har du inget konto? Skapa ett' : 'Har du redan ett konto? Logga in'}
        </Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="namn@exempel.se"
        placeholderTextColor={colors.inkMuted}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        value={email}
        onChangeText={setEmail}
        editable={!busy}
        testID="email-input"
      />
      <TextInput
        style={styles.input}
        placeholder="Lösenord"
        placeholderTextColor={colors.inkMuted}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        textContentType={mode === 'signUp' ? 'newPassword' : 'password'}
        value={password}
        onChangeText={setPassword}
        editable={!busy}
        testID="password-input"
      />

      {status.kind === 'error' && (
        <Text style={styles.error} testID="login-error">
          {status.message}
        </Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={busy}
        testID="submit-button"
      >
        {busy ? (
          <ActivityIndicator color={colors.surface} />
        ) : (
          <Text style={styles.buttonText}>{mode === 'signIn' ? 'Logga in' : 'Skapa konto'}</Text>
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
  tabs: {
    alignItems: 'center',
  },
  tabLabel: {
    ...typography.body,
    color: colors.accent,
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
