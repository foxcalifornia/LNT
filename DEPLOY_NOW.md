# Deploy LNT Paris to Netlify - Quick Start

## ⚠️ Important: GitHub Push Issue

Your repository has a secret (GitHub PAT) in the git history that's blocking pushes. You have two options:

### Option A: Allow the Secret (Quickest)
1. Click this link: https://github.com/foxcalifornia/LNT/security/secret-scanning/unblock-secret/3BgPHCQymRYzG6zqwXrt5P7TEw9
2. Click "Allow secret" 
3. Then run: `git push origin main --force`

### Option B: Deploy Without GitHub (Recommended for Now)

Since you're already logged into Netlify CLI, deploy directly:

## 🚀 Deploy Now (3 Steps)

### Step 1: Create a New Netlify Site
```bash
netlify sites:create --name lntparis
```

### Step 2: Link This Directory to the Site
```bash
netlify link
```

### Step 3: Deploy to Production
```bash
cd c:/Users/Fayçal/Documents/LNT
netlify deploy --prod --dir=artifacts/mobile/dist
```

## Alternative: Manual Deploy via Dashboard

1. **Build is already complete** at: `c:/Users/Fayçal/Documents/LNT/artifacts/mobile/dist`

2. **Go to Netlify Dashboard**: https://app.netlify.com/

3. **Drag & Drop Deploy**:
   - Click "Add new site" → "Deploy manually"
   - Drag the `artifacts/mobile/dist` folder
   - Done! Your site will be live in seconds

4. **Configure Environment Variables** (in Netlify dashboard):
   - `EXPO_PUBLIC_DOMAIN`: Your Netlify URL (e.g., `your-site.netlify.app`)
   - `EXPO_PUBLIC_API_URL`: `https://lnt-paris.replit.app/api`

## What's Ready

✅ Web app built and optimized (3.05 MB)  
✅ Build output in `artifacts/mobile/dist/`  
✅ Netlify configuration in `netlify.toml`  
✅ You're logged into Netlify CLI  

## Next Steps After Deployment

1. Test the deployed site
2. Update API URL if needed
3. Set up custom domain (optional)
4. Configure continuous deployment from GitHub (after fixing the secret issue)

---

**Current Status**: Ready to deploy! Just choose your preferred method above.
