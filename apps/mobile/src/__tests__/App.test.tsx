import { act, create } from 'react-test-renderer';
import App from '../../App';

test('renders without crashing', () => {
  let tree: ReturnType<typeof create> | undefined;

  act(() => {
    tree = create(<App />);
  });

  expect(tree).toBeTruthy();
});
