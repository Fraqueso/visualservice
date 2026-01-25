import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePhotoStore } from '../../../store/photoStore';
import { Photo } from '../../../services/supabase';
import { format } from 'date-fns';
import { formatCodeForDisplay } from '../../../utils/codeGenerator';

export default function GalleryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const photos = usePhotoStore((state) => state.photos);
  const isLoading = usePhotoStore((state) => state.isLoading);
  const hasMore = usePhotoStore((state) => state.hasMore);
  const fetchPhotos = usePhotoStore((state) => state.fetchPhotos);

  useEffect(() => {
    fetchPhotos(true);
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchPhotos(true);
    setIsRefreshing(false);
  }, [fetchPhotos]);

  const onEndReached = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchPhotos(false);
    }
  }, [isLoading, hasMore, fetchPhotos]);

  // Filter photos by search query (code)
  const filteredPhotos = searchQuery
    ? photos.filter((photo) =>
        photo.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : photos;

  // Group photos by date
  const groupedPhotos = filteredPhotos.reduce((groups, photo) => {
    const date = format(new Date(photo.captured_at), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(photo);
    return groups;
  }, {} as Record<string, Photo[]>);

  const sections = Object.entries(groupedPhotos).map(([date, photos]) => ({
    date,
    title: format(new Date(date), 'MMMM d, yyyy'),
    data: photos,
  }));

  const renderPhoto = ({ item }: { item: Photo }) => (
    <TouchableOpacity
      style={styles.photoItem}
      onPress={() => router.push(`/(main)/photo/${item.id}`)}
    >
      <View style={styles.photoImageContainer}>
        {item.thumbnail_url || item.image_url ? (
          <Image
            source={{ uri: item.thumbnail_url || item.image_url }}
            style={styles.photoImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="image" size={24} color="#64748B" />
          </View>
        )}
      </View>
      <Text style={styles.photoCode} numberOfLines={1}>
        {formatCodeForDisplay(item.code)}
      </Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="images-outline" size={64} color="#64748B" />
      <Text style={styles.emptyTitle}>No Photos Yet</Text>
      <Text style={styles.emptySubtitle}>
        Take your first photo to start building your verification portfolio
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => router.push('/(main)/camera')}
      >
        <Ionicons name="camera" size={20} color="#FFFFFF" />
        <Text style={styles.emptyButtonText}>Take Photo</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gallery</Text>
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={() => router.push('/(main)/camera')}
        >
          <Ionicons name="camera" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by code..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="characters"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>

      {/* Photos count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {filteredPhotos.length} {filteredPhotos.length === 1 ? 'photo' : 'photos'}
        </Text>
      </View>

      {/* Photo Grid */}
      {filteredPhotos.length === 0 && !isLoading ? (
        renderEmpty()
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.date}
          renderItem={({ item: section }) => (
            <View>
              {renderSectionHeader(section.title)}
              <View style={styles.photoGrid}>
                {section.data.map((photo) => (
                  <View key={photo.id} style={styles.photoGridItem}>
                    {renderPhoto({ item: photo })}
                  </View>
                ))}
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  cameraButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#F8FAFC',
    fontSize: 16,
  },
  countContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  countText: {
    fontSize: 14,
    color: '#64748B',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  photoGridItem: {
    width: '33.333%',
    padding: 4,
  },
  photoItem: {
    width: '100%',
  },
  photoImageContainer: {
    aspectRatio: 1,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 6,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoCode: {
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
