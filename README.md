# Store Rating Web Application

A full-stack role-based store rating platform built for the **FullStack Intern Coding Challenge**.

## 🛠️ Tech Stack
* **Database:** PostgreSQL (Hosted on Supabase)
* **Backend:** Node.js + Express.js
* **Frontend:** React.js + Vite + Lucide Icons

---

## 🚀 Quick Setup & Run Instructions

### 1. Backend Setup
1. Open a terminal and navigate to `backend`:
   ```bash
   cd backend
   npm install
   ```
2. Verify your `.env` file inside the `backend` folder:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://postgres.atouzgnpusxqpsmplftf:<YOUR-DATABASE-PASSWORD>@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres
   JWT_SECRET=super_secret_jwt_key_store_rating_2024
   ```
3. Start the backend:
   ```bash
   npm start
   ```
   *(The server will automatically connect to Supabase, create any missing tables, and seed a default Admin user).*

### 2. Frontend Setup
1. Open another terminal and navigate to `frontend`:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser at `http://localhost:3000`.

---

## 🔑 Pre-Configured Accounts

### Default System Administrator:
* **Email:** `admin@storerating.com`
* **Password:** `Admin@123456`

---

## 📋 Features Implemented

### 1. System Administrator
* **Dashboard:** Total counts for Users, Stores, and Ratings.
* **Store Management:** Add new stores with name, email, and address.
* **User Management:** Add new users (Admin, Normal User, Store Owner).
* **Listing & Filters:**
  * Stores list with sorting on Name, Email, Address, and Rating.
  * Users list with sorting on Name, Email, Address, and Role.
  * Real-time filtering by Name, Email, Address, and Role.
  * View User details (if Store Owner, displays their store rating).
* **Logout.**

### 2. Normal User
* **Registration & Login:** Self signup page with form validations.
* **Password Management:** Update password from any screen.
* **Store Browsing:** View all stores with overall ratings & reviews count.
* **Search:** Search stores by Name and Address.
* **Ratings:**
  * Submit new rating (1 to 5 stars).
  * Modify existing rating.
* **Logout.**

### 3. Store Owner
* **Login & Dashboard:**
  * View store overall average rating & total reviews.
  * View list of all users who rated their store.
  * Sort rating submissions by User Name, Email, Rating, and Date.
* **Password Management:** Update password.
* **Logout.**

---

## 🔒 Form Validations (Strict Compliance)
* **Name:** Min 20 characters, Max 60 characters.
* **Address:** Maximum 400 characters.
* **Password:** 8-16 characters, must include at least 1 uppercase letter and 1 special character.
* **Email:** Standard email format validation.
