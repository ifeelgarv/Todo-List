import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../src/context/auth"; // Custom hook to manage authentication state.

export default function Index() {
  const {userToken, isLoading} = useAuth(); // userToken indicates whether user is logged in or not, isLoading indicates whether the authentication state is being loaded.

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!userToken) {
    return <Redirect href="/login" />;
  } else {
    return <Redirect href="/home" />
  }
}