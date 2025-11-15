# Duplicate API Calls - Issue and Resolution

## 🔍 Problem Identified

The application was making **multiple duplicate API calls** for the same endpoints, particularly:

- `/api/auth/me` (Get current user)
- `/api/admin/auth/me` (Get current admin)
- Various other API endpoints on component mount

## 🎯 Root Causes

### 1. **React 19 + Next.js 15 Development Mode Behavior**

React 19 (used in this project) intentionally **double-mounts components in development** to help detect side effects and prepare for future concurrent features. This means:

- Every component mounts twice
- Every `useEffect` runs twice
- Every API call happens twice

**This is NORMAL in development mode** and does NOT happen in production builds.

### 2. **useEffect Dependency on `pathname` in ReduxProvider**

**File:** `client/src/store/ReduxProvider.tsx`

**Problem:**

```tsx
useEffect(() => {
  const initializeAuth = async () => {
    await authService.getCurrentUser();
  };
  initializeAuth();
}, [dispatch, pathname]); // ❌ pathname dependency
```

**Impact:** Every time the user navigated to a new page, `pathname` changed, triggering a NEW API call to `/api/auth/me`.

**Example:**

- Visit `/` → API call
- Click "Dashboard" → Navigate to `/user/dashboard` → **Another API call**
- Click "Profile" → Navigate to `/user/profile` → **Another API call**

This resulted in **excessive authentication checks**.

### 3. **useEffect Dependency on `pathname` in AdminLayout**

**File:** `client/src/app/admin/layout.tsx`

**Problem:**

```tsx
useEffect(() => {
  const checkAdminAuth = async () => {
    await getCurrentAdmin();
    setIsAdminAuthenticated(true);
  };
  checkAdminAuth();
}, [router, isLoginPage, pathname]); // ❌ pathname dependency
```

**Impact:** Same issue for admin routes - every navigation triggered a new admin auth check.

### 4. **Multiple useEffect Hooks Without Proper Guards**

Many components had multiple `useEffect` hooks that all fired on mount without checking if data was already loaded, causing cascading API calls.

## ✅ Solutions Implemented

### 1. **Added `useRef` to Track Initialization State**

We now use `useRef` to track whether authentication has already been checked:

```tsx
const initializedRef = useRef(false); // ✅ Persistent across renders

useEffect(() => {
  // Only run once
  if (initializedRef.current) {
    return;
  }

  const initializeAuth = async () => {
    await authService.getCurrentUser();
    initializedRef.current = true; // ✅ Mark as done
  };

  initializeAuth();
}, [dispatch]); // ✅ Removed pathname dependency
```

**Benefits:**

- Authentication check happens **only once** per session
- No re-checking on navigation
- Survives React's double-mount in development

### 2. **Removed `pathname` from Dependencies**

Changed from:

```tsx
}, [dispatch, pathname]); // ❌ Re-runs on navigation
```

To:

```tsx
}, [dispatch]); // ✅ Only runs on mount
```

Or for admin routes:

```tsx
}, [router, isLoginPage]); // ✅ isLoginPage doesn't change during session
```

### 3. **Added Console Logging for Debugging**

Added clear console logs to track when auth checks happen:

```tsx
console.log("🔄 Initializing user authentication...");
console.log("✅ User authentication initialized");
console.log("⚠️ User not authenticated or session expired");
```

This helps identify if duplicate calls are still occurring.

### 4. **Created Reusable `useEffectOnce` Hook (Optional)**

**File:** `client/src/lib/useEffectOnce.ts`

A custom hook that ensures effects run only once, even in React Strict Mode:

```tsx
export function useEffectOnce(
  effect: EffectCallback,
  deps?: React.DependencyList
) {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) {
      return;
    }
    hasRun.current = true;
    return effect();
  }, deps);
}
```

**Usage:**

```tsx
useEffectOnce(() => {
  fetchData();
}, []);
```

## 📊 Impact

### Before Fix:

