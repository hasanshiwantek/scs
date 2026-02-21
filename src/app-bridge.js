// app-bridge.js
import createApp from "@shopify/app-bridge";

const params = new URLSearchParams(window.location.search);

const isShopify = Boolean(params.get("shop") && params.get("host"));

const app = createApp({
  apiKey: "a2afe2f64c425f93f052bfaece617ca5",
  host: isShopify ? params.get("host") : "dummy_host", // fallback for local
  shop: isShopify ? params.get("shop") : "test-store.myshopify.com", // dummy shop
  forceRedirect: isShopify, // only redirect in Shopify iframe
});

export default app;