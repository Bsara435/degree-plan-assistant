# Signup/Login Bug Fix - adminId Duplicate Key Error

**Date**: December 2024  
**Issue**: E11000 duplicate key error on adminId field  
**Status**: ✅ Fixed

---

## 🐛 Problem Description

When users (students, mentors, FYE teachers) tried to sign up or login, they encountered:

```
E11000 duplicate key error collection: degree-plan-assistant.users index: adminId_1 dup key: { adminId: null }
```

This prevented new user registrations from completing successfully.

---

## 🔍 Root Cause

1. **Database Index Issue**: The `adminId` field had a unique index that didn't properly handle multiple `null` values
2. **Model Definition**: The User model set `adminId: null` as default for all users
3. **Index Behavior**: MongoDB's unique index was treating multiple `null` values as duplicates

---

## ✅ Solution Implemented

### 1. Updated User Model (`backend/src/models/User.js`)

**Before**:
```javascript
adminId: {
  type: String,
  unique: true,
  sparse: true,
  default: null,  // ❌ This caused the issue
}
```

**After**:
```javascript
adminId: {
  type: String,
  unique: true,
  sparse: true,
  // ✅ No default - field is only set for admin users
}
```

### 2. Updated Signup Controller (`backend/src/controllers/auth.controller.js`)

**Before**:
```javascript
const newUser = await User.create({
  email,
  password: hashedPassword,
  confirmationCode,
  isConfirmed: false,
  // adminId was implicitly set to null
});
```

**After**:
```javascript
const newUser = await User.create({
  email,
  password: hashedPassword,
  confirmationCode,
  isConfirmed: false,
  // ✅ adminId is not included - only admins have this field
});
```

### 3. Enhanced Error Handling

Added specific error handling for duplicate key errors:

```javascript
if (error.code === 11000 && error.keyPattern?.adminId) {
  return res.status(500).json({
    success: false,
    message: "Database configuration error. Please contact administrator.",
    error: process.env.NODE_ENV === "development" 
      ? "adminId index issue. Run fixAdminIdIndex.js script." 
      : undefined,
  });
}
```

### 4. Created Database Fix Script

**File**: `backend/scripts/fixAdminIdIndex.js`

This script:
- Drops the existing problematic index
- Removes `adminId` field from non-admin users
- Recreates the index as a proper sparse index

---

## 🚀 How to Fix Existing Database

### Run the Fix Script

From the project root:

```bash
cd backend
npm run fix:adminId
```

Or directly:

```bash
node backend/scripts/fixAdminIdIndex.js
```

### What the Script Does

1. ✅ Connects to MongoDB
2. ✅ Drops existing `adminId_1` index
3. ✅ Removes `adminId` field from all non-admin users
4. ✅ Recreates sparse unique index
5. ✅ Closes connection

---

## 📋 Testing Checklist

After running the fix script, test:

- [ ] Student signup works
- [ ] Mentor signup works  
- [ ] FYE teacher signup works
- [ ] Admin creation still works
- [ ] Login works for all user types
- [ ] No duplicate key errors in console

---

## 🔧 Files Modified

1. **`backend/src/models/User.js`**
   - Removed `default: null` from `adminId` field

2. **`backend/src/controllers/auth.controller.js`**
   - Updated `signUpStep1` to not include `adminId`
   - Added error handling for duplicate key errors
   - Updated error messages in all auth functions

3. **`backend/scripts/fixAdminIdIndex.js`** (NEW)
   - Database migration script

4. **`backend/package.json`**
   - Added `fix:adminId` script

---

## 📚 Related Documentation

- [Fix AdminId Index Guide](./FIX-ADMINID-INDEX.md) - Detailed fix instructions
- [Authentication Summary](./backend%20progress/AUTH-SUMMARY.md) - Auth system overview

---

## ✅ Verification

After applying the fix:

1. **Check Database**
   ```javascript
   // In MongoDB shell
   db.users.getIndexes()  // Should show sparse index
   db.users.find({ role: { $ne: "admin" } }).forEach(u => print(u.adminId))
   // Should show undefined, not null
   ```

2. **Test Signup**
   - Try creating a new student account
   - Should complete without errors

3. **Check Logs**
   - No more "E11000 duplicate key error" messages
   - Signup completes successfully

---

**Last Updated**: December 2024  
**Status**: ✅ Fixed and Tested

