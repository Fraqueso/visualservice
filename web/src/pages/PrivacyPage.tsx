import { Link } from 'react-router-dom';

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-slate-400 mb-8">Last updated: January 25, 2026</p>

          <div className="prose prose-invert prose-slate max-w-none space-y-6">
            <section className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">1. Introduction</h2>
              <p className="text-slate-300 leading-relaxed">
                VisualService ("we," "our," or "us") is committed to protecting your privacy. This Privacy
                Policy explains how we collect, use, disclose, and safeguard your information when you use
                our mobile application and website.
              </p>
            </section>

            <section className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">2. Information We Collect</h2>

              <h3 className="text-lg font-medium text-white mt-4 mb-2">Personal Information</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Email address (for account creation and communication)</li>
                <li>Full name (optional, for profile)</li>
                <li>Business name (optional, for profile)</li>
                <li>Password (encrypted and never stored in plain text)</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-4 mb-2">Photos and Content</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Photos taken through the VisualService camera</li>
                <li>Verification codes and timestamps</li>
                <li>Album names and descriptions</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-4 mb-2">Device Information</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Device type, brand, and model</li>
                <li>Operating system and version</li>
                <li>App version</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-4 mb-2">Customer Feedback</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Star ratings (1-5)</li>
                <li>Comments (optional)</li>
                <li>Customer email (optional, for follow-up)</li>
                <li>Hashed IP address (for spam prevention)</li>
              </ul>
            </section>

            <section className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Provide and maintain the Service</li>
                <li>Generate unique verification codes for photos</li>
                <li>Display verification information to customers</li>
                <li>Process and display customer feedback</li>
                <li>Send service-related communications</li>
                <li>Improve and optimize the Service</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">4. Information Sharing</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                We do not sell your personal information. We may share information in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li><strong className="text-white">Verification:</strong> Verification codes and timestamps are publicly accessible when customers verify photos</li>
                <li><strong className="text-white">Feedback:</strong> Customer ratings and comments are shared with the service provider who owns the photo</li>
                <li><strong className="text-white">Service Providers:</strong> We use third-party services (e.g., Supabase for hosting) that may process data on our behalf</li>
                <li><strong className="text-white">Legal Requirements:</strong> We may disclose information if required by law</li>
              </ul>
            </section>

            <section className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">5. Data Retention</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Your data is retained according to your subscription tier:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li><strong className="text-white">Free:</strong> Photos and codes are deleted after 30 days</li>
                <li><strong className="text-white">Pro:</strong> Photos and codes are deleted after 1 year</li>
                <li><strong className="text-white">Enterprise:</strong> Custom retention period per agreement</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                Account information is retained until you delete your account. Upon account deletion, all
                associated data is permanently removed.
              </p>
            </section>

            <section className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">6. Data Security</h2>
              <p className="text-slate-300 leading-relaxed">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4 mt-4">
                <li>All data is transmitted over HTTPS/TLS encryption</li>
                <li>Passwords are hashed using bcrypt</li>
                <li>Photos are stored in encrypted cloud storage</li>
                <li>Access to user data is restricted to authorized personnel</li>
                <li>Regular security audits and updates</li>
              </ul>
            </section>

            <section className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">7. Your Rights</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li><strong className="text-white">Access:</strong> Request a copy of your personal data</li>
                <li><strong className="text-white">Correction:</strong> Update inaccurate information</li>
                <li><strong className="text-white">Deletion:</strong> Delete your account and all associated data</li>
                <li><strong className="text-white">Portability:</strong> Export your data in a standard format</li>
                <li><strong className="text-white">Objection:</strong> Object to certain processing of your data</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                To exercise these rights, please contact us at{' '}
                <a href="mailto:privacy@visualservice.app" className="text-primary-400 hover:text-primary-300">
                  privacy@visualservice.app
                </a>
              </p>
            </section>

            <section className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">8. Cookies and Tracking</h2>
              <p className="text-slate-300 leading-relaxed">
                The VisualService website uses minimal cookies for essential functionality only. We do not
                use advertising trackers or sell data to third parties. The mobile app does not use cookies
                but may store authentication tokens securely on your device.
              </p>
            </section>

            <section className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">9. Children's Privacy</h2>
              <p className="text-slate-300 leading-relaxed">
                The Service is not intended for users under 13 years of age. We do not knowingly collect
                personal information from children under 13. If you believe we have collected information
                from a child under 13, please contact us immediately.
              </p>
            </section>

            <section className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">10. International Data Transfers</h2>
              <p className="text-slate-300 leading-relaxed">
                Your information may be transferred to and processed in countries other than your own.
                We ensure appropriate safeguards are in place to protect your information in accordance
                with this Privacy Policy.
              </p>
            </section>

            <section className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">11. Changes to This Policy</h2>
              <p className="text-slate-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant
                changes via email or through the app. The "Last updated" date at the top indicates when
                the policy was last revised.
              </p>
            </section>

            <section className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">12. Contact Us</h2>
              <p className="text-slate-300 leading-relaxed">
                If you have questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <ul className="list-none text-slate-300 space-y-2 mt-4">
                <li>
                  <strong className="text-white">Email:</strong>{' '}
                  <a href="mailto:privacy@visualservice.app" className="text-primary-400 hover:text-primary-300">
                    privacy@visualservice.app
                  </a>
                </li>
                <li>
                  <strong className="text-white">Support:</strong>{' '}
                  <a href="mailto:support@visualservice.app" className="text-primary-400 hover:text-primary-300">
                    support@visualservice.app
                  </a>
                </li>
              </ul>
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
            <Link to="/terms" className="text-sm text-slate-400 hover:text-white transition-colors">
              Terms of Service
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
