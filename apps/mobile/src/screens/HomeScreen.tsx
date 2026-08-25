import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { checkSupabaseConnection } from '../lib/supabase';
import { colors, spacing, typography } from '../design/tokens';

type BackendStatus =
  { kind: 'checking' } | { kind: 'connected' } | { kind: 'error'; message: string };

export function HomeScreen() {
  const [status, setStatus] = useState<BackendStatus>({ kind: 'checking' });

  useEffect(() => {
    let cancelled = false;

    checkSupabaseConnection()
      .then((result) => {
        if (cancelled) return;
        setStatus(
          result.connected ? { kind: 'connected' } : { kind: 'error', message: result.error },
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus({ kind: 'error', message: err instanceof Error ? err.message : String(err) });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Ordel</Text>
      <Text style={styles.status} testID="backend-status">
        {status.kind === 'checking' && 'Backend: Kontrollerar...'}
        {status.kind === 'connected' && 'Backend: Ansluten'}
        {status.kind === 'error' && `Backend: Ej nåbar (${status.message})`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  heading: {
    ...typography.heading,
    color: colors.ink,
  },
  status: {
    ...typography.body,
    color: colors.inkMuted,
  },
});
