# 🍽️ FoodSpotter — AI-Powered Restaurant Discovery Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-Backend-green?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Interactive_Maps-199900?style=for-the-badge&logo=leaflet)](https://leafletjs.com/)

**FoodSpotter** is a modern, full-stack restaurant discovery and exploration web application. It allows users to discover nearby eateries, view detailed information on an interactive map, and get **AI-generated review summaries** in seconds.

---

## ✨ Key Features

- 📍 **Smart Location-Based Discovery**: Automatically detects your current location or lets you search by custom coordinates/cities.
- 🗺️ **Interactive Leaflet Maps**: Real-time interactive map with custom pins and restaurant previews.
- 🤖 **AI Review Summarizer**: Summarizes hundreds of customer reviews into pros, cons, and a concise verdict powered by OpenRouter LLMs.
- 🔖 **Bookmark & Save Favorites**: Save your favorite dining spots to your personal collection backed by MongoDB.
- 🔍 **Dynamic Filtering & Sorting**: Filter by cuisine, distance, price range, ratings, and dietary preferences.
- ⚡ **Modern Responsive UI**: Built with Next.js 14, Tailwind CSS, and Framer Motion micro-animations.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Lucide Icons, Framer Motion
- **Maps**: Leaflet / React-Leaflet

### Backend
- **Server**: Node.js & Express with TypeScript (`ts-node-dev`)
- **Database**: MongoDB with Mongoose ORM
- **APIs**: Geoapify Places API / Overpass OpenStreetMap & OpenRouter AI

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or local MongoDB instance)
- API Keys:
  - [Geoapify API Key](https://www.geoapify.com/) (Free tier)
  - [OpenRouter API Key](https://openrouter.ai/) (For AI summaries)

### 2. Clone the Repository
```bash
git clone https://github.com/<YOUR_GITHUB_USERNAME>/food-spotter.git
cd food-spotter
```

### 3. Environment Variables Setup

#### Backend (`/backend/.env`)
Copy the example file and fill in your keys:
```bash
cd backend
cp .env.example .env
```
Configure your `backend/.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEOAPIFY_API_KEY=your_geoapify_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=meta-llama/llama-3-8b-instruct:free
```

#### Frontend (`/frontend/.env.local` or Root `.env.local`)
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api
```

---

### 4. Install Dependencies & Run

#### Start Backend
```bash
cd backend
npm install
npm run dev
```
> Backend runs at `http://localhost:5000`

#### Start Frontend
```bash
# In the root or frontend directory
npm install
npm run dev
```
> Frontend runs at `http://localhost:3000`

---

## 📁 Project Structure

```
food-spotter/
├── backend/                # Express & TypeScript Backend
│   ├── src/
│   │   ├── config/         # Database and environment configurations
│   │   ├── models/         # Mongoose schemas (Restaurant, Review, Saved)
│   │   ├── routes/         # API routes (places, reviews, AI summary)
│   │   ├── services/       # External API integrations (Geoapify, OpenRouter)
│   │   └── server.ts       # Express app entry point
│   ├── .env.example
│   └── package.json
├── src/                    # Next.js Frontend
│   ├── app/                # App router pages and API endpoints
│   ├── components/         # Reusable UI, Map & Restaurant components
│   ├── types/              # TypeScript interface definitions
│   └── lib/                # Client helper utilities
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🔒 Security Note
All sensitive tokens (API keys, MongoDB credentials) are managed via `.env` files and strictly excluded from Git commits via `.gitignore`.

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
