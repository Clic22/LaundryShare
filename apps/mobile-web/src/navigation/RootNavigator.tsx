import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import HomeScreen from '@/screens/HomeScreen';
import ProfileSetupScreen from '@/screens/profile/ProfileSetupScreen';
import ProfileEditScreen from '@/screens/profile/ProfileEditScreen';
import HostRegistrationScreen from '@/screens/host/HostRegistrationScreen';

export type RootStackParamList = {
  Auth: undefined;
  ProfileSetup: undefined;
  Main: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  ProfileEdit: undefined;
  HostRegistration: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

function MainNavigator() {
  return (
    <MainStack.Navigator>
      <MainStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'LaundryShare' }}
      />
      <MainStack.Screen
        name="ProfileEdit"
        component={ProfileEditScreen}
        options={{ title: 'Edit Profile' }}
      />
      <MainStack.Screen
        name="HostRegistration"
        component={HostRegistrationScreen}
        options={{ title: 'Become a Host' }}
      />
    </MainStack.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}

export default function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Check if user is logged in but profile is incomplete
  const isProfileComplete = user?.is_profile_complete ?? false;

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : !isProfileComplete ? (
          <RootStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        ) : (
          <RootStack.Screen name="Main" component={MainNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
