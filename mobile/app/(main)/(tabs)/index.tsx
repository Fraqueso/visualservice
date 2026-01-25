import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { usePhotoStore } from '../../../store/photoStore';
import { useEffect } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const photos = usePhotoStore((state) => state.photos);
  const albums = usePhotoStore((state) => state.albums);
  const fetchPhotos = usePhotoStore((state) => state.fetchPhotos);
  const fetchAlbums = usePhotoStore((state) => state.fetchAlbums);

  useEffect(() => {
    fetchPhotos(true);
    fetchAlbums();
  }, []);

  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const recentPhotos = photos.slice(0, 5);
  const tierLabel = profile?.subscription_tier === 'free' ? 'Free' :
                    profile?.subscription_tier === 'pro' ? 'Pro' : 'Enterprise';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {firstName}!</Text>
            <Text style={styles.tierBadge}>{tierLabel} Plan</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/(main)/(tabs)/settings')}
          >
            <Ionicons name="person-circle" size={40} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => router.push('/(main)/camera')}
          >
            <View style={styles.cameraIconContainer}>
              <Ionicons name="camera" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.cameraButtonText}>Take Photo</Text>
            <Text style={styles.cameraButtonSubtext}>Capture & verify your work</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{photos.length}</Text>
            <Text style={styles.statLabel}>Photos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{albums.length}</Text>
            <Text style={styles.statLabel}>Albums</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {profile?.subscription_tier === 'free' ? '30d' : '1yr'}
            </Text>
            <Text style={styles.statLabel}>Retention</Text>
          </View>
        </View>

        {/* Recent Photos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Photos</Text>
            <TouchableOpacity onPress={() => router.push('/(main)/(tabs)/gallery')}>
              <Text style={styles.seeAllLink}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentPhotos.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="images-outline" size={48} color="#64748B" />
              <Text style={styles.emptyStateText}>No photos yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Take your first photo to get started
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recentPhotos.map((photo) => (
                <TouchableOpacity
                  key={photo.id}
                  style={styles.photoThumbnail}
                  onPress={() => router.push(`/(main)/photo/${photo.id}`)}
                >
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="image" size={24} color="#64748B" />
                  </View>
                  <Text style={styles.photoCode} numberOfLines={1}>
                    {photo.code}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Quick Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <View style={styles.tipNumber}>
                <Text style={styles.tipNumberText}>1</Text>
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Take a Photo</Text>
                <Text style={styles.tipDescription}>
                  Capture your work with the in-app camera
                </Text>
              </View>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipNumber}>
                <Text style={styles.tipNumberText}>2</Text>
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Get a Code</Text>
                <Text style={styles.tipDescription}>
                  Each photo gets a unique verification code
                </Text>
              </View>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipNumber}>
                <Text style={styles.tipNumberText}>3</Text>
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Share & Verify</Text>
                <Text style={styles.tipDescription}>
                  Customers verify your work is authentic
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Upgrade CTA for Free users */}
        {profile?.subscription_tier === 'free' && (
          <TouchableOpacity
            style={styles.upgradeBanner}
            onPress={() => {
              Alert.alert(
                'Pro Coming Soon',
                'Upgrade to Pro for $4.99/month to get:\n\n• 1-year data retention (vs 30 days)\n• Unlimited albums (vs 3 max)\n• Priority support\n\nIn-app purchases will be available after App Store approval.',
                [{ text: 'OK' }]
              );
            }}
          >
            <View style={styles.upgradeContent}>
              <Ionicons name="star" size={24} color="#F59E0B" />
              <View style={styles.upgradeText}>
                <Text style={styles.upgradeTitle}>Pro Coming Soon</Text>
                <Text style={styles.upgradeDescription}>
                  1-year retention & unlimited albums
                </Text>
              </View>
            </View>
            <View style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>$4.99/mo</Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  tierBadge: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  profileButton: {
    padding: 4,
  },
  quickActions: {
    marginBottom: 24,
  },
  cameraButton: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cameraIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cameraButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  cameraButtonSubtext: {
    fontSize: 14,
    color: '#94A3B8',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  seeAllLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F8FAFC',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#64748B',
  },
  photoThumbnail: {
    width: 100,
    marginRight: 12,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  photoCode: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
  },
  tipsList: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  tipDescription: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
  },
  upgradeBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginBottom: 32,
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  upgradeText: {
    marginLeft: 12,
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  upgradeDescription: {
    fontSize: 12,
    color: '#94A3B8',
  },
  upgradeButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
});
