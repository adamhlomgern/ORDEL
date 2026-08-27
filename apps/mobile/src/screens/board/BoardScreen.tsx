import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type {
  BoardCoordinate,
  BoardTileState,
  GameStatus,
  Letter,
  Placement,
  RackTile,
} from '@ordel/types';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { useAuth } from '../../auth/AuthProvider';
import { getSupabase } from '../../lib/supabase';
import { submitTurnAction } from '../../lib/edgeFunctions';
import { previewPlay, type PreviewResult } from '../../lib/boardPreview';
import { BoardGrid, type PendingPlacement } from './BoardGrid';
import { RackTray } from './RackTray';
import { BlankLetterModal } from './BlankLetterModal';
import { colors, radii, spacing, typography } from '../../design/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Board'>;
type Mode = 'play' | 'swap';

interface ReadyData {
  board: BoardTileState[];
  status: GameStatus;
  currentTurnPlayerId: string | null;
  rack: RackTile[];
}

type LoadState =
  { kind: 'loading' } | { kind: 'ready'; data: ReadyData } | { kind: 'error'; message: string };

type SubmitStatus = { kind: 'idle' } | { kind: 'busy' } | { kind: 'error'; message: string };

function coordKey(c: BoardCoordinate): string {
  return `${c.row},${c.col}`;
}

