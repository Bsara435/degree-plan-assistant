# Frontend Setup Guide

## ✅ What's Already Configured

### 1. Tailwind CSS v4
- ✅ Installed and configured in `frontend/src/app/globals.css`
- ✅ Brand colors added to theme
- ✅ Custom CSS variables defined

### 2. Brand Colors Available
You can now use these colors in your components:

```jsx
// Using Tailwind classes
<button className="bg-primary text-white">Primary Button</button>
<div className="text-navy">Dark Navy Text</div>
<p className="text-gray-400">Light gray text</p>

// Available color classes:
// - bg-primary / text-primary
// - bg-primary-dark / text-primary-dark  
// - bg-primary-light / text-primary-light
// - bg-navy / text-navy
// - bg-gray / text-gray
```

---

## 🔧 Next Steps

### 1. Install Phosphor Icons

Run this command in the `frontend` directory:

```bash
npm install @phosphor-icons/react
```

### 2. Usage Example

After installation, use icons like this:

```jsx
import { ArrowRight, User, EnvelopeSimple, Lock } from "@phosphor-icons/react";

export default function SignupButton() {
  return (
    <button className="bg-primary text-white px-6 py-3 rounded-md flex items-center gap-2">
      Sign Up
      <ArrowRight size={20} weight="bold" />
    </button>
  );
}
```

---

## 📁 Current Project Structure

Your frontend already has a skeleton structure ready for development:

```
frontend/
├── src/
│   └── app/
│       ├── globals.css              # ✅ Tailwind config with brand colors
│       ├── layout.tsx
│       └── page.tsx
│
├── app/                             # ⚠️ Duplicate app directory (needs cleanup)
│   ├── signup/
│   │   ├── confirm/                 # Email verification page
│   │   └── role/                    # Profile completion page
│   └── dashboard/
│       ├── student/                 # Student dashboard
│       ├── mentor/                  # Peer mentor dashboard
│       └── fye-teacher/             # FYE teacher dashboard
│
├── components/                      # ✅ Component folders exist (empty)
│   ├── auth/                        # Authentication components
│   ├── ui/                          # Reusable UI components
│   └── layout/                      # Layout components
│
├── lib/                             # ✅ Empty - for utilities
├── hooks/                           # ✅ Empty - for custom React hooks
├── context/                         # ✅ Empty - for Context API providers
├── styles/                          # ✅ Empty - for additional styles
│
└── public/
    └── illustrations/               # Empty - for images/illustrations
```

### 🔧 Structure Notes

**Issue Found**: You have **two `app` directories**:
1. `src/app/` - This is the correct Next.js 15 App Router location ✅
2. `app/` - This is a duplicate and should be moved to `src/app/`

**Recommendation**: Move the routes from `app/` into `src/app/`

---

## 📂 Folder Organization Guide

### What Goes Where

#### 🔐 `/components/auth/`
Authentication-related components:
- `LoginForm.tsx` - Login form component
- `SignupForm.tsx` - Signup step 1 form
- `VerificationCodeInput.tsx` - 6-digit code input
- `ProfileForm.tsx` - Profile completion form
- `ProtectedRoute.tsx` - Route protection wrapper

#### 🎨 `/components/ui/`
Reusable UI components (design system):
- `Button.tsx` - Button component with variants
- `Input.tsx` - Input field with validation
- `Select.tsx` - Dropdown/select component
- `Card.tsx` - Card container
- `Modal.tsx` - Modal/dialog component
- `Alert.tsx` - Alert/notification component
- `Spinner.tsx` - Loading spinner
- `Badge.tsx` - Badge/tag component

#### 📐 `/components/layout/`
Layout components:
- `Header.tsx` - Top navigation bar
- `Footer.tsx` - Footer with CLE logo
- `Sidebar.tsx` - Dashboard sidebar
- `DashboardLayout.tsx` - Dashboard wrapper
- `AuthLayout.tsx` - Authentication pages wrapper

#### 📚 `/lib/`
Utility functions and helpers:
- `api.ts` - Axios instance and API calls
- `utils.ts` - Helper functions (cn, formatDate, etc.)
- `validators.ts` - Form validation schemas (Zod)
- `constants.ts` - App constants (roles, schools, etc.)

#### 🪝 `/hooks/`
Custom React hooks:
- `useAuth.ts` - Authentication state and functions
- `useUser.ts` - User data and profile
- `useForm.ts` - Form handling utilities
- `useApi.ts` - API call wrapper with loading/error states

#### 🌐 `/context/`
Context providers:
- `AuthContext.tsx` - Authentication context
- `UserContext.tsx` - User data context
- `ThemeContext.tsx` - Theme/dark mode context (optional)

#### 🎯 `/src/app/` Routes
Page routes using Next.js App Router:

