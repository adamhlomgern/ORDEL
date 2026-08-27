import * as mockReact from 'react';
import { Alert } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { GameDetailScreen } from '../GameDetailScreen';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => mockReact.useEffect(callback, [callback]),
}));

const mockFetchMyGame = jest.fn();
jest.mock('../../lib/myGames', () => ({
  fetchMyGame: (gameId: string) => mockFetchMyGame(gameId),
}));

const mockPlayersSelect = jest.fn();
jest.mock('../../lib/supabase', () => ({
  getSupabase: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          returns: () => mockPlayersSelect(),
        }),
      }),
    }),
  }),
}));

jest.mock('../../auth/AuthProvider', () => ({
  useAuth: () => ({
    status: { kind: 'ready', session: { user: { id: 'me' } }, username: 'OrdelSpelare' },
  }),
}));

const mockSubmitTurnAction = jest.fn();
jest.mock('../../lib/edgeFunctions', () => ({
  submitTurnAction: (gameId: string, action: unknown) => mockSubmitTurnAction(gameId, action),
}));

const baseGame = {
  id: 'game-1',
  status: 'active' as const,
  tempo: 'NORMAL',
  turn_duration_hours: 72,
  tile_bag_remaining: 80,
  current_turn_player_id: 'me',
  end_reason: null,
  created_at: '2026-01-01T00:00:00Z',
  is_my_turn: true,
  opponent_id: 'opp',
  opponent_username: 'Motstandare',
};

function renderScreen() {
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(
      <GameDetailScreen
        navigation={{} as never}
        route={{ params: { gameId: 'game-1' } } as never}
      />,
    );
  });
  return tree!;
}

beforeEach(() => {
  mockFetchMyGame.mockReset();
  mockPlayersSelect.mockReset();
  mockSubmitTurnAction.mockReset();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

test('shows scores and enables Passa when it is my turn', async () => {
  mockFetchMyGame.mockResolvedValue({ data: baseGame, error: null });
  mockPlayersSelect.mockResolvedValue({
    data: [
      { player_id: 'me', score: 12, rack_tile_count: 7, has_resigned: false },
      { player_id: 'opp', score: 5, rack_tile_count: 7, has_resigned: false },
    ],
    error: null,
  });

  const tree = renderScreen();
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(tree.root.findByProps({ testID: 'game-status' }).props.children).toBe('Din tur');
  expect(tree.root.findByProps({ testID: 'pass-button' }).props.disabled).toBe(false);
});

test('disables Passa when it is not my turn', async () => {
  mockFetchMyGame.mockResolvedValue({ data: { ...baseGame, is_my_turn: false }, error: null });
  mockPlayersSelect.mockResolvedValue({
    data: [
      { player_id: 'me', score: 0, rack_tile_count: 7, has_resigned: false },
      { player_id: 'opp', score: 0, rack_tile_count: 7, has_resigned: false },
    ],
    error: null,
  });

  const tree = renderScreen();
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(tree.root.findByProps({ testID: 'pass-button' }).props.disabled).toBe(true);
});

test('resign shows a confirmation before calling submitTurnAction', async () => {
  mockFetchMyGame.mockResolvedValue({ data: baseGame, error: null });
  mockPlayersSelect.mockResolvedValue({
    data: [
      { player_id: 'me', score: 0, rack_tile_count: 7, has_resigned: false },
      { player_id: 'opp', score: 0, rack_tile_count: 7, has_resigned: false },
    ],
    error: null,
  });

  const tree = renderScreen();
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });

  act(() => {
    tree.root.findByProps({ testID: 'resign-button' }).props.onPress();
  });

  expect(Alert.alert).toHaveBeenCalled();
  expect(mockSubmitTurnAction).not.toHaveBeenCalled();
});
