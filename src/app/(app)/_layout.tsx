import { Stack } from "expo-router";
import { useAuth } from "../../context/auth";
import { Redirect } from "expo-router";

// This layout is for authenticated routes
export default function AppLayout() {
  const { userToken } = useAuth();

  // If not authenticated redirect karo login page par
  if (!userToken) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="home"
        options={{
          title: "My Todos",
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: "Add Todo",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: "Edit Todo",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
