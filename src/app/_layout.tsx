// src/app/_layout.tsx
import { Slot } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../context/auth';
import { TodoProvider } from '../context/todo';

// Root layout with providers
export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <TodoProvider>
          <Slot />
        </TodoProvider>
      </AuthProvider>
    </PaperProvider>
  );
}