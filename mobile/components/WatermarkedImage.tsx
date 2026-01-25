import React, { forwardRef } from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';

interface WatermarkedImageProps {
  imageUri: string;
  watermarkText: string;
  width?: number;
  height?: number;
}

/**
 * Component that renders an image with a watermark overlay.
 * Use with react-native-view-shot's captureRef to create a watermarked image.
 */
const WatermarkedImage = forwardRef<View, WatermarkedImageProps>(
  ({ imageUri, watermarkText, width, height }, ref) => {
    // Default to a 4:3 aspect ratio if dimensions not provided
    const containerWidth = width || Dimensions.get('window').width;
    const containerHeight = height || containerWidth * 0.75;

    return (
      <View
        ref={ref}
        style={[
          styles.container,
          { width: containerWidth, height: containerHeight },
        ]}
        collapsable={false}
      >
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.watermarkContainer}>
          <Text style={styles.watermarkText}>{watermarkText}</Text>
        </View>
      </View>
    );
  }
);

WatermarkedImage.displayName = 'WatermarkedImage';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#000000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  watermarkContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  watermarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});

export default WatermarkedImage;
