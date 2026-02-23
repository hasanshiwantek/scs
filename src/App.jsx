import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppBridge } from '@shopify/app-bridge-react';
import createApp from '@shopify/app-bridge';
import { Redirect } from '@shopify/app-bridge/actions';
import { useEffect } from 'react';
import TokenPage from './pages/TokenPage';
import OrdersPage from './pages/OrdersPage';
import './App.css'

// App load hote hi auth hit karo
const AuthInitializer = () => {
  const shopify = useAppBridge();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const shop = params.get("shop");
        const host = params.get("host");
        if (!shop) return;

        const sessionToken = await shopify.idToken();

        // Backend must return JSON { redirectUrl } (use ?format=json), NOT 302 — else fetch follows redirect → CORS
        const response = await fetch(
          `/api-proxy/auth/shopify?shop=${encodeURIComponent(shop)}&format=json`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          }
        );

        const data = await response.json();

        if (data?.redirectUrl) {
          // CDN window.shopify has no redirectToUrl; use App Bridge Redirect.Action.REMOTE
          if (typeof shopify.redirectToUrl === 'function') {
            await shopify.redirectToUrl(data.redirectUrl);
          } else if (host) {
            const app = createApp({
              apiKey: 'a2afe2f64c425f93f052bfaece617ca5',
              host,
              shop: shop || 'test-store.myshopify.com',
            });
            Redirect.create(app).dispatch(Redirect.Action.REMOTE, data.redirectUrl);
          } else {
            window.location.href = data.redirectUrl;
          }
        }

      } catch (err) {
        console.error("[Auth] Error:", err);
      }
    };

    initAuth();
  }, []);

  return null;
};
function App() {
  return (
    // ❌ AppProvider nahi - v4 mein zaroorat nahi
    <BrowserRouter>
      <AuthInitializer />
      <Routes>
        <Route path="/" element={<TokenPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;