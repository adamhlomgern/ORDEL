import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { CreateGameScreen } from '../CreateGameScreen';

const mockCreateGame = jest.fn();
jest.mock('../../lib/edgeFunctions', () => ({
  createGame: (opponentUsername: string) => mockCreateGame(opponentUsername),
}));

function renderScreen(navigation: { navigate: jest.Mock; replace: jest.Mock }) {
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(<CreateGameScreen navigation={navigation as never} route={{} as never} />);
  });
  return tree!;
}

beforeEach(() => {
  mockCreateGame.mockReset();
});

test('rejects an empty username without calling createGame', async () => {
  const navigation = { navigate: jest.fn(), replace: jest.fn() };
  const tree = renderScreen(navigation);

  await act(async () => {
    tree.root.findByProps({ testID: 'create-game-button' }).props.onPress();
  });

  expect(mockCreateGame).not.toHaveBeenCalled();
  expect(tree.root.findByProps({ testID: 'create-game-error' })).toBeTruthy();
});

test('replaces with GameDetail on success', async () => {
  mockCreateGame.mockResolvedValue({ ok: true, data: { gameId: 'game-42' } });
  const navigation = { navigate: jest.fn(), replace: jest.fn() };
  const tree = renderScreen(navigation);

  await act(async () => {
    tree.root.findByProps({ testID: 'opponent-username-input' }).props.onChangeText('Vän');
  });
  await act(async () => {
    await tree.root.findByProps({ testID: 'create-game-button' }).props.onPress();
  });

  expect(mockCreateGame).toHaveBeenCalledWith('Vän');
  expect(navigation.replace).toHaveBeenCalledWith('GameDetail', { gameId: 'game-42' });
});

test('shows the backend error message on failure', async () => {
  mockCreateGame.mockResolvedValue({ ok: false, message: 'Opponent not found.' });
  const navigation = { navigate: jest.fn(), replace: jest.fn() };
  const tree = renderScreen(navigation);

  await act(async () => {
    tree.root.findByProps({ testID: 'opponent-username-input' }).props.onChangeText('Okänd');
  });
  await act(async () => {
    await tree.root.findByProps({ testID: 'create-game-button' }).props.onPress();
  });

  expect(navigation.replace).not.toHaveBeenCalled();
  expect(tree.root.findByProps({ testID: 'create-game-error' }).props.children).toBe(
    'Opponent not found.',
  );
});
