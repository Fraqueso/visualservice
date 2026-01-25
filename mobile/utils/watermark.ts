import * as ImageManipulator from 'expo-image-manipulator';
import { format } from 'date-fns';
import { captureRef } from 'react-native-view-shot';
import { View } from 'react-native';

interface WatermarkOptions {
  code: string;
  timestamp: Date;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

/**
 * Format timestamp for watermark display
 * Example: "Jan 24, 2026 3:45 PM"
 */
export function formatWatermarkTimestamp(date: Date): string {
  return format(date, 'MMM d, yyyy h:mm a');
}

/**
 * Generate watermark text
 * Format: "Code: ABC123XYZ789 | Jan 24, 2026 3:45 PM"
 */
export function generateWatermarkText(code: string, timestamp: Date): string {
  return `Code: ${code} | ${formatWatermarkTimestamp(timestamp)}`;
}

/**
 * Apply watermark to an image
 *
 * Note: expo-image-manipulator doesn't support text overlays directly.
 * For MVP, we'll use a workaround:
 * 1. Create a canvas-based watermark (using react-native-canvas or similar)
 * 2. Or generate watermarked images server-side
 *
 * For now, this returns the compressed image and we'll add text watermark
 * in a separate canvas component for display.
 */
export async function processImage(
  imageUri: string,
  options: WatermarkOptions
): Promise<{ uri: string; width: number; height: number }> {
  try {
    // Get image info and compress
    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        // Resize to max 2048px width while maintaining aspect ratio
        { resize: { width: 2048 } },
      ],
      {
        compress: 0.85,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Image processing error:', error);
    throw error;
  }
}

/**
 * Generate a hash of the image for fraud detection
 * This is a simple implementation - in production, use a proper hashing algorithm
 */
export async function generateImageHash(imageUri: string): Promise<string> {
  try {
    // For MVP, we'll use the file size + timestamp as a simple "hash"
    // In production, implement proper perceptual hashing (pHash)
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const size = blob.size;
    const timestamp = Date.now();

    return `${size}-${timestamp}`;
  } catch (error) {
    console.error('Image hash generation error:', error);
    return `hash-${Date.now()}`;
  }
}

/**
 * Calculate watermark dimensions based on image size
 */
export function calculateWatermarkDimensions(
  imageWidth: number,
  imageHeight: number
): {
  fontSize: number;
  padding: number;
  backgroundColor: string;
  textColor: string;
} {
  // Font size is approximately 3% of image height, min 14px, max 48px
  const fontSize = Math.max(14, Math.min(48, Math.floor(imageHeight * 0.03)));
  const padding = Math.floor(fontSize * 0.5);

  return {
    fontSize,
    padding,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    textColor: '#FFFFFF',
  };
}

/**
 * Capture a watermarked image from a ref to a WatermarkedImage component
 * @param viewRef - React ref to the WatermarkedImage component
 * @returns URI of the captured watermarked image
 */
export async function captureWatermarkedImage(
  viewRef: React.RefObject<View>
): Promise<string> {
  try {
    if (!viewRef.current) {
      throw new Error('View ref is not available');
    }

    const uri = await captureRef(viewRef, {
      format: 'jpg',
      quality: 0.9,
    });

    return uri;
  } catch (error) {
    console.error('Failed to capture watermarked image:', error);
    throw error;
  }
}

/**
 * Process and watermark an image in one step
 * @param imageUri - Original image URI
 * @param viewRef - Ref to WatermarkedImage component showing the image with watermark
 * @returns Processed image data
 */
export async function processAndWatermarkImage(
  imageUri: string,
  viewRef: React.RefObject<View>
): Promise<{ uri: string; width: number; height: number }> {
  try {
    // First capture the watermarked view
    const watermarkedUri = await captureWatermarkedImage(viewRef);

    // Then compress and resize the watermarked image
    const result = await ImageManipulator.manipulateAsync(
      watermarkedUri,
      [{ resize: { width: 2048 } }],
      {
        compress: 0.85,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Failed to process and watermark image:', error);
    throw error;
  }
}
