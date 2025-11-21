# Postman Testing Guide for Ayurvedic Chatbot Backend

This guide provides comprehensive instructions for testing all backend API endpoints using Postman.

## Prerequisites

1. **Backend Server Running**: Ensure your backend server is running on `http://localhost:5000`
2. **Postman Installed**: Download and install Postman from https://www.postman.com/
3. **Firebase Authentication**: You'll need a valid Firebase ID token for authenticated endpoints
4. **Test Data**: Some endpoints require existing conversation IDs or user data

## Postman Setup

### 1. Create a New Collection
- Open Postman
- Click "New" → "Collection"
- Name it "Ayurvedic Chatbot API"
- Add a description: "Testing all backend endpoints for Ayurvedic chatbot"

### 2. Set Base URL Variable
- In your collection, go to "Variables" tab
- Add variable:
  - Variable: `baseUrl`
  - Initial value: `http://localhost:5000`
  - Current value: `http://localhost:5000`

### 3. Set Authentication Variable
- Add another variable:
  - Variable: `authToken`
  - Initial value: `YOUR_FIREBASE_ID_TOKEN_HERE`
  - Current value: `YOUR_FIREBASE_ID_TOKEN_HERE`

## Authentication Setup

Most endpoints require Firebase authentication. To get a Firebase ID token:

1. **Using Firebase Console** (for testing):
   - Go to Firebase Console → Authentication → Users
   - Create a test user or use existing one
   - Copy the user's UID

2. **Using Frontend**:
   - Log in through your app's frontend
   - Open browser dev tools → Application → Local Storage
   - Find the Firebase ID token

3. **Update Postman Variable**:
   - Replace `YOUR_FIREBASE_ID_TOKEN_HERE` with your actual token
   - Format: `Bearer YOUR_TOKEN_HERE`

## API Endpoints Testing Guide

### Base Headers for Authenticated Requests
For all authenticated endpoints, add this header:
```
Authorization: Bearer {{authToken}}
```

---

## 1. Authentication Routes

### GET /api/auth/me
**Purpose**: Get current user information

**Method**: GET
**URL**: `{{baseUrl}}/api/auth/me`
**Headers**:
```
Authorization: Bearer {{authToken}}
```

**Expected Response (200)**:
```json
{
  "id": "firebase_user_id",
  "email": "user@example.com",
  "name": "User Name",
  "avatar": "https://avatar.url",
  "provider": "google.com"
}
```

---

## 2. Conversation Routes

### GET /api/conversations
**Purpose**: Get all conversations for authenticated user

**Method**: GET
**URL**: `{{baseUrl}}/api/conversations`
**Headers**:
```
Authorization: Bearer {{authToken}}
```

