Auto Rename Conversation Title Fix

- Context:
  Current auto renaming backend logic only renames conversations if the title is "New Conversation" (text chat) or "Image Analysis Session" (image chat).
  The app has multiple modes ('LEGACY', 'GYAAN', 'VAIDYA', 'DRISHTI') with different default conversation titles.
  As a result, conversations in some modes (e.g. "Vaidya Consultation" mode or "New Chat" mode) are not renamed automatically on first message.

- Objective:
  Fix the backend auto renaming logic to check for the default title based on conversation.mode.
  Centralize mode to default title mapping.
  Update /api/chat and /api/image-chat POST routes to auto rename conditionally.

- Files to edit:
  - server/routes.ts

- Plan:
  1. Add mapping of mode to default conversation title.
  2. Replace current string literals in rename condition checks with mapping-based check.
  3. Update auto rename logic in /api/chat and /api/image-chat handlers.
  4. Test various modes for correct auto renaming behavior.

- Followup:
  - Test new conversation creation and first message sending in all modes.
  - Verify frontend reflects updated titles after renaming.
