import { useState } from 'react';
import { Link } from 'react-router-dom';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: string;
  faqs: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    title: 'Getting Started',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    faqs: [
      {
        question: 'What is VisualService?',
        answer: 'VisualService is a photo verification app for service providers like car detailers, contractors, stylists, and cleaners. It helps you prove your work is authentic by adding timestamped verification codes to your photos that customers can verify.',
      },
      {
        question: 'How do I get started?',
        answer: 'Download the VisualService app from the App Store or Google Play. Create an account with your email, and you\'re ready to start taking verified photos. The app will guide you through the process.',
      },
      {
        question: 'Is VisualService free to use?',
        answer: 'Yes! The free tier includes unlimited photo uploads, 30-day data retention, and up to 3 albums. Pro users ($4.99/month) get 1-year retention and unlimited albums. Enterprise plans are available for larger businesses.',
      },
      {
        question: 'What devices are supported?',
        answer: 'VisualService is available for iOS (iPhone and iPad) and Android devices. The verification website works on any modern web browser.',
      },
    ],
  },
  {
    title: 'Taking Photos',
    icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z',
    faqs: [
      {
        question: 'Why can\'t I upload photos from my gallery?',
        answer: 'VisualService only allows photos taken directly through the app camera. This ensures every photo is genuinely captured at the time shown, preventing fraud and maintaining trust with your customers.',
      },
      {
        question: 'What is the watermark on my photos?',
        answer: 'Each photo gets a unique verification code and timestamp watermarked in the corner. This code is what customers use to verify the photo is authentic. The format is: "Code: ABC123XYZ789 | Jan 24, 2026 3:45 PM"',
      },
      {
        question: 'How does the before/after overlay work?',
        answer: 'The onion-skin overlay feature lets you take a "before" photo, then display it as a semi-transparent overlay when taking the "after" photo. This helps you match angles and framing perfectly. Adjust the opacity slider to see more or less of the overlay.',
      },
      {
        question: 'Can I edit or remove the watermark?',
        answer: 'No, the watermark is permanently burned into the photo when captured. This is intentional—it ensures the verification code survives sharing on social media and cannot be manipulated.',
      },
    ],
  },
  {
    title: 'Verification & Sharing',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    faqs: [
      {
        question: 'How do customers verify my photos?',
        answer: 'Share the verification link (visualservice.app/verify/CODE) or just tell customers the code. They can enter it on our website to see when the photo was taken and confirm it\'s authentic.',
      },
      {
        question: 'What information do customers see when verifying?',
        answer: 'Customers see the verification code, the exact date and time the photo was taken, and confirmation that it was captured using the VisualService camera. They can also leave a rating and feedback.',
      },
      {
        question: 'How do I share my photos?',
        answer: 'After taking a photo, you can copy the verification code, copy the full verification link, or use the share button to send via SMS, email, or any other app. You can also download the watermarked image.',
      },
      {
        question: 'What happens to customer feedback?',
        answer: 'Customer ratings and comments are stored securely. Positive feedback (4-5 stars) prompts customers to leave a Google review. Constructive feedback (1-3 stars) is sent privately to you.',
      },
    ],
  },
  {
    title: 'Albums & Organization',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    faqs: [
      {
        question: 'How do I organize my photos?',
        answer: 'Create albums to organize photos by job, client, vehicle, or any category you prefer. You can select an album before taking a photo, or add photos to albums later from the gallery.',
      },
      {
        question: 'How many albums can I create?',
        answer: 'Free users can create up to 3 albums. Pro and Enterprise users have unlimited albums.',
      },
      {
        question: 'Can I search for specific photos?',
        answer: 'Yes! Use the search bar in the gallery to find photos by verification code. You can also filter by date or browse by album.',
      },
    ],
  },
  {
    title: 'Account & Subscription',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    faqs: [
      {
        question: 'How do I upgrade to Pro?',
        answer: 'Go to Settings in the app and tap "Upgrade to Pro." You\'ll be taken to the App Store or Google Play to complete your subscription. Pro costs $4.99/month or $49.99/year.',
      },
      {
        question: 'What happens to my photos if I downgrade?',
        answer: 'If you downgrade from Pro to Free, your existing photos will remain but will follow the 30-day retention policy. Photos older than 30 days will be deleted. We recommend downloading important photos before downgrading.',
      },
      {
        question: 'How do I delete my account?',
        answer: 'Go to Settings > Delete Account. This will permanently delete all your photos, albums, and account data. This action cannot be undone.',
      },
      {
        question: 'How do I change my password?',
        answer: 'Go to Settings > Change Password. Enter your new password twice to confirm. You\'ll need to be logged in to change your password.',
      },
    ],
  },
  {
    title: 'Technical Issues',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    faqs: [
      {
        question: 'The app won\'t let me take photos',
        answer: 'Make sure you\'ve granted camera permissions. Go to your device settings > Apps > VisualService > Permissions and enable Camera access. Then restart the app.',
      },
      {
        question: 'My photos aren\'t uploading',
        answer: 'Check your internet connection. Photos require an active connection to upload. If you\'re on a slow connection, uploads may take longer. Try switching between WiFi and cellular data.',
      },
      {
        question: 'I forgot my password',
        answer: 'On the login screen, tap "Forgot Password" and enter your email. We\'ll send you a link to reset your password. Check your spam folder if you don\'t see the email.',
      },
      {
        question: 'The verification code isn\'t working',
        answer: 'Make sure you\'re entering the code exactly as shown—codes are case-sensitive and contain only letters A-Z and numbers 0-9. If the code was from a Free account, it may have expired after 30 days.',
      },
    ],
  },
];

export default function HelpPage() {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleItem = (categoryIndex: number, faqIndex: number) => {
    const key = `${categoryIndex}-${faqIndex}`;
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const filteredData = searchQuery
    ? faqData.map((category) => ({
        ...category,
        faqs: category.faqs.filter(
          (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter((category) => category.faqs.length > 0)
    : faqData;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 border-b border-slate-800">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
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
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Help Center
            </h1>
            <p className="text-slate-400 text-lg mb-8">
              Find answers to common questions about VisualService
            </p>

            {/* Search */}
            <div className="max-w-xl mx-auto relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help..."
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* FAQ Categories */}
          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-slate-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-slate-400 text-lg">No results found for "{searchQuery}"</p>
              <p className="text-slate-500 mt-2">Try a different search term or browse the categories below</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredData.map((category, categoryIndex) => (
                <div key={category.title} className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                  <div className="p-6 border-b border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-primary-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={category.icon}
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white">{category.title}</h2>
                  </div>

                  <div className="divide-y divide-slate-700">
                    {category.faqs.map((faq, faqIndex) => {
                      const isExpanded = expandedItems.has(`${categoryIndex}-${faqIndex}`);
                      return (
                        <div key={faqIndex}>
                          <button
                            onClick={() => toggleItem(categoryIndex, faqIndex)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-700/50 transition-colors"
                          >
                            <span className="text-white font-medium pr-4">{faq.question}</span>
                            <svg
                              className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                          {isExpanded && (
                            <div className="px-6 pb-4">
                              <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contact Support */}
          <div className="mt-12 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-xl border border-primary-500/30 p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Still need help?</h2>
            <p className="text-slate-300 mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <a
              href="mailto:support@visualservice.app"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Contact Support
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-slate-800">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © 2026 VisualService. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/terms" className="text-sm text-slate-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
