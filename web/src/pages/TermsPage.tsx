import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 border-b border-slate-800">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-slate-400 mb-8">Last updated: January 25, 2026</p>

          <div className="prose prose-invert prose-slate max-w-none space-y-6">
            <section className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-300 leading-relaxed">
                By accessing or using the VisualService mobile application and website (collectively, the "Service"),
                you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not
                use our Service.
              </p>
            </section>

            <section className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                VisualService provides a photo verification platform for service providers. Our Service includes:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Mobile application for capturing and watermarking photos with verification codes</li>
                <li>Public verification page for customers to verify photo authenticity</li>
                <li>Customer feedback and rating system</li>
                <li>Photo organization and album management</li>
              </ul>
            </section>

            <section className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">3. User Accounts</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                To use certain features of the Service, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">4. Subscription Plans</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                We offer the following subscription tiers:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li><strong className="text-white">Free:</strong> 30-day data retention, up to 3 albums</li>
                <li><strong className="text-white">Pro ($4.99/month):</strong> 1-year data retention, unlimited albums</li>
                <li><strong className="text-white">Enterprise:</strong> Custom retention, API access, dedicated support</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                Subscriptions are billed through the Apple App Store or Google Play Store. Cancellations and
                refunds are subject to the respective store's policies.
              </p>
            </section>

            <section className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">5. Acceptable Use</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Upload content that is illegal, harmful, or violates others' rights</li>
                <li>Impersonate any person or entity</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Use the Service for any fraudulent or deceptive purpose</li>
                <li>Upload photos you did not take or do not have rights to</li>
              </ul>
            </section>

            <section className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">6. Intellectual Property</h2>
              <p className="text-slate-300 leading-relaxed">
                You retain ownership of photos you upload to the Service. By uploading content, you grant
                VisualService a limited license to store, display, and process your photos for the purpose
                of providing the Service. The VisualService name, logo, and all related marks are our
                trademarks and may not be used without permission.
              </p>
            </section>

            <section className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">7. Data Retention</h2>
              <p className="text-slate-300 leading-relaxed">
                Photos and verification codes are retained according to your subscription tier. When data
                reaches its retention limit, it will be automatically deleted. We recommend downloading
                any photos you wish to keep before your retention period expires. Account deletion will
                result in immediate removal of all associated data.
              </p>
            </section>

            <section className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">8. Limitation of Liability</h2>
              <p className="text-slate-300 leading-relaxed">
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. TO THE MAXIMUM EXTENT
                PERMITTED BY LAW, VISUALSERVICE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
              </p>
            </section>

            <section className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">9. Termination</h2>
              <p className="text-slate-300 leading-relaxed">
                We may terminate or suspend your account at any time for violations of these terms. You may
                delete your account at any time through the app settings. Upon termination, your data will
                be deleted in accordance with our data retention policies.
              </p>
            </section>

            <section className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">10. Changes to Terms</h2>
              <p className="text-slate-300 leading-relaxed">
                We may update these Terms of Service from time to time. We will notify you of significant
                changes via email or through the app. Continued use of the Service after changes constitutes
                acceptance of the new terms.
              </p>
            </section>

            <section className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">11. Contact Us</h2>
              <p className="text-slate-300 leading-relaxed">
                If you have questions about these Terms of Service, please contact us at:{' '}
                <a href="mailto:legal@visualservice.app" className="text-primary-400 hover:text-primary-300">
                  legal@visualservice.app
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-slate-800">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © 2026 VisualService. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/help" className="text-sm text-slate-400 hover:text-white transition-colors">
              Help Center
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
