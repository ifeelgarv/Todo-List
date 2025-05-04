# React Native Todo App

A cross-platform mobile Todo application built with React Native, Expo, and TypeScript. This application integrates with DummyJSON APIs for user authentication and Todo management.


## Features

- **User Authentication**
  - Login with DummyJSON credentials
  - Secure token storage
  - Protected routes

- **Todo Management**
  - View all todos
  - Add new todos
  - Edit existing todos
  - Mark todos as complete/incomplete
  - Delete todos

- **Modern UI**
  - Clean UI

- **Error Handling**
  - API error handling
  - With Error messages
  - Loading indicators for operations

## Technologies Used

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform for React Native
- **Expo Router** - File-based routing for Expo apps
- **TypeScript** - Type-safe JavaScript
- **React Native Paper** - Material Design components
- **Axios** - HTTP client for API requests
- **AsyncStorage** - Local storage for authentication tokens
- **DummyJSON API** - Mock REST API for authentication and todos

## Project Structure

```
TODO-APP/
├── src/
│   ├── app/
│   │   ├── (app)/              # Authenticated routes
│   │   │   ├── _layout.tsx     # Layout for authenticated routes
│   │   │   ├── home.tsx        # Todo list screen
│   │   │   ├── add.tsx         # Add todo screen
│   │   │   └── edit.tsx        # Edit todo screen
│   │   ├── _layout.tsx         # Root layout with providers
│   │   ├── index.tsx           # Entry point with auth redirection
│   │   └── login.tsx           # Login screen
│   ├── components/             # Reusable components
│   ├── context/
│   │   ├── auth.tsx            # Authentication context
│   │   └── todo.tsx            # Todo management context
│   └── types/
│       └── index.ts            # TypeScript type definitions
├── assets/                     # Images and other static assets
├── .gitignore
├── app.json                    # Expo configuration
├── package.json
└── tsconfig.json               # TypeScript configuration
```

## Setup and Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or newer)
- **npm** (v6 or newer) or **yarn** (v1.22 or newer)
- **Expo CLI**: `npm install -g expo-cli`
- **Expo Go** app on your physical device (available on [iOS App Store](https://apps.apple.com/app/apple-store/id982107779) or [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Installation Steps

1. **Install Dependencies**

```
npm install
# or if you use yarn
npm yarn
```

2. **Start the development server**
```
npx expo start
```