# Authentication & Query History Feature

## Overview

This document describes the authentication and query history tracking features added to CipherSQLStudio.

## Features Implemented

### 1. User Authentication System

- **User Registration**: Users can sign up with username, email, and password
- **User Login**: Secure login with JWT tokens
- **Session Management**: Persistent login using localStorage
- **User Profile**: Access to current user information

### 2. Query History Tracking

- **Automatic Saving**: All SQL query attempts are automatically saved for logged-in users
- **Query Details**: Each attempt stores:
  - Query text
  - Timestamp
  - Success/failure status
  - Execution time
  - Rows affected
  - Error messages (if any)
- **History Viewer**: Users can view all their previous attempts on each assignment
- **Query Loading**: Users can reload previous queries from their history

### 3. User Progress Tracking

- **Attempt Counter**: Track number of attempts per assignment
- **Completion Status**: Mark assignments as completed
- **Last Query**: Save the most recent query for each assignment
- **Resume Work**: Automatically load the last saved query when returning to an assignment

## Technical Implementation

### Backend (API Routes)

#### Authentication Endpoints

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

#### Progress Endpoints

- `GET /api/progress/history?assignmentId=<id>` - Get query history for an assignment
- Query execution endpoint updated to automatically save attempts

### Frontend Components

#### New Pages

- `/login` - Login page with email/password form
- `/signup` - Registration page with validation

#### Updated Components

- **Header**: Shows login/logout buttons and username
- **AssignmentAttempt**: Displays query history panel with toggle button
- **App**: Wrapped with AuthProvider for global auth state

#### New Context

- **AuthContext**: Manages authentication state across the app
  - Login/logout functions
  - Current user state
  - Loading states

### Database Schema

#### User Model

```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  fullName: String,
  role: String (default: "student"),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

#### UserProgress Model (Updated)

```javascript
{
  userId: String (required),
  assignmentId: ObjectId (required),
  attempts: Number,
  isCompleted: Boolean,
  lastAttempt: Date,
  savedQuery: String,
  hintsUsed: Number,
  queryHistory: [
    {
      query: String,
      timestamp: Date,
      wasSuccessful: Boolean,
      executionTime: Number,
      rowsAffected: Number,
      errorMessage: String
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

1. **Password Hashing**: Using bcryptjs with salt rounds
2. **JWT Tokens**: Secure token-based authentication (7-day expiry)
3. **Authorization Headers**: Protected endpoints require Bearer token
4. **Input Validation**: Server-side validation for all user inputs

## Environment Variables Required

Add these to your `.env` file:

```env
JWT_SECRET=your-secret-key-change-in-production
```

## Usage

### For Users

1. **Sign Up**: Click "Sign Up" in the header → Fill the form → Start learning
2. **Login**: Click "Login" → Enter credentials → Access your history
3. **View History**: On any assignment page, click "📝 HISTORY" button
4. **Load Query**: Click "Load" button on any previous attempt
5. **Guest Access**: Can still use the platform without logging in (no history saved)

### For Developers

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Set Environment Variables**: Create `.env` file with JWT_SECRET

3. **Test Authentication**:

   ```bash
   # Login
   POST /api/auth/login
   Body: { "email": "user@example.com", "password": "password123" }

   # Get User
   GET /api/auth/me
   Headers: { "Authorization": "Bearer <token>" }
   ```

## API Examples

### Register User

```javascript
POST /api/auth/signup
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

### Login

```javascript
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "student"
  }
}
```

### Get Query History

```javascript
GET /api/progress/history?assignmentId=<assignment_id>
Headers: {
  "Authorization": "Bearer <token>"
}

Response:
{
  "success": true,
  "queryHistory": [
    {
      "query": "SELECT * FROM users",
      "timestamp": "2024-12-28T10:30:00Z",
      "wasSuccessful": true,
      "executionTime": 45,
      "rowsAffected": 10
    }
  ],
  "attempts": 5,
  "isCompleted": true
}
```

## Future Enhancements

- Password reset functionality
- Email verification
- Social authentication (Google, GitHub)
- Advanced analytics dashboard
- Query performance comparison
- Leaderboards and achievements

## Author

Gourav Chaudhary

## Last Updated

December 28, 2024
