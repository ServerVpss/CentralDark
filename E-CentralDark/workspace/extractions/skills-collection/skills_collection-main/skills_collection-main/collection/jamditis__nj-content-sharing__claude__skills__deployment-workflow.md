---
name: deployment-workflow
description: Streamline the build and FTP deployment process for the NJ Content Sharing Network portal to centerforcooperativemedia.org. Activate when building for production, preparing deployments, or troubleshooting deployment issues.
---

# Deployment Workflow

This skill guides production builds and FTP deployment for the NJ Content Sharing Network portal.

## When to Activate

- User mentions deployment, publishing, or going live
- Building for production
- Preparing FTP upload
- Troubleshooting deployment issues
- Verifying production build output

## Deployment Target

- **URL**: https://centerforcooperativemedia.org/programs/contentnetwork/
- **Method**: FTP upload
- **Build output**: `portal/dist/` folder
- **Base path**: `/programs/contentnetwork/` (configured in vite.config.js)

## Pre-Deployment Checklist

### 1. Code Quality

```bash
cd portal
npm run lint
```

Fix any ESLint errors before proceeding.

### 2. Build Production Bundle

```bash
cd portal
npm run build
```

Expected output structure:
```
dist/
  index.html
  assets/
    index-[hash].js
    index-[hash].css
```

### 3. Preview Production Build

```bash
npm run preview
```

Test at http://localhost:4173 to verify:
- All sections render correctly
- Navigation works (anchor links)
- External links open correctly
- Copy attribution button functions
- Mobile menu operates properly

### 4. Validate Build Output

Check bundle sizes (keep under 500KB total for good performance):
```bash
ls -lah portal/dist/assets/
```

Verify base path in generated HTML:
```bash
grep -o 'href="[^"]*"' portal/dist/index.html | head -5
grep -o 'src="[^"]*"' portal/dist/index.html | head -5
```

All paths should start with `/programs/contentnetwork/`.

## FTP Upload Process

### File Structure to Upload

Upload entire contents of `portal/dist/` to `/programs/contentnetwork/` on server:

```
Server: /programs/contentnetwork/
  index.html
  assets/
    index-[hash].js
    index-[hash].css
    (any other assets)
```

### FTP Client Settings

- **Host**: (obtain from CCM)
- **Protocol**: SFTP preferred, FTP with TLS acceptable
- **Remote directory**: /programs/contentnetwork/
- **Transfer mode**: Binary for all files

### Upload Order

1. Upload `assets/` folder first (immutable hashed files)
2. Upload `index.html` last (atomic update)

This ensures users never see broken references during deploy.

## Post-Deployment Verification

1. **Load the page**: https://centerforcooperativemedia.org/programs/contentnetwork/
2. **Hard refresh**: Ctrl+Shift+R to bypass cache
3. **Check all sections**: Scroll through entire page
4. **Test navigation**: Click each nav link
5. **Test external links**: PluckyWire, Mailchimp signup
6. **Test mobile**: Use browser dev tools responsive mode
7. **Check console**: No JavaScript errors

## Rollback Procedure

If deployment causes issues:

1. **Keep previous dist folder** - Before building, copy current dist:
   ```bash
   cp -r portal/dist portal/dist-backup
   ```

2. **To rollback** - Re-upload the backup:
   ```bash
   # Upload portal/dist-backup/* to server
   ```

## Build Configuration Reference

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/programs/contentnetwork/',
})
```

The `base` option ensures all asset references use the correct path prefix.

## Guidelines

1. **Always preview before deploy** - Never upload untested builds.

2. **Deploy during low-traffic times** - Early morning or late evening EST.

3. **Document deployments** - Note date and changes in CLAUDE.md.

4. **Keep backups** - Retain at least the previous production build.

5. **Test on multiple devices** - Chrome, Firefox, Safari; desktop and mobile.

## Common Issues

**Assets 404 after deploy:**
- Verify `base` path in vite.config.js matches server directory
- Check that assets folder was uploaded completely
- Confirm file permissions on server (readable by web server)

**Styles broken:**
- CSS file may not have uploaded
- Check for CSS-in-JS hydration issues
- Verify Tailwind build included all classes

**Old version still showing:**
- Browser cache issue - hard refresh
- CDN cache - may take a few minutes to clear
- Check index.html hash references match uploaded files

## Deployment Log Template

Add to CLAUDE.md after each deployment:

```markdown
### Deployment YYYY-MM-DD

- **Changes**: [Brief description]
- **Build hash**: [First 8 chars of asset hash]
- **Deployed by**: [Name]
- **Status**: Success / Issues encountered
```

## Related Skills

- widget-management: For verifying widgets work in production
- content-configuration: For managing content before deploy