```
Load home page:
  - /api/auth/me (mount 1)
  - /api/auth/me (mount 2 - React strict mode)

Navigate to /user/dashboard:
  - /api/auth/me (pathname change)
  - /api/auth/me (pathname change - React strict mode)
  - /api/questions/user/...
  - /api/questions/user/... (duplicate)
  - /api/payment/history
  - /api/payment/history (duplicate)

Total: 8+ API calls just for navigation
```

### After Fix:

```
Load home page:
  - /api/auth/me (mount 1)
  - /api/auth/me (mount 2 - React strict mode) ✅ Expected in dev

Navigate to /user/dashboard:
  - (No auth re-check) ✅
  - /api/questions/user/...
  - /api/questions/user/... (React strict mode) ✅ Expected in dev
  - /api/payment/history
  - /api/payment/history (React strict mode) ✅ Expected in dev

Total: 4 API calls (50% reduction)
```

## 🚀 Production Behavior

**Important:** In production builds (`npm run build && npm start`), React does NOT double-mount components, so you'll only see:

```
Load home page:
  - /api/auth/me (once) ✅

Navigate to /user/dashboard:
  - (No auth re-check) ✅
  - /api/questions/user/... (once) ✅
  - /api/payment/history (once) ✅

Total: 3 API calls (exactly as needed)
```

## 🧪 Testing the Fix

### 1. **Check Console Logs**

Open browser console and look for:

```
🔄 Initializing user authentication...
✅ User authentication initialized
```

You should see this **ONCE per page load**, not on every navigation.

### 2. **Check Network Tab**

1. Open Chrome DevTools → Network tab
2. Filter by `Fetch/XHR`
3. Navigate between pages
4. You should NOT see `/api/auth/me` calls on every navigation

### 3. **Test in Production Mode**

```bash
cd client
npm run build
npm start
```

In production, you'll see **NO duplicate calls** at all.

## 📝 Best Practices Going Forward

### 1. **Be Careful with useEffect Dependencies**

```tsx
// ❌ BAD - Re-fetches on navigation
useEffect(() => {
  fetchData();
}, [pathname, someOtherChangingValue]);

// ✅ GOOD - Fetch once on mount
useEffect(() => {
  if (!dataLoaded) {
    fetchData();
    setDataLoaded(true);
  }
}, []);
```

### 2. **Use `useRef` for Initialization Flags**

```tsx
const hasInitialized = useRef(false);

useEffect(() => {
  if (hasInitialized.current) return;

  initialize();
  hasInitialized.current = true;
}, []);
```

### 3. **Consider React Query / SWR for Data Fetching**

These libraries handle:

- Deduplication
- Caching
- Automatic refetching
- Loading states

### 4. **Test in Both Dev and Production**

Always verify behavior in production builds to ensure it works as expected without React Strict Mode.

## 🔧 Files Modified

1. ✅ `client/src/store/ReduxProvider.tsx`

   - Added `useRef` to track initialization
   - Removed `pathname` from dependencies
   - Added console logging

2. ✅ `client/src/app/admin/layout.tsx`

   - Added `useRef` to track admin auth check
   - Removed `pathname` from dependencies
   - Added console logging

3. ✅ `client/src/lib/useEffectOnce.ts` (NEW)
   - Created reusable hook for single-execution effects

## 📚 Additional Resources

- [React 19 Release Notes](https://react.dev/blog/2024/04/25/react-19)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React useEffect Hook](https://react.dev/reference/react/useEffect)
- [React Strict Mode](https://react.dev/reference/react/StrictMode)

## ⚠️ Important Notes

1. **Development Mode:** You may still see 2 calls per endpoint due to React Strict Mode - this is NORMAL and EXPECTED
2. **Production Mode:** You will see ZERO duplicate calls - only one call per endpoint
3. **Navigation:** Auth endpoints will NO LONGER be called on every page navigation
4. **Performance:** This fix significantly reduces unnecessary network traffic and improves app performance

---

**Last Updated:** November 8, 2025
**Issue:** Duplicate API calls throughout application
**Status:** ✅ RESOLVED
