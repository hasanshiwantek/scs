import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App.jsx'
import { store, persistor } from './store/store.js';
import { AppBridgeProvider } from '@shopify/app-bridge-react';

const config = {
  apiKey: "a2afe2f64c425f93f052bfaece617ca5",
  host: new URLSearchParams(window.location.search).get("host"),
  forceRedirect: true,
};

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <AppBridgeProvider config={config}>
        <App />
      </AppBridgeProvider>
    </PersistGate>
  </Provider>
)