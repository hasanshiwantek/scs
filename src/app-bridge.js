import createApp from "@shopify/app-bridge";

// Get URL parameters
const params = new URLSearchParams(window.location.search);

const app = createApp({
  apiKey: "a2afe2f64c425f93f052bfaece617ca5", // Shopify Partner Dashboard se
  host: params.get("host"),   // Shopify admin iframe me automatically aayega
  shop: params.get("shop"),   // Shopify store param
  forceRedirect: true,        // Embedded app ke liye Shopify admin me redirect
});

export default app;