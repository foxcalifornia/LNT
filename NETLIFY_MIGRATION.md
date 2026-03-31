# Migration to Netlify - Complete Guide

## ✅ What's Been Done

Your Express API has been converted to Netlify Functions! Here's what changed:

### 1. **API Function Created** (`netlify/functions/api.ts`)
- Wraps your existing Express app using `serverless-http`
- All your routes work exactly the same
- Handles SumUp OAuth redirects
- Automatically scales

### 2. **Build Configuration Updated** (`netlify.toml`)
- Builds both API and frontend together
- Routes `/api/*` to Netlify Functions
- Sets up proper redirects

### 3. **Frontend Updated**
- API URL changed from `https://lnt-paris.replit.app` to `/.netlify/functions/api`
- Now uses relative URLs (same domain)

## 🔧 Environment Variables to Set in Netlify

Go to your Netlify dashboard → Site settings → Environment variables and add:

### Required Variables:

```bash
# Database
SUPABASE_DATABASE_URL=postgresql://postgres.yowfhpixlzbczycdfniy:O5j3fWwAc5vliaIlnuK1MOiq0DWy@aws-1-eu-west-1.pooler.supabase.com:6543/postgres

# SumUp Payment Integration
SUMUP_CLIENT_ID=your_sumup_client_id
SUMUP_CLIENT_SECRET=your_sumup_client_secret
SUMUP_MERCHANT_CODE=MC4VDM6U
SUMUP_READER_ID=rdr_1NSYDFW7HZ8YN8F6P4TK2MZQ4W
SUMUP_REDIRECT_URI=https://lntparis.netlify.app/callback
SUMUP_REFRESH_TOKEN=your_refresh_token
SUMUP_USER_TOKEN=your_user_token

# Build Environment
NODE_VERSION=20
TZ=Europe/Paris
```

### Get Your SumUp Credentials:
1. Go to your `.replit` file (locally, don't commit it)
2. Copy the SumUp values
3. Add them to Netlify environment variables

## 📦 Dependencies to Install

The `serverless-http` package is needed. Add it to your workspace:

```bash
pnpm add -w serverless-http
```

## 🚀 Deployment Steps

### Step 1: Install Dependencies
```bash
pnpm install
```

### Step 2: Test Build Locally
```bash
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/mobile run build:web
```

### Step 3: Commit and Push
```bash
git add .
git commit -m "Migrate API to Netlify Functions"
git push origin main
```

### Step 4: Deploy on Netlify
1. Go to https://app.netlify.com/
2. Your site will auto-deploy from GitHub
3. Add environment variables (see above)
4. Trigger a manual redeploy if needed

## 🔍 Testing After Deployment

### Test API Endpoint:
```bash
curl https://lntparis.netlify.app/api/health
```

Should return:
```json
{"status":"ok"}
```

### Test Frontend:
1. Open https://lntparis.netlify.app
2. Login with your credentials
3. Try creating a sale
4. Check if data saves to Supabase

## ⚠️ Important Notes

### Cold Starts
- First request after inactivity may be slow (2-3 seconds)
- Subsequent requests are fast
- This is normal for serverless functions

### Function Timeout
- Netlify Functions have a 10-second timeout
- Your current API should work fine within this limit
- If you have long-running operations, they may need optimization

### Database Connection
- Supabase connection pooling is already configured
- No changes needed to your database setup

## 🎯 Benefits of This Migration

✅ **Single Platform**: Everything on Netlify  
✅ **Auto-scaling**: Handles traffic spikes automatically  
✅ **Free Tier**: Generous limits for your use case  
✅ **Instant Updates**: Push to GitHub → Auto-deploy  
✅ **Better Performance**: Global CDN for frontend  
✅ **No Server Management**: Fully serverless  

## 🔄 Rollback Plan

If something goes wrong, you can quickly rollback:

1. Change `EXPO_PUBLIC_API_URL` back to `https://lnt-paris.replit.app`
2. Redeploy frontend only
3. Your Replit API will still work

## 📝 Next Steps

1. ✅ Install `serverless-http` dependency
2. ✅ Set environment variables in Netlify
3. ✅ Commit and push changes
4. ✅ Verify deployment works
5. ✅ Test all features (login, sales, inventory, reports)
6. ✅ Turn off Replit server (save costs)

---

**Need Help?** Check the Netlify Functions logs in your dashboard for debugging.
