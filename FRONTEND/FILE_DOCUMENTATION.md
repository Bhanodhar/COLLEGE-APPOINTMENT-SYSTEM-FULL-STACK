# College Appointment System - Frontend Documentation

## Project Structure Overview

This is a React + Vite application built for college appointment booking between students and professors. It uses JWT authentication and role-based access control.

---

## 📁 Root Configuration Files

### `vite.config.js`

- Vite build configuration for development and production
- Sets up dev server and build output

### `package.json`

- Dependencies: React 18, React Router (navigation), Axios (HTTP), Tailwind CSS (styling), Lucide Icons, React Hot Toast (notifications)
- Scripts: `dev` (local development), `build` (production build), `preview` (test production build)

### `tailwind.config.cjs` & `postcss.config.cjs`

- Tailwind CSS styling framework configuration

### `.eslintrc.js`

- ESLint code linting rules (to catch errors)

### `index.html`

- Main HTML file that loads React app

---

## 🎨 Frontend Source `/src/`

### **Main Application File**

#### `App.jsx`

**Purpose:** Root routing component - sets up all application pages  
**What it does:**

- Defines public routes: Home (`/`), Login, Register
- Defines student-only routes: Find Professors, Book Appointment, My Appointments
- Defines professor-only routes: Manage Availability, View Appointments
- Wraps entire app with `AuthProvider` for authentication context

---

### **🔐 Authentication System** `/contexts/`

#### `AuthContext.jsx`

**Purpose:** Global authentication state management  
**Key functionality:**

- Stores current logged-in user info (name, email, role, Id)
- Handles login/logout/register operations
- Saves JWT token to browser localStorage
- Checks if token expired using jwt-decode
- Provides `useAuth()` hook for any component to access user info
- Provides `AuthProvider` wrapper component

---

### **🛡️ Route Protection**

#### `ProtectedRoute.jsx`

**Purpose:** Guard private routes - only authenticated users can access  
**What it does:**

- Redirects unauthenticated users to login page
- Checks if user has required role (student/professor) before showing page
- Shows loading spinner while checking authentication

---

### **📡 API Communication** `/services/`

#### `api.js`

**Purpose:** Configured HTTP client for all backend communication  
**Key features:**

- Sets base URL to backend server
- Automatically adds JWT token to every request header
- Catches 401 (unauthorized) and redirects to login
- Shows error notifications for failed requests

#### `authService.js`

**Purpose:** User registration & login functions  
**Methods:**

- `register(userData)` - Create new user account
- `login(email, password)` - Sign in user, save token
- `getMe()` - Get current logged-in user info

#### `appointmentService.js`

**Purpose:** Appointment booking & management  
**Methods:**

- `book(appointmentData)` - Student books appointment
- `cancel(appointmentId)` - Cancel existing appointment
- `getStudentAppointments()` - Get user's bookings (if student)
- `getProfessorAppointments()` - Get professor's appointments (if professor)

#### `availabilityService.js`

**Purpose:** Professor availability slot management  
**Methods:**

- `create(slotData)` - Professor creates available time slot
- `getProfessorAvailability(professorId)` - See professor's open slots
- `getMyAvailability()` - Professor sees own created slots
- `deleteSlot(slotId)` - Delete/cancel availability slot

#### `userService.js`

**Purpose:** Get list of professors  
**Methods:**

- `getProfessors()` - List all professors
- `getProfessor(professorId)` - Get specific professor details

#### `index.js`

**Purpose:** Export all services in one place  
**What it does:** Re-exports appointmentService, authService, availabilityService, userService

---

### **🎯 Components** `/components/`

#### `NavBar.jsx`

**Purpose:** Top navigation bar showing on every page  
**Display logic:**

- If logged in: Shows user name & role, logout button
- If logged out: Shows Login & Register links

#### `Footer.jsx`

**Purpose:** Simple footer at bottom of every page  
**Displays:** Copyright year

#### `Hero.jsx`

**Purpose:** Welcome banner on homepage for non-logged-in users  
**Display:**

- Project title and description
- Call-to-action buttons (Login/Register)
- Sample professor cards for visual preview
- GSAP animations (optional, can be disabled)

---

### **📄 Pages** `/pages/`

#### `Home.jsx` (DELETED - Was unused)

#### `NotFound.jsx`

**Purpose:** 404 page when user visits non-existent route  
**Displays:** "Page not found" message with link to home

#### `Login.jsx`

**Purpose:** User sign-in page  
**Fields:** Email, Password  
**On submit:** Calls `login()` function, saves token, redirects to dashboard

#### `Register.jsx`

**Purpose:** Create new user account  
**Features:**

- Email, Password input fields
- Role selection: Student or Professor
- If Student role: Shows Student ID field
- If Professor role: Shows Department & Qualification fields

