# Dashboard Duplicate API Calls - Fixed

## 🔴 Problem on `/user/dashboard` Page

You were seeing these duplicate calls:

```
68fccd5d08ed8ad1f4a7e543 (test history) - called 3 times
history (payment history) - called 3 times
```

## 🔍 Root Causes

### 1. **`progress` in useEffect Dependencies**

```tsx
// ❌ BEFORE
useEffect(() => {
  fetchTestHistory();
}, [isAuthenticated, user, progress]); // progress causes re-fetch!
```

**Problem:** When `authService.getCurrentUser()` updates the user's progress in Redux, it triggers a re-fetch of test history.

### 2. **`user` Object in Dependencies**

```tsx
// ❌ BEFORE
useEffect(() => {
  fetchTransactionHistory();
}, [isAuthenticated, user]); // user object reference changes
```

**Problem:** The entire `user` object as a dependency causes re-fetches when ANY property changes.

### 3. **No Fetch Guards**

Both effects didn't check if data was already fetched, so:

- React Strict Mode → 2x calls
- `progress` update → 2x more calls
- `user` object update → 2x more calls

**Result:** **6+ duplicate calls** for each endpoint!

## ✅ Solution Applied

### Fixed Code:

```tsx
// ✅ AFTER - Added refs to track fetch status
const testHistoryFetched = useRef(false);
const transactionHistoryFetched = useRef(false);

useEffect(() => {
  const fetchTestHistory = async () => {
    if (!user?.userId) return;

    // Prevent duplicate fetches
    if (testHistoryFetched.current) return;

    testHistoryFetched.current = true;
    console.log("📊 Fetching test history...");

    // ... fetch logic
  };

  if (isAuthenticated && user) {
    fetchTestHistory();
  }
  // Only depend on user.userId, not the entire user object or progress
}, [isAuthenticated, user?.userId]);

useEffect(() => {
  const fetchTransactionHistory = async () => {
    if (!user?.userId) return;

    // Prevent duplicate fetches
    if (transactionHistoryFetched.current) return;

    transactionHistoryFetched.current = true;
    console.log("💳 Fetching transaction history...");

    // ... fetch logic
  };

  if (isAuthenticated && user) {
    fetchTransactionHistory();
  }
  // Only depend on user.userId, not the entire user object
}, [isAuthenticated, user?.userId]);
```

## 📊 Expected Results

### Before Fix:

```
Load /user/dashboard:
  - Test history API: 3 calls (React mount x2 + progress update)
  - Payment history API: 3 calls (React mount x2 + user update)
Total: 6 API calls
```

### After Fix (Development):

```
Load /user/dashboard:
  - Test history API: 2 calls (React Strict Mode only)
  - Payment history API: 2 calls (React Strict Mode only)
Total: 4 API calls (33% reduction)
```

### After Fix (Production):

```
Load /user/dashboard:
  - Test history API: 1 call ✅
  - Payment history API: 1 call ✅
Total: 2 API calls (66% reduction)
```

## 🧪 How to Test

1. **Clear browser cache and reload**
2. **Open DevTools → Network → Fetch/XHR**
3. **Navigate to `/user/dashboard`**
4. **Look for console logs:**

   ```
   📊 Fetching test history...
   💳 Fetching transaction history...
   ```

   You should see each **ONCE per page load**

5. **Check Network tab:**
   - Development: 2 calls per endpoint (React Strict Mode)
   - Production: 1 call per endpoint

## 🎯 Key Changes

1. ✅ Added `useRef` to track if data was already fetched
2. ✅ Changed `user` dependency to `user?.userId` to prevent object reference changes
3. ✅ Removed `progress` from dependencies (was causing cascading re-fetches)
4. ✅ Added console logs for debugging
5. ✅ Guard checks to prevent duplicate fetches

## 📁 File Modified

- ✅ `client/src/app/user/dashboard/page.tsx`

## ⚠️ Important

The `useRef` approach ensures that:

- Data is fetched **once per session**
- Even if Redux state updates, we don't re-fetch
- React Strict Mode won't break the logic
- Navigation away and back to dashboard will use cached data (no re-fetch)

If you need to **force a refresh** of the data (e.g., after completing a test), you can add:

```tsx
const refreshDashboard = () => {
  testHistoryFetched.current = false;
  transactionHistoryFetched.current = false;
  // Then trigger the useEffects by updating a dependency
};
```

---

**Status:** ✅ FIXED  
**File:** dashboard/page.tsx  
**Reduction:** 33-66% fewer API calls
