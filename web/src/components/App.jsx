import { StateProvider } from './StateProvider.jsx';
import { GameContainer } from './GameContainer.jsx';

/**
 * Root application component
 */
export function App() {
  return (
    <StateProvider>
      <GameContainer />
    </StateProvider>
  );
}
