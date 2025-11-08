# 🧠 Overview

This project is a **modern, responsive Quiz Platform** built with **React** and **TypeScript**. It features two main roles:

- **User**: Takes quizzes and views results.
- **Admin**: Manages quizzes, uploads content, and monitors activity.



---

## 🚀 Run Locally

### **Prerequisites**

- [Node.js](https://nodejs.org/)

### **Setup Steps**

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set your API key:** Open `.env.local` and set:

   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the app:**

   ```bash
   npm run dev
   ```

Your app will now be live locally!

---

## 🌟 Core Features

### **User Mode**

- Simple login (name linked to IP).
- Choose from available quizzes.
- Support for **MCQ**, **True/False**, and **Fill-in-the-Blank** questions.
- Real-time timers (per-quiz or per-question).
- Instant feedback and explanations.
- Auto submission on exit.
- Detailed results with score, stats, and review option.
- Download results as image or text file.

### **Admin Mode**

- Password-protected access.
- Dashboard for managing quizzes and attempts.
- Upload quizzes via **JSON file or text input**.
- View all user attempts with device type and IP tracking.
- Detect suspicious activity (e.g., multiple users on the same IP).

### **General Features**

- **Dark Mode toggle**.
- **Responsive design** for all devices.
- **Offline persistence** using localStorage.

---

## 📁 Project Structure

```
.
├── App.tsx                  # Main app, router, and state manager
├── components/              # Reusable UI components
│   ├── DarkModeToggle.tsx   # Toggle for light/dark mode
│   └── Icons.tsx            # SVG icons
├── hooks/                   # Custom React Hooks
│   └── useLocalStorage.ts   # Persistent localStorage state hook
├── pages/                   # App pages
│   ├── AdminDashboard.tsx   # Admin interface
│   ├── HomePage.tsx         # Login and quiz selection
│   ├── QuizPage.tsx         # Quiz-taking experience
│   └── ResultPage.tsx       # Results and review screen
├── utils/                   # Helper functions
│   └── helpers.ts           # Utility helpers (shuffle, format time, etc.)
├── index.html               # Entry HTML file
├── index.tsx                # App entry point
├── metadata.json            # App metadata
└── types.ts                 # TypeScript data definitions
```

---

## 🧩 Part 1: Foundation

### **types.ts – The Data Blueprint**

Defines all major data structures:

- **Question:** Holds text, type, options, correct answer, and note.
- **TimerConfig:** Controls quiz timing (per-question or total).
- **Quiz:** Contains metadata, configuration, and questions.
- **User:** Tracks username, IP, and device type.
- **QuizAttempt:** Records full attempt data for admin review.

### **index.html – The Entry Point**

- Loads **Tailwind CSS** via CDN.
- Includes **html2canvas** for image downloads.
- Renders the app into `<div id="root">`.

### **index.tsx – Starting the App**

Mounts the React app and connects it to the HTML root.

---

## ⚙️ Part 2: Core Architecture & State Management

### **hooks/useLocalStorage.ts**

A custom hook providing persistent state using the browser’s localStorage.

- Reads and writes data automatically.
- Saves user sessions, quizzes, and attempts locally.

### **App.tsx – The Conductor**

Controls overall app state, routing, and authentication.

- **view:** Manages page navigation (home, quiz, result, admin).
- **user:** Holds current user info.
- **activeQuiz:** Tracks selected quiz.
- **lastAttempt:** Stores the latest quiz result.

Includes authentication for both users and admins, with routing handled via state changes.

---

## 🧭 Part 3: The User Journey

### **HomePage.tsx**

- Fetches IP address for login.
- Remembers usernames via IP.
- Displays available quizzes.
- Starts selected quiz.

### **QuizPage.tsx**

- Handles all quiz interactions.
- Saves state persistently per user.
- Supports real-time countdown timers.
- Displays instant feedback after submission.
- Automatically grades and records results.

### **ResultPage.tsx**

- Displays scores and review options.
- Allows downloading results as **image** or **text**.

---

## 🧑‍💼 Part 4: The Admin Experience

### **AdminDashboard.tsx**

- Manage all quizzes and view attempts.
- Upload new quizzes (via JSON or text input).
- Displays attempts in a table format.
- Monitors suspicious IP activity using built-in filters.

---

## 🔧 Recreating in Flutter

Want to port this to **Flutter**? Here’s how:

- Convert `types.ts` interfaces to Dart classes.
- Use `shared_preferences` or `hive` for data persistence.
- Replace React’s router logic with Flutter’s Navigator.
- Tailwind utilities map to widget properties (e.g., `p-8` → `EdgeInsets.all(32)`).
- Use `http` for IP fetching and `screenshot` for image exports.

