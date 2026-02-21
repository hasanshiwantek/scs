import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { setUserData } from "../store/userSlice";
import app from "../app-bridge";  // 👈 import app-bridge.js
import { Redirect } from "@shopify/app-bridge/actions";

const API_KEY_STORAGE = 'scs_api_key';
const IS_SHOPIFY = Boolean(window.shopify); // ✅ Shopify mein hai ya nahi

export default function TokenPage() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const shop = params.get("shop");
  console.log("Shop param:", shop);

  if (shop) {
    // Shopify ke liye endpoint hit karna, redirect nahi
    fetch(`https://scs.advertsedge.com/auth/shopify?shop=${shop}`, {
      method: "GET", // agar GET hai to, ya "POST" agar API POST expect kare
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Response from Shopify auth endpoint:", data);
      })
      .catch((err) => {
        console.error("Error hitting Shopify auth endpoint:", err);
      });
  }
}, []);

  async function getSessionToken() {
    try {
      if (IS_SHOPIFY && window.shopify?.idToken) {
        const token = await window.shopify.idToken();
        console.log("Session Token:", token);
        return token;
      }
    } catch (e) {
      console.warn("Token error:", e);
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!apiKey.trim()) {
      setError("Please enter your API key.");
      return;
    }

    setLoading(true);
    try {
      const sessionToken = await getSessionToken();

      const headers = { "Content-Type": "application/json" };
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
      }

      const res = await fetch("https://scs.advertsedge.com/api/connect-app", {
        method: "POST",
        headers,
        body: JSON.stringify({ app_token: apiKey.trim() }),
      });

      const data = await res.json().catch(() => ({}));
      console.log("Response:", data);

      if (data?.status && data?.data) {
        dispatch(setUserData({
          user: data.data,
          apiKey: apiKey.trim()
        }));
        navigate("/orders");
      } else {
        setError(data?.message || "Invalid API key. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Request failed. Check console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f6f6f7]">
      <div className="w-full max-w-[400px]">
        <div className="bg-white rounded-xl border border-[#e1e3e5] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="px-8 pt-8">
            <div className="w-11 h-11 rounded-lg bg-[#008060] flex items-center justify-center mb-5">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[#202223] tracking-tight">Connect your account</h1>
            <p className="mt-1.5 text-sm text-[#6d7175] leading-relaxed">
              Enter the API key from your Laravel admin dashboard to sync orders with Shopify.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pb-8 pt-5">
            <label htmlFor="api-key" className="block text-sm font-medium text-[#202223] mb-1.5">
              API Key
            </label>
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              autoComplete="off"
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border border-[#c9cccf] bg-white text-[#202223] placeholder-[#8c9196] focus:outline-none focus:ring-2 focus:ring-[#008060]/30 focus:border-[#008060] transition disabled:opacity-60 disabled:bg-[#f6f6f7]"
            />
            {error && (
              <p className="mt-2 text-sm text-[#d72c0d] flex items-center gap-1.5">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full py-3 px-4 rounded-lg font-semibold text-white bg-[#008060] hover:bg-[#006e52] focus:outline-none focus:ring-2 focus:ring-[#008060] focus:ring-offset-2 transition disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-[#008060]"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Validating…
                </span>
              ) : (
                'Continue'
              )}
            </button>
          </form>
        </div>
        <p className="mt-5 text-center text-xs text-[#8c9196]">
          Get your API key from the Laravel admin dashboard after signing up.
        </p>
      </div>
    </div>
  );
}

export { API_KEY_STORAGE };