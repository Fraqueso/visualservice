import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions, FlashMode } from 'expo-camera';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
let captureRef: any = null;
try {
  captureRef = require('react-native-view-shot').captureRef;
} catch {
  console.log('[Camera] react-native-view-shot not available (Expo Go)');
}
import * as ImageManipulator from 'expo-image-manipulator';
import Slider from '@react-native-community/slider';
import { generateUniqueCode } from '../../utils/codeGenerator';
import { generateImageHash, generateWatermarkText } from '../../utils/watermark';
import { usePhotoStore } from '../../store/photoStore';
import { useAuthStore } from '../../store/authStore';
import { Album } from '../../services/supabase';
import { trackEvent } from '../../services/analytics';
import * as Device from 'expo-device';

const WATERMARK_WIDTH = 1200;
const WATERMARK_HEIGHT = 900;

export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const watermarkViewRef = useRef<View>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [isCapturing, setIsCapturing] = useState(false);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  // Watermarking state
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState<string>('');
  const [isProcessingWatermark, setIsProcessingWatermark] = useState(false);

  // Onion-skin overlay state (for before/after matching)
  const [overlayImageUri, setOverlayImageUri] = useState<string | null>(null);
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showOverlayControls, setShowOverlayControls] = useState(false);

  const profile = useAuthStore((state) => state.profile);
  const uploadPhoto = usePhotoStore((state) => state.uploadPhoto);
  const albums = usePhotoStore((state) => state.albums);
  const fetchAlbums = usePhotoStore((state) => state.fetchAlbums);

  // Request permission on mount
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  // Fetch albums on mount
  useEffect(() => {
    fetchAlbums();
  }, []);

  // Process watermark after image is set
  useEffect(() => {
    if (capturedImageUri && watermarkText && isProcessingWatermark) {
      // Small delay to ensure the view is rendered
      const timer = setTimeout(async () => {
        try {
          await processWatermarkedImage();
        } catch (error) {
          console.error('Watermark processing error:', error);
          Alert.alert('Error', 'Failed to process photo. Please try again.');
          resetCaptureState();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [capturedImageUri, watermarkText, isProcessingWatermark]);

  const resetCaptureState = () => {
    setIsCapturing(false);
    setIsProcessingWatermark(false);
    setCapturedImageUri(null);
    setWatermarkText('');
  };

  const processWatermarkedImage = async () => {
    if (!capturedImageUri) return;

    try {
      let imageToUpload: string;

      if (captureRef && watermarkViewRef.current) {
        // Full watermarking with react-native-view-shot (dev builds)
        const watermarkedUri = await captureRef(watermarkViewRef, {
          format: 'jpg',
          quality: 0.9,
        });
        imageToUpload = watermarkedUri;
      } else {
        // Fallback: upload without burned-in watermark (Expo Go)
        console.log('[Camera] Using fallback: watermark not burned into image (Expo Go mode)');
        imageToUpload = capturedImageUri;
      }

      // Compress the image
      const processed = await ImageManipulator.manipulateAsync(
        imageToUpload,
        [{ resize: { width: 2048 } }],
        {
          compress: 0.85,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      // Extract code from watermark text
      const codeMatch = watermarkText.match(/Code: ([A-Z0-9]+)/);
      const code = codeMatch ? codeMatch[1] : '';

      // Generate image hash
      const photoHash = await generateImageHash(processed.uri);

      // Get device info
      const deviceInfo = {
        brand: Device.brand,
        model: Device.modelName,
        os: Device.osName,
        osVersion: Device.osVersion,
      };

      // Upload the watermarked photo
      const { photo: uploadedPhoto, error } = await uploadPhoto(
        processed.uri,
        code,
        {
          captured_at: new Date().toISOString(),
          photo_hash: photoHash,
          device_info: deviceInfo,
          width: processed.width,
          height: processed.height,
        }
      );

      if (error) {
        throw error;
      }

      trackEvent('photo_captured', {
        has_album: !!selectedAlbum,
        has_overlay: !!overlayImageUri,
      });

      // Navigate to post-capture screen
      router.push({
        pathname: '/(main)/post-capture',
        params: {
          photoId: uploadedPhoto?.id,
          code,
          imageUri: processed.uri,
          albumId: selectedAlbum?.id || '',
          albumName: selectedAlbum?.name || '',
        },
      });

      resetCaptureState();
    } catch (error) {
      throw error;
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);

      // Take the photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        exif: false, // Strip EXIF for privacy
      });

      if (!photo?.uri) {
        throw new Error('Failed to capture photo');
      }

      // Generate unique verification code
      const code = await generateUniqueCode();
      const timestamp = new Date();
      const watermark = generateWatermarkText(code, timestamp);

      // Set state to render the watermark view
      setCapturedImageUri(photo.uri);
      setWatermarkText(watermark);
      setIsProcessingWatermark(true);

      // The useEffect above will handle the rest of the processing
    } catch (error) {
      console.error('Capture error:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
      resetCaptureState();
    }
  };

  const toggleFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash((current) => {
      if (current === 'off') return 'on';
      if (current === 'on') return 'auto';
      return 'off';
    });
  };

  const getFlashIcon = (): keyof typeof Ionicons.glyphMap => {
    if (flash === 'on') return 'flash';
    if (flash === 'auto') return 'flash-outline';
    return 'flash-off';
  };

  // Overlay control functions
  const setAsBeforePhoto = (uri: string) => {
    setOverlayImageUri(uri);
    setShowOverlay(true);
    setShowOverlayControls(true);
  };

  const clearOverlay = () => {
    setOverlayImageUri(null);
    setShowOverlay(false);
    setShowOverlayControls(false);
  };

  const toggleOverlayVisibility = () => {
    setShowOverlay((prev) => !prev);
  };

  // Permission not determined yet
  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <Ionicons name="camera-outline" size={64} color="#64748B" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            VisualService needs camera access to capture photos for verification.
            This is required to ensure photos are genuine.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Access</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
      >
        {/* Onion-skin Overlay Image */}
        {overlayImageUri && showOverlay && (
          <Image
            source={{ uri: overlayImageUri }}
            style={[styles.overlayImage, { opacity: overlayOpacity }]}
            resizeMode="cover"
          />
        )}

        {/* Top Controls */}
        <SafeAreaView style={styles.topControls}>
          <TouchableOpacity style={styles.controlButton} onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.topRightControls}>
            {/* Overlay toggle button - only show if overlay exists */}
            {overlayImageUri && (
              <TouchableOpacity
                style={[styles.controlButton, showOverlay && styles.controlButtonActive]}
                onPress={toggleOverlayVisibility}
              >
                <Ionicons
                  name={showOverlay ? 'layers' : 'layers-outline'}
                  size={24}
                  color={showOverlay ? '#3B82F6' : '#FFFFFF'}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
              <Ionicons name={getFlashIcon()} size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={toggleFacing}>
              <Ionicons name="camera-reverse" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Overlay Controls Panel */}
        {overlayImageUri && showOverlayControls && (
          <View style={styles.overlayControlsPanel}>
            <View style={styles.overlayControlsHeader}>
              <Text style={styles.overlayControlsTitle}>Before Photo Overlay</Text>
              <TouchableOpacity onPress={() => setShowOverlayControls(false)}>
                <Ionicons name="chevron-up" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={styles.opacityControl}>
              <Text style={styles.opacityLabel}>Opacity: {Math.round(overlayOpacity * 100)}%</Text>
              <Slider
                style={styles.opacitySlider}
                minimumValue={0}
                maximumValue={1}
                step={0.05}
                value={overlayOpacity}
                onValueChange={setOverlayOpacity}
                minimumTrackTintColor="#3B82F6"
                maximumTrackTintColor="#475569"
                thumbTintColor="#3B82F6"
              />
            </View>

            <View style={styles.overlayActions}>
              <TouchableOpacity
                style={styles.overlayActionButton}
                onPress={toggleOverlayVisibility}
              >
                <Ionicons
                  name={showOverlay ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#F8FAFC"
                />
                <Text style={styles.overlayActionText}>
                  {showOverlay ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.overlayActionButton, styles.overlayActionButtonDanger]}
                onPress={clearOverlay}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                <Text style={[styles.overlayActionText, styles.overlayActionTextDanger]}>
                  Clear
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Collapsed overlay indicator */}
        {overlayImageUri && !showOverlayControls && (
          <TouchableOpacity
            style={styles.overlayIndicator}
            onPress={() => setShowOverlayControls(true)}
          >
            <Ionicons name="layers" size={16} color="#3B82F6" />
            <Text style={styles.overlayIndicatorText}>
              Before overlay {showOverlay ? 'on' : 'off'} ({Math.round(overlayOpacity * 100)}%)
            </Text>
            <Ionicons name="chevron-down" size={16} color="#94A3B8" />
          </TouchableOpacity>
        )}

        {/* Watermark Preview */}
        <View style={styles.watermarkPreview}>
          <Text style={styles.watermarkPreviewText}>
            Code + timestamp will be added here
          </Text>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <View style={styles.bottomControlsInner}>
            {/* Gallery shortcut */}
            <TouchableOpacity
              style={styles.sideButton}
              onPress={() => router.push('/(main)/(tabs)/gallery')}
            >
              <Ionicons name="images" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Set Before button - for onion skin overlay */}
            <TouchableOpacity
              style={[
                styles.sideButton,
                overlayImageUri && styles.sideButtonActive,
              ]}
              onPress={async () => {
                if (!cameraRef.current || isCapturing) return;
                try {
                  const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.7,
                    exif: false,
                  });
                  if (photo?.uri) {
                    setAsBeforePhoto(photo.uri);
                  }
                } catch (error) {
                  Alert.alert('Error', 'Failed to capture before photo');
                }
              }}
              disabled={isCapturing}
            >
              <Ionicons
                name={overlayImageUri ? 'git-compare' : 'git-compare-outline'}
                size={22}
                color={overlayImageUri ? '#3B82F6' : '#FFFFFF'}
              />
            </TouchableOpacity>

            {/* Capture button */}
            <TouchableOpacity
              style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
              onPress={handleCapture}
              disabled={isCapturing}
            >
              {isCapturing ? (
                <ActivityIndicator size="large" color="#3B82F6" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>

            {/* Album selector */}
            <TouchableOpacity
              style={[styles.sideButton, selectedAlbum && styles.sideButtonActive]}
              onPress={() => setShowAlbumModal(true)}
            >
              <Ionicons
                name={selectedAlbum ? "folder" : "folder-outline"}
                size={22}
                color={selectedAlbum ? "#3B82F6" : "#FFFFFF"}
              />
            </TouchableOpacity>

            {/* Overlay settings shortcut */}
            {overlayImageUri && (
              <TouchableOpacity
                style={[styles.sideButton, showOverlayControls && styles.sideButtonActive]}
                onPress={() => setShowOverlayControls(!showOverlayControls)}
              >
                <Ionicons
                  name="options"
                  size={22}
                  color={showOverlayControls ? '#3B82F6' : '#FFFFFF'}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Album indicator */}
          {selectedAlbum && (
            <View style={styles.albumIndicator}>
              <Ionicons name="folder" size={14} color="#3B82F6" />
              <Text style={styles.albumIndicatorText} numberOfLines={1}>
                {selectedAlbum.name}
              </Text>
            </View>
          )}

          {/* Tip text */}
          <Text style={styles.tipText}>
            {overlayImageUri
              ? 'Align with the overlay and capture your "after" photo'
              : selectedAlbum
              ? `Photos will be added to "${selectedAlbum.name}"`
              : 'Tap compare icon to set a "before" photo overlay'}
          </Text>
        </View>
      </CameraView>

      {/* Hidden Watermark View for capturing - positioned offscreen */}
      {capturedImageUri && watermarkText && (
        <View style={styles.offscreenContainer}>
          <View
            ref={watermarkViewRef}
            style={styles.watermarkCaptureView}
            collapsable={false}
          >
            <Image
              source={{ uri: capturedImageUri }}
              style={styles.watermarkImage}
              resizeMode="cover"
            />
            <View style={styles.watermarkBadge}>
              <Text style={styles.watermarkBadgeText}>{watermarkText}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Album Selection Modal */}
      <Modal
        visible={showAlbumModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAlbumModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Album</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAlbumModal(false)}
              >
                <Ionicons name="close" size={24} color="#F8FAFC" />
              </TouchableOpacity>
            </View>

            {/* No Album option */}
            <TouchableOpacity
              style={[
                styles.albumOption,
                !selectedAlbum && styles.albumOptionSelected,
              ]}
              onPress={() => {
                setSelectedAlbum(null);
                setShowAlbumModal(false);
              }}
            >
              <View style={styles.albumOptionIcon}>
                <Ionicons name="images-outline" size={24} color="#94A3B8" />
              </View>
              <View style={styles.albumOptionInfo}>
                <Text style={styles.albumOptionName}>No Album</Text>
                <Text style={styles.albumOptionDesc}>Photo goes to gallery only</Text>
              </View>
              {!selectedAlbum && (
                <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
              )}
            </TouchableOpacity>

            {albums.length === 0 ? (
              <View style={styles.emptyAlbums}>
                <Ionicons name="folder-open-outline" size={48} color="#64748B" />
                <Text style={styles.emptyAlbumsText}>No albums yet</Text>
                <Text style={styles.emptyAlbumsSubtext}>
                  Create albums in the Gallery tab to organize your photos
                </Text>
              </View>
            ) : (
              <FlatList
                data={albums}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                style={styles.albumList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.albumOption,
                      selectedAlbum?.id === item.id && styles.albumOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedAlbum(item);
                      setShowAlbumModal(false);
                    }}
                  >
                    <View style={styles.albumOptionIcon}>
                      <Ionicons name="folder" size={24} color="#3B82F6" />
                    </View>
                    <View style={styles.albumOptionInfo}>
                      <Text style={styles.albumOptionName}>{item.name}</Text>
                      {item.description && (
                        <Text style={styles.albumOptionDesc} numberOfLines={1}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                    {selectedAlbum?.id === item.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  // Watermark capture styles (offscreen)
  offscreenContainer: {
    position: 'absolute',
    left: -9999,
    top: -9999,
  },
  watermarkCaptureView: {
    width: WATERMARK_WIDTH,
    height: WATERMARK_HEIGHT,
    backgroundColor: '#000000',
  },
  watermarkImage: {
    width: WATERMARK_WIDTH,
    height: WATERMARK_HEIGHT,
  },
  watermarkBadge: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  watermarkBadgeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContent: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  backButtonText: {
    color: '#64748B',
    fontSize: 16,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  topRightControls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  // Onion-skin overlay styles
  overlayImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  overlayControlsPanel: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 16,
    padding: 16,
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  overlayControlsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  overlayControlsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  opacityControl: {
    marginBottom: 12,
  },
  opacityLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
  },
  opacitySlider: {
    width: '100%',
    height: 40,
  },
  overlayActions: {
    flexDirection: 'row',
    gap: 12,
  },
  overlayActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  overlayActionButtonDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  overlayActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#F8FAFC',
  },
  overlayActionTextDanger: {
    color: '#EF4444',
  },
  overlayIndicator: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
    zIndex: 10,
  },
  overlayIndicatorText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  watermarkPreview: {
    position: 'absolute',
    bottom: 180,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  watermarkPreviewText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bottomControlsInner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 24,
  },
  sideButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  captureButtonDisabled: {
    opacity: 0.7,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
  },
  albumIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  albumIndicatorText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
    maxWidth: 150,
  },
  tipText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumList: {
    paddingHorizontal: 16,
  },
  albumOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  albumOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  albumOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  albumOptionInfo: {
    flex: 1,
  },
  albumOptionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F8FAFC',
  },
  albumOptionDesc: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  emptyAlbums: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyAlbumsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F8FAFC',
    marginTop: 16,
  },
  emptyAlbumsSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
