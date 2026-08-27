import * as mockReact from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { BoardScreen } from '../BoardScreen';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => mockReact.useEffect(callback, [callback]),
}));

jest.mock('../../../auth/AuthProvider', () => ({
  useAuth: () => ({
    status: { kind: 'ready', session: { user: { id: 'me' } }, username: 'OrdelSpelare' },
  }),
}));

const rack = [
  { id: 'b1', kind: 'letter', letter: 'B', value: 4 },
  { id: 'i1', kind: 'letter', letter: 'I', value: 1 },
  { id: 'l1', kind: 'letter', letter: 'L', value: 1 },
];

function makeChain(result: { data: unknown; error: null }) {
  const chain = {
    select: () => chain,
    eq: () => chain,
    maybeSingle: () => Promise.resolve(result),
  };
  return chain;
}

const mockFrom = jest.fn((table: string) => {
  if (table === 'games_public') {
    return makeChain({
      data: { board_state: [], status: 'active', current_turn_player_id: 'me' },
      error: null,
    });
  }
  if (table === 'game_players_public') {
    return makeChain({ data: { rack }, error: null });
  }
  throw new Error(`unexpected table ${table}`);
});

jest.mock('../../../lib/supabase', () => ({
  getSupabase: () => ({ from: mockFrom }),
}));

const mockSubmitTurnAction = jest.fn();
jest.mock('../../../lib/edgeFunctions', () => ({
  submitTurnAction: (gameId: string, action: unknown) => mockSubmitTurnAction(gameId, action),
}));

function renderScreen(navigation: { goBack: jest.Mock }) {
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(
      <BoardScreen
        navigation={navigation as never}
        route={{ params: { gameId: 'game-1' } } as never}
      />,
    );
  });
  return tree!;
}

beforeEach(() => {
  mockSubmitTurnAction.mockReset();
});

test('placing tiles to form a valid word enables submit and calls submitTurnAction', async () => {
  mockSubmitTurnAction.mockResolvedValue({ ok: true, data: {} });
  const navigation = { goBack: jest.fn() };
  const tree = renderScreen(navigation);

  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });

  act(() => {
    tree.root.findByProps({ testID: 'rack-tile-b1' }).props.onPress();
  });
  act(() => {
    tree.root.findByProps({ testID: 'board-cell-7-6' }).props.onPress();
  });
  act(() => {
    tree.root.findByProps({ testID: 'rack-tile-i1' }).props.onPress();
  });
  act(() => {
    tree.root.findByProps({ testID: 'board-cell-7-7' }).props.onPress();
  });
  act(() => {
    tree.root.findByProps({ testID: 'rack-tile-l1' }).props.onPress();
  });
  act(() => {
    tree.root.findByProps({ testID: 'board-cell-7-8' }).props.onPress();
  });

  expect(tree.root.findByProps({ testID: 'preview-result' }).props.children).toContain('BIL');
  expect(tree.root.findByProps({ testID: 'submit-play-button' }).props.disabled).toBe(false);

  await act(async () => {
    await tree.root.findByProps({ testID: 'submit-play-button' }).props.onPress();
  });

  expect(mockSubmitTurnAction).toHaveBeenCalledWith('game-1', {
    type: 'PLAY',
    placements: [
      { coordinate: { row: 7, col: 6 }, tile: rack[0] },
      { coordinate: { row: 7, col: 7 }, tile: rack[1] },
      { coordinate: { row: 7, col: 8 }, tile: rack[2] },
    ],
  });
  expect(navigation.goBack).toHaveBeenCalled();
});

test('a lone tile off-center shows the invalid reason and keeps submit disabled', async () => {
  const navigation = { goBack: jest.fn() };
  const tree = renderScreen(navigation);

  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });

  act(() => {
    tree.root.findByProps({ testID: 'rack-tile-b1' }).props.onPress();
  });
  act(() => {
    tree.root.findByProps({ testID: 'board-cell-3-3' }).props.onPress();
  });

  expect(tree.root.findByProps({ testID: 'preview-result' }).props.children).toBe(
    'The first move must cover the center cell.',
  );
  expect(tree.root.findByProps({ testID: 'submit-play-button' }).props.disabled).toBe(true);
});

test('swap mode selects tiles and submits a SWAP action', async () => {
  mockSubmitTurnAction.mockResolvedValue({ ok: true, data: {} });
  const navigation = { goBack: jest.fn() };
  const tree = renderScreen(navigation);

  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });

  act(() => {
    tree.root.findByProps({ testID: 'mode-toggle' }).props.onPress();
  });
  act(() => {
    tree.root.findByProps({ testID: 'rack-tile-b1' }).props.onPress();
  });

  await act(async () => {
    await tree.root.findByProps({ testID: 'submit-swap-button' }).props.onPress();
  });

  expect(mockSubmitTurnAction).toHaveBeenCalledWith('game-1', {
    type: 'SWAP',
    tileIds: ['b1'],
  });
  expect(navigation.goBack).toHaveBeenCalled();
});
