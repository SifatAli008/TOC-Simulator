# 🔥 Vercel Environment Variables Setup

## 🚨 **URGENT: Add Firebase Environment Variables**

Your deployment is failing because Firebase environment variables are missing in Vercel. Here's how to fix it:

## 🔧 **Step 1: Go to Vercel Dashboard**

1. **Visit**: https://vercel.com/sifatali008s-projects/toc-simulator
2. **Click**: Settings tab
3. **Click**: Environment Variables (left sidebar)

## 🔑 **Step 2: Add These Environment Variables**

Click **"Add New"** for each variable:

### **Production Environment Variables**
```bash
NEXT_PUBLIC_FIREBASE_API_KEY = [YOUR_NEW_FIREBASE_API_KEY]
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = [YOUR_PROJECT].firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = [YOUR_PROJECT_ID]
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = [YOUR_PROJECT].firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = [YOUR_SENDER_ID]
NEXT_PUBLIC_FIREBASE_APP_ID = [YOUR_APP_ID]
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = [YOUR_MEASUREMENT_ID]
```

## 🔥 **Step 3: Get Firebase Configuration**

1. **Go to**: [Firebase Console](https://console.firebase.google.com/)
2. **Select your project** or create a new one
3. **Click**: Project Settings (gear icon)
4. **Scroll to**: "Your apps" section
5. **Click**: Web app icon or "Add app" if none exists
6. **Copy**: Configuration values
7. **Paste**: Each value into Vercel environment variables

## ⚙️ **Step 4: Environment Settings**

For each environment variable in Vercel:
- **Environment**: Select "Production", "Preview", and "Development"
- **Value**: Paste your Firebase configuration value
- **Click**: Save

## 🚀 **Step 5: Redeploy**

After adding all environment variables:
1. **Go to**: Deployments tab in Vercel
2. **Click**: "Redeploy" on the latest deployment
3. **Or**: Make a new commit to trigger automatic deployment

## ✅ **Expected Result**

With environment variables configured:
- ✅ Build will complete successfully
- ✅ Firebase functionality will work
- ✅ TOC Simulator will be fully functional
- ✅ No more "Missing required Firebase environment variables" errors

## 🔍 **Verify Setup**

You can verify the environment variables are working by:
1. Checking the deployment logs show no Firebase errors
2. Testing Firebase features in your deployed app
3. Confirming no console errors related to Firebase

---

**Status**: ⚠️ **ENVIRONMENT VARIABLES REQUIRED**  
**Priority**: 🚨 **URGENT** - Deployment will fail without these variables
