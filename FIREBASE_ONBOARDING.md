# Firebase Onboarding Guide

## Overview

This project uses Firebase as its backend-as-a-service solution to support classroom functionality for the Clean Python
Game. Firebase provides authentication, real-time database, and hosting capabilities without requiring server
maintenance.

### Firebase Services Used

- **Firebase Authentication** - Google OAuth for user sign-in
- **Cloud Firestore** - NoSQL database for storing groups, join codes, and user data
- **Firebase Hosting** - (Optional) For deploying the web application

## Project Configuration

### Firebase Project Details

- **Project ID**: `cleanpygame`
- **Auth Domain**: `cleanpygame.firebaseapp.com`
- **Database**: Cloud Firestore in production mode

### Configuration File

The Firebase configuration is located in `web/src/firebase/index.ts`:

```typescript
const firebaseConfig = {
    apiKey: "AIzaSyA3slyeaQPyZoslSEa8tVYaa2dxZREOjeI",
    authDomain: "cleanpygame.firebaseapp.com",
    projectId: "cleanpygame",
    storageBucket: "cleanpygame.firebasestorage.app",
    messagingSenderId: "112429030567",
    appId: "1:112429030567:web:18798b8af61858ab7d8f82",
    measurementId: "G-JCN6ZHYVPR"
};
```

## Authentication System

### Implementation

The authentication system uses Google OAuth and is implemented in `web/src/firebase/auth.ts`.

#### Key Functions:

- `signInWithGoogle()` - Initiates Google sign-in popup
- `signOut()` - Signs out the current user
- `getCurrentUser()` - Returns the current authenticated user
