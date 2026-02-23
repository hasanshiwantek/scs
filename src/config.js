/**
 * Backend API base URL (proxy removed — direct calls).
 * Override with VITE_API_BASE_URL in .env
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://scs.advertsedge.com';
