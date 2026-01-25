import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface VerificationResult {
  code: string;
  captured_at: string;
  verified: boolean;
}

export interface FeedbackData {
  photo_code: string;
  rating: number;
  comment?: string;
  customer_email?: string;
}

/**
 * Verify a photo code - public endpoint
 */
export async function verifyPhotoCode(code: string): Promise<VerificationResult | null> {
  try {
    // Call the verify_photo_code function
    const { data, error } = await supabase
      .rpc('verify_photo_code', { p_code: code.toUpperCase() });

    if (error) {
      console.error('Verification error:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    return data[0] as VerificationResult;
  } catch (error) {
    console.error('Verification error:', error);
    return null;
  }
}

/**
 * Submit feedback for a photo code - public endpoint
 */
export async function submitFeedback(feedback: FeedbackData): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('feedback')
      .insert({
        photo_code: feedback.photo_code.toUpperCase(),
        rating: feedback.rating,
        comment: feedback.comment || null,
        customer_email: feedback.customer_email || null,
        ip_hash: null, // Will be set server-side
      });

    if (error) {
      console.error('Feedback submission error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Feedback submission error:', error);
    return { success: false, error: 'Failed to submit feedback' };
  }
}

/**
 * Log a verification event
 */
export async function logVerification(code: string): Promise<void> {
  try {
    await supabase
      .from('verification_logs')
      .insert({
        photo_code: code.toUpperCase(),
        referrer: document.referrer || null,
        user_agent: navigator.userAgent || null,
      });
  } catch (error) {
    console.error('Verification log error:', error);
  }
}
