import { Stack } from 'expo-router';

import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function Home() {
  return (
    <SafeAreaView className={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <WebView source={{ uri: 'https://brgykonekweb.up.railway.app' }} style={{ flex: 1 }} />
    </SafeAreaView>
  );
}

const styles = {
  container: 'flex flex-1 bg-white',
};
