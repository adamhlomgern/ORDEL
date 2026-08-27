import * as mockReact from 'react';
import { Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { HomeScreen } from '../HomeScreen';
import type { MyGameRow } from '../../lib/myGames';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => mockReact.useEffect(callback, [callback]),
}));

const mockFetchMyGames = jest.fn();
jest.mock('../../lib/myGames', () => ({
  fetchMyGames: () => mockFetchMyGames(),
}));

jest.mock('../../lib/supabase', () => ({
  getSupabase: () => ({ auth: { signOut: jest.fn() } }),
}));

jest.mock('../../auth/AuthProvider', () => ({
  useAuth: () => ({
    status: { kind: 'ready', session: { user: { id: 'me' } }, username: 'OrdelSpelare' },
  }),
}));

function game(overrides: Partial<MyGameRow>): MyGameRow {
  return {
    id: 'g1',
    status: 'active',
    tempo: 'NORMAL',
    turn_duration_hours: 72,
    tile_bag_remaining: 80,
    current_turn_player_id: 'me',
    end_reason: null,
    created_at: '2026-01-01T00:00:00Z',
    is_my_turn: true,
    opponent_id: 'opp',
    opponent_username: 'Motstandare',
    ...overrides,
  };
}

function renderScreen(navigate: jest.Mock) {
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(<HomeScreen navigation={{ navigate } as never} route={{} as never} />);
  });
  return tree!;
}

beforeEach(() => {
  mockFetchMyGames.mockReset();
});

test('shows an empty state when there are no games', async () => {
  mockFetchMyGames.mockResolvedValue({ data: [], error: null });
  const tree = renderScreen(jest.fn());

  await act(async () => {
    await Promise.resolve();
  });

  expect(
    tree.root
      .findAllByType(Text)
      .some((n) => n.props.children === 'Inga partier ännu. Skapa ett nytt!'),
  ).toBe(true);
});

test('groups games and navigates to GameDetail on tap', async () => {
  mockFetchMyGames.mockResolvedValue({
    data: [game({ id: 'yours', is_my_turn: true }), game({ id: 'theirs', is_my_turn: false })],
    error: null,
  });
  const navigate = jest.fn();
  const tree = renderScreen(navigate);

  await act(async () => {
    await Promise.resolve();
  });

  act(() => {
    tree.root.findByProps({ testID: 'game-row-yours' }).props.onPress();
  });

  expect(navigate).toHaveBeenCalledWith('GameDetail', { gameId: 'yours' });
});

test('shows an error and allows retry when the fetch fails', async () => {
  mockFetchMyGames.mockResolvedValue({ data: null, error: { message: 'network down' } });
  const tree = renderScreen(jest.fn());

  await act(async () => {
    await Promise.resolve();
  });

  expect(tree.root.findByProps({ testID: 'games-error' }).props.children).toBe('network down');
});
