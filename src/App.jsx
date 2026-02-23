import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppBridge } from '@shopify/app-bridge-react';
import { useEffect } from 'react';
import { API_BASE_URL } from './config';
import TokenPage from './pages/TokenPage';
import OrdersPage from './pages/OrdersPage';
import './App.css';

// App load hote hi auth hit karo
const AuthInitializer = () => {
  const shopify = useAppBridge();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const shop = new URLSearchParams(window.location.search).get("shop");
        if (!shop) return;

        const sessionToken = await shopify.idToken();

        // Backend must return JSON { redirectUrl } (use ?format=json), NOT 302 — else fetch follows redirect → CORS
        const response = await fetch(
          `${API_BASE_URL}/auth/shopify?shop=${encodeURIComponent(shop)}&format=json`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          }
        );

        const data = await response.json();

        if (data?.alreadyInstalled) return;

        if (data?.redirectUrl) {
          // Top window redirect so Shopify OAuth loads outside iframe (avoids X-Frame-Options deny)
          (window.top || window).location.href = data.redirectUrl;
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