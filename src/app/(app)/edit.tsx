import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import {
  TextInput,
  Button,
  Text,
  ActivityIndicator,
  Checkbox,
} from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { useTodos } from "../../context/todo";

export default function EditTodoScreen() {
  const params = useLocalSearchParams<{
    id: string;
    title: string;
    completed: string;
  }>();
  const id = parseInt(params.id || "0", 10);
  const [title, setTitle] = useState<string>(params.title || "");
  const [completed, setCompleted] = useState<boolean>(
    params.completed === "true"
  );
  const { updateTodo, isLoading, error } = useTodos();

  const handleUpdateTodo = async () => {
    if (title.trim()) {
      await updateTodo(id, {
        todo: title,
        completed,
      });

      if (!error) {
        router.back();
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <TextInput
          label="Todo Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          multiline
        />

        <View style={styles.checkboxContainer}>
          <Checkbox
            status={completed ? "checked" : "unchecked"}
            onPress={() => setCompleted(!completed)}
          />
          <Text style={styles.checkboxLabel}>Mark as completed</Text>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {isLoading ? (
          <ActivityIndicator size="small" style={styles.loader} />
        ) : (
          <Button
            mode="contained"
            onPress={handleUpdateTodo}
            style={styles.button}
            disabled={!title.trim()}
          >
            Update Todo
          </Button>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
  },
  input: {
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkboxLabel: {
    marginLeft: 8,
  },
  button: {
    marginTop: 10,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  loader: {
    marginTop: 20,
  },
});
