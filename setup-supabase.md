# Supabase Local Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- Docker Desktop (for local Supabase)

## Installation Steps

### 1. Install Supabase CLI
```bash
npm install -g supabase
```

### 2. Start Supabase Locally
```bash
# Start Supabase services
supabase start

# This will output the local URL and anon key
# Copy these values to your .env file
```

### 3. Create .env file
Create a `.env` file in the root directory with:
```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<your_local_anon_key>
```

### 4. Run the Application
```bash
npm run dev
```

## Alternative: Use Default Values
The app now has default values for local development, so you can run it without setting up Supabase immediately. The app will show a connection error if Supabase is not running, but you can still see the UI structure.

## Troubleshooting
- Make sure Docker Desktop is running
- Check that ports 54321-54329 are available
- If you get connection errors, try restarting Supabase: `supabase stop && supabase start` 