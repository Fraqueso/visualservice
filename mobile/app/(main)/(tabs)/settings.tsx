import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  Linking,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../../store/authStore';
import { format } from 'date-fns';

const NOTIFICATIONS_KEY = '@visualservice_notifications_enabled';

export default function SettingsScreen() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const signOut = useAuthStore((state) => state.signOut);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isUpdating = useAuthStore((state) => state.isUpdating);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const changePassword = useAuthStore((state) => state.changePassword);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Load saved notification preference
  useEffect(() => {
    const loadNotificationPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
        if (saved !== null) {
          setNotificationsEnabled(saved === 'true');
        }
      } catch (error) {
        console.error('Failed to load notification preference:', error);
      }
    };
    loadNotificationPreference();
  }, []);

  // Handle notification toggle with persistence
  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, value.toString());
    } catch (error) {
      console.error('Failed to save notification preference:', error);
    }
  };

  // Modal states
  const [editNameModalVisible, setEditNameModalVisible] = useState(false);
  const [editBusinessModalVisible, setEditBusinessModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);

  // Form states
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [businessName, setBusinessName] = useState(profile?.business_name || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This will permanently delete all your photos, albums, and data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteAccount();
            if (error) {
              Alert.alert('Error', 'Failed to delete account. Please try again or contact support.');
            } else {
              Alert.alert('Account Deleted', 'Your account and all data have been deleted.');
            }
          },
        },
      ]
    );
  };

  const handleUpdateFullName = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter a valid name.');
      return;
    }

    const { error } = await updateProfile({ full_name: fullName.trim() });

    if (error) {
      Alert.alert('Error', error.message || 'Failed to update name. Please try again.');
    } else {
      Alert.alert('Success', 'Your name has been updated.');
      setEditNameModalVisible(false);
    }
  };

  const handleUpdateBusinessName = async () => {
    const { error } = await updateProfile({ business_name: businessName.trim() || null });

    if (error) {
      Alert.alert('Error', error.message || 'Failed to update business name. Please try again.');
    } else {
      Alert.alert('Success', 'Your business name has been updated.');
      setEditBusinessModalVisible(false);
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!newPassword) {
      Alert.alert('Error', 'Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    const { error } = await changePassword(newPassword);

    if (error) {
      Alert.alert('Error', error.message || 'Failed to change password. Please try again.');
    } else {
      Alert.alert('Success', 'Your password has been changed.');
      setChangePasswordModalVisible(false);
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const openEditNameModal = () => {
    setFullName(profile?.full_name || '');
    setEditNameModalVisible(true);
  };

  const openEditBusinessModal = () => {
    setBusinessName(profile?.business_name || '');
    setEditBusinessModalVisible(true);
  };

  const openChangePasswordModal = () => {
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setChangePasswordModalVisible(true);
  };

  const getTierInfo = () => {
    switch (profile?.subscription_tier) {
      case 'pro':
        return {
          name: 'Pro',
          color: '#3B82F6',
          retention: '1 year',
          albums: 'Unlimited',
        };
      case 'enterprise':
        return {
          name: 'Enterprise',
          color: '#8B5CF6',
          retention: 'Custom',
          albums: 'Unlimited',
        };
      default:
        return {
          name: 'Free',
          color: '#64748B',
          retention: '30 days',
          albums: '3 max',
        };
    }
  };

  const tierInfo = getTierInfo();

  const SettingsRow = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
    danger = false,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingsRow}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.settingsIcon, danger && styles.settingsIconDanger]}>
        <Ionicons
          name={icon}
          size={20}
          color={danger ? '#EF4444' : '#F8FAFC'}
        />
      </View>
      <View style={styles.settingsContent}>
        <Text style={[styles.settingsTitle, danger && styles.settingsTitleDanger]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (onPress && (
        <Ionicons name="chevron-forward" size={20} color="#64748B" />
      ))}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={32} color="#3B82F6" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile?.full_name || profile?.email?.split('@')[0] || 'User'}
            </Text>
            <Text style={styles.profileEmail}>{profile?.email}</Text>
          </View>
          <View style={[styles.tierBadge, { backgroundColor: tierInfo.color }]}>
            <Text style={styles.tierBadgeText}>{tierInfo.name}</Text>
          </View>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionRow}>
              <Text style={styles.subscriptionLabel}>Current Plan</Text>
              <Text style={[styles.subscriptionValue, { color: tierInfo.color }]}>
                {tierInfo.name}
              </Text>
            </View>
            <View style={styles.subscriptionRow}>
              <Text style={styles.subscriptionLabel}>Data Retention</Text>
              <Text style={styles.subscriptionValue}>{tierInfo.retention}</Text>
            </View>
            <View style={styles.subscriptionRow}>
              <Text style={styles.subscriptionLabel}>Albums</Text>
              <Text style={styles.subscriptionValue}>{tierInfo.albums}</Text>
            </View>
            {profile?.subscription_expires_at && (
              <View style={styles.subscriptionRow}>
                <Text style={styles.subscriptionLabel}>Renews</Text>
                <Text style={styles.subscriptionValue}>
                  {format(new Date(profile.subscription_expires_at), 'MMM d, yyyy')}
                </Text>
              </View>
            )}

            {profile?.subscription_tier === 'free' && (
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => {
                  Alert.alert(
                    'Pro Coming Soon',
                    'Upgrade to Pro for $4.99/month to get:\n\n• 1-year data retention (vs 30 days)\n• Unlimited albums (vs 3 max)\n• Priority support\n\nIn-app purchases will be available after App Store approval.',
                    [{ text: 'OK' }]
                  );
                }}
              >
                <Ionicons name="star" size={18} color="#0F172A" />
                <Text style={styles.upgradeButtonText}>Pro Coming Soon - $4.99/mo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingsCard}>
            <SettingsRow
              icon="person-outline"
              title="Full Name"
              subtitle={profile?.full_name || 'Not set'}
              onPress={openEditNameModal}
            />
            <SettingsRow
              icon="business-outline"
              title="Business Name"
              subtitle={profile?.business_name || 'Not set'}
              onPress={openEditBusinessModal}
            />
            <SettingsRow
              icon="lock-closed-outline"
              title="Change Password"
              onPress={openChangePasswordModal}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingsCard}>
            <SettingsRow
              icon="notifications-outline"
              title="Push Notifications"
              subtitle="Get notified about feedback"
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationToggle}
                  trackColor={{ false: '#334155', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                />
              }
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingsCard}>
            <SettingsRow
              icon="help-circle-outline"
              title="Help Center"
              onPress={() => Linking.openURL('https://visualservice.app/help')}
            />
            <SettingsRow
              icon="mail-outline"
              title="Contact Support"
              onPress={() => Linking.openURL('mailto:support@visualservice.app')}
            />
            <SettingsRow
              icon="document-text-outline"
              title="Terms of Service"
              onPress={() => Linking.openURL('https://visualservice.app/terms')}
            />
            <SettingsRow
              icon="shield-outline"
              title="Privacy Policy"
              onPress={() => Linking.openURL('https://visualservice.app/privacy')}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          <View style={styles.settingsCard}>
            <SettingsRow
              icon="log-out-outline"
              title="Sign Out"
              onPress={handleSignOut}
            />
            <SettingsRow
              icon="trash-outline"
              title="Delete Account"
              subtitle="Permanently delete all data"
              onPress={handleDeleteAccount}
              danger
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>VisualService v1.0.0</Text>
          <Text style={styles.appInfoText}>Made with care for service providers</Text>
        </View>
      </ScrollView>

      {/* Edit Full Name Modal */}
      <Modal
        visible={editNameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditNameModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Full Name</Text>
              <TouchableOpacity
                onPress={() => setEditNameModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor="#64748B"
                autoCapitalize="words"
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
              onPress={handleUpdateFullName}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Business Name Modal */}
      <Modal
        visible={editBusinessModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditBusinessModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Business Name</Text>
              <TouchableOpacity
                onPress={() => setEditBusinessModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Business Name</Text>
              <TextInput
                style={styles.textInput}
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="Enter your business name"
                placeholderTextColor="#64748B"
                autoCapitalize="words"
                autoFocus
              />
              <Text style={styles.inputHint}>
                Leave empty to remove business name
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
              onPress={handleUpdateBusinessName}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={changePasswordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setChangePasswordModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity
                onPress={() => setChangePasswordModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor="#64748B"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoFocus
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor="#64748B"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.passwordToggle}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.inputHint}>
                Password must be at least 6 characters
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
              onPress={handleChangePassword}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <Text style={styles.saveButtonText}>Change Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748B',
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tierBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    marginHorizontal: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingsCard: {
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsIconDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    color: '#F8FAFC',
  },
  settingsTitleDanger: {
    color: '#EF4444',
  },
  settingsSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  subscriptionCard: {
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  subscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  subscriptionLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  subscriptionValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F8FAFC',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appInfoText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  modalCloseButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94A3B8',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputHint: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: '#F8FAFC',
  },
  passwordToggle: {
    padding: 14,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
