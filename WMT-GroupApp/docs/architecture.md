# System Architecture: Luxury Restaurant Experience System

## Overview
The system follows a modern full-stack architecture with a decoupled backend and mobile frontend.

## Components

### 1. Mobile Frontend (React Native)
- **Framework**: React Native with Expo support.
- **Navigation**: React Navigation (Stack & Tab).
- **State Management**: React Hooks (useState, useEffect) and AsyncStorage for persistent auth tokens.
- **Styling**: Custom design system with a premium dark-mode theme.

### 2. Backend API (Node.js & Express)
- **Server**: Express.js REST API.
- **Auth**: JWT (JSON Web Tokens) with Bcrypt for secure password hashing.
- **Image Handling**: Multer for handling multipart/form-data.
- **Logging**: Morgan for development request tracking.

### 3. Database (MongoDB Atlas)
- **Type**: NoSQL Document Database.
- **Hosting**: Cloud-hosted on MongoDB Atlas for scalability and reliability.

## Communication Flow
1. User interacts with the Mobile App.
2. App sends HTTPS requests with JWT in the Authorization header to the Backend.
3. Backend validates the token and interacts with MongoDB via Mongoose.
4. Backend returns JSON data to the App.
5. App updates the UI based on the response.
