import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../store/userSlice";
import { API_BASE_URL } from "../config";

const TokenPage = () => {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ Redux persist se savedApiKey lo
  const savedApiKey = useSelector((state) => state.user.userData?.apiKey || "");

  // ✅ Detect Shopify
  const searchParams = new URLSearchParams(window.location.search);
  const shopParam = searchParams.get("shop");
  const hostParam = searchParams.get("host");

  const isShopify = () =>
    typeof window !== "undefined" &&
    typeof window.shopify !== "undefined" &&
    shopParam &&
    hostParam;

  // ✅ Har baar fresh token
  const getSessionToken = async () => {
    if (!isShopify()) return null;
    try {
      return await window.shopify.idToken();
    } catch (err) {
      console.warn("Session token error:", err);
      return null;
    }
  };

  // ✅ Agar Redux mein apiKey already hai to auto login
  useEffect(() => {
    if (savedApiKey) {
      autoLogin(savedApiKey);
    }
  }, [savedApiKey]);

  const autoLogin = async (key) => {
    setLoading(true);
    try {
      const sessionToken = await getSessionToken();
      const headers = { "Content-Type": "application/json" };
      if (sessionToken) headers.Authorization = `Bearer ${sessionToken}`;

      const response = await fetch(`${API_BASE_URL}/api/connect-app`, {
        method: "POST",
        headers,
        body: JSON.stringify({ app_token: key }),
      });

      const data = await response.json().catch(() => ({}));

      if (data?.status && data?.data) {
        dispatch(setUserData({ user: data.data, apiKey: key }));
        navigate("/orders");
      } else {
        // ✅ Auto login fail — Redux clear, manual login karne do
        dispatch(setUserData({}));
      }
    } catch (err) {
      console.error("Auto login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
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
      if (sessionToken) headers.Authorization = `Bearer ${sessionToken}`;

      const response = await fetch(`${API_BASE_URL}/api/connect-app`, {
        method: "POST",
        headers,
        body: JSON.stringify({ app_token: apiKey.trim() }),
      });

      const data = await response.json().catch(() => ({}));
      console.log("[API] connect-app RESPONSE:", { status: response.status, ok: response.ok, data });

      if (data?.status && data?.data) {
        // ✅ Sirf apiKey store karo — sessionToken nahi (expire hota hai)
        dispatch(setUserData({ user: data.data, apiKey: apiKey.trim() }));
        navigate("/orders");
      } else {
        setError(data?.message || "Invalid API key.");
      }
    } catch (err) {
      console.error("[API] connect-app ERROR:", err);
      setError("Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f6f6f7]">
      <div className="w-full max-w-[400px]">
        <div className="bg-white rounded-xl border border-[#e1e3e5] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="px-8 pt-8">
            <h1 className="text-xl font-bold text-[#202223]">
              Connect your account
            </h1>
            <p className="mt-1.5 text-sm text-[#6d7175]">
              Enter the API key from your Laravel admin dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pb-8 pt-5" autoComplete="on">
            <input type="text" name="username" autoComplete="username" className="sr-only" tabIndex={-1} aria-hidden="true" readOnly defaultValue=" " />
            <label className="block text-sm font-medium text-[#202223] mb-1.5">
              API Key
            </label>
            <input
              type="password"
              name="apiKey"
              autoComplete="new-password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border border-[#c9cccf]"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full py-3 px-4 rounded-lg text-white bg-[#008060]"
            >
              {loading ? "Validating…" : "Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TokenPage;