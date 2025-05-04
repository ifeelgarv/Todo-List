import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, FlatList, Animated, Dimensions } from "react-native";
import {
  FAB,
  List,
  Checkbox,
  ActivityIndicator,
  Text,
  IconButton,
  Divider,
  Surface,
  Snackbar,
  Avatar,
  Button,
  Portal,
  Dialog,
  Menu,
} from "react-native-paper";
import { router } from "expo-router";
import { useTodos } from "../../context/todo";
import { useAuth } from "../../context/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Todo } from "../../types";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

export default function TodoListScreen() {
  const { todos, isLoading, error, fetchTodos, updateTodo, deleteTodo } =
    useTodos();
  const { logout, user } = useAuth();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSwipe, setActiveSwipe] = useState<number | null>(null);

  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  const itemAnimations = useRef<{ [key: number]: Animated.Value }>({}).current;

  // Effect to show error in snackbar
  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarVisible(true);
    }
  }, [error]);

  useEffect(() => {
    fetchTodos();

    // animations start
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // animations for new todo items 
  useEffect(() => {
    todos.forEach((todo) => {
      if (!itemAnimations[todo.id]) {
        itemAnimations[todo.id] = new Animated.Value(0);
        Animated.timing(itemAnimations[todo.id], {
          toValue: 1,
          duration: 300,
          delay: 100 * (Object.keys(itemAnimations).length % 5),
          useNativeDriver: true,
        }).start();
      }
    });
  }, [todos]);

  const handleToggleComplete = (id: number, completed: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Adding animation for the checkbox
    const targetValue = completed ? 0 : 1;
    if (itemAnimations[id]) {
      Animated.sequence([
        Animated.timing(itemAnimations[id], {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(itemAnimations[id], {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }

    updateTodo(id, { completed: !completed });
  };

  const handleEditTodo = (todo: Todo) => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    router.push({
      pathname: "/(app)/edit",
      params: {
        id: String(todo.id),
        title: todo.todo,
        completed: todo.completed ? "true" : "false",
      },
    });
  };

  const confirmDeleteTodo = (id: number) => {
    setTodoToDelete(id);
    setDeleteDialogVisible(true);
  };

  const handleDeleteTodo = () => {
    if (todoToDelete !== null) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      deleteTodo(todoToDelete);
      setDeleteDialogVisible(false);
      setTodoToDelete(null);

      setSnackbarMessage("Todo deleted successfully");
      setSnackbarVisible(true);
    }
  };

  const handleAddTodo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(app)/add");
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTodos();
    setRefreshing(false);

    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Show snackbar
    setSnackbarMessage("Tasks refreshed");
    setSnackbarVisible(true);
  };

  const swipeToDelete = (id: number) => {
    setActiveSwipe(activeSwipe === id ? null : id);
  };

  const getItemAnimation = (id: number) => {
    return itemAnimations[id] || new Animated.Value(1);
  };

  // Custom rendering function for todo items
  const renderItem = ({ item, index }: { item: Todo; index: number }) => {
    const isSwipeActive = activeSwipe === item.id;
    const animation = getItemAnimation(item.id);

    // Calculate staggered entrance animation
    const translateY = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0],
    });

    return (
      <Animated.View
        style={[
          styles.animatedItem,
          {
            opacity: animation,
            transform: [{ translateY }, { scale: animation }],
          },
        ]}
        key={`todo-item-${item.id}`}
      >
        <Surface
          style={[styles.todoItem, item.completed && styles.completedItem]}
        >
          <List.Item
            title={item.todo}
            titleStyle={[
              styles.todoText,
              item.completed && styles.completedText,
            ]}
            description={item.completed ? "Completed" : "In progress"}
            descriptionStyle={
              item.completed
                ? styles.completedDescription
                : styles.todoDescription
            }
            left={() => (
              <Animated.View style={{ transform: [{ scale: animation }] }}>
                <Checkbox
                  status={item.completed ? "checked" : "unchecked"}
                  onPress={() => handleToggleComplete(item.id, item.completed)}
                  color="#6200ee"
                />
              </Animated.View>
            )}
            right={() => (
              <View style={styles.actions}>
                {isSwipeActive ? (
                  <>
                    <IconButton
                      icon="pencil"
                      iconColor="#fff"
                      size={20}
                      mode="contained"
                      containerColor="#2196F3"
                      onPress={() => handleEditTodo(item)}
                      style={styles.actionButton}
                    />
                    <IconButton
                      icon="delete"
                      iconColor="#fff"
                      size={20}
                      mode="contained"
                      containerColor="#f44336"
                      onPress={() => confirmDeleteTodo(item.id)}
                      style={styles.actionButton}
                    />
                  </>
                ) : (
                  <IconButton
                    icon="dots-horizontal"
                    size={20}
                    onPress={() => swipeToDelete(item.id)}
                  />
                )}
              </View>
            )}
          />
        </Surface>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.userInfo}>
          <Avatar.Text
            size={40}
            label={(user?.firstName?.[0] || "U").toUpperCase()}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.welcomeText}>
              Welcome, {user?.firstName || "User"}
            </Text>
            <Text style={styles.todayText}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              mode="contained"
              iconColor="#fff"
              containerColor="#6200ee"
              size={24}
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={handleRefresh}
            title="Refresh"
            leadingIcon="refresh"
          />
          <Menu.Item onPress={logout} title="Logout" leadingIcon="logout" />
        </Menu>
      </Animated.View>

      <Divider />

      <View style={styles.taskSummary}>
        <Surface style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Tasks</Text>
          <Text style={styles.summaryCount}>{todos.length}</Text>
        </Surface>
        <Surface style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Completed</Text>
          <Text style={styles.summaryCount}>
            {todos.filter((t) => t.completed).length}
          </Text>
        </Surface>
        <Surface style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Pending</Text>
          <Text style={styles.summaryCount}>
            {todos.filter((t) => !t.completed).length}
          </Text>
        </Surface>
      </View>

      <Animated.View style={[styles.todoContainer, { opacity: fadeAnim }]}>
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#6200ee" />
          </View>
        ) : (
          <>
            {todos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="clipboard-text-outline"
                  size={64}
                  color="#9e9e9e"
                />
                <Text style={styles.emptyText}>No tasks yet. Add one!</Text>
                <Button
                  mode="contained"
                  onPress={handleAddTodo}
                  style={styles.emptyButton}
                  icon="plus"
                >
                  Add Task
                </Button>
              </View>
            ) : (
              <FlatList
                data={todos}
                renderItem={renderItem}
                keyExtractor={(item) => `todo-${item.id}`}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={styles.listContent}
                onRefresh={handleRefresh}
                refreshing={refreshing}
                showsVerticalScrollIndicator={false}
              />
            )}
          </>
        )}
      </Animated.View>

      {/* Simplified Add Todo Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        color="#fff"
        onPress={handleAddTodo}
      />

      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Icon icon="alert" />
          <Dialog.Title>Delete Task</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this task?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>
              Cancel
            </Button>
            <Button onPress={handleDeleteTodo}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: "OK",
          onPress: () => setSnackbarVisible(false),
        }}
        duration={2000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f9fc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    marginRight: 12,
    backgroundColor: "#6200ee",
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  todayText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  taskSummary: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: "space-between",
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: "#ffffff",
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6200ee",
  },
  todoContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  animatedItem: {
    width: "100%",
  },
  todoItem: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  completedItem: {
    backgroundColor: "#f9f9f9",
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  todoText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#888",
    fontSize: 16,
  },
  todoDescription: {
    fontSize: 12,
    color: "#6200ee",
  },
  completedDescription: {
    fontSize: 12,
    color: "#4CAF50",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginHorizontal: 4,
  },
  separator: {
    height: 12,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#6200ee",
    elevation: 5,
    shadowColor: "#6200ee",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f9fc",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f9fc",
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  emptyButton: {
    marginTop: 16,
    backgroundColor: "#6200ee",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: "#6200ee",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  snackbar: {
    backgroundColor: "#6200ee",
    borderRadius: 8,
    margin: 16,
    elevation: 4,
    shadowColor: "#6200ee",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deleteButton: {
    backgroundColor: "#f44336",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: "#f44336",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  dialogContent: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  dialogActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  dialogButton: {
    backgroundColor: "#6200ee",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: "#6200ee",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dialogButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  dialogCancelButton: {
    backgroundColor: "#f44336",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: "#f44336",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dialogCancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  dialogDeleteButton: {
    backgroundColor: "#f44336",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: "#f44336",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dialogDeleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  dialogDeleteButtonContainer: {
    marginTop: 16,
    backgroundColor: "#f44336",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: "#f44336",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});
