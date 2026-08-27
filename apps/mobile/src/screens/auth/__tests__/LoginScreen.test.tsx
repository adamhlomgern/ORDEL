import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { LoginScreen } from '../LoginScreen';

const mockSignUp = jest.fn();
const mockSignInWithPassword = jest.fn();

jest.mock('../../../lib/supabase', () => ({
  getSupabase: () => ({
    auth: { signUp: mockSignUp, signInWithPassword: mockSignInWithPassword },
  }),
}));

function renderScreen() {
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(<LoginScreen navigation={{} as never} route={{} as never} />);
  });
  return tree!;
}

function fillForm(tree: ReactTestRenderer, email: string, password: string) {
  tree.root.findByProps({ testID: 'email-input' }).props.onChangeText(email);
  tree.root.findByProps({ testID: 'password-input' }).props.onChangeText(password);
}

beforeEach(() => {
  mockSignUp.mockReset();
  mockSignInWithPassword.mockReset();
});

test('rejects an invalid email without calling the backend', async () => {
  const tree = renderScreen();

  await act(async () => {
    fillForm(tree, 'not-an-email', 'longenough');
  });
  await act(async () => {
    tree.root.findByProps({ testID: 'submit-button' }).props.onPress();
  });

  expect(mockSignInWithPassword).not.toHaveBeenCalled();
  expect(tree.root.findByProps({ testID: 'login-error' })).toBeTruthy();
});

test('rejects a password shorter than 6 characters', async () => {
  const tree = renderScreen();

  await act(async () => {
    fillForm(tree, 'player@example.com', 'abc');
  });
  await act(async () => {
    tree.root.findByProps({ testID: 'submit-button' }).props.onPress();
  });

  expect(mockSignInWithPassword).not.toHaveBeenCalled();
  expect(tree.root.findByProps({ testID: 'login-error' }).props.children).toContain('6 tecken');
});

test('signs in with password by default', async () => {
  mockSignInWithPassword.mockResolvedValue({ error: null });
  const tree = renderScreen();

  await act(async () => {
    fillForm(tree, 'player@example.com', 'hunter22');
  });
  await act(async () => {
    await tree.root.findByProps({ testID: 'submit-button' }).props.onPress();
  });

  expect(mockSignInWithPassword).toHaveBeenCalledWith({
    email: 'player@example.com',
    password: 'hunter22',
  });
});

test('shows the backend error message when sign-in fails', async () => {
  mockSignInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } });
  const tree = renderScreen();

  await act(async () => {
    fillForm(tree, 'player@example.com', 'hunter22');
  });
  await act(async () => {
    await tree.root.findByProps({ testID: 'submit-button' }).props.onPress();
  });

  expect(tree.root.findByProps({ testID: 'login-error' }).props.children).toBe(
    'Invalid login credentials',
  );
});

test('switching to sign-up mode calls signUp instead', async () => {
  mockSignUp.mockResolvedValue({ data: { user: { identities: [{ id: 'x' }] } }, error: null });
  const tree = renderScreen();

  act(() => {
    tree.root.findByProps({ testID: 'mode-toggle' }).props.onPress();
  });
  await act(async () => {
    fillForm(tree, 'newplayer@example.com', 'hunter22');
  });
  await act(async () => {
    await tree.root.findByProps({ testID: 'submit-button' }).props.onPress();
  });

  expect(mockSignUp).toHaveBeenCalledWith({
    email: 'newplayer@example.com',
    password: 'hunter22',
  });
  expect(mockSignInWithPassword).not.toHaveBeenCalled();
});

test('maps an empty identities array on sign-up to an "already registered" message', async () => {
  mockSignUp.mockResolvedValue({ data: { user: { identities: [] } }, error: null });
  const tree = renderScreen();

  act(() => {
    tree.root.findByProps({ testID: 'mode-toggle' }).props.onPress();
  });
  await act(async () => {
    fillForm(tree, 'existing@example.com', 'hunter22');
  });
  await act(async () => {
    await tree.root.findByProps({ testID: 'submit-button' }).props.onPress();
  });

  expect(tree.root.findByProps({ testID: 'login-error' }).props.children).toBe(
    'Kontot finns redan, logga in istället.',
  );
});
