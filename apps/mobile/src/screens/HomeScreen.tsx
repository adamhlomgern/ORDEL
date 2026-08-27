import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../auth/AuthProvider';
import { getSupabase } from '../lib/supabase';
import { fetchMyGames, type MyGameRow } from '../lib/myGames';
import { colors, radii, spacing, typography } from '../design/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

type LoadState = { kind: 'loading' } | { kind: 'ready' } | { kind: 'error'; message: string };

interface Section {
  title: string;
  data: MyGameRow[];
}

function buildSections(games: MyGameRow[]): Section[] {
  const yourTurn = games.filter((g) => g.status === 'active' && g.is_my_turn);
  const waiting = games.filter((g) => g.status === 'active' && !g.is_my_turn);
  const completed = games.filter((g) => g.status === 'completed');

  const sections: Section[] = [];
  if (yourTurn.length > 0) sections.push({ title: 'DIN TUR', data: yourTurn });
  if (waiting.length > 0) sections.push({ title: 'VÄNTAR', data: waiting });
  if (completed.length > 0) sections.push({ title: 'AVSLUTADE', data: completed });
  return sections;
}

function statusCaption(game: MyGameRow): string {
  if (game.status === 'completed') {
    return `Avslutat (${game.end_reason ?? 'okänt'})`;
  }
  return game.is_my_turn ? 'Din tur' : `Väntar på ${game.opponent_username}`;
}

export function HomeScreen({ navigation }: Props) {
  const { status: authStatus } = useAuth();
  const username = authStatus.kind === 'ready' ? authStatus.username : '';
  const [games, setGames] = useState<MyGameRow[]>([]);
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showSpinner: boolean) => {
    if (showSpinner) setState({ kind: 'loading' });
    const { data, error } = await fetchMyGames();
    if (error) {
      setState({ kind: 'error', message: error.message });
      return;
    }
    setGames(data ?? []);
    setState({ kind: 'ready' });
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(true);
    }, [load]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await load(false);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Ordel</Text>
        <Text style={styles.subheading}>Inloggad som {username}</Text>
        <TouchableOpacity onPress={() => getSupabase().auth.signOut()} testID="sign-out-button">
          <Text style={styles.signOut}>Logga ut</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.newGameButton}
        onPress={() => navigation.navigate('CreateGame')}
        testID="new-game-button"
      >
        <Text style={styles.newGameButtonText}>Nytt parti</Text>
      </TouchableOpacity>

      {state.kind === 'loading' && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
        </View>
      )}

      {state.kind === 'error' && (
        <View style={styles.centered}>
          <Text style={styles.error} testID="games-error">
            {state.message}
          </Text>
          <TouchableOpacity onPress={() => load(true)}>
            <Text style={styles.retryText}>Försök igen</Text>
          </TouchableOpacity>
        </View>
      )}

      {state.kind === 'ready' && games.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.body}>Inga partier ännu. Skapa ett nytt!</Text>
        </View>
      )}

      {state.kind === 'ready' && games.length > 0 && (
        <SectionList
          sections={buildSections(games)}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.gameRow}
              onPress={() => navigation.navigate('GameDetail', { gameId: item.id })}
              testID={`game-row-${item.id}`}
            >
              <Text style={styles.gameOpponent}>vs {item.opponent_username}</Text>
              <Text style={styles.gameStatus}>{statusCaption(item)}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.xs,
  },
  heading: {
    ...typography.heading,
    color: colors.ink,
  },
  subheading: {
    ...typography.body,
    color: colors.inkMuted,
  },
  signOut: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.sm,
  },
  newGameButton: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
  },
  newGameButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  body: {
    ...typography.body,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
  },
  retryText: {
    ...typography.body,
    color: colors.accent,
  },
  sectionHeader: {
    ...typography.caption,
    color: colors.inkMuted,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  gameRow: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gameOpponent: {
    ...typography.body,
    color: colors.ink,
    fontWeight: '600',
  },
  gameStatus: {
    ...typography.caption,
    color: colors.inkMuted,
  },
});
