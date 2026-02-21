import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../store/userSlice";

const API_KEY_STORAGE = "scs_api_key";

const TokenPage = () => {
  const [apiKey, setApiKey] = useState(
    localStorage.getItem(API_KEY_STORAGE) || ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ Detect Shopify safely
  const searchParams = new URLSearchParams(window.location.search);
  const shopParam = searchParams.get("shop");
  const hostParam = searchParams.get("host");

  const IS_SHOPIFY =
    typeof window !== "undefined" &&
    typeof window.shopify !== "undefined" &&
    shopParam &&
    hostParam;

  // ✅ When inside Shopify, send user to OAuth via full-page redirect (fetch would follow redirect to Shopify and hit CORS)
  useEffect(() => {
    if (IS_SHOPIFY) {
      window.location.href = `/api-proxy/auth/shopify?shop=${shopParam}`;
    }
  }, [IS_SHOPIFY, shopParam]);

  // ✅ Safe session token getter
  const getSessionToken = async () => {
    if (!IS_SHOPIFY) return null;

    try {
      const token = await window.shopify.idToken();
      return token;
    } catch (err) {
      console.warn("Session token error:", err);
      return null;
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

      const headers = {
        "Content-Type": "application/json",
      };

      if (sessionToken) {
        headers.Authorization = `Bearer ${sessionToken}`;
      }

      const response = await fetch(
        "/api-proxy/api/connect-app",
        {
          method: "POST",
          headers,
          body: JSON.stringify({ app_token: apiKey.trim() }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (data?.status && data?.data) {
        dispatch(
          setUserData({
            user: data.data,
            apiKey: apiKey.trim(),
          })
        );

        localStorage.setItem(API_KEY_STORAGE, apiKey.trim());

        navigate("/orders");
      } else {
        setError(data?.message || "Invalid API key.");
      }
    } catch (err) {
      console.error(err);
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

          <form onSubmit={handleSubmit} className="px-8 pb-8 pt-5">
            <label className="block text-sm font-medium text-[#202223] mb-1.5">
              API Key
            </label>

            <input
              type="password"
              autoComplete="new-password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border border-[#c9cccf]"
            />

            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}

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