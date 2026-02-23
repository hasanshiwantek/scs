import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppBridge } from '@shopify/app-bridge-react';
import { useEffect } from 'react';
import TokenPage from './pages/TokenPage';
import OrdersPage from './pages/OrdersPage';
import './App.css'

// ✅ Yeh component app load hote hi auth API hit karega
const AuthInitializer = () => {
  const shopify = useAppBridge();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Session token lo App Bridge se
        const sessionToken = await shopify.idToken();

        // 2. Shop param URL se lo
        const searchParams = new URLSearchParams(window.location.search);
        const shop = searchParams.get("shop");

        if (!shop) {
          console.warn("Shop param nahi mila");
          return;
        }

        // 3. Backend API hit karo
        const response = await fetch(`/api-proxy/auth/shopify?shop=${shop}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log("[Auth] Shopify auth response:", data);

      } catch (err) {
        console.error("[Auth] Error:", err);
      }
    };

    initAuth();
  }, []); // sirf ek baar — app load pe

  return null; // kuch render nahi karta
};

function App() {
  return (
    <AppProvider
         apiKey="a2afe2f64c425f93f052bfaece617ca5" 
      isEmbeddedApp
    >
      <AuthInitializer /> {/* ✅ Yahan add karo */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TokenPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;