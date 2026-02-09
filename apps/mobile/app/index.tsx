import { Redirect } from 'expo-router';
import { useAuthStore } from '../lib/auth';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { profile, isLoading, communityId } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (!profile) return <Redirect href="/login" />;
  if (!communityId && profile.role === 'member') return <Redirect href="/join" />;
  return <Redirect href="/(tabs)" />;
}
