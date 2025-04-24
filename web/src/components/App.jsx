import { StateProvider } from './StateProvider.jsx';
import { IdeLayout } from './IdeLayout.jsx';

/**
 * Root application component
 */
export function App() {
  return (
    <StateProvider>
      <IdeLayout />
    </StateProvider>
  );
}
