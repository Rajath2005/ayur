# Credits Popup - Quick Fix Guide

## Current Issue
Credits showing as "/ 40 Credits" instead of the actual count (e.g., "37 / 40 Credits")

## What I've Done

### 1. Added Debug Logging
- ✅ **Frontend**: Console logs the API response
- ✅ **Backend**: Logs each step of data fetching
- ✅ **Error Display**: Shows error messages in the popup if API fails

### 2. Improved Error Handling
- ✅ Added fallback values (`?? 0` instead of `|| 0`)
- ✅ Added retry logic (2 retries)
- ✅ Added error state display in UI

## How to Debug

### Step 1: Open the Application
1. Go to `http://localhost:5000`
2. Make sure you're logged in

### Step 2: Open Browser DevTools
1. Press `F12` to open DevTools
2. Go to the **Console** tab
3. Go to the **Network** tab

### Step 3: Open Credits Popup
1. Click the ⚡ icon in the sidebar (or any credits display)
2. The popup should open

### Step 4: Check Console Logs

**Frontend Log** (in browser console):
```
Credits API Response: {
  success: true,
  remainingCredits: 37,
  maxCredits: 40,
  ...
}
```

**Backend Log** (in terminal where `npm run dev` is running):
```
[Credits Details] Fetching for user: abc123...
[Credits Details] Credits: 37
[Credits Details] User details: { totalCredits: 40, ... }
[Credits Details] History count: 5
[Credits Details] Sending response: { ... }
```

### Step 5: Check Network Tab

1. Look for request to `/api/users/me/credits/details`
2. Check the **Status** (should be `200 OK`)
3. Click on the request
4. Go to **Response** tab
5. Verify the response structure

## Common Issues & Solutions

### Issue 1: 401 Unauthorized
**Symptom**: Network tab shows 401 error
**Solution**: 
- Log out and log back in
- Check if Firebase token is valid

### Issue 2: 500 Server Error
**Symptom**: Network tab shows 500 error
**Solution**:
- Check server terminal for error logs
- Verify MongoDB is running
- Check if `getCreditLogs` method exists

### Issue 3: Credits are `null` or `undefined`
**Symptom**: Console shows `remainingCredits: null`
**Solution**:
- User might be new and credits not initialized
- Try creating a new chat to initialize credits
- Check server logs for database errors

### Issue 4: Empty Response
**Symptom**: API returns `{}` or empty object
**Solution**:
- Check if `verifyFirebaseToken` middleware is working
- Verify user ID is being passed correctly
- Check server logs for errors

## Expected Result

After opening the popup, you should see:

**In the Popup:**
- ✅ "37 / 40 Credits" (or your actual count)
- ✅ Green/Yellow/Red progress bar
- ✅ Cost breakdown section
- ✅ Reset countdown
- ✅ Recent activity (last 5 transactions)

**In Console:**
- ✅ "Credits API Response: { ... }" with full data
- ✅ No error messages

**In Server Terminal:**
- ✅ "[Credits Details] Fetching for user: ..."
- ✅ "[Credits Details] Credits: 37"
- ✅ "[Credits Details] Sending response: ..."

## If Still Not Working

### Quick Test in Browser Console
Run this in the browser console:
```javascript
fetch('/api/users/me/credits/details')
  .then(r => r.json())
  .then(d => console.log('API Response:', d))
  .catch(e => console.error('API Error:', e))
```

### Check Server Logs
Look in the terminal where `npm run dev` is running for:
- Any error messages
- The debug logs starting with `[Credits Details]`

### Verify Database
If you have MongoDB access:
```javascript
// Check if user has credit data
db.users.findOne({ _id: "YOUR_USER_ID" })
```

## Next Steps

1. **Open the popup** and check browser console
2. **Look at the terminal** where server is running
3. **Share the logs** with me:
   - What does the browser console show?
   - What does the server terminal show?
   - Any error messages?

This will help me identify exactly where the issue is!
