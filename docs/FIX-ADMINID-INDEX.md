# Fix adminId Index Error

## Problem

When signing up regular users (students, mentors, FYE teachers), you may encounter this error:

```
E11000 duplicate key error collection: degree-plan-assistant.users index: adminId_1 dup key: { adminId: null }
```

## Root Cause

The `adminId` field in the User model has a unique index. When multiple non-admin users sign up, they all have `adminId: null`, which violates the unique constraint.

## Solution

We've fixed this by:
1. Removing `default: null` from the `adminId` field in the User model
2. Not setting `adminId` for non-admin users (field is omitted, not set to null)
3. Creating a fix script to repair existing database

## Quick Fix

### Option 1: Run the Fix Script (Recommended)

From the project root directory:

```bash
cd backend
npm run fix:adminId
```

Or directly:

```bash
node backend/scripts/fixAdminIdIndex.js
```

### Option 2: Manual MongoDB Fix

If you prefer to fix it manually in MongoDB:

```javascript
// Connect to MongoDB
use degree-plan-assistant

// Drop the existing index
db.users.dropIndex("adminId_1")

// Remove adminId from non-admin users
db.users.updateMany(
  { role: { $ne: "admin" }, adminId: { $exists: true } },
  { $unset: { adminId: "" } }
)

// Recreate the index as sparse
db.users.createIndex(
  { adminId: 1 },
  { unique: true, sparse: true, name: "adminId_1" }
)
```

## What the Fix Script Does

1. **Drops existing index**: Removes the problematic `adminId_1` index
2. **Cleans data**: Removes `adminId` field from all non-admin users
3. **Recreates index**: Creates a new sparse unique index that allows multiple null/undefined values

## Verification

After running the fix script, try signing up a new user. The error should be resolved.

## Prevention

The code has been updated to:
- Not set `adminId` for non-admin users (field is omitted)
- Only set `adminId` when creating admin users
- Handle the error gracefully with helpful messages

## Code Changes

### User Model (`backend/src/models/User.js`)
- Removed `default: null` from `adminId` field
- Kept `sparse: true` to allow multiple undefined values

### Auth Controller (`backend/src/controllers/auth.controller.js`)
- Updated `signUpStep1` to not include `adminId` when creating users
- Added error handling for duplicate key errors
- Provides helpful error messages in development mode

## Testing

After running the fix:

1. **Test Student Signup**
   ```bash
   POST /api/auth/signup/step1
   {
     "email": "student@test.com",
     "password": "Test1234"
   }
   ```

2. **Test Mentor Signup**
   - Same as above, role will be set during profile completion

3. **Test FYE Teacher Signup**
   - Same as above, role will be set during profile completion

All should work without the duplicate key error.

---

**Last Updated**: December 2024  
**Status**: ✅ Fixed

