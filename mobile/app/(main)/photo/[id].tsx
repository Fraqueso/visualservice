import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { format } from 'date-fns';
import { supabase, Photo } from '../../../services/supabase';
import { usePhotoStore } from '../../../store/photoStore';
import { getVerificationUrl, formatCodeForDisplay } from '../../../utils/codeGenerator';
import { generateWatermarkText } from '../../../utils/watermark';

export default function PhotoDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [photo, setPhoto] = useState<Photo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const deletePhoto = usePhotoStore((state) => state.deletePhoto);

  useEffect(() => {
    fetchPhoto();
  }, [id]);

  const fetchPhoto = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPhoto(data);
    } catch (error) {
      console.error('Fetch photo error:', error);
      Alert.alert('Error', 'Failed to load photo');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!photo) return;
    await Clipboard.setStringAsync(photo.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = async () => {
    if (!photo) return;
    await Clipboard.setStringAsync(getVerificationUrl(photo.code));
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShare = async () => {
    if (!photo) return;
    const verificationUrl = getVerificationUrl(photo.code);

    try {
      await Share.share({
        message: `Verify my work at: ${verificationUrl}\n\nVerification Code: ${photo.code}`,
        title: 'VisualService Verification',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!photo) return;
            const { error } = await deletePhoto(photo.id);
            if (error) {
              Alert.alert('Error', 'Failed to delete photo');
            } else {
              router.back();
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!photo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Photo not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const verificationUrl = getVerificationUrl(photo.code);
  const capturedAt = new Date(photo.captured_at);
  const expiresAt = new Date(photo.expires_at);
  const watermarkText = generateWatermarkText(photo.code, capturedAt);
  const isExpired = expiresAt < new Date();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photo Details</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
          <Ionicons name="trash-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photo */}
        <View style={styles.photoContainer}>
          {photo.watermarked_url || photo.image_url ? (
            <Image
              source={{ uri: photo.watermarked_url || photo.image_url }}
              style={styles.photo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="image" size={64} color="#64748B" />
            </View>
          )}

          {/* Watermark overlay */}
          <View style={styles.watermarkOverlay}>
            <Text style={styles.watermarkText}>{watermarkText}</Text>
          </View>

          {/* Expired badge */}
          {isExpired && (
            <View style={styles.expiredBadge}>
              <Ionicons name="warning" size={14} color="#F59E0B" />
              <Text style={styles.expiredText}>Verification Expired</Text>
            </View>
          )}
        </View>

        {/* Verification Code */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Verification Code</Text>
          <Text style={styles.codeValue}>{formatCodeForDisplay(photo.code)}</Text>
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

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCopyLink}>
            <Ionicons name="link" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>
              {copiedLink ? 'Copied!' : 'Copy Link'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButtonPrimary} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Photo Information</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar-outline" size={18} color="#64748B" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Captured</Text>
              <Text style={styles.detailValue}>
                {format(capturedAt, 'MMM d, yyyy h:mm a')}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="time-outline" size={18} color="#64748B" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Verification Expires</Text>
              <Text style={[styles.detailValue, isExpired && styles.expiredValue]}>
                {isExpired
                  ? 'Expired'
                  : format(expiresAt, 'MMM d, yyyy')}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#64748B" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Tier at Capture</Text>
              <Text style={styles.detailValue}>
                {photo.tier_at_capture.charAt(0).toUpperCase() + photo.tier_at_capture.slice(1)}
              </Text>
            </View>
          </View>

          {photo.width && photo.height && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="resize-outline" size={18} color="#64748B" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Dimensions</Text>
                <Text style={styles.detailValue}>
                  {photo.width} x {photo.height}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Verification URL */}
        <View style={styles.urlCard}>
          <Text style={styles.urlLabel}>Verification URL</Text>
          <Text style={styles.urlValue} numberOfLines={2}>
            {verificationUrl}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 16,
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
  headerButton: {
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  photoContainer: {
    aspectRatio: 4 / 3,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
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
  expiredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  expiredText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
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
    fontSize: 24,
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
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 14,
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  detailsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#F8FAFC',
  },
  expiredValue: {
    color: '#F59E0B',
  },
  urlCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#334155',
  },
  urlLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  urlValue: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: '#3B82F6',
    fontSize: 16,
  },
});