```
src/app/
├── page.tsx                        # Home/landing page
├── layout.tsx                      # Root layout
├── globals.css                     # Global styles + Tailwind
│
├── signup/
│   ├── page.tsx                    # Signup Step 1 (email/password)
│   ├── confirm/
│   │   └── page.tsx                # Signup Step 2 (verify code)
│   └── profile/
│       └── page.tsx                # Signup Step 3 (complete profile)
│
├── login/
│   ├── page.tsx                    # Login Step 1 (email/password)
│   └── verify/
│       └── page.tsx                # Login Step 2 (verify code)
│
└── dashboard/
    ├── layout.tsx                  # Dashboard layout with sidebar
    ├── student/
    │   ├── page.tsx                # Student dashboard home
    │   ├── plan/
    │   │   └── page.tsx            # Degree plan builder
    │   └── profile/
    │       └── page.tsx            # Student profile
    ├── mentor/
    │   ├── page.tsx                # Mentor dashboard
    │   └── students/
    │       └── page.tsx            # Mentored students list
    └── fye-teacher/
        ├── page.tsx                # FYE teacher dashboard
        └── students/
            └── page.tsx            # Students overview
```

---

## 🔧 Next Steps - Reorganize Structure

### Step 1: Fix Duplicate App Folder

You need to merge the duplicate `app/` folder into `src/app/`. Here's how:

**Option A - Manual Move:**
1. Copy all folders from `frontend/app/` to `frontend/src/app/`
2. Delete the old `frontend/app/` directory

**Option B - Use this guide:**

```bash
# In your frontend directory
# Move signup routes
mv app/signup src/app/signup

# Move dashboard routes
mv app/dashboard src/app/dashboard

# Delete empty app folder
rmdir app
```

### Step 2: Create Missing Routes

Add these missing routes to `src/app/`:

```bash
# Create login routes
mkdir -p src/app/login/verify

# Create signup profile route
mkdir -p src/app/signup/profile
```

---

## 🎨 Using Brand Colors

### CSS Variables
```css
/* In your CSS files */
.custom-button {
  background-color: var(--primary-blue);
  color: white;
  border-radius: var(--radius-md);
}
```

### Tailwind Classes
```jsx
// Primary Button
<button className="bg-primary hover:bg-primary-dark text-white rounded-md px-6 py-3">
  Submit
</button>

// Input Field
<input 
  className="border border-gray rounded-md px-4 py-3 focus:border-primary focus:outline-none"
  type="text"
/>

// Card with Navy Background
<div className="bg-navy text-white p-6 rounded-lg">
  Content
</div>
```

---

## 🚀 Starting Development

### 1. Run Development Server
```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:3000`

### 2. Build for Production
```bash
npm run build
npm start
```

---

## 📦 Required Packages to Install

Run these in the `frontend` directory:

```bash
# Icons
npm install @phosphor-icons/react

# Form Handling (Recommended)
npm install react-hook-form zod @hookform/resolvers

# State Management (Optional)
npm install zustand

# UI Components (Optional but helpful)
npm install clsx tailwind-merge
```

---

## 🎯 Creating Your First Component

### Example: Button Component

Create `src/components/ui/Button.tsx`:

```tsx
import { ComponentProps } from 'react';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary';
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseStyles = 'px-6 py-3 rounded-md font-semibold transition-colors';
  
  const variantStyles = {
    primary: 'bg-primary hover:bg-primary-dark text-white',
    secondary: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white'
  };

  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Example: Input Component

Create `src/components/ui/Input.tsx`:

```tsx
import { ComponentProps } from 'react';

interface InputProps extends ComponentProps<'input'> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-navy">
          {label}
        </label>
      )}
      <input
        className={`
          border rounded-md px-4 py-3 text-base
          focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
          ${error ? 'border-red-500' : 'border-gray'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-sm text-red-500">{error}</span>
      )}
    </div>
  );
}
```

---

## 🔗 Connecting to Backend API

### Create API Client

Create `src/lib/api.ts`:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Example API Call

```typescript
import api from '@/lib/api';

// Signup Step 1
export async function signupStep1(email: string, password: string) {
  const response = await api.post('/auth/signup/step1', {
    email,
    password,
  });
  return response.data;
}

// Login Step 1
export async function loginStep1(email: string, password: string) {
  const response = await api.post('/auth/login/step1', {
    email,
    password,
  });
  return response.data;
}
```

---

## 🌍 Environment Variables

Create `.env.local` in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 📚 Resources

- **Tailwind CSS v4 Docs**: https://tailwindcss.com/docs
- **Phosphor Icons**: https://phosphoricons.com/
- **Next.js 15 Docs**: https://nextjs.org/docs
- **React Hook Form**: https://react-hook-form.com/
- **Figma Design**: [DegreePlanAI](https://www.figma.com/design/aBL54lelwj4r2pm6KON3Kp/DegreePlanAI?node-id=2002-246&t=5wZBZwhg8RVIxyN3-1)

---

## ✅ Checklist

- [x] Tailwind CSS v4 configured
- [x] Brand colors added to theme
- [x] CSS variables defined
- [ ] Phosphor Icons installed
- [ ] Component folder structure created
- [ ] Button component created
- [ ] Input component created
- [ ] API client configured
- [ ] Environment variables set
- [ ] First signup page implemented

---

**Last Updated**: October 18, 2025  
**Status**: ✅ Frontend ready for component development

