## Debugging Steps for Credits Popup

### Issue
Credits showing as "/ 40 Credits" instead of actual credit count.

### Steps to Debug

1. **Open Browser Console**
   - Press F12 to open DevTools
   - Go to Console tab

2. **Open Credits Popup**
   - Click on the ⚡ icon in the sidebar
   - Look for console log: "Credits API Response: ..."

3. **Check the Response**
   The response should look like:
   ```json
   {
     "success": true,
     "remainingCredits": 37,
     "maxCredits": 40,
     "usedCredits": 3,
     "cycleStart": "2025-11-06T00:00:00.000Z",
     "cycleEnd": "2025-12-06T00:00:00.000Z",
     "resetInDays": 15,
     "usageHistory": [...],
     "plan": "free"
   }
   ```

4. **Check Network Tab**
   - Go to Network tab in DevTools
   - Open the popup
   - Look for request to `/api/users/me/credits/details`
   - Check:
     - Status code (should be 200)
     - Response body
     - Any error messages

5. **Possible Issues**

   **Issue A: User not authenticated**
   - Check if you're logged in
   - Look for 401 or 403 errors in Network tab
   - Solution: Log in again

   **Issue B: Database not initialized**
   - Check server console for errors
   - Look for MongoDB connection errors
   - Solution: Restart server, check MongoDB connection

   **Issue C: User has no credit data**
   - New users might not have credits initialized
   - Solution: Create a new chat to initialize credits

   **Issue D: API returning wrong structure**
   - Check console log for actual response
   - Compare with expected structure above
   - Solution: Fix backend route if structure is wrong

6. **Quick Fix: Initialize Credits**
   
   If you're a new user, credits might not be initialized. Try:
   - Create a new chat conversation
   - This should initialize your credits to 40
   - Then open the popup again

7. **Manual API Test**
   
   Open browser console and run:
   ```javascript
   fetch('/api/users/me/credits/details')
     .then(r => r.json())
     .then(d => console.log('Credits Data:', d))
     .catch(e => console.error('Error:', e))
   ```

### Expected Behavior After Fix

- Credits should show: "37 / 40 Credits" (or your actual count)
- Progress bar should be filled proportionally
- Recent activity should show last 5 transactions
- Reset countdown should show days remaining

### If Still Not Working

1. Check server logs for errors
2. Verify MongoDB is running
3. Check if `getCreditLogs` method exists in mongo-storage.ts
4. Verify user document has credit fields
