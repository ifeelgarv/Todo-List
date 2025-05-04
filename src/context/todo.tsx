// src/context/todo.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './auth';
import { Todo, TodosResponse } from '../types';

interface TodoState {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  fetchTodos: () => Promise<void>;
  addTodo: (title: string) => Promise<void>;
  updateTodo: (id: number, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
}

interface TodoProviderProps {
  children: ReactNode;
}

const TodoContext = createContext<TodoState>({
  todos: [],
  isLoading: false,
  error: null,
  fetchTodos: async () => {},
  addTodo: async () => {},
  updateTodo: async () => {},
  deleteTodo: async () => {},
});

export const useTodos = () => useContext(TodoContext);

export const TodoProvider: React.FC<TodoProviderProps> = ({ children }) => {
  const { userToken, user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = async () => {
    if (!userToken || !user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<TodosResponse>(
        `https://dummyjson.com/todos/user/${user.id}`, 
        {
          headers: { Authorization: `Bearer ${userToken}` }
        }
      );
      
      // Ensure each todo has a unique ID before setting state
      const validatedTodos = response.data.todos.map(todo => ({
        ...todo,
        id: todo.id || Math.random() * 10000 // Fallback ID if missing
      }));
      
      setTodos(validatedTodos);
    } catch (error) {
      setError('Failed to fetch todos. Please try again.');
      console.error('Error fetching todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async (title: string) => {
    if (!userToken || !user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post<Todo>(
        'https://dummyjson.com/todos/add',
        {
          todo: title,
          completed: false,
          userId: user.id
        },
        {
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}` 
          }
        }
      );
      
      // Use functional update to prevent stale state issues
      setTodos(prevTodos => [...prevTodos, response.data]);
    } catch (error) {
      setError('Failed to add todo. Please try again.');
      console.error('Error adding todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTodo = async (id: number, updates: Partial<Todo>) => {
    if (!userToken) return;
    
    // Optimistic update for better UX
    const previousTodos = [...todos];
    setTodos(prevTodos => prevTodos.map(todo => 
      todo.id === id ? { ...todo, ...updates } : todo
    ));
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First attempt with the standard endpoint
      const response = await axios.put<Todo>(
        `https://dummyjson.com/todos/${id}`,
        updates,
        {
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}` 
          }
        }
      );
      
      // Update with the server response data to stay in sync
      setTodos(prevTodos => prevTodos.map(todo => 
        todo.id === id ? { ...todo, ...response.data } : todo
      ));
    } catch (error) {
      console.error('Error updating todo with standard endpoint:', error);
      
      // If the first attempt fails, try with an alternative endpoint format
      try {
        const response = await axios.patch<Todo>(
          `https://dummyjson.com/todos/${id}`,
          updates,
          {
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userToken}` 
            }
          }
        );
        
        // Update with the server response data
        setTodos(prevTodos => prevTodos.map(todo => 
          todo.id === id ? { ...todo, ...response.data } : todo
        ));
      } catch (secondError) {
        console.error('Error updating todo with alternative endpoint:', secondError);
        
        // If both attempts fail, revert the UI state
        setTodos(previousTodos);
        setError('Failed to update todo. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTodo = async (id: number) => {
    if (!userToken) return;
    
    // Optimistic update - remove from UI first
    const previousTodos = [...todos];
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    
    try {
      // First attempt with standard endpoint
      const response = await axios.delete(
        `https://dummyjson.com/todos/${id}`,
        {
          headers: { 
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // If delete was unsuccessful, try alternative endpoint
      if (!response || response.status >= 400) {
        throw new Error('First delete attempt failed');
      }
    } catch (error) {
      console.error('Error deleting todo with standard endpoint:', error);
      
      // If the first attempt fails, try with an alternative endpoint
      try {
        const response = await axios.delete(
          `https://dummyjson.com/todos/delete/${id}`,
          {
            headers: { 
              Authorization: `Bearer ${userToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // If second attempt fails too
        if (!response || response.status >= 400) {
          throw new Error('Second delete attempt failed');
        }
      } catch (secondError) {
        // If both attempts fail, revert the UI state
        setTodos(previousTodos);
        setError('Failed to delete todo. Please try again.');
        console.error('Second delete attempt failed:', secondError);
      }
    }
  };

  useEffect(() => {
    if (userToken && user) {
      fetchTodos();
    } else {
      setTodos([]);
    }
  }, [userToken, user]);

  return (
    <TodoContext.Provider
      value={{
        todos,
        isLoading,
        error,
        fetchTodos,
        addTodo,
        updateTodo,
        deleteTodo
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};