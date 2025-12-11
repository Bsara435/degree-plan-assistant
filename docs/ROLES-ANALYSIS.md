# Roles Analysis & Finalization Guide

**Date**: December 2024  
**Purpose**: Comprehensive analysis of user roles implementation and finalization requirements

---

## 📊 Current Role System Overview

### Defined Roles

The system supports **4 user roles**:

| Role | Backend Enum | Frontend Mapping | Default | Description |
|------|-------------|------------------|---------|-------------|
| `student` | `"student"` | `"student"` | ✅ Yes | Default role for students |
| `peer_mentor` | `"peer_mentor"` | `"mentor"` | ❌ No | Peer mentors who guide students |
| `fye_teacher` | `"fye_teacher"` | `"fye-teacher"` | ❌ No | FYE (First Year Experience) instructors |
| `admin` | `"admin"` | `"admin"` | ❌ No | System administrators |

---

## 🔍 Current Implementation Status

### ✅ What's Working

1. **Backend Role Model**
   - Role enum defined in `User.js` schema
   - Default role is `"student"`
   - Role-based validation in profile completion
   - Role-based authorization middleware exists (`authorizeRoles`)

2. **Authentication Flow**
   - Signup flow (3 steps) implemented
   - Login flow (2 steps) implemented
   - JWT token generation working
   - Profile completion endpoint exists

3. **Admin Dashboard**
   - Admin login flow implemented
   - Admin dashboard page exists (`/admin/dashboard`)
   - Role promotion functionality (student → peer_mentor)
   - Mentor/advisor assignment functionality

4. **Frontend Role Selection**
   - Role selection page exists (`/signup/role`)
   - Role display names implemented
   - Role-based routing (`getRoleDestination`)

### ❌ Issues & Gaps Identified

#### 1. **Role Not Set During Signup** ⚠️ CRITICAL

**Problem**: 
- Role selection page (`/signup/role`) exists but doesn't actually set the role
- Role defaults to `"student"` in backend, but there's no way to set `peer_mentor` or `fye_teacher` during signup
- The role parameter from URL is not passed to the backend

**Current Flow**:
```
/signup/role → /signup/confirm?role=mentor → /signup/create-account → (role lost)
```

**Impact**: 
- Users cannot sign up as peer mentors or FYE teachers
- Only admins can promote users to these roles after signup

