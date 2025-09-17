# 🔐 GitHub Secrets Setup Guide

## ⚠️ URGENT: Required for Deployment

Your Vercel deployment is failing because GitHub secrets are not configured. Follow these steps **immediately**:

## 🚀 Step 1: Navigate to GitHub Secrets

**Click this link**: [GitHub Secrets Settings](https://github.com/SifatAli008/TOC-Simulator/settings/secrets/actions)

Or manually go to:
1. https://github.com/SifatAli008/TOC-Simulator
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)

## 🔑 Step 2: Add Required Secrets

Click **"New repository secret"** for each of these:

### Vercel Deployment Secrets
```
Name: VERCEL_TOKEN
Value: 4QoNVvLgxcN4UlrAeWXBn8Zc

Name: VERCEL_ORG_ID  
Value: team_9eEABLbyiHLdJRpp2L5GTlZF

Name: VERCEL_PROJECT_ID
Value: prj_9Ec6A6C4B53fKo31K18r1bNdPARB
```

### Firebase Configuration Secrets
⚠️ **IMPORTANT**: Get NEW values from Firebase Console (old key was compromised)

```
Name: NEXT_PUBLIC_FIREBASE_API_KEY
Value: [GET NEW VALUE FROM FIREBASE CONSOLE]

Name: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
Value: [YOUR_PROJECT].firebaseapp.com

Name: NEXT_PUBLIC_FIREBASE_PROJECT_ID
Value: [YOUR_PROJECT_ID]

Name: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
Value: [YOUR_PROJECT].firebasestorage.app

Name: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
Value: [YOUR_SENDER_ID]

Name: NEXT_PUBLIC_FIREBASE_APP_ID
Value: [YOUR_APP_ID]

Name: NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
Value: [YOUR_MEASUREMENT_ID]
```

## 🔥 Step 3: Get New Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Project Settings** (gear icon)
4. Scroll to **"Your apps"** section
5. Click on your web app
6. Copy the config values
7. Add each value as a GitHub secret

## ✅ Step 4: Verify Setup

After adding all secrets, you should have **10 total secrets**:
- 3 Vercel secrets
- 7 Firebase secrets

## 🚀 Step 5: Test Deployment

1. Make any small change to your code
2. Commit and push to main branch:
   ```bash
   git add .
   git commit -m "test: trigger deployment with secrets"
   git push origin main
   ```
3. Check the **Actions** tab to see if deployment succeeds

## 🔍 Common Issues

### "No existing credentials found"
- **Solution**: Make sure `VERCEL_TOKEN` secret is added exactly as shown

### "Project not found" 
- **Solution**: Verify `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are correct

### "Firebase initialization error"
- **Solution**: Ensure all Firebase secrets are added and values are correct

### "Environment variables missing"
- **Solution**: Double-check all 7 Firebase environment variables are set

## 📋 Quick Checklist

- [ ] Added `VERCEL_TOKEN` secret
- [ ] Added `VERCEL_ORG_ID` secret  
- [ ] Added `VERCEL_PROJECT_ID` secret
- [ ] Got NEW Firebase configuration (old key was compromised)
- [ ] Added all 7 Firebase environment variables
- [ ] Tested deployment by pushing a commit
- [ ] Verified deployment succeeds in Actions tab

## 🎯 Expected Result

Once all secrets are configured:
- ✅ CI pipeline will pass all checks
- ✅ Deployment to Vercel will succeed
- ✅ Production URL will be generated
- ✅ TOC Simulator will be live at: `https://toc-simulator-[hash].vercel.app`

## 🆘 Need Help?

If you're still seeing errors after adding secrets:
1. Double-check secret names match exactly (case-sensitive)
2. Verify secret values don't have extra spaces
3. Make sure you're adding them as **repository secrets**, not environment secrets
4. Try triggering a new deployment by making a small commit

---

**Status**: ⚠️ **SECRETS REQUIRED**  
**Priority**: 🚨 **URGENT** - Deployment blocked until secrets are configured
