import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { UsernamePickerScreen } from '../UsernamePickerScreen';

const mockFrom = jest.fn();

jest.mock('../../../lib/supabase', () => ({
  getSupabase: () => ({ from: mockFrom }),
}));

const mockRefreshProfile = jest.fn();

jest.mock('../../../auth/AuthProvider', () => ({
  useAuth: () => ({
    status: { kind: 'needsProfile', session: { user: { id: 'user-1' } } },
    refreshProfile: mockRefreshProfile,
  }),
}));

function renderScreen() {
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(<UsernamePickerScreen />);
  });
  return tree!;
}

beforeEach(() => {
  mockFrom.mockReset();
  mockRefreshProfile.mockReset();
});

test('rejects a username outside the 3-20 char pattern without inserting', async () => {
  const tree = renderScreen();

  await act(async () => {
    tree.root.findByProps({ testID: 'username-input' }).props.onChangeText('a');
  });
  await act(async () => {
    tree.root.findByProps({ testID: 'save-username-button' }).props.onPress();
  });

  expect(mockFrom).not.toHaveBeenCalled();
  expect(tree.root.findByProps({ testID: 'username-error' })).toBeTruthy();
});

test('inserts the profile row and refreshes on success', async () => {
  const insert = jest.fn().mockResolvedValue({ error: null });
  mockFrom.mockReturnValue({ insert });
  const tree = renderScreen();

  await act(async () => {
    tree.root.findByProps({ testID: 'username-input' }).props.onChangeText('OrdelSpelare');
  });
  await act(async () => {
    await tree.root.findByProps({ testID: 'save-username-button' }).props.onPress();
  });

  expect(mockFrom).toHaveBeenCalledWith('profiles');
  expect(insert).toHaveBeenCalledWith({ id: 'user-1', username: 'OrdelSpelare' });
  expect(mockRefreshProfile).toHaveBeenCalled();
});

test('maps a unique-violation error to a Swedish "taken" message', async () => {
  const insert = jest.fn().mockResolvedValue({ error: { code: '23505', message: 'duplicate' } });
  mockFrom.mockReturnValue({ insert });
  const tree = renderScreen();

  await act(async () => {
    tree.root.findByProps({ testID: 'username-input' }).props.onChangeText('OrdelSpelare');
  });
  await act(async () => {
    await tree.root.findByProps({ testID: 'save-username-button' }).props.onPress();
  });

  expect(mockRefreshProfile).not.toHaveBeenCalled();
  expect(tree.root.findByProps({ testID: 'username-error' }).props.children).toBe(
    'Användarnamnet är upptaget, välj ett annat.',
  );
});
