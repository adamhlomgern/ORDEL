import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../auth/AuthProvider';
import { getSupabase } from '../lib/supabase';
import { fetchMyGame, type MyGameRow } from '../lib/myGames';
import { submitTurnAction } from '../lib/edgeFunctions';
import { colors, radii, spacing, typography } from '../design/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'GameDetail'>;

interface GamePlayerPublicRow {
  player_id: string;
  score: number;
  rack_tile_count: number;
  has_resigned: boolean;
}

type LoadState =
  | { kind: 'loading' }
  | { kind: 'ready'; game: MyGameRow; players: GamePlayerPublicRow[] }
  | { kind: 'error'; message: string };

type ActionStatus = { kind: 'idle' } | { kind: 'busy' } | { kind: 'error'; message: string };

export function GameDetailScreen({ route, navigation }: Props) {
  const { gameId } = route.params;
  const { status: authStatus } = useAuth();
  const userId = authStatus.kind === 'ready' ? authStatus.session.user.id : '';
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [actionStatus, setActionStatus] = useState<ActionStatus>({ kind: 'idle' });

  const load = useCallback(async () => {
    const [gameResult, playersResult] = await Promise.all([
      fetchMyGame(gameId),
      getSupabase()
        .from('game_players_public')
        .select('player_id, score, rack_tile_count, has_resigned')
        .eq('game_id', gameId)
        .returns<GamePlayerPublicRow[]>(),
    ]);

    if (gameResult.error) {
      setState({ kind: 'error', message: gameResult.error.message });
      return;
    }
    if (!gameResult.data) {
      setState({ kind: 'error', message: 'Partiet kunde inte hittas.' });
      return;
    }
    if (playersResult.error) {
      setState({ kind: 'error', message: playersResult.error.message });
      return;
    }

    setState({ kind: 'ready', game: gameResult.data, players: playersResult.data ?? [] });
  }, [gameId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handlePass = async () => {
    setActionStatus({ kind: 'busy' });
    const result = await submitTurnAction(gameId, { type: 'PASS' });
    if (!result.ok) {
      setActionStatus({ kind: 'error', message: result.message });
      return;
    }
    setActionStatus({ kind: 'idle' });
    await load();
  };

  const doResign = async () => {
    setActionStatus({ kind: 'busy' });
    const result = await submitTurnAction(gameId, { type: 'RESIGN' });
    if (!result.ok) {
      setActionStatus({ kind: 'error', message: result.message });
      return;
    }
    setActionStatus({ kind: 'idle' });
    await load();
  };

  const handleResign = () => {
    Alert.alert('Ge upp partiet?', 'Det här går inte att ångra.', [
      { text: 'Avbryt', style: 'cancel' },
      { text: 'Ge upp', style: 'destructive', onPress: doResign },
    ]);
  };

  if (state.kind === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (state.kind === 'error') {
    return (
      <View style={styles.centered}>
        <Text style={styles.error} testID="game-detail-error">
          {state.message}
        </Text>
      </View>
    );
  }

  const { game, players } = state;
  const me = players.find((p) => p.player_id === userId);
  const opponent = players.find((p) => p.player_id !== userId);
  const busy = actionStatus.kind === 'busy';
  const canPass = game.status === 'active' && game.is_my_turn;
  const canResign = game.status === 'active';

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Du vs {game.opponent_username}</Text>
      <View style={styles.scoreRow}>
        <Text style={styles.score}>Du: {me?.score ?? 0}</Text>
        <Text style={styles.score}>
          {game.opponent_username}: {opponent?.score ?? 0}
        </Text>
      </View>
      <Text style={styles.body} testID="game-status">
        {game.status === 'completed'
          ? `Avslutat (${game.end_reason ?? 'okänt'})`
          : game.is_my_turn
            ? 'Din tur'
            : `Väntar på ${game.opponent_username}`}
      </Text>
      <Text style={styles.caption}>Brickor kvar i påsen: {game.tile_bag_remaining}</Text>

      {actionStatus.kind === 'error' && (
        <Text style={styles.error} testID="action-error">
          {actionStatus.message}
        </Text>
      )}

      {busy ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Board', { gameId })}
            testID="play-button"
          >
            <Text style={styles.buttonText}>{canPass ? 'Lägg bricka' : 'Visa bräde'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, !canPass && styles.buttonDisabled]}
            onPress={handlePass}
            disabled={!canPass}
            testID="pass-button"
          >
            <Text style={styles.buttonText}>Passa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.dangerButton, !canResign && styles.buttonDisabled]}
            onPress={handleResign}
            disabled={!canResign}
            testID="resign-button"
          >
            <Text style={styles.buttonText}>Ge upp</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.md,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    ...typography.heading,
    color: colors.ink,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  score: {
    ...typography.body,
    color: colors.ink,
    fontWeight: '600',
  },
  body: {
    ...typography.body,
    color: colors.inkMuted,
  },
  caption: {
    ...typography.caption,
    color: colors.inkMuted,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: colors.danger,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
});
