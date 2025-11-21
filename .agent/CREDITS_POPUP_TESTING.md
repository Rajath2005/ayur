# Credits Popup System - Testing Guide

## Quick Test Steps

### 1. Open the Application
Navigate to: `http://localhost:5000`

### 2. Test Popup Triggers

#### Option A: Sidebar Credits Display
1. Look for the ⚡ icon with credit count in the sidebar (e.g., "37 / 40")
2. Click on it
3. ✅ Credits popup should appear

#### Option B: Credits Card (if visible)
1. Find the "Monthly Credits" card
2. Click anywhere on the card
3. ✅ Credits popup should appear

#### Option C: Credits Button (in chat pages)
1. Navigate to a chat or image chat page
2. Look for the credits button in the header
3. Click on it
4. ✅ Credits popup should appear

### 3. Verify Popup Content

The popup should display:

**Header Section:**
- ✅ Green ⚡ icon
- ✅ "Credits Overview" title
- ✅ Close (X) button

**Current Credits Summary:**
- ✅ Large credit number (e.g., "37 / 40 Credits")
- ✅ Progress bar showing usage
- ✅ Color changes based on level:
  - Green if > 50% remaining
  - Yellow if 20-50% remaining
  - Red if < 20% remaining

**Cost Breakdown:**
- ✅ New Chat: 2 credits (blue icon)
- ✅ Bot Response: 1 credit (purple icon)
- ✅ Image Generation: 5 credits (pink icon)

**Upcoming Reset:**
- ✅ Shows days until reset (e.g., "Credits reset in 15 days")
- ✅ Shows next cycle date (e.g., "Next cycle starts on Dec 6, 2025")

**Recent Activity:**
- ✅ Timeline view of last 5 transactions
- ✅ Each entry shows:
  - Transaction type (e.g., "NEW CHAT", "BOT RESPONSE")
  - Time ago (e.g., "2 minutes ago")
  - Credits deducted (e.g., "-2")

**Footer:**
- ✅ "Got it" button

### 4. Test Interactions

#### Close Popup
- ✅ Click "Got it" button → popup closes
- ✅ Click backdrop (dark area outside popup) → popup closes
- ✅ Click X button in header → popup closes

#### Scroll Test (if needed)
- ✅ If content is tall, scrolling works within popup
- ✅ Background page doesn't scroll when popup is open

#### Real-time Updates
1. Keep popup open
2. Create a new chat or send a message in another tab
3. ✅ Credits should update within 5 seconds
4. ✅ New transaction should appear in Recent Activity

### 5. Test Responsiveness

#### Desktop (> 768px)
- ✅ Popup appears centered
- ✅ Max width: 420px
- ✅ Backdrop blur effect visible

#### Tablet (768px - 1024px)
- ✅ Popup still centered
- ✅ Responsive padding

#### Mobile (< 768px)
- ✅ Popup takes most of screen width
- ✅ Content scrollable if needed
- ✅ Touch-friendly button sizes

### 6. Test Dark Mode

1. Toggle theme to dark mode
2. Open credits popup
3. ✅ Popup background is dark (zinc-900)
4. ✅ Text is light colored
5. ✅ Icons and colors still visible
6. ✅ Progress bar colors work in dark mode

### 7. Test Edge Cases

#### No Credits
1. Use all credits (or manually set to 0 in database)
2. Open popup
3. ✅ Shows "0 / 40 Credits"
4. ✅ Progress bar is empty
5. ✅ Red color scheme

#### No Transaction History
1. New user with no transactions
2. Open popup
3. ✅ Shows "No recent activity" message

#### Loading State
1. Open popup with slow network (throttle in DevTools)
2. ✅ Shows "Loading history..." while fetching
3. ✅ Shows "..." for credit count while loading

## API Testing

### Test Backend Endpoint Directly

```bash
# Get credits details (requires authentication)
curl -X GET http://localhost:5000/api/users/me/credits/details \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected response:
```json
{
  "success": true,
  "remainingCredits": 37,
  "maxCredits": 40,
  "usedCredits": 3,
  "cycleStart": "2025-11-06T00:00:00.000Z",
  "cycleEnd": "2025-12-06T00:00:00.000Z",
  "resetInDays": 15,
  "usageHistory": [
    {
      "id": "...",
      "type": "BOT_RESPONSE",
      "amount": 1,
      "timestamp": "2025-11-21T17:00:00.000Z"
    }
  ],
  "plan": "free"
}
```

## Common Issues & Solutions

### Issue: Popup doesn't open
**Solution:** Check browser console for errors. Verify `CreditsPopup` is imported correctly.

### Issue: Data not loading
**Solution:** 
1. Check network tab for API call to `/api/users/me/credits/details`
2. Verify user is authenticated
3. Check server logs for errors

### Issue: Popup appears behind other elements
**Solution:** Verify z-index is set correctly (z-[999999] for backdrop, z-[1000000] for content)

### Issue: Scroll not working
**Solution:** Check that `max-h-[90vh]` and `overflow-y-auto` classes are applied

### Issue: Real-time updates not working
**Solution:** 
1. Verify `refetchInterval: isOpen ? 5000 : false` in useQuery
2. Check that popup state is managed correctly

## Performance Checklist

- ✅ Popup only fetches data when open
- ✅ Auto-refresh stops when popup closes
- ✅ Portal rendering prevents re-renders of parent components
- ✅ Animations are smooth (CSS transitions)
- ✅ No memory leaks (cleanup in useEffect)

## Accessibility Checklist

- ✅ Can close with ESC key (via backdrop click)
- ✅ Focus management (trapped in modal)
- ✅ Screen reader friendly labels
- ✅ Sufficient color contrast
- ✅ Touch targets are large enough (44x44px minimum)

## Browser Testing

Test in:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

---

## Status: Ready for Testing ✅

All components are implemented and integrated. The system is ready for comprehensive user testing.
