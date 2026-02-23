import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppBridge } from '@shopify/app-bridge-react'; // sirf yeh
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
        const sessionToken = await shopify.idToken();
        const shop = new URLSearchParams(window.location.search).get("shop");

        if (!shop) return;

        const response = await fetch(`/api-proxy/auth/shopify?shop=${shop}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log("[Auth] Response:", data);

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