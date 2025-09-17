# Vercel Deployment Setup

## 🚀 Required GitHub Secrets

To enable automatic deployment to Vercel, you need to configure the following secrets in your GitHub repository:

### Navigate to GitHub Secrets
1. Go to: **https://github.com/SifatAli008/TOC-Simulator**
2. Click: **Settings** → **Secrets and variables** → **Actions**
3. Click: **"New repository secret"**

### Add These Secrets:

```bash
# Vercel Authentication Token
VERCEL_TOKEN = 4QoNVvLgxcN4UlrAeWXBn8Zc

# Vercel Organization ID
VERCEL_ORG_ID = team_9eEABLbyiHLdJRpp2L5GTlZF

# Vercel Project ID  
VERCEL_PROJECT_ID = prj_9Ec6A6C4B53fKo31K18r1bNdPARB
```

## 🔧 Firebase Environment Variables

Also add your Firebase configuration secrets:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY = your_new_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID = your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = your_measurement_id
```

## 📋 Step-by-Step Setup

### 1. Add Vercel Secrets
For each secret above:
- Click **"New repository secret"**
- Enter the **Name** (e.g., `VERCEL_TOKEN`)
- Enter the **Secret** (the value)
- Click **"Add secret"**

### 2. Get New Firebase Config
⚠️ **Important**: Since the old Firebase API key was compromised, get a new configuration:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → **Project Settings** → **General**
3. Scroll to **"Your apps"** → **Web app** → **Config**
4. Copy the new values and add them as GitHub secrets

### 3. Test Deployment
After adding all secrets:
1. Make any small change to your code
2. Commit and push to main branch
3. Check **Actions** tab to see if deployment succeeds

## 🔍 Troubleshooting

### Common Issues:

#### "No existing credentials found"
- **Solution**: Make sure `VERCEL_TOKEN` secret is added correctly

#### "Project not found"
- **Solution**: Verify `VERCEL_PROJECT_ID` and `VERCEL_ORG_ID` are correct

#### "Environment variables missing"
- **Solution**: Add all Firebase secrets to GitHub repository secrets

#### "Build fails"
- **Solution**: Ensure all Firebase environment variables are configured

### Verify Setup:
```bash
# Local deployment test (if needed)
vercel --token 4QoNVvLgxcN4UlrAeWXBn8Zc
```

## 🎯 Expected Result

Once configured, every push to the `main` branch will:
1. ✅ Run CI tests and quality checks
2. ✅ Build the application with your Firebase config
3. ✅ Deploy to Vercel production environment
4. ✅ Provide deployment URL in commit comments

Your TOC Simulator will be available at:
**https://toc-simulator-[hash].vercel.app**

## 🔐 Security Notes

- Never commit the actual token values to your repository
- The provided token is for your project only
- GitHub secrets are encrypted and only available to your workflows
- Consider regenerating tokens periodically for security

---

**Last Updated**: September 2025  
**Status**: Ready for deployment once secrets are configured
