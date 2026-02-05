import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sentry } from './services/sentry';
import ErrorFallback from './components/ErrorFallback';
import VerifyPage from './pages/VerifyPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import HelpPage from './pages/HelpPage';

function App() {
  return (
    <Sentry.ErrorBoundary fallback={ErrorFallback}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/verify/:code" element={<VerifyPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  );
}

export default App;
