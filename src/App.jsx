import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import AppRouter from './router/AppRouter';
import { ToastProvider } from './components/ui/Toast';
import { useTokenRefresh } from './hooks/useTokenRefresh';

// Component to initialize token refresh
function AppWithTokenRefresh() {
  useTokenRefresh();
  return <AppRouter />;
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ToastProvider>
          <AppWithTokenRefresh />
        </ToastProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
