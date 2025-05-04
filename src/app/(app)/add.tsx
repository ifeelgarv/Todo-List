import React, { useState } from "react";
import { 
  View, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  StatusBar,
  Animated
} from "react-native";
import { 
  TextInput, 
  Button, 
  Text, 
  ActivityIndicator, 
  IconButton,
  Surface,
  Divider
} from "react-native-paper";
import { router } from "expo-router";
import { useTodos } from "../../context/todo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

export default function AddTodoScreen() {
  const [title, setTitle] = useState<string>("");
  const { addTodo, isLoading, error } = useTodos();
  const [titleFocused, setTitleFocused] = useState(false);

  const handleAddTodo = async () => {
    if (title.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await addTodo(title);
      if (!error) {
        router.back();
      }
    }
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <Surface style={styles.card}>
          <View style={styles.content}>
            <Text style={styles.label}>What's your task?</Text>
            
            <TextInput
              label="Task Description"
              placeholder="Enter your task here..."
              value={title}
              onChangeText={setTitle}
              style={[
                styles.input
              ]}
              onFocus={() => setTitleFocused(true)}
              onBlur={() => setTitleFocused(false)}
              autoFocus
              multiline
              numberOfLines={5}
              mode="outlined"
              outlineColor="#e0e0e0"
              activeOutlineColor="#6200ee"
            />

            {error && (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle" size={18} color="#f44336" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.tipContainer}>
              <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#FFA000" />
              <Text style={styles.tipText}>
                Tip: Be specific with your task description for better organization
              </Text>
            </View>
          </View>

          <Divider />

          <View style={styles.buttonContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#6200ee" style={styles.loader} />
            ) : (
              <Button
                mode="contained"
                onPress={handleAddTodo}
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                disabled={!title.trim()}
              >
                Add Task
              </Button>
            )}
          </View>
        </Surface>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f9fc",
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#6200ee",
    paddingTop: Platform.OS === "ios" ? 40 : 10,
    paddingBottom: 16,
    paddingHorizontal: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  card: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 16,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    fontSize: 16,
    marginBottom: 20,
    borderRadius: 8,
  },
  inputFocused: {
    borderColor: "#6200ee",
    borderWidth: 2,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#D32F2F",
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: "#fafafa",
  },
  button: {
    borderRadius: 8,
    backgroundColor: "#6200ee",
    elevation: 3,
    shadowColor: "#6200ee",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonContent: {
    height: 56,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF8E1",
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  tipText: {
    color: "#5D4037",
    marginLeft: 8,
    flex: 1,
    fontSize: 13,
  },
  loader: {
    marginVertical: 10,
  },
});