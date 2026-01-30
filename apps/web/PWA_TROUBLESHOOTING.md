# PWA Troubleshooting Steps

## On Your Mobile Phone:

### Step 1: Clear Browser Data
**Chrome (Android):**
1. Open Chrome Settings → Privacy → Clear browsing data
2. Select "Cookies and site data" and "Cached images and files"
3. Clear data for tingletalk.com

**Safari (iOS):**
1. Settings → Safari → Advanced → Website Data
2. Find tingletalk.com and swipe to delete
3. Or clear all website data

### Step 2: Check if Already Installed
- Look for TingleTalk icon on your home screen
- If it exists, the app is already installed!
- Uninstall it to see the prompt again

### Step 3: Clear localStorage
1. Open tingletalk.com in Chrome
2. Open Chrome DevTools (Desktop) or use Remote Debugging
3. Go to Application → Local Storage → tingletalk.com
4. Delete the key `pwa-install-dismissed`
5. Refresh the page

### Step 4: Check Browser Console
1. On Desktop Chrome: Right-click → Inspect → Console
2. On Mobile: Use Chrome Remote Debugging
3. Look for these messages:
   - "Service Worker registered" ✅
   - "beforeinstallprompt" event ✅
4. Check for any errors

### Step 5: Manual Installation (Alternative)

If the automatic prompt doesn't show, users can still install manually:

**Chrome (Android):**
1. Open tingletalk.com
2. Tap the menu (⋮) in the top-right
3. Tap "Add to Home screen" or "Install app"
4. Confirm

**Safari (iOS 16.4+):**
1. Open tingletalk.com
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

**Desktop Chrome/Edge:**
1. Look for the install icon (⊕) in the address bar
2. Click it
3. Click "Install"

## Why the Prompt Might Not Show:

### 1. iOS Safari Limitations
- iOS Safari doesn't support the `beforeinstallprompt` event
- Users MUST use the manual method (Share → Add to Home Screen)
- Our custom prompt won't appear on iOS
- This is an Apple limitation, not a bug

### 2. Chrome Requirements
- Must visit the site at least once
- Must spend some time on the site (engagement heuristics)
- Must not have dismissed it recently
- Must not have already installed it

### 3. Already Installed
- If you see the app in standalone mode (no browser UI), it's installed
- Check your home screen for the TingleTalk icon

### 4. localStorage Dismissed Flag
- If you clicked "Dismiss" before, it won't show again
- Clear localStorage to reset this

## Testing PWA Features:

### Check if Service Worker is Running:
1. Open Chrome DevTools
2. Go to Application tab
3. Click "Service Workers" in the left sidebar
4. You should see "sw.js" with status "activated and running"

### Check Manifest:
1. In DevTools → Application tab
2. Click "Manifest" in the left sidebar
3. Verify all fields are correct
4. Check that icons load properly

### Test Offline Mode:
1. Install the app
2. Open DevTools → Application → Service Workers
3. Check "Offline" checkbox
4. Refresh the page
5. The app should still work!

## Force the Install Prompt (For Testing):

Add this code to browser console to manually trigger:
```javascript
// Clear the dismissed flag
localStorage.removeItem('pwa-install-dismissed');

// Reload the page
location.reload();
```

## Expected Behavior:

✅ **Android Chrome**: Custom prompt appears after 3 seconds
✅ **Desktop Chrome/Edge**: Custom prompt appears + browser install icon
❌ **iOS Safari**: No custom prompt (use manual installation only)
⚠️ **Firefox**: Limited PWA support, manual installation only

## Still Not Working?

### Check the Network Tab:
1. Open DevTools → Network
2. Refresh the page
3. Verify these files load successfully:
   - `/manifest.json` (200 OK)
   - `/sw.js` (200 OK)
   - `/icons/icon-*.png` (200 OK)

### Check Console for Errors:
Look for errors related to:
- Service Worker registration
- Manifest parsing
- Icon loading

### Verify HTTPS:
- PWAs ONLY work on HTTPS (or localhost)
- Check that tingletalk.com uses HTTPS (it does ✓)

## Contact Support:
If none of these work, share:
1. Browser name and version
2. Operating system
3. Console errors (screenshot)
4. Network tab screenshot
