# BrgyKonek Mobile APK Build Guide

This guide explains how to build the brgykonek-mobile app into an APK file using Expo's internal build system (EAS Build).

## Prerequisites

Before building the APK, ensure you have the following:

1. **Node.js** (v18 or higher)
2. **Expo CLI** installed globally:
   ```bash
   npm install -g @expo/cli
   ```
3. **EAS CLI** installed globally:
   ```bash
   npm install -g eas-cli
   ```
4. **Expo account** - Sign up at [expo.dev](https://expo.dev)
5. **Android Studio** (for Android SDK and tools)

## Setup Instructions

### 1. Navigate to Mobile App Directory

```bash
cd brgykonek-mobile
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Login to Expo

```bash
expo login
```

Enter your Expo account credentials when prompted.

### 4. Configure EAS Build

Initialize EAS Build configuration:

```bash
eas build:configure
```

This will create an `eas.json` file with build configuration. The default configuration should work for most cases.

### 5. Update App Configuration (if needed)

Review and update `app.json` if you need to modify:

- App name, slug, or version
- Icon and splash screen paths
- Android-specific settings
- Permissions

Example Android configuration in `app.json`:

```json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.brgykonek",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE"
      ]
    }
  }
}
```

## Building the APK

### Option 1: Development Build (Recommended for Testing)

Build a development APK that you can install directly:

```bash
eas build --platform android --profile development
```

### Option 2: Preview Build

Build a preview APK for internal testing:

```bash
eas build --platform android --profile preview
```

### Option 3: Production Build

Build a production APK for distribution:

```bash
eas build --platform android --profile production
```

## Build Profiles Configuration

The `eas.json` file defines different build profiles. Here's a typical configuration:

```json
{
  "cli": {
    "version": ">= 5.9.1"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## Build Process

1. **Start the build**: Run one of the build commands above
2. **Monitor progress**: EAS will show a QR code and build URL
3. **Wait for completion**: Builds typically take 10-20 minutes
4. **Download APK**: Once complete, download the APK from the provided URL

## Installing the APK

### On Android Device:

1. Enable "Unknown sources" or "Install from unknown apps" in Android settings
2. Transfer the APK file to your device
3. Open the APK file and follow installation prompts

### Via ADB (Android Debug Bridge):

```bash
adb install path/to/your/app.apk
```

## Troubleshooting

### Common Issues:

1. **Build fails with dependency errors**:
   ```bash
   npm install --force
   eas build --platform android --clear-cache
   ```

2. **Permission denied errors**:
   - Ensure your Expo account has proper permissions
   - Check if the project is properly linked to your account

3. **Build timeout**:
   - Try building during off-peak hours
   - Consider upgrading to a paid EAS plan for faster builds

4. **App crashes on startup**:
   - Check device logs: `adb logcat`
   - Ensure all required permissions are granted
   - Verify API endpoints are accessible

### Useful Commands:

- **Check build status**: `eas build:list`
- **View build logs**: `eas build:view [BUILD_ID]`
- **Cancel build**: `eas build:cancel [BUILD_ID]`

## Environment Variables

If your app uses environment variables, create a `.env` file in the mobile app directory:

```env
API_BASE_URL=https://your-api-url.com
API_KEY=your-api-key
```

Then update `app.json` to include environment variables:

```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": process.env.API_BASE_URL,
      "apiKey": process.env.API_KEY
    }
  }
}
```

## Continuous Integration

For automated builds, you can integrate EAS Build with CI/CD systems:

```yaml
# Example GitHub Actions workflow
name: Build APK
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g eas-cli
      - run: eas build --platform android --non-interactive
```

## Build Optimization

To optimize build times and APK size:

1. **Use ProGuard/R8** (enabled by default in production builds)
2. **Optimize images** and assets
3. **Remove unused dependencies**
4. **Use Hermes** JavaScript engine (default in recent Expo versions)

## Distribution

### Internal Testing:
- Share APK file directly with testers
- Use Google Play Console internal testing track

### Public Distribution:
- Upload to Google Play Store
- Use Google Play Console for app store distribution

## Support

For additional help:
- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo Community Forums](https://forums.expo.dev/)

---

**Note**: This guide assumes you're using Expo SDK 54+ and EAS Build. Make sure your Expo CLI and EAS CLI are up to date for the best experience.
