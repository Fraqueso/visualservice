import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { verifyPhotoCode, submitFeedback, logVerification } from '../services/supabase';
import type { VerificationResult } from '../services/supabase';
import StarRating from '../components/StarRating';

type ViewState = 'loading' | 'verified' | 'not-found' | 'rating' | 'feedback-submitted';

export default function VerifyPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const [viewState, setViewState] = useState<ViewState>('loading');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchCode, setSearchCode] = useState('');

  useEffect(() => {
    if (code) {
      verifyCode(code);
    } else {
      setViewState('not-found');
    }
  }, [code]);

  const verifyCode = async (codeToVerify: string) => {
    setViewState('loading');
    const result = await verifyPhotoCode(codeToVerify);

    if (result && result.verified) {
      setVerificationResult(result);
      setViewState('verified');
      // Log the verification
      logVerification(codeToVerify);
    } else {
      setVerificationResult(null);
      setViewState('not-found');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      navigate(`/verify/${searchCode.toUpperCase().replace(/[^A-Z0-9]/g, '')}`);
    }
  };

  const handleRatingClick = (value: number) => {
    setRating(value);
    setViewState('rating');
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || rating === 0) return;

    setIsSubmitting(true);
    const result = await submitFeedback({
      photo_code: code,
      rating,
      comment: comment.trim() || undefined,
      customer_email: email.trim() || undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      setViewState('feedback-submitted');
    } else {
      alert('Failed to submit feedback. Please try again.');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "MMMM d, yyyy 'at' h:mm a");
    } catch {
      return timestamp;
    }
  };

  // Header component
  const Header = () => (
    <header className="py-4 px-4 border-b border-slate-800">
      <div className="max-w-3xl mx-auto flex items-center gap-3">
        <a href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
            </svg>
          </div>
          <span className="text-lg font-bold text-white">VisualService</span>
        </a>
      </div>
    </header>
  );

  // Loading state
  if (viewState === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Verifying photo...</p>
          </div>
        </main>
      </div>
    );
  }

  // Not found state
  if (viewState === 'not-found') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Photo Not Found</h1>
            <p className="text-slate-400 mb-6">
              This verification code doesn't exist or may have expired.
            </p>

            <form onSubmit={handleSearch} className="space-y-4">
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                placeholder="Try another code"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 text-center tracking-widest font-mono"
              />
              <button
                type="submit"
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // Feedback submitted state
  if (viewState === 'feedback-submitted') {
    const isPositive = rating >= 4;

    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className={`w-16 h-16 ${isPositive ? 'bg-green-500/10' : 'bg-yellow-500/10'} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <svg
                className={`w-8 h-8 ${isPositive ? 'text-green-500' : 'text-yellow-500'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              {isPositive ? 'Thank You!' : 'Feedback Received'}
            </h1>

            {isPositive ? (
              <>
                <p className="text-slate-400 mb-6">
                  Help others find great service by leaving a public review.
                </p>
                <a
                  href="https://www.google.com/search?q=leave+a+review"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 py-3 px-6 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Leave a Review on Google
                </a>
              </>
            ) : (
              <p className="text-slate-400 mb-6">
                Thank you for your feedback. We'll pass this along to the service provider.
              </p>
            )}

            <button
              onClick={() => navigate('/')}
              className="mt-4 text-slate-400 hover:text-white transition-colors"
            >
              Verify another photo
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Rating submission state
  if (viewState === 'rating') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <button
              onClick={() => setViewState('verified')}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <h1 className="text-2xl font-bold text-white mb-2">Rate This Service</h1>
            <p className="text-slate-400 mb-6">
              You selected {rating} {rating === 1 ? 'star' : 'stars'}. Add a comment to complete your feedback.
            </p>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Comment (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about your experience..."
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 resize-none"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-slate-500 mt-1 text-right">
                  {comment.length}/500
                </p>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Your email (optional, for follow-up)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // Verified state (main view)
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {/* Success icon */}
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Photo Verified</h1>

          {/* Verification details */}
          <div className="bg-slate-800 rounded-lg p-6 mb-6 text-left">
            <div className="mb-4">
              <p className="text-sm text-slate-400 mb-1">Verification Code</p>
              <p className="text-lg font-mono font-bold text-white tracking-widest">
                {verificationResult?.code}
              </p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-slate-400 mb-1">Captured</p>
              <p className="text-white">
                {verificationResult && formatTimestamp(verificationResult.captured_at)}
              </p>
            </div>
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Taken with VisualService app
            </div>
          </div>

          {/* Rating prompt */}
          <div className="bg-slate-800/50 rounded-lg p-6">
            <p className="text-white font-medium mb-4">
              How was this service?
            </p>
            <StarRating onRate={handleRatingClick} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 border-t border-slate-800">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © 2026 VisualService. Trusted verification for service providers.
          </p>
          <div className="flex gap-6">
            <Link to="/terms" className="text-xs text-slate-400 hover:text-white transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="text-xs text-slate-400 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="/help" className="text-xs text-slate-400 hover:text-white transition-colors">
              Help
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