#### `Dashboard.jsx`

**Purpose:** Main page after login showing role-based menu  
**For Students:**

- Button: "Find Professors & Book Appointment"
- Button: "My Appointments"
- Button: "Professor List"

**For Professors:**

- Button: "Manage Availability"
- Button: "My Appointments"

#### `MyAppointments.jsx`

**Purpose:** Show all appointments for the logged-in user  
**For Students:** Display appointments they booked with professors, option to cancel  
**For Professors:** Display all student appointments, option to cancel  
**Features:** Search by professor/student name, filter by status (pending/confirmed/cancelled), filter by date

---

### **👨‍🎓 Student Pages** `/pages/student/`

#### `BookAppointment.jsx`

**Purpose:** Main page for students to book appointments with professors  
**Layout:** 3-column design:

- **Left:** Professor search/list
- **Middle:** Professor's available time slots
- **Right:** Booking form requesting appointment reason
  **Flow:** Select professor → See available times → Select slot → Enter reason → Book

---

### **👨‍🏫 Professor Pages** `/pages/professor/`

#### `ProfessorAppointments.jsx`

**Purpose:** Professor sees all student appointments with them  
**Display:** Shows student name, email, appointment time, status  
**Action:** Can cancel appointments (which removes the booking)

#### `ProfessorAvailability.jsx`

**Purpose:** Professor manages their available time slots for bookings  
**Create slot:** Pick start date/time and end date/time → Create  
**Display:** Shows all created slots, prevents deletion if slot is already booked  
**Delete:** Can delete availability slots to no longer accept bookings

---

### **📦 Old/Deleted Components**

These were removed for being unused or redundant:

| File                                | Reason                                          |
| ----------------------------------- | ----------------------------------------------- |
| `/src/api/`                         | Old API folder - replaced with `/services/`     |
| `/src/context/`                     | Old context folder                              |
| `src/components/Input.jsx`          | Unused custom input wrapper                     |
| `src/components/Button.jsx`         | Unused custom button wrapper                    |
| `src/components/Debug.jsx`          | Debug component for development                 |
| `src/components/common/`            | Unused navbar/sidebar components                |
| `src/layouts/Layout.jsx`            | Unused layout wrapper                           |
| `src/pages/Home.jsx`                | Replaced by dashboard                           |
| `src/pages/StudentAppointments.jsx` | Replaced by MyAppointments.jsx                  |
| `src/pages/StudentDashboard.jsx`    | Replaced by Dashboard.jsx                       |
| Various professor/\* pages          | Old professor pages replaced with new structure |

---

## 🔄 Authentication Flow

1. **New User:** Clicks Register → Fills form with email/password/role/details → Account created, token saved
2. **Returning User:** Clicks Login → Enters email/password → Token saved to localStorage
3. **Every Page Load:** AuthContext checks if token exists and is valid, redirects to login if not
4. **Every API Request:** `api.js` automatically adds bearer token to request header
5. **Session Expiry:** If backend returns 401, user redirected to login
6. **Logout:** Token removed from localStorage, user redirected to login

---

## 🎨 Styling

**Framework:** Tailwind CSS (utility-first CSS)  
**How it works:** Classes like `flex`, `bg-white`, `px-4`, `text-center` directly style elements

---

## 🔧 Development

**Start dev server:**

```bash
npm run dev
```

Starts local development server at http://localhost:5173

**Build for production:**

```bash
npm run build
```

Creates optimized `/dist` folder ready for deployment

---

## 📝 Key Concepts for Beginners

| Term                | Meaning                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------ |
| **Context API**     | React way to share data globally without passing props through every component             |
| **useAuth Hook**    | Custom function that lets any component easily access user info and authentication methods |
| **Route**           | URL path like `/login` or `/professors` that loads a different page                        |
| **Protected Route** | Page that only shows if user is logged in and has correct role                             |
| **Service**         | File containing functions that call backend API endpoints                                  |
| **Interceptor**     | Automatically runs code before/after every API request (we use it to add token)            |
| **JWT Token**       | Encrypted user ID that backend gives us to prove we're logged in                           |
| **localStorage**    | Browser storage that keeps data even after page refresh                                    |

---

## 🚀 To Run the Application

1. **Start Backend:** (in BACKEND folder)

   ```bash
   npm run dev
   ```

2. **Start Frontend:** (in FRONTEND folder)

   ```bash
   npm run dev
   ```

3. **Open Browser:** Go to http://localhost:5173

4. **Register & Login:** Create account with role (student/professor)

5. **Use App:**
   - Students: Browse professors and book appointments
   - Professors: Create availability slots and see bookings

---

**All code has been rewritten with beginner-friendly comments explaining each section!** 🎉
