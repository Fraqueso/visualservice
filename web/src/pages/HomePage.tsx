import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function HomePage() {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'VisualService - Photo Verification';
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      navigate(`/verify/${code.toUpperCase().replace(/[^A-Z0-9]/g, '')}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 border-b border-slate-800">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">VisualService</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            Verify Photo Authenticity
          </h1>
          <p className="text-slate-400 mb-8">
            Enter the verification code from the photo to confirm it was taken
            with the VisualService app.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter verification code"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-center text-lg tracking-widest font-mono"
              maxLength={16}
            />
            <button
              type="submit"
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors"
            >
              Verify Photo
            </button>
          </form>

          <p className="mt-8 text-sm text-slate-500">
            The code is displayed on watermarked photos from VisualService
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-slate-800">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © 2026 VisualService. Trusted verification for service providers.
          </p>
          <div className="flex gap-6">
            <Link to="/terms" className="text-sm text-slate-400 hover:text-white transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="/help" className="text-sm text-slate-400 hover:text-white transition-colors">
              Help
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
