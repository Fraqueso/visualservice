let Sentry: any = null;

try {
  Sentry = require('@sentry/react-native');
} catch {
  // Native module not available (e.g. running in Expo Go)
  console.log('[Sentry] Native module not available, using no-op fallback');
}

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export function initSentry() {
  if (!Sentry || !SENTRY_DSN) {
    if (__DEV__) {
      console.log('Sentry not available or DSN not configured, skipping initialization');
    }
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    enabled: !__DEV__,
    beforeBreadcrumb(breadcrumb: any) {
      if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
        return null;
      }
      return breadcrumb;
    },
  });
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (__DEV__) {
    console.error(error);
    return;
  }

  if (!Sentry) return;

  if (error instanceof Error) {
    Sentry.captureException(error, { extra: context });
  } else {
    Sentry.captureMessage(String(error), { extra: context });
  }
}

export function setUser(id: string, email?: string) {
  Sentry?.setUser({ id, email });
}

export function clearUser() {
  Sentry?.setUser(null);
}

export { Sentry };
