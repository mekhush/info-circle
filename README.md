
## 📌 Initial Setup (After Cloning)

```bash
git clone <repository-url>
cd <project-folder>
npm install
npm run dev
```

---

# 🌿 Branching Strategy

⚠️ Do NOT work directly on `main` branch.

Always create a new branch for your feature.

---

## 🟢 Step 1: Create a New Branch

Make sure you're on main first:

```bash
git checkout main
git pull origin main
```

Now create a new branch:

```bash
git checkout -b new-branch-name
```

Example:

* feature-auth
* feature-posts
* bugfix-navbar

---

## 🟢 Step 2: Work and Commit

After making changes:

```bash
git add .
git commit -m "Your commit message"
```

---

## 🟢 Step 3: Push New Branch to GitHub

First time pushing:

```bash
git push -u origin new-branch-name
```

After that, just use:

```bash
git push
```

---

# 🔄 Keeping Your Branch Updated

Before continuing work (every day):

```bash
git checkout main
git pull origin main
git checkout new-branch-name
git merge main
```

This ensures your branch has the latest updates.

---

# ✅ After Completing Your Work

1. Push your branch:

```bash
git push
```

2. Go to GitHub
3. Create a Pull Request
4. Merge into `main` after review

---

# 🧹 Optional: Delete Branch After Merge

```bash
git branch -d new-branch-name
git push origin --delete new-branch-name
```

---

# 🚨 Important Rules

* ❌ Never push directly to `main`
* ❌ Never delete `main`
* ❌ Never force push
* ✅ Always pull before starting work
* ✅ Always use feature branches
* ✅ Use clear commit messages

---

# 🚀 Info Circle – Frontend

A modern, responsive, role-based web application built using **React 18 + Vite 5 + Tailwind CSS 3.4**.

Designed with scalable architecture, premium UI principles, and a mobile-first approach.

---

## 🛠 Tech Stack

- ⚛️ React 18.2
- ⚡ Vite 5
- 🎨 Tailwind CSS 3.4
- 🔀 React Router DOM 6
- 🌐 Axios
- 🛠 ESLint + Prettier

---

## 📂 Project Architecture

```

src
├── assets/            → Static files (images, icons, logos)
│
├── components/        → Reusable UI components
│   ├── common/        → Navbar, Footer, Sidebar
│   ├── post/          → PostCard, PostForm
│   └── user/          → UserCard
│
├── pages/             → Route-level pages
│   ├── public/        → Landing, Login, Signup
│   ├── user/          → Home, Profile, CreatePost
│   └── admin/         → Dashboard, UserList, PostList
│
├── services/          → Axios API configuration & endpoints
├── context/           → Global state management (AuthContext)
├── routes/            → Protected & Admin route logic
├── utils/             → Constants, helpers
│
├── App.jsx            → Root component
└── main.jsx           → Entry point

````

---

## ✨ Core Features

### 👤 User Module

- Modern Landing Page
- Secure Login & Registration
- JWT-Based Role Authentication
- Create, Edit & Delete Posts
- Personal Profile Management
- Fully Responsive (Mobile-First Design)

---

### 🛠 Admin Module

- Dedicated Admin Dashboard
- Manage Users
- Manage Posts
- Category Management
- Add / Remove Admin

---

## ⚙️ Installation Guide

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/info-circle.git
cd info-circle
````

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Start Development Server

```bash
npm run dev
```

Open in browser:

```
http://localhost:5173
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

> ⚠️ In Vite, environment variables must start with `VITE_`

---

## 🧪 Production Build

Create optimized production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## 📱 Responsive Design Strategy

This project follows:

* Mobile-first approach
* Tailwind breakpoints (`sm`, `md`, `lg`, `xl`)
* Flexible grid-based layout
* Future-ready for mobile conversion

---

## 📦 Dependency Management

Dependencies are managed using:

* `package.json`
* `package-lock.json`

This ensures consistent versions across all team members.

---

## 👥 Team Workflow

* `main` → Production-ready code
* Feature branches → New features
* Pull requests → Code review before merge

---

## 🚀 Future Enhancements

* Progressive Web App (PWA)
* React Native Mobile Version
* Dark Mode Support
* Notification System

---

## 👨‍💻 Authors

Developed by:

* Mallikarjun jamabar
* Kushal B
* Sandeep B

---

⭐ If you like this project, give it a star!