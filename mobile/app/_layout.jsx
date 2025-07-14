import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import {useAuthStore} from "../store/authStore";
import { useEffect } from "react";

// The Stack component from expo-router is used to define navigation between screens
// in your app using a stack-based navigation pattern — similar to how pages work in a browser
export default function RootLayout() {
  const router= useRouter();
  const segments = useSegments();

  const{checkAuth, user, token}= useAuthStore();

  useEffect(()=>{
    checkAuth();
  },[])

  // handle navigation based on the auth state
  useEffect(() => {
    const inAuthScreen = segments[0] === "(auth)";
    const isSignedIn = user && token;

    if (!isSignedIn && !inAuthScreen) router.replace("/(auth)");
    else if (isSignedIn && inAuthScreen) router.replace("/(tabs)");
  }, [user, token, segments]);


  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </SafeScreen>
      <StatusBar style="dark"/>
    </SafeAreaProvider>
  );
}