**Files Affected**:
- `frontend/app/signup/role/page.tsx` - Role selection
- `frontend/app/signup/confirm/page.tsx` - Confirmation page (doesn't use role)
- `frontend/app/signup/create-account/page.tsx` - Account creation (doesn't pass role)
- `backend/src/controllers/auth.controller.js` - `signUpStep1` doesn't accept role

---

#### 2. **Profile Completion Always Requires Student Fields** ⚠️ CRITICAL

**Problem**:
- `complete-profile/page.tsx` always shows and requires `major` and `classification` fields
- These fields should only be required for students
- Non-student roles (peer_mentor, fye_teacher) don't need these fields

**Current Behavior**:
- All users must fill major and classification, even if they're not students
- Backend validation correctly skips these for non-students, but frontend doesn't

**Files Affected**:
- `frontend/app/signup/complete-profile/page.tsx` - Always shows student fields
- `frontend/lib/api.ts` - `signupStep3` always sends major/classification

---

#### 3. **Role Name Mismatch** ⚠️ MEDIUM

**Problem**:
- Frontend uses `"mentor"` and `"fye-teacher"` (with hyphens)
- Backend uses `"peer_mentor"` and `"fye_teacher"` (with underscores)
- Mapping exists in `lib/auth.ts` but not consistently applied

**Current Mapping**:
```typescript
// frontend/lib/auth.ts
roleDestinations: {
  student: "/home",
  mentor: "/home",           // Should map to peer_mentor
  "fye-teacher": "/home",    // Should map to fye_teacher
  admin: "/admin/dashboard",
}
```

**Files Affected**:
- `frontend/lib/auth.ts` - Role destination mapping
- `frontend/app/signup/role/page.tsx` - Role selection URLs
- All role-based conditionals in frontend

---

#### 4. **School Enum Mismatch** ⚠️ MEDIUM

**Problem**:
- Backend enum: `["SSE", "SHAS", "SBA"]`
- Documentation mentions: `["SSE", "SSAH", "SBA"]`
- Frontend uses: `["SSE", "SHAS", "SBA"]` ✅ (matches backend)

**Note**: Frontend is correct, but documentation is inconsistent

**Files Affected**:
- `docs/backend progress/AUTH-SUMMARY.md` - Mentions "SSAH" instead of "SHAS"
- `backend/src/models/User.js` - Uses "SHAS" ✅

---

#### 5. **Missing Role-Specific Dashboards** ⚠️ LOW

**Problem**:
- Dashboard folders exist but are empty:
  - `/dashboard/student/` - Empty
  - `/dashboard/mentor/` - Empty  
  - `/dashboard/fye-teacher/` - Empty
- All roles currently redirect to `/home` (shared experience)

**Current Behavior**:
- All non-admin roles go to `/home` (mobile-first experience)
- Admin goes to `/admin/dashboard`
- No role-specific dashboards implemented

**Files Affected**:
- `frontend/app/dashboard/student/` - Empty directory
- `frontend/app/dashboard/mentor/` - Empty directory
- `frontend/app/dashboard/fye-teacher/` - Empty directory

---

## 🎯 Finalization Requirements

### Priority 1: Critical Fixes

#### 1.1 Implement Role Setting During Signup

**Tasks**:
1. Update `signUpStep1` to accept `role` parameter
2. Store role in localStorage during signup flow
3. Pass role from role selection → confirmation → account creation → backend
4. Update backend to set role during user creation

**Files to Modify**:
- `backend/src/controllers/auth.controller.js` - Add role to `signUpStep1`
- `frontend/app/signup/create-account/page.tsx` - Pass role to API
- `frontend/app/signup/confirm/page.tsx` - Store role in localStorage
- `frontend/lib/api.ts` - Update `signupStep1` to accept role

---

#### 1.2 Fix Profile Completion for Non-Students

**Tasks**:
1. Make major/classification fields conditional based on role
2. Only show student fields when role is "student"
3. Update validation to skip student fields for non-students

**Files to Modify**:
- `frontend/app/signup/complete-profile/page.tsx` - Conditional field rendering
- `frontend/lib/api.ts` - Conditional field sending

---

### Priority 2: Consistency Fixes

#### 2.1 Standardize Role Names

**Tasks**:
1. Create consistent role mapping utility
2. Use backend role names (`peer_mentor`, `fye_teacher`) as source of truth
3. Map frontend display names to backend roles consistently

**Files to Modify**:
- `frontend/lib/auth.ts` - Add role mapping utility
- `frontend/app/signup/role/page.tsx` - Use mapped role names
- All role-based conditionals

---

#### 2.2 Fix Documentation

**Tasks**:
1. Update docs to use "SHAS" consistently
2. Document role mapping clearly

**Files to Modify**:
- `docs/backend progress/AUTH-SUMMARY.md`
- `docs/backend progress/authentication-progress.md`

---

### Priority 3: Enhancements

#### 3.1 Role-Specific Dashboards (Optional)

**Tasks**:
1. Create role-specific dashboard pages
2. Update routing to use role-specific dashboards
3. Implement role-specific features

**Files to Create/Modify**:
- `frontend/app/dashboard/student/page.tsx`
- `frontend/app/dashboard/mentor/page.tsx`
- `frontend/app/dashboard/fye-teacher/page.tsx`
- `frontend/lib/auth.ts` - Update role destinations

---

## 📋 Role Requirements Summary

### Student Role
- **Required Fields**: `fullName`, `school`, `major`, `classification`
- **Optional Fields**: `mentor`, `advisor`
- **Dashboard**: `/home` (or `/dashboard/student` if implemented)
- **Special Features**: Can be assigned mentors/advisors

### Peer Mentor Role
- **Required Fields**: `fullName`, `school`
- **Optional Fields**: `major` (if they were a student before)
- **Dashboard**: `/home` (or `/dashboard/mentor` if implemented)
- **Special Features**: Can be assigned as mentor to students, can be advisor

### FYE Teacher Role
- **Required Fields**: `fullName`, `school`
- **Optional Fields**: None
- **Dashboard**: `/home` (or `/dashboard/fye-teacher` if implemented)
- **Special Features**: Can be assigned as advisor to students

### Admin Role
- **Required Fields**: `fullName`, `school`, `adminId`
- **Optional Fields**: None
- **Dashboard**: `/admin/dashboard`
- **Special Features**: 
  - Can promote students to mentors
  - Can assign mentors/advisors to students
  - Can manage all users

---

## 🔄 Role Assignment Flow

### Current Flow (Broken)
```
User selects role → Role lost → Defaults to student → Admin must promote
```

### Desired Flow
```
User selects role → Role stored → Role sent to backend → Role set in database
```

### Admin Promotion Flow (Working)
```
Admin dashboard → Select student → Promote to mentor → Role updated
```

---

## 🧪 Testing Checklist

### Role Signup Testing
- [ ] Sign up as student - verify role is "student"
- [ ] Sign up as peer mentor - verify role is "peer_mentor"
- [ ] Sign up as FYE teacher - verify role is "fye_teacher"
- [ ] Verify student fields required only for students
- [ ] Verify non-students don't need major/classification

### Role Login Testing
- [ ] Login as student - verify routing to `/home`
- [ ] Login as peer mentor - verify routing to `/home`
- [ ] Login as FYE teacher - verify routing to `/home`
- [ ] Login as admin - verify routing to `/admin/dashboard`

### Role Authorization Testing
- [ ] Verify role-based middleware works
- [ ] Verify admin-only endpoints are protected
- [ ] Verify role-specific features are accessible

---

## 📁 Key Files Reference

### Backend
- `backend/src/models/User.js` - User schema with role enum
- `backend/src/controllers/auth.controller.js` - Signup/login logic
- `backend/src/controllers/admin.controller.js` - Admin role management
- `backend/src/middleware/auth.middleware.js` - Role authorization

### Frontend
- `frontend/app/signup/role/page.tsx` - Role selection
- `frontend/app/signup/create-account/page.tsx` - Account creation
- `frontend/app/signup/complete-profile/page.tsx` - Profile completion
- `frontend/lib/auth.ts` - Role routing utilities
- `frontend/lib/api.ts` - API client with role support

### Documentation
- `docs/backend progress/AUTH-SUMMARY.md` - Auth system overview
- `docs/backend progress/authentication-progress.md` - Signup flow docs
- `docs/README.md` - Project overview

---

## 🚀 Next Steps

1. **Immediate**: Fix role setting during signup (Priority 1.1)
2. **Immediate**: Fix profile completion for non-students (Priority 1.2)
3. **Short-term**: Standardize role names (Priority 2.1)
4. **Short-term**: Fix documentation (Priority 2.2)
5. **Long-term**: Implement role-specific dashboards (Priority 3.1)

---

**Last Updated**: December 2025  
**Status**: ⚠️ Roles partially implemented, critical fixes needed

