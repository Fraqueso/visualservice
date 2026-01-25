import { create } from 'zustand';
import { supabase, Photo, Album } from '../services/supabase';
import { useAuthStore } from './authStore';

interface PhotoState {
  photos: Photo[];
  albums: Album[];
  selectedAlbum: Album | null;
  isLoading: boolean;
  hasMore: boolean;
  page: number;

  // Photo actions
  fetchPhotos: (refresh?: boolean) => Promise<void>;
  fetchPhotosByAlbum: (albumId: string) => Promise<Photo[]>;
  getPhotoByCode: (code: string) => Promise<Photo | null>;
  uploadPhoto: (imageUri: string, code: string, metadata: Partial<Photo>) => Promise<{ photo: Photo | null; error: Error | null }>;
  deletePhoto: (photoId: string) => Promise<{ error: Error | null }>;

  // Album actions
  fetchAlbums: () => Promise<void>;
  createAlbum: (name: string, description?: string) => Promise<{ album: Album | null; error: Error | null }>;
  updateAlbum: (albumId: string, updates: Partial<Album>) => Promise<{ error: Error | null }>;
  deleteAlbum: (albumId: string) => Promise<{ error: Error | null }>;
  addPhotoToAlbum: (photoId: string, albumId: string) => Promise<{ error: Error | null }>;
  removePhotoFromAlbum: (photoId: string, albumId: string) => Promise<{ error: Error | null }>;
  setSelectedAlbum: (album: Album | null) => void;
}

const PAGE_SIZE = 50;

export const usePhotoStore = create<PhotoState>((set, get) => ({
  photos: [],
  albums: [],
  selectedAlbum: null,
  isLoading: false,
  hasMore: true,
  page: 0,

  fetchPhotos: async (refresh = false) => {
    try {
      const state = get();
      if (state.isLoading) return;

      set({ isLoading: true });

      const page = refresh ? 0 : state.page;
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('captured_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const newPhotos = data || [];
      const hasMore = newPhotos.length === PAGE_SIZE;

      set({
        photos: refresh ? newPhotos : [...state.photos, ...newPhotos],
        hasMore,
        page: page + 1,
      });
    } catch (error) {
      console.error('Fetch photos error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPhotosByAlbum: async (albumId: string) => {
    try {
      const { data, error } = await supabase
        .from('photo_albums')
        .select(`
          photo_id,
          photos (*)
        `)
        .eq('album_id', albumId)
        .order('added_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((item: any) => item.photos).filter(Boolean);
    } catch (error) {
      console.error('Fetch photos by album error:', error);
      return [];
    }
  },

  getPhotoByCode: async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('code', code)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Get photo by code error:', error);
      return null;
    }
  },

  uploadPhoto: async (imageUri: string, code: string, metadata: Partial<Photo>) => {
    try {
      const profile = useAuthStore.getState().profile;
      if (!profile) throw new Error('Not authenticated');

      // Generate unique file path
      const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${profile.id}/${code}.${fileExt}`;
      const watermarkedFileName = `${profile.id}/${code}_watermarked.${fileExt}`;

      // Read file as blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Upload original image
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, blob, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl: imageUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      // Calculate expiry based on tier
      const tier = profile.subscription_tier;
      let expiresAt: Date;
      switch (tier) {
        case 'free':
          expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
          break;
        case 'pro':
          expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
          break;
        case 'enterprise':
          expiresAt = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000); // 10 years
          break;
        default:
          expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }

      // Insert photo record
      const { data: photo, error: insertError } = await supabase
        .from('photos')
        .insert({
          user_id: profile.id,
          code,
          image_url: imageUrl,
          captured_at: metadata.captured_at || new Date().toISOString(),
          tier_at_capture: tier,
          expires_at: expiresAt.toISOString(),
          photo_hash: metadata.photo_hash,
          device_info: metadata.device_info,
          width: metadata.width,
          height: metadata.height,
          file_size: metadata.file_size,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Add to local state
      set((state) => ({
        photos: [photo, ...state.photos],
      }));

      return { photo, error: null };
    } catch (error) {
      console.error('Upload photo error:', error);
      return { photo: null, error: error as Error };
    }
  },

  deletePhoto: async (photoId: string) => {
    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;

      // Remove from local state
      set((state) => ({
        photos: state.photos.filter((p) => p.id !== photoId),
      }));

      return { error: null };
    } catch (error) {
      console.error('Delete photo error:', error);
      return { error: error as Error };
    }
  },

  fetchAlbums: async () => {
    try {
      set({ isLoading: true });

      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ albums: data || [] });
    } catch (error) {
      console.error('Fetch albums error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  createAlbum: async (name: string, description?: string) => {
    try {
      const profile = useAuthStore.getState().profile;
      if (!profile) throw new Error('Not authenticated');

      // Check album limit for free tier
      const { albums } = get();
      if (profile.subscription_tier === 'free' && albums.length >= 3) {
        throw new Error('Free tier limited to 3 albums. Upgrade to Pro for unlimited albums.');
      }

      const { data: album, error } = await supabase
        .from('albums')
        .insert({
          user_id: profile.id,
          name,
          description,
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      set((state) => ({
        albums: [album, ...state.albums],
      }));

      return { album, error: null };
    } catch (error) {
      console.error('Create album error:', error);
      return { album: null, error: error as Error };
    }
  },

  updateAlbum: async (albumId: string, updates: Partial<Album>) => {
    try {
      const { error } = await supabase
        .from('albums')
        .update(updates)
        .eq('id', albumId);

      if (error) throw error;

      // Update local state
      set((state) => ({
        albums: state.albums.map((a) =>
          a.id === albumId ? { ...a, ...updates } : a
        ),
      }));

      return { error: null };
    } catch (error) {
      console.error('Update album error:', error);
      return { error: error as Error };
    }
  },

  deleteAlbum: async (albumId: string) => {
    try {
      const { error } = await supabase
        .from('albums')
        .delete()
        .eq('id', albumId);

      if (error) throw error;

      // Remove from local state
      set((state) => ({
        albums: state.albums.filter((a) => a.id !== albumId),
        selectedAlbum: state.selectedAlbum?.id === albumId ? null : state.selectedAlbum,
      }));

      return { error: null };
    } catch (error) {
      console.error('Delete album error:', error);
      return { error: error as Error };
    }
  },

  addPhotoToAlbum: async (photoId: string, albumId: string) => {
    try {
      const { error } = await supabase
        .from('photo_albums')
        .insert({
          photo_id: photoId,
          album_id: albumId,
        });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Add photo to album error:', error);
      return { error: error as Error };
    }
  },

  removePhotoFromAlbum: async (photoId: string, albumId: string) => {
    try {
      const { error } = await supabase
        .from('photo_albums')
        .delete()
        .eq('photo_id', photoId)
        .eq('album_id', albumId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Remove photo from album error:', error);
      return { error: error as Error };
    }
  },

  setSelectedAlbum: (album: Album | null) => {
    set({ selectedAlbum: album });
  },
}));
