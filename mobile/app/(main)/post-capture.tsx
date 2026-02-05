import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Share,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { format } from 'date-fns';
import { getVerificationUrl, formatCodeForDisplay } from '../../utils/codeGenerator';
import { generateWatermarkText } from '../../utils/watermark';
import { usePhotoStore } from '../../store/photoStore';
import { trackEvent } from '../../services/analytics';

export default function PostCaptureScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    photoId: string;
    code: string;
    imageUri: string;
    albumId: string;
    albumName: string;
  }>();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [albumAdded, setAlbumAdded] = useState(false);

  const addPhotoToAlbum = usePhotoStore((state) => state.addPhotoToAlbum);

  const code = params.code || '';
  const imageUri = params.imageUri || '';
  const photoId = params.photoId || '';
  const albumId = params.albumId || '';
  const albumName = params.albumName || '';
  const verificationUrl = getVerificationUrl(code);
  const timestamp = new Date();
  const watermarkText = generateWatermarkText(code, timestamp);

  // Add photo to album if one was selected
  useEffect(() => {
    const addToAlbum = async () => {
      if (photoId && albumId && !albumAdded) {
        const { error } = await addPhotoToAlbum(photoId, albumId);
        if (error) {
          console.error('Failed to add photo to album:', error);
          Alert.alert('Warning', 'Photo was saved but could not be added to the album.');
        } else {
          setAlbumAdded(true);
        }
      }
    };
    addToAlbum();
  }, [photoId, albumId, albumAdded]);

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(code);
    setCopiedCode(true);
    trackEvent('code_copied', { code });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(verificationUrl);
    setCopiedLink(true);
    trackEvent('code_copied', { code, type: 'link' });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Verify my work at: ${verificationUrl}\n\nVerification Code: ${code}`,
        title: 'VisualService Verification',
      });
      trackEvent('photo_shared', { code });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleDone = () => {
    router.replace('/(main)/(tabs)/gallery');
  };

  const handleTakeAnother = () => {
    router.replace('/(main)/camera');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photo Captured</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photo Preview */}
        <View style={styles.photoContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.photo} resizeMode="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="image" size={48} color="#64748B" />
            </View>
          )}

          {/* Watermark overlay preview */}
          <View style={styles.watermarkOverlay}>
            <Text style={styles.watermarkText}>{watermarkText}</Text>
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.successBadge}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={styles.successText}>Photo verified & saved</Text>
        </View>

        {/* Album Badge */}
        {albumName && albumAdded && (
          <View style={styles.albumBadge}>
            <Ionicons name="folder" size={16} color="#3B82F6" />
            <Text style={styles.albumBadgeText}>Added to "{albumName}"</Text>
          </View>
        )}

        {/* Verification Code Card */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Verification Code</Text>
          <Text style={styles.codeValue}>{formatCodeForDisplay(code)}</Text>
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
            <Ionicons
              name={copiedCode ? 'checkmark' : 'copy-outline'}
              size={18}
              color={copiedCode ? '#10B981' : '#3B82F6'}
            />
            <Text style={[styles.copyButtonText, copiedCode && styles.copiedText]}>
              {copiedCode ? 'Copied!' : 'Copy Code'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Verification Link Card */}
        <View style={styles.linkCard}>
          <Text style={styles.linkLabel}>Share with your customer</Text>
          <Text style={styles.linkValue} numberOfLines={1}>
            {verificationUrl}
          </Text>
          <View style={styles.linkActions}>
            <TouchableOpacity style={styles.linkButton} onPress={handleCopyLink}>
              <Ionicons
                name={copiedLink ? 'checkmark' : 'link'}
                size={18}
                color={copiedLink ? '#10B981' : '#FFFFFF'}
              />
              <Text style={styles.linkButtonText}>
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={18} color="#FFFFFF" />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
          <Text style={styles.infoText}>
            Include the verification code in your social media posts or share the
            link directly with customers so they can verify your work.
          </Text>
        </View>

        {/* Timestamp */}
        <Text style={styles.timestamp}>
          Captured: {format(timestamp, 'MMM d, yyyy h:mm a')}
        </Text>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleTakeAnother}>
          <Ionicons name="camera" size={20} color="#F8FAFC" />
          <Text style={styles.secondaryButtonText}>Take Another</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={handleDone}>
          <Text style={styles.primaryButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  photoContainer: {
    aspectRatio: 4 / 3,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  watermarkOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  watermarkText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    marginBottom: 20,
  },
  successText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  albumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  albumBadgeText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  codeCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  codeLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  codeValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginBottom: 16,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  copyButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  copiedText: {
    color: '#10B981',
  },
  linkCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  linkValue: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  linkActions: {
    flexDirection: 'row',
    gap: 12,
  },
  linkButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    borderRadius: 8,
    paddingVertical: 10,
  },
  linkButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 10,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 20,
    marginLeft: 12,
  },
  timestamp: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 12,
    marginBottom: 20,
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    backgroundColor: '#0F172A',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
