import React, { useState, useEffect } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, StatusBar } from "react-native";
import {
  TextInput,
  Button,
  Text,
  ActivityIndicator,
  Checkbox,
  Surface,
  Divider,
  IconButton
} from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { useTodos } from "../../context/todo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

export default function EditTodoScreen() {
  // Parse route params
  const params = useLocalSearchParams<{
    id: string;
    title: string;
    completed: string;
  }>();
  
  const id = parseInt(params.id || "0", 10);
  const [title, setTitle] = useState<string>(params.title || "");
  const [completed, setCompleted] = useState<boolean>(params.completed === "true");
  const [titleFocused, setTitleFocused] = useState(false);
  
  const { updateTodo, isLoading, error } = useTodos();

  const handleUpdateTodo = async () => {
    if (title.trim()) {
      // Add haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      await updateTodo(id, {
        todo: title,
        completed,
      });

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
            <Text style={styles.label}>Edit your task</Text>
            
            <TextInput
              label="Task Description"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              onFocus={() => setTitleFocused(true)}
              onBlur={() => setTitleFocused(false)}
              autoFocus
              multiline
              numberOfLines={5}
              mode="outlined"
              outlineColor="#e0e0e0"
              activeOutlineColor="#6200ee"
            />

            <View style={styles.checkboxContainer}>
              <Checkbox
                status={completed ? "checked" : "unchecked"}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCompleted(!completed);
                }}
                color="#6200ee"
              />
              <Text style={styles.checkboxLabel}>
                Mark as {completed ? "incomplete" : "completed"}
              </Text>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle" size={18} color="#f44336" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>

          <Divider />

          <View style={styles.buttonContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#6200ee" style={styles.loader} />
            ) : (
              <Button
                mode="contained"
                onPress={handleUpdateTodo}
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                disabled={!title.trim()}
              >
                Update Task
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
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
  loader: {
    marginVertical: 10,
  },
});