import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePhotoStore } from '../../../store/photoStore';
import { useAuthStore } from '../../../store/authStore';
import { Album } from '../../../services/supabase';
import { format } from 'date-fns';

export default function AlbumsScreen() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDescription, setNewAlbumDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const profile = useAuthStore((state) => state.profile);
  const albums = usePhotoStore((state) => state.albums);
  const isLoading = usePhotoStore((state) => state.isLoading);
  const fetchAlbums = usePhotoStore((state) => state.fetchAlbums);
  const createAlbum = usePhotoStore((state) => state.createAlbum);

  const isFreeUser = profile?.subscription_tier === 'free';
  const canCreateAlbum = !isFreeUser || albums.length < 3;

  useEffect(() => {
    fetchAlbums();
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchAlbums();
    setIsRefreshing(false);
  }, [fetchAlbums]);

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) {
      Alert.alert('Error', 'Please enter an album name');
      return;
    }

    if (!canCreateAlbum) {
      Alert.alert(
        'Album Limit Reached',
        'Free tier is limited to 3 albums. Pro (coming soon) will offer unlimited albums for $4.99/month.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsCreating(true);
    const { album, error } = await createAlbum(newAlbumName.trim(), newAlbumDescription.trim() || undefined);
    setIsCreating(false);

    if (error) {
      Alert.alert('Error', error.message || 'Failed to create album');
    } else {
      setShowCreateModal(false);
      setNewAlbumName('');
      setNewAlbumDescription('');
      if (album) {
        router.push(`/(main)/album/${album.id}`);
      }
    }
  };

  const renderAlbum = ({ item }: { item: Album }) => (
    <TouchableOpacity
      style={styles.albumCard}
      onPress={() => router.push(`/(main)/album/${item.id}`)}
    >
      <View style={styles.albumCover}>
        <Ionicons name="folder" size={32} color="#3B82F6" />
      </View>
      <View style={styles.albumInfo}>
        <Text style={styles.albumName} numberOfLines={1}>
          {item.name}
        </Text>
        {item.description && (
          <Text style={styles.albumDescription} numberOfLines={1}>
            {item.description}
          </Text>
        )}
        <Text style={styles.albumDate}>
          Created {format(new Date(item.created_at), 'MMM d, yyyy')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#64748B" />
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="folder-outline" size={64} color="#64748B" />
      <Text style={styles.emptyTitle}>No Albums Yet</Text>
      <Text style={styles.emptySubtitle}>
        Create albums to organize your photos by job, client, or project
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.emptyButtonText}>Create Album</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Albums</Text>
        <TouchableOpacity
          style={[styles.addButton, !canCreateAlbum && styles.addButtonDisabled]}
          onPress={() => {
            if (canCreateAlbum) {
              setShowCreateModal(true);
            } else {
              Alert.alert(
                'Album Limit Reached',
                'Free tier is limited to 3 albums. Pro (coming soon) will offer unlimited albums for $4.99/month.',
                [{ text: 'OK' }]
              );
            }
          }}
        >
          <Ionicons name="add" size={24} color={canCreateAlbum ? '#3B82F6' : '#64748B'} />
        </TouchableOpacity>
      </View>

      {/* Album limit indicator for free users */}
      {isFreeUser && (
        <View style={styles.limitIndicator}>
          <Text style={styles.limitText}>
            {albums.length}/3 albums used
          </Text>
          {albums.length >= 3 && (
            <TouchableOpacity onPress={() => {
              Alert.alert(
                'Pro Coming Soon',
                'Upgrade to Pro for $4.99/month to get unlimited albums. In-app purchases will be available after App Store approval.',
                [{ text: 'OK' }]
              );
            }}>
              <Text style={styles.upgradeLink}>Pro coming soon</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Album List */}
      {albums.length === 0 && !isLoading ? (
        renderEmpty()
      ) : (
        <FlatList
          data={albums}
          keyExtractor={(item) => item.id}
          renderItem={renderAlbum}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Create Album Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Album</Text>
            <TouchableOpacity onPress={handleCreateAlbum} disabled={isCreating}>
              <Text style={[styles.modalDone, isCreating && styles.modalDoneDisabled]}>
                {isCreating ? 'Creating...' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Album Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Car Details - January"
              placeholderTextColor="#64748B"
              value={newAlbumName}
              onChangeText={setNewAlbumName}
              autoFocus
            />

            <Text style={styles.inputLabel}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add notes about this album..."
              placeholderTextColor="#64748B"
              value={newAlbumDescription}
              onChangeText={setNewAlbumDescription}
              multiline
              numberOfLines={3}
            />
          </View>
        </SafeAreaView>
      </Modal>
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  limitIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  limitText: {
    fontSize: 14,
    color: '#64748B',
  },
  upgradeLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  albumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  albumCover: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  albumInfo: {
    flex: 1,
  },
  albumName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  albumDescription: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 4,
  },
  albumDate: {
    fontSize: 12,
    color: '#64748B',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
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
  modalCancel: {
    fontSize: 16,
    color: '#94A3B8',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  modalDone: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  modalDoneDisabled: {
    opacity: 0.5,
  },
  modalContent: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});
