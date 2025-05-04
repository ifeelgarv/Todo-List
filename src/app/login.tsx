import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  ImageBackground,
} from "react-native";
import {
  TextInput,
  Button,
  Title,
  Text,
  ActivityIndicator,
  Surface,
  MD3Colors,
  Portal,
  Modal,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useAuth } from "../context/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true);
  const [resetModalVisible, setResetModalVisible] = useState<boolean>(false);
  const { login, isLoading, error, userToken } = useAuth();
  const router = useRouter();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const inputFocus = useRef(new Animated.Value(0)).current;

  // Redirect if already logged in
  useEffect(() => {
    if (userToken) {
      router.replace("/home");
    }
  }, [userToken]);

  // Initial animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const resetToCorrectCredentials = () => {
    const correctUsername = "emilys";
    const correctPassword = "emilyspass";

    // Add animation for reset
    Animated.sequence([
      Animated.timing(inputFocus, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(inputFocus, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setUsername(correctUsername);
    setPassword(correctPassword);
    setResetModalVisible(false);

    console.log(
      `Reset to correct credentials: ${correctUsername} / ${correctPassword}`
    );
  };

  // Initialize with correct credentials
  useEffect(() => {
    resetToCorrectCredentials();
  }, []);

  const handleLogin = () => {
    if (username.trim() && password.trim()) {
      // Button press animation
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Log exact values to verify what's being sent
      console.log("Username:", username);
      console.log("Password:", password);

      login(username, password);
    }
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <ImageBackground
      source={{ uri: "https://source.unsplash.com/random/1080x1920/?gradient" }}
      style={styles.backgroundImage}
      blurRadius={8}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View
            style={[
              styles.animatedContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY }, { scale: fadeAnim }],
              },
            ]}
          >
            <Surface style={styles.surface}>
              <View style={styles.logoContainer}>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={60}
                  color="#6200ee"
                />
              </View>

              <Title style={styles.title}>TaskMaster</Title>
              <Text style={styles.subtitle}>
                Organize your life, one task at a time
              </Text>

              <View style={styles.form}>
                <Animated.View
                  style={{
                    transform: [
                      {
                        scale: Animated.add(
                          1,
                          Animated.multiply(inputFocus, 0.03)
                        ),
                      },
                    ],
                  }}
                >
                  <TextInput
                    label="Username"
                    value={username}
                    onChangeText={setUsername}
                    style={styles.input}
                    autoCapitalize="none"
                    left={<TextInput.Icon icon="account" />}
                    mode="outlined"
                    outlineColor="#6200ee50"
                    activeOutlineColor="#6200ee"
                    theme={{ colors: { primary: "#6200ee" } }}
                  />
                </Animated.View>

                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={secureTextEntry}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={secureTextEntry ? "eye" : "eye-off"}
                      onPress={toggleSecureEntry}
                    />
                  }
                  mode="outlined"
                  outlineColor="#6200ee50"
                  activeOutlineColor="#6200ee"
                  theme={{ colors: { primary: "#6200ee" } }}
                />

                {error && (
                  <Animated.View
                    style={{
                      opacity: fadeAnim,
                      transform: [
                        { translateY: Animated.multiply(fadeAnim, -5) },
                      ],
                    }}
                  >
                    <Surface style={styles.errorSurface}>
                      <MaterialCommunityIcons
                        name="alert-circle"
                        size={18}
                        color="#fff"
                      />
                      <Text style={styles.errorText}>{error}</Text>
                    </Surface>
                  </Animated.View>
                )}

                {isLoading ? (
                  <View style={styles.loaderContainer}>
                    <ActivityIndicator
                      size="large"
                      color="#6200ee"
                      style={styles.loader}
                    />
                    <Text style={styles.loadingText}>Logging in...</Text>
                  </View>
                ) : (
                  <>
                    <Animated.View
                      style={{ transform: [{ scale: buttonScale }] }}
                    >
                      <Button
                        mode="contained"
                        onPress={handleLogin}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                        disabled={!username || !password}
                        labelStyle={styles.buttonLabel}
                        icon="login"
                      >
                        Sign In
                      </Button>
                    </Animated.View>

                    <TouchableOpacity
                      onPress={() => setResetModalVisible(true)}
                      style={styles.resetButton}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.resetText}>
                        Use Default Credentials
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </Surface>
          </Animated.View>
        </ScrollView>

        <Portal>
          <Modal
            visible={resetModalVisible}
            onDismiss={() => setResetModalVisible(false)}
            contentContainerStyle={styles.modal}
          >
            <Title style={styles.modalTitle}>Use Default Credentials?</Title>
            <Text style={styles.modalText}>
              This will set the username to "emilys" and password to
              "emilyspass"
            </Text>
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setResetModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={resetToCorrectCredentials}
                style={styles.modalButton}
              >
                Confirm
              </Button>
            </View>
          </Modal>
        </Portal>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  animatedContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  surface: {
    padding: 24,
    elevation: 8,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#6200ee",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 36,
    color: "#666",
    fontWeight: "500",
  },
  form: {
    width: "100%",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  button: {
    marginTop: 10,
    borderRadius: 30,
    elevation: 4,
    backgroundColor: "#6200ee",
  },
  buttonContent: {
    paddingVertical: 8,
    height: 56,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  errorSurface: {
    backgroundColor: "#f44336",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  errorText: {
    color: "white",
    marginLeft: 8,
    flex: 1,
  },
  loaderContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  loader: {
    marginBottom: 8,
  },
  loadingText: {
    color: "#6200ee",
    fontWeight: "500",
  },
  resetButton: {
    marginTop: 24,
    alignItems: "center",
  },
  resetText: {
    color: "#6200ee",
    fontWeight: "500",
    fontSize: 14,
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 16,
    textAlign: "center",
  },
  modalText: {
    marginBottom: 24,
    textAlign: "center",
    color: "#666",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  modalButton: {
    minWidth: 120,
  },
});
