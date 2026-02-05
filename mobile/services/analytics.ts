import PostHog from 'posthog-react-native';

const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

let posthog: PostHog | null = null;

export function initAnalytics() {
  if (!POSTHOG_KEY) {
    if (__DEV__) {
      console.log('PostHog key not configured, skipping analytics initialization');
    }
    return;
  }

  posthog = new PostHog(POSTHOG_KEY, {
    host: POSTHOG_HOST,
    enableSessionReplay: false,
  });
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (__DEV__) {
    console.log(`[Analytics] ${event}`, properties);
  }
  posthog?.capture(event, properties);
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  posthog?.identify(userId, properties);
}

export function resetAnalytics() {
  posthog?.reset();
}
