import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { Text } from 'react-native';
import { AuthProvider, useAuth } from '../AuthProvider';

const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockFrom = jest.fn();

jest.mock('../../lib/supabase', () => ({
  getSupabase: () => ({
    auth: { getSession: mockGetSession, onAuthStateChange: mockOnAuthStateChange },
    from: mockFrom,
  }),
}));

function StatusProbe() {
  const { status } = useAuth();
  return <Text testID="status">{status.kind}</Text>;
}

function renderProvider() {
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(
      <AuthProvider>
        <StatusProbe />
      </AuthProvider>,
    );
  });
  return tree!;
}

beforeEach(() => {
  mockGetSession.mockReset();
  mockOnAuthStateChange.mockReset();
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } },
  });
  mockFrom.mockReset();
});

test('resolves to signedOut when there is no session', async () => {
  mockGetSession.mockResolvedValue({ data: { session: null } });
  const tree = renderProvider();

  await act(async () => {
    await Promise.resolve();
  });

  expect(tree.root.findByProps({ testID: 'status' }).props.children).toBe('signedOut');
});

test('resolves to needsProfile when a session exists but has no profile row', async () => {
  mockGetSession.mockResolvedValue({
    data: { session: { user: { id: 'user-1' } } },
  });
  mockFrom.mockReturnValue({
    select: () => ({
      eq: () => ({
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
  });
  const tree = renderProvider();

  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(tree.root.findByProps({ testID: 'status' }).props.children).toBe('needsProfile');
});

test('resolves to ready with the username when a profile row exists', async () => {
  mockGetSession.mockResolvedValue({
    data: { session: { user: { id: 'user-1' } } },
  });
  mockFrom.mockReturnValue({
    select: () => ({
      eq: () => ({
        maybeSingle: () => Promise.resolve({ data: { username: 'OrdelSpelare' }, error: null }),
      }),
    }),
  });
  const tree = renderProvider();

  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(tree.root.findByProps({ testID: 'status' }).props.children).toBe('ready');
});
