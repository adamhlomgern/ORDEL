import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthProvider';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { UsernamePickerScreen } from '../screens/auth/UsernamePickerScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { CreateGameScreen } from '../screens/CreateGameScreen';
import { GameDetailScreen } from '../screens/GameDetailScreen';
import { BoardScreen } from '../screens/board/BoardScreen';
import { colors, spacing, typography } from '../design/tokens';

export type RootStackParamList = {
  Login: undefined;
  UsernamePicker: undefined;
  Home: undefined;
  CreateGame: undefined;
  GameDetail: { gameId: string };
  Board: { gameId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function LoadingView() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator color={colors.accent} size="large" />
      <Text style={styles.loadingText}>Laddar...</Text>
    </View>
  );
}

export function RootNavigator() {
  const { status } = useAuth();

  if (status.kind === 'loading') {
    return <LoadingView />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
        {status.kind === 'signedOut' && (
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Logga in' }} />
        )}
        {status.kind === 'needsProfile' && (
          <Stack.Screen
            name="UsernamePicker"
            component={UsernamePickerScreen}
            options={{ title: 'Välj användarnamn', headerBackVisible: false }}
          />
        )}
        {status.kind === 'ready' && (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Ordel' }} />
            <Stack.Screen
              name="CreateGame"
              component={CreateGameScreen}
              options={{ title: 'Nytt parti' }}
            />
            <Stack.Screen
              name="GameDetail"
              component={GameDetailScreen}
              options={{ title: 'Parti' }}
            />
            <Stack.Screen name="Board" component={BoardScreen} options={{ title: 'Spelplan' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    ...typography.body,
    color: colors.inkMuted,
  },
});
