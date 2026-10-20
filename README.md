# Chow9ja 🍲 - Authentic Nigerian Food Delivery Web App

A high-performance universal web application built with **React Native / Expo Web**, **Expo Router**, and **Supabase** (PostgreSQL & Authentication).

---

## 🌟 Key Features

- **🍲 Naija Delicacies Catalogue**: Firewood Smokey Jollof Rice, Slow-roasted Beef Suya, Egusi & Pounded Yam, Fried Plantains (Dodo), and freshly prepared soups.
- **⚡ Custom Meal Customization**: Select protein cuts (Chef Assorted Meats, Goat Meat, Fried Fish), swallow varieties, portion sizes, and chef preparation instructions.
- **🔒 Real Supabase Authentication**: Role-separated sign-in and sign-up (Customer vs Kitchen Admin) backed by PostgreSQL Row Level Security (RLS) and database triggers.
- **⚙️ Kitchen Operations Portal (Admin)**: Real-time order dispatch board, dynamic live price updating, and meal availability toggles.
- **📍 Delivery Address Management**: Multiple delivery addresses with default flags, landmarks, and campus hostel support.
- **📱 Fully Responsive Design**: Mobile-first architecture that seamlessly adapts into a clean, centered desktop layout with high-contrast warm chocolate & cream Nigerian aesthetic.
- **🚀 Vercel & Web Ready**: Fully configured static export with single-page application (SPA) rewrites and optimized asset headers.

---

## 🛠️ Tech Stack

- **Framework**: Expo (SDK 52) / React Native Web
- **Routing**: Expo Router (File-based routing with `+html.tsx` and `+not-found.tsx`)
- **Backend**: Supabase (PostgreSQL, Auth, RLS Policies)
- **Styling**: Vanilla CSS tokens & StyleSheet with Nigerian brand theme
- **Deployment**: Vercel (`vercel.json`) / GitHub Actions

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or later)
- npm or bun

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Ensure your Supabase project keys are configured:
```env
EXPO_PUBLIC_SUPABASE_URL=https://oysomwevajgyooiczply.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Run Development Server
```bash
npm run web
# or
npx expo start --web
```

---

## 📦 Production Web Build

To generate the static production web bundle:
```bash
npm run build
# or
npx expo export --platform web
```
The output will be placed in the `dist/` directory.

---

## 🌐 Deploying to Vercel

### Method A: Via Vercel Web Dashboard (Recommended)
1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: configure expo web app for vercel deployment"
   git branch -M main
   git remote add origin https://github.com/<your-username>/chow9ja.git
   git push -u origin main
   ```
2. Log into [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your `chow9ja` GitHub repository.
4. Vercel will automatically read `vercel.json`:
   - **Build Command**: `npx expo export --platform web`
   - **Output Directory**: `dist`
5. In **Environment Variables**, add:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
6. Click **Deploy**.

### Method B: Via Vercel CLI
```bash
npm i -g vercel
vercel
```

---

## 🛡️ License
MIT License.
