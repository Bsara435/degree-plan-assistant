# UI & Frontend Progress

## Overview
This document tracks the UI/UX design and frontend implementation progress for the Degree Plan Assistant application.

---

## Current Status: 🎨 **DESIGN IN PROGRESS**

The signup user interface has been designed in Figma and is ready for frontend implementation.

---

## Design System

### Color Palette

The application uses a professional blue-themed color palette:

| Color Code | Usage | Preview |
|------------|-------|---------|
| `#0345A0` | Primary Blue - Main brand color, primary buttons, headers | ![#0345A0](https://via.placeholder.com/100x30/0345A0/FFFFFF?text=0345A0) |
| `#12084B` | Dark Navy - Dark accents, text on light backgrounds | ![#12084B](https://via.placeholder.com/100x30/12084B/FFFFFF?text=12084B) |
| `#B1B1B1` | Light Gray - Secondary text, borders, disabled states | ![#B1B1B1](https://via.placeholder.com/100x30/B1B1B1/000000?text=B1B1B1) |

### Typography & Colors in CSS

```css
:root {
  /* Primary Colors */
  --primary-blue: #0345A0;
  --dark-navy: #12084B;
  --light-gray: #B1B1B1;
  
  /* Additional shades (if needed) */
  --primary-blue-light: #0557CC;
  --primary-blue-dark: #023380;
}
```

---

## Icon System

### Phosphor Icons

The application uses **Phosphor Icons** for all SVG icons and graphics.

- **Icon Library**: [Phosphor Icons](https://phosphoricons.com/?q=arrow&size=16)
- **Style**: Clean, modern, and consistent
- **Weights Available**: Thin, Light, Regular, Bold, Fill, Duotone
- **License**: MIT (Free for commercial use)

**Installation** (for React/Next.js):
```bash
npm install phosphor-react
# or
npm install @phosphor-icons/react
```

**Usage Example**:
```jsx
import { ArrowRight, User, EnvelopeSimple } from "@phosphor-icons/react";

<ArrowRight size={24} color="#0345A0" weight="bold" />
```

---

## Figma Designs

### Signup Flow Design

The complete signup user interface has been designed in Figma, including:
- Step 1: Email & Password Registration
- Step 2: Email Verification
- Step 3: Profile Completion

**Figma Project Link**: [DegreePlanAI - Signup Design](https://www.figma.com/design/aBL54lelwj4r2pm6KON3Kp/DegreePlanAI?node-id=2002-246&t=5wZBZwhg8RVIxyN3-1)

**Design Features**:
- ✅ Complete 3-step signup flow
- ✅ Responsive layouts
- ✅ Consistent color scheme
- ✅ Phosphor Icons integration
- ✅ Form validation states
- ✅ Loading states
- ✅ Error messages
- ✅ Success confirmations

---

## Implementation Status

### Completed ✅
- [x] Signup flow UI design in Figma
- [x] Color palette definition
- [x] Icon system selection (Phosphor Icons)

### In Progress 🔄
- [ ] Frontend implementation of signup flow
- [ ] Component library setup
- [ ] Responsive design implementation

### Planned 📋
- [ ] Login flow UI design
- [ ] Dashboard design
- [ ] Degree plan builder UI
- [ ] User profile pages
- [ ] Admin panel design
- [ ] Mobile responsive views

---

## Design Specifications

### Signup Pages

#### Page 1: Email & Password Registration
- Email input field
- Password input field
- "Sign Up" button (Primary Blue)
- Link to login page
- Form validation indicators

#### Page 2: Email Verification
- 6-digit code input
- Resend code button
- Verification status indicators
- Success/error messages

#### Page 3: Profile Completion
- Full name input
- School dropdown (SSE, SSAH, SBA)
- Major input (for students)
- Classification dropdown (for students)
- Role selection
- "Complete Profile" button

---

## Frontend Technology Stack

### Recommended Stack
- **Framework**: Next.js 14+ (React)
- **Styling**: Tailwind CSS
- **Icons**: Phosphor Icons
- **State Management**: React Context API / Zustand
- **Form Handling**: React Hook Form
- **API Client**: Axios / Fetch
- **UI Components**: Custom components based on Figma designs

---

## Design Guidelines

### Button Styles
```css
/* Primary Button */
background: #0345A0;
color: white;
border-radius: 8px;
padding: 12px 24px;
font-weight: 600;

/* Secondary Button */
background: transparent;
color: #0345A0;
border: 2px solid #0345A0;
border-radius: 8px;
padding: 12px 24px;
```

### Input Fields
```css
border: 1px solid #B1B1B1;
border-radius: 8px;
padding: 12px 16px;
font-size: 16px;

/* Focus State */
border-color: #0345A0;
outline: none;
box-shadow: 0 0 0 3px rgba(3, 69, 160, 0.1);
```

---

## Accessibility Considerations

- [ ] WCAG 2.1 Level AA compliance
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Color contrast ratios meet standards
- [ ] Focus indicators on all interactive elements
- [ ] Error messages are descriptive and helpful

---

## Responsive Breakpoints

```css
/* Mobile First Approach */
--mobile: 320px;
--tablet: 768px;
--desktop: 1024px;
--large-desktop: 1440px;
```

---

## Next Steps

1. 🎨 **Review Figma designs** with team
2. 💻 **Set up Next.js project** with Tailwind CSS
3. 🔨 **Implement signup components** based on Figma designs
4. 🧪 **Test UI/UX** with real users
5. 🎨 **Design login flow** in Figma
6. 📱 **Optimize for mobile** devices

---

## Resources

- **Figma Project**: [DegreePlanAI Design](https://www.figma.com/design/aBL54lelwj4r2pm6KON3Kp/DegreePlanAI?node-id=2002-246&t=5wZBZwhg8RVIxyN3-1)
- **Icon Library**: [Phosphor Icons](https://phosphoricons.com/)
- **Color Palette Tool**: [Coolors.co](https://coolors.co/)
- **Tailwind CSS**: [Tailwind Documentation](https://tailwindcss.com/docs)

---

---

## Branding Assets

### CLE Logo

The application includes the CLE (Center for Language Enhancement) logo from Al Akhawayn University.

- **Logo Source**: [CLE Logo (White Version)](https://cle.aui.ma/wp-content/uploads/2022/06/logo-cle-white.png)
- **Usage**: Footer, partnership acknowledgments, about page
- **Format**: PNG with transparent background
- **Color**: White version for dark backgrounds

**Logo Display**:
```jsx
<img 
  src="https://cle.aui.ma/wp-content/uploads/2022/06/logo-cle-white.png" 
  alt="CLE - Center for Language Enhancement Logo"
  className="h-12 w-auto"
/>
```

---

## Recent Updates

### Chat UI Improvements (Current Session)

#### ✅ Completed Features

1. **Enhanced Chat Interface**
   - Sender messages displayed on the right with blue gradient
   - Receiver messages displayed on the left with white background
   - Avatar circles with user initials for visual identification
   - Improved message bubble styling with rounded corners
   - Read receipt indicators for sent messages
   - Typing indicator with animated dots
   - Modern, clean design following messaging app patterns

2. **File Upload Functionality**
   - Added `+` button for file uploads
   - Supports images, PDFs, and Word documents
   - Ready for API integration
   - Styled to match chat interface

3. **Dynamic Landing Pages**
   - Removed static/hardcoded message data
   - Advisor and mentor pages now fetch real conversations
   - Shows 5 most recent conversations
   - Displays unread message indicators
   - Proper timestamp formatting (e.g., "2h ago", "Yesterday")
   - Loading and empty states

4. **Major Enum Validation Fix**
   - Fixed validation errors for "Business Administration" and other common major names
   - Added comprehensive alias mappings
   - Automatic normalization to full enum values
   - Backward compatible with existing data

#### Files Modified
- `frontend/app/(main)/home/page.tsx` - Dynamic conversations
- `frontend/app/(main)/chat/[id]/page.tsx` - Enhanced chat UI
- `backend/src/models/User.js` - Major enum aliases

#### Design Improvements
- **Color Scheme:**
  - Sender: Blue gradient (`#0345A0` to `#2F41AA`)
  - Receiver: White with gray border
  - Avatars: Gradient backgrounds (blue for sender, emerald for receiver)

- **UI Elements:**
  - Improved header with user avatar and online status
  - Better date separators with pill-style badges
  - Enhanced input styling with focus states
  - Icon-based send button (paper plane)
  - Modern spacing and shadows

For detailed documentation, see: [Chat UI Improvements Documentation](../CHAT-UI-IMPROVEMENTS.md)

---

**Last Updated**: Current Session  
**Designer**: Design Team  
**Status**: ✅ Signup UI designed and ready for implementation | ✅ Chat UI improvements completed