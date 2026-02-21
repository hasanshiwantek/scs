import createApp from "@shopify/app-bridge";

const params = new URLSearchParams(window.location.search);

const app = createApp({
  apiKey: "a2afe2f64c425f93f052bfaece617ca5",         // Shopify Partner Dashboard se
  host: params.get("host") || "dummy_host",  // embedded app URL me milta hai
  shop: params.get("shop") || "test-store.myshopify.com",
  forceRedirect: true,                      // Shopify admin me redirect
});

export default app;