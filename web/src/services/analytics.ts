import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

export function initAnalytics() {
  if (!POSTHOG_KEY) {
    console.log('PostHog key not configured, skipping analytics initialization');
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
  });
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (import.meta.env.DEV) {
    console.log(`[Analytics] ${event}`, properties);
  }
  if (POSTHOG_KEY) {
    posthog.capture(event, properties);
  }
}
