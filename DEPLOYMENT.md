# LNT Paris - Netlify Deployment Guide

## Build Status
✅ **Build completed successfully!**

The web application has been rebuilt and is ready for Netlify deployment.

## Build Output
- **Location**: `artifacts/mobile/dist/`
- **Size**: ~3 MB (optimized web bundle)
- **Entry point**: `index.html`

## Deployment Configuration

### Netlify Settings (already configured in `netlify.toml`)
- **Build command**: `pnpm --filter @workspace/mobile run build:web`
- **Publish directory**: `artifacts/mobile/dist`
- **Base directory**: `.`

### Environment Variables
The following environment variables are set in `netlify.toml`:
- `EXPO_PUBLIC_DOMAIN`: `lntparis.netlify.app`
- `EXPO_PUBLIC_API_URL`: `https://lnt-paris.replit.app/api`

## Deployment Steps

### Option 1: Deploy via Netlify CLI
```bash
# Install Netlify CLI (if not already installed)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to production
netlify deploy --prod
```

### Option 2: Deploy via Netlify Dashboard
1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository: `https://github.com/foxcalifornia/LNT-PARIS.git`
4. Netlify will automatically detect the `netlify.toml` configuration
5. Click "Deploy site"

### Option 3: Manual Deploy (Drag & Drop)
1. Go to [Netlify](https://app.netlify.com/)
2. Drag and drop the `artifacts/mobile/dist` folder to the Netlify dashboard

## Local Testing

To test the build locally before deploying:
```bash
# Navigate to the mobile artifact
cd artifacts/mobile

# Serve the dist folder
pnpm run serve
# OR use any static server
npx serve dist
```

## Rebuilding

To rebuild the application:
```bash
# From the root directory
pnpm --filter @workspace/mobile run build:web
```

## Important Notes

1. **Dependencies**: Make sure `pnpm` is installed globally before deploying via CLI
2. **API Connection**: The app is configured to connect to the API at `https://lnt-paris.replit.app/api`
3. **SPA Routing**: The `netlify.toml` includes redirects for single-page app routing
4. **Build Cache**: The build process clears Metro cache automatically for clean builds

## Troubleshooting

### Build fails on Netlify
- Ensure Netlify has Node.js 18+ selected in build settings
- Check that all environment variables are set correctly
- Review build logs for specific error messages

### App doesn't load after deployment
- Check browser console for errors
- Verify the API URL is accessible
- Ensure all assets are loading correctly (check Network tab)

## Next Steps

1. Deploy to Netlify using one of the methods above
2. Configure custom domain (optional)
3. Set up continuous deployment from GitHub
4. Monitor deployment logs and application performance

---

**Repository**: https://github.com/foxcalifornia/LNT-PARIS.git
**Build Date**: March 30, 2026