**Expected Response (200)**:
```json
[
  {
    "id": "conv_id_1",
    "userId": "user_id",
    "title": "Conversation Title",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET /api/conversations/:id
**Purpose**: Get specific conversation by ID

**Method**: GET
**URL**: `{{baseUrl}}/api/conversations/:id`
**Headers**:
```
Authorization: Bearer {{authToken}}
```
**URL Params**:
- `id`: Conversation ID (from previous GET request)

**Expected Response (200)**:
```json
{
  "id": "conv_id",
  "userId": "user_id",
  "title": "Conversation Title",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### POST /api/conversations
**Purpose**: Create a new conversation

**Method**: POST
**URL**: `{{baseUrl}}/api/conversations`
**Headers**:
```
Authorization: Bearer {{authToken}}
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "title": "New Conversation"
}
```

**Expected Response (200)**:
```json
{
  "id": "new_conv_id",
  "userId": "user_id",
  "title": "New Conversation",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### PUT /api/conversations/:id
**Purpose**: Update conversation title

**Method**: PUT
**URL**: `{{baseUrl}}/api/conversations/:id`
**Headers**:
```
Authorization: Bearer {{authToken}}
Content-Type: application/json
```
**URL Params**:
- `id`: Conversation ID
**Body** (raw JSON):
```json
{
  "title": "Updated Conversation Title"
}
```

**Expected Response (200)**:
```json
{
  "id": "conv_id",
  "userId": "user_id",
  "title": "Updated Conversation Title",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### DELETE /api/conversations/:id
**Purpose**: Delete a conversation

**Method**: DELETE
**URL**: `{{baseUrl}}/api/conversations/:id`
**Headers**:
```
Authorization: Bearer {{authToken}}
```
**URL Params**:
- `id`: Conversation ID

**Expected Response (200)**:
```json
{
  "message": "Conversation deleted"
}
```

---

## 3. Message Routes

### GET /api/conversations/:conversationId/messages
**Purpose**: Get all messages in a conversation

**Method**: GET
**URL**: `{{baseUrl}}/api/conversations/:conversationId/messages`
**Headers**:
```
Authorization: Bearer {{authToken}}
```
**URL Params**:
- `conversationId`: Conversation ID

**Expected Response (200)**:
```json
[
  {
    "id": "msg_id_1",
    "conversationId": "conv_id",
    "role": "user",
    "content": "Hello",
    "attachments": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "msg_id_2",
    "conversationId": "conv_id",
    "role": "assistant",
    "content": "Hi there!",
    "attachments": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### POST /api/chat
**Purpose**: Send a chat message and get AI response

**Method**: POST
**URL**: `{{baseUrl}}/api/chat`
**Headers**:
```
Authorization: Bearer {{authToken}}
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "conversationId": "your_conversation_id",
  "content": "Hello, I need help with Ayurvedic advice",
  "userMessageId": "user_msg_123",
  "assistantMessageId": "assistant_msg_456"
}
```

**Expected Response (200)**:
```json
{
  "userMessage": {
    "id": "user_msg_123",
    "conversationId": "conv_id",
    "role": "user",
    "content": "Hello, I need help with Ayurvedic advice",
    "attachments": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "assistantMessage": {
    "id": "assistant_msg_456",
    "conversationId": "conv_id",
    "role": "assistant",
    "content": "AI response here...",
    "attachments": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 4. Credits Routes

### GET /api/users/me/credits
**Purpose**: Get user's current credits

**Method**: GET
**URL**: `{{baseUrl}}/api/users/me/credits`
**Headers**:
```
Authorization: Bearer {{authToken}}
```

**Expected Response (200)**:
```json
{
  "credits": 50,
  "maxCredits": 100
}
```

### POST /api/credits/deduct
**Purpose**: Deduct credits for specific actions

**Method**: POST
**URL**: `{{baseUrl}}/api/credits/deduct`
**Headers**:
```
Authorization: Bearer {{authToken}}
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "type": "BOT_RESPONSE",
  "amount": 1
}
```

**Valid Types and Amounts**:
- `NEW_CHAT`: 2 credits
- `BOT_RESPONSE`: 1 credit
- `IMAGE_GENERATION`: 5 credits

**Expected Response (200)**:
```json
{
  "remainingCredits": 49
}
```

---

## 5. Symptom Analysis Route

### POST /api/symptom
**Purpose**: Analyze symptoms using Ayurvedic principles

**Method**: POST
**URL**: `{{baseUrl}}/api/symptom`
**Headers**:
```
Authorization: Bearer {{authToken}}
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "symptoms": "I have headache and feel tired",
  "conversationId": "optional_conversation_id"
}
```

**Expected Response (200)**:
```json
{
  "analysis": "Based on Ayurvedic principles, your symptoms suggest..."
}
```

---

## 6. Herbal Remedies Route

### POST /api/remedies
**Purpose**: Get herbal remedies for conditions

**Method**: POST
**URL**: `{{baseUrl}}/api/remedies`
**Headers**:
```
Authorization: Bearer {{authToken}}
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "condition": "headache",
  "dosha": "vata"
}
```

**Expected Response (200)**:
```json
{
  "remedies": "Recommended Ayurvedic remedies for headache..."
}
```

---

## 7. Appointment Link Route

### POST /api/appointment-link
**Purpose**: Generate appointment booking link

**Method**: POST
**URL**: `{{baseUrl}}/api/appointment-link`
**Headers**:
```
Authorization: Bearer {{authToken}}
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "reason": "Consultation for digestive issues",
  "conversationId": "optional_conversation_id"
}
```

**Expected Response (200)**:
```json
{
  "appointmentLink": "https://calendly.com/ayurchat-practitioner?prefill=encoded_context",
  "message": "Appointment link generated successfully"
}
```

---

## 8. Image Chat Routes

### POST /api/image-chat-sessions
**Purpose**: Create a new image chat session

**Method**: POST
**URL**: `{{baseUrl}}/api/image-chat-sessions`
**Headers**:
```
Authorization: Bearer {{authToken}}
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
  "title": "Image Analysis Session"
}
```

**Expected Response (200)**:
```json
{
  "id": "session_id",
  "userId": "user_id",
  "title": "Image Analysis Session",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/image-chat-sessions/:id
**Purpose**: Get image chat session details

**Method**: GET
**URL**: `{{baseUrl}}/api/image-chat-sessions/:id`
**Headers**:
```
Authorization: Bearer {{authToken}}
```
**URL Params**:
- `id`: Session ID

**Expected Response (200)**:
```json
{
  "id": "session_id",
  "userId": "user_id",
  "title": "Image Analysis Session",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/image-chat-sessions/:conversationId/messages
**Purpose**: Get messages from image chat session

**Method**: GET
**URL**: `{{baseUrl}}/api/image-chat-sessions/:conversationId/messages`
**Headers**:
```
Authorization: Bearer {{authToken}}
```
**URL Params**:
- `conversationId`: Conversation ID

**Expected Response (200)**:
```json
[
  {
    "id": "msg_id",
    "conversationId": "conv_id",
    "role": "user",
    "content": "Analyze this image",
    "attachments": [
      {
        "type": "image",
        "url": "data:image/jpeg;base64,/9j/4AAQ..."
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### POST /api/image-chat
**Purpose**: Send image and text for analysis

**Method**: POST
**URL**: `{{baseUrl}}/api/image-chat`
**Headers**:
```
Authorization: Bearer {{authToken}}
```
**Body**: Form-data
- `conversationId`: (text) your_conversation_id
- `content`: (text) "Please analyze this image"
- `userMessageId`: (text) "user_msg_123"
- `assistantMessageId`: (text) "assistant_msg_456"
- `image`: (file) Select an image file (JPEG/PNG)

**Expected Response (200)**:
```json
{
  "userMessage": {
    "id": "user_msg_123",
    "conversationId": "conv_id",
    "role": "user",
    "content": "Please analyze this image",
    "attachments": [
      {
        "type": "image",
        "url": "data:image/jpeg;base64,/9j/4AAQ..."
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "assistantMessage": {
    "id": "assistant_msg_456",
    "conversationId": "conv_id",
    "role": "assistant",
    "content": "I've analyzed the image you uploaded...",
    "attachments": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Error Responses

Common error responses you might encounter:

### 400 Bad Request
```json
{
  "message": "Required field is missing or invalid"
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "NO_CREDITS",
  "credits": 0,
  "message": "Insufficient credits"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Testing Workflow

1. **Start with Authentication**: Test `/api/auth/me` to verify your token
2. **Check Credits**: Test `/api/users/me/credits` to see available credits
3. **Create Conversation**: Use `/api/conversations` (POST) to create a test conversation
4. **Send Messages**: Use `/api/chat` to test the main chat functionality
5. **Test Other Features**: Try symptom analysis, remedies, appointment links
6. **Test Image Features**: Create image sessions and upload images
7. **Clean Up**: Delete test conversations using `/api/conversations/:id` (DELETE)

## Tips

- **Save Responses**: Use Postman's "Save Response" feature to save successful responses for reference
- **Environment Variables**: Create different environments for development, staging, and production
- **Tests**: Add Postman tests to automatically validate responses
- **Runner**: Use Postman Runner to execute multiple requests in sequence
- **Import Collection**: You can import this guide as a Postman collection for easier setup

## Troubleshooting

- **CORS Issues**: Ensure your backend allows requests from Postman
- **Token Expiration**: Firebase tokens expire; refresh them periodically
- **File Upload Limits**: Images are limited to 10MB
- **Rate Limiting**: Be mindful of API rate limits if implemented
- **Database State**: Some requests depend on existing data; ensure proper setup order

This guide covers all the backend endpoints for comprehensive testing of your Ayurvedic chatbot API.
