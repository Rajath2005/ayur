# MongoDB Migration TODO

## ✅ Completed Tasks
- [x] Analyze codebase and identify Firestore usage
- [x] Create migration plan
- [x] Get user approval
- [x] Install MongoDB dependencies (mongoose, mongodb)
- [x] Create MongoDB connection file (server/mongodb.ts)
- [x] Create Mongoose models (server/models/)
  - [x] Conversation model
  - [x] Message model
- [x] Implement MongoStorage class (server/mongo-storage.ts)
- [x] Update storage factory to use MongoDB
- [x] Update shared schema for MongoDB compatibility
- [x] Remove FirestoreStorage class and imports
- [x] Update frontend chat.tsx to use API calls instead of Firestore
- [x] Remove client/src/services/firestore.ts
- [x] Update routes.ts for messageId uniqueness check

## 🔄 In Progress Tasks

## 📋 Pending Tasks
- [ ] Test conversation creation and message storage
- [ ] Test message retrieval and history loading
- [ ] Verify Firebase auth still works
- [ ] Ensure no duplicate messages
- [ ] Clean up any remaining Firestore references

## 🐛 Issues Found
- None yet

## 📝 Notes
- Keep Firebase Authentication unchanged
- Implement messageId uniqueness for idempotency
- Frontend must use API calls, not direct Firestore
- Remove all Firestore conversation logic
