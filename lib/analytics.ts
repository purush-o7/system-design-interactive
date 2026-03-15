declare global {
  interface Window {
    gtag?: (...args: [string, string, Record<string, unknown>?]) => void;
  }
}

export function trackEvent(
  event: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", event, params);
  }
}