export function BoardScreen({ route, navigation }: Props) {
  const { gameId } = route.params;
  const { status: authStatus } = useAuth();
  const userId = authStatus.kind === 'ready' ? authStatus.session.user.id : '';

  const [loadState, setLoadState] = useState<LoadState>({ kind: 'loading' });
  const [mode, setMode] = useState<Mode>('play');
  const [pendingPlacements, setPendingPlacements] = useState<PendingPlacement[]>([]);
  const [selectedRackTileId, setSelectedRackTileId] = useState<string | null>(null);
  const [selectedForSwap, setSelectedForSwap] = useState<Set<string>>(new Set());
  const [blankTile, setBlankTile] = useState<Extract<RackTile, { kind: 'blank' }> | null>(null);
  const [blankCoordinate, setBlankCoordinate] = useState<BoardCoordinate | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({ kind: 'idle' });

  const resetPending = useCallback(() => {
    setPendingPlacements([]);
    setSelectedRackTileId(null);
    setSelectedForSwap(new Set());
  }, []);

  const load = useCallback(async () => {
    const [gameResult, playerResult] = await Promise.all([
      getSupabase()
        .from('games_public')
        .select('board_state, status, current_turn_player_id')
        .eq('id', gameId)
        .maybeSingle(),
      getSupabase()
        .from('game_players_public')
        .select('rack')
        .eq('game_id', gameId)
        .eq('player_id', userId)
        .maybeSingle(),
    ]);

    if (gameResult.error || !gameResult.data) {
      setLoadState({
        kind: 'error',
        message: gameResult.error?.message ?? 'Partiet hittades inte.',
      });
      return;
    }
    if (playerResult.error || !playerResult.data) {
      setLoadState({
        kind: 'error',
        message: playerResult.error?.message ?? 'Din bricka hittades inte.',
      });
      return;
    }

    setLoadState({
      kind: 'ready',
      data: {
        board: gameResult.data.board_state,
        status: gameResult.data.status,
        currentTurnPlayerId: gameResult.data.current_turn_player_id,
        rack: playerResult.data.rack,
      },
    });
    resetPending();
  }, [gameId, userId, resetPending]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const availableRackTiles = useMemo(() => {
    if (loadState.kind !== 'ready') return [];
    if (mode === 'swap') return loadState.data.rack;
    const pendingIds = new Set(pendingPlacements.map((p) => p.tile.id));
    return loadState.data.rack.filter((t) => !pendingIds.has(t.id));
  }, [loadState, mode, pendingPlacements]);

  const preview: PreviewResult | null = useMemo(() => {
    if (loadState.kind !== 'ready' || pendingPlacements.length === 0) return null;
    const placements: Placement[] = pendingPlacements.map((p) => ({
      coordinate: p.coordinate,
      tile: p.tile,
    }));
    return previewPlay(loadState.data.board, loadState.data.rack, placements);
  }, [loadState, pendingPlacements]);

  const switchMode = (next: Mode) => {
    setMode(next);
    resetPending();
  };

  const isMyTurn =
    loadState.kind === 'ready' &&
    loadState.data.status === 'active' &&
    loadState.data.currentTurnPlayerId === userId;

  const handleCellPress = (coordinate: BoardCoordinate) => {
    if (mode !== 'play' || loadState.kind !== 'ready' || !isMyTurn) return;
    const key = coordKey(coordinate);

    const pendingIndex = pendingPlacements.findIndex((p) => coordKey(p.coordinate) === key);
    if (pendingIndex !== -1) {
      setPendingPlacements((prev) => prev.filter((_, i) => i !== pendingIndex));
      return;
    }

    const isOccupied = loadState.data.board.some((t) => coordKey(t.coordinate) === key);
    if (isOccupied || !selectedRackTileId) return;

    const tile = availableRackTiles.find((t) => t.id === selectedRackTileId);
    if (!tile) return;

    if (tile.kind === 'blank') {
      setBlankTile(tile);
      setBlankCoordinate(coordinate);
      return;
    }

    setPendingPlacements((prev) => [...prev, { coordinate, tile }]);
    setSelectedRackTileId(null);
  };

  const handleRackTilePress = (tile: RackTile) => {
    if (!isMyTurn) return;
    if (mode === 'swap') {
      setSelectedForSwap((prev) => {
        const next = new Set(prev);
        if (next.has(tile.id)) {
          next.delete(tile.id);
        } else {
          next.add(tile.id);
        }
        return next;
      });
      return;
    }
    setSelectedRackTileId((prev) => (prev === tile.id ? null : tile.id));
  };

  const handleBlankSelect = (letter: Letter) => {
    if (!blankTile || !blankCoordinate) return;
    const assignedTile: RackTile = { ...blankTile, assignedLetter: letter };
    setPendingPlacements((prev) => [...prev, { coordinate: blankCoordinate, tile: assignedTile }]);
    setSelectedRackTileId(null);
    setBlankTile(null);
    setBlankCoordinate(null);
  };

  const handleBlankCancel = () => {
    setBlankTile(null);
    setBlankCoordinate(null);
  };

  const handleSubmitPlay = async () => {
    if (!preview || !preview.valid) return;
    setSubmitStatus({ kind: 'busy' });
    const placements: Placement[] = pendingPlacements.map((p) => ({
      coordinate: p.coordinate,
      tile: p.tile,
    }));
    const result = await submitTurnAction(gameId, { type: 'PLAY', placements });
    if (!result.ok) {
      setSubmitStatus({ kind: 'error', message: result.message });
      return;
    }
    navigation.goBack();
  };

  const handleSubmitSwap = async () => {
    if (selectedForSwap.size === 0) return;
    setSubmitStatus({ kind: 'busy' });
    const result = await submitTurnAction(gameId, {
      type: 'SWAP',
      tileIds: [...selectedForSwap],
    });
    if (!result.ok) {
      setSubmitStatus({ kind: 'error', message: result.message });
      return;
    }
    navigation.goBack();
  };

  if (loadState.kind === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (loadState.kind === 'error') {
    return (
      <View style={styles.centered}>
        <Text style={styles.error} testID="board-error">
          {loadState.message}
        </Text>
      </View>
    );
  }

  const busy = submitStatus.kind === 'busy';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BoardGrid
        board={loadState.data.board}
        pending={pendingPlacements}
        onCellPress={handleCellPress}
        readOnly={!isMyTurn}
      />

      {!isMyTurn && (
        <Text style={styles.waitingText} testID="waiting-text">
          Det är inte din tur just nu — du kan bara titta på brädet.
        </Text>
      )}

      {preview && (
        <Text
          style={preview.valid ? styles.previewValid : styles.previewInvalid}
          testID="preview-result"
        >
          {preview.valid
            ? `${preview.wordsCreated.map((w) => w.word).join(', ')} — ${preview.totalScore}p${
                preview.sjuaBonus ? ' (SJUA +50)' : ''
              }`
            : preview.reason}
        </Text>
      )}

      <RackTray
        tiles={availableRackTiles}
        selectedTileId={selectedRackTileId}
        selectedForSwap={selectedForSwap}
        mode={mode}
        onTilePress={handleRackTilePress}
        readOnly={!isMyTurn}
      />

      {submitStatus.kind === 'error' && (
        <Text style={styles.error} testID="submit-error">
          {submitStatus.message}
        </Text>
      )}

      {isMyTurn && (
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => switchMode(mode === 'play' ? 'swap' : 'play')}
            testID="mode-toggle"
          >
            <Text style={styles.modeToggleText}>
              {mode === 'play' ? 'Byt brickor' : 'Avbryt byte'}
            </Text>
          </TouchableOpacity>

          {mode === 'play' && (
            <>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={resetPending}
                disabled={pendingPlacements.length === 0}
                testID="clear-button"
              >
                <Text style={styles.secondaryButtonText}>Rensa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, (!preview?.valid || busy) && styles.buttonDisabled]}
                onPress={handleSubmitPlay}
                disabled={!preview?.valid || busy}
                testID="submit-play-button"
              >
                {busy ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <Text style={styles.buttonText}>Skicka drag</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {mode === 'swap' && (
            <TouchableOpacity
              style={[styles.button, (selectedForSwap.size === 0 || busy) && styles.buttonDisabled]}
              onPress={handleSubmitSwap}
              disabled={selectedForSwap.size === 0 || busy}
              testID="submit-swap-button"
            >
              {busy ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.buttonText}>Byt</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      <BlankLetterModal
        visible={!!blankTile}
        onSelect={handleBlankSelect}
        onCancel={handleBlankCancel}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingText: {
    ...typography.caption,
    color: colors.inkMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  previewValid: {
    ...typography.body,
    color: colors.success,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  previewInvalid: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeToggleText: {
    ...typography.body,
    color: colors.accent,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  secondaryButtonText: {
    ...typography.body,
    color: colors.inkMuted,
  },
});
