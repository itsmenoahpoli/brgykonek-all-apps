# BrgyKonek - Complete Application Suite

A comprehensive barangay management system consisting of three applications:

- **Web Application** (Angular) - Administrative dashboard and web interface
- **Mobile Application** (React Native/Expo) - Citizen-facing mobile app
- **Backend API** (Node.js/Express) - RESTful API server

## 📋 Prerequisites

Before setting up the applications, ensure you have the following installed:

### Global Requirements

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** - [Download here](https://git-scm.com/)

### Application-Specific Requirements

#### For Web Application (Angular)

- **Angular CLI** (v19 or higher)
  ```bash
  npm install -g @angular/cli
  ```

#### For Mobile Application (React Native/Expo)

- **Expo CLI**
  ```bash
  npm install -g @expo/cli
  ```
- **iOS Development** (macOS only)
  - Xcode (for iOS simulator)
  - iOS Simulator
- **Android Development**
  - Android Studio
  - Android SDK
  - Android Emulator

#### For Backend Application (Node.js)

- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community)
- **TypeScript** (will be installed as dev dependency)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/itsmenoahpoli/brgykonek-system
cd "brgykonek-system"
```

### 2. Backend Setup (Start First)

The backend should be set up first as both web and mobile applications depend on it.

```bash
cd brgykonek-backend
```

#### Install Dependencies

```bash
npm install
```

#### Environment Configuration

1. Copy the environment example file:

   ```bash
   cp env.example .env
   ```

2. Edit `.env` with your configuration:

   ```env
   NODE_ENV=development
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/brgykonek
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   # Email Configuration for OTP
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

#### Database Setup

1. Ensure MongoDB is running on your system
2. Run database migrations:
   ```bash
   npm run migrate
   ```

#### Start the Backend

```bash
# Development mode with auto-reload
npm run dev

# Production build
npm run build
npm start
```

The backend will be available at `http://localhost:3000`

### 3. Web Application Setup (Angular)

```bash
cd brgy-konek-web
```

#### Install Dependencies

```bash
npm install
```

#### Start Development Server

```bash
npm run dev
```

The web application will be available at `http://localhost:4200`

### 4. Mobile Application Setup (React Native/Expo)

```bash
cd brgykonek-mobile
```

#### Install Dependencies

```bash
npm install
```

#### Start Development Server

```bash
# Start Expo development server
npm start

# Or run directly on specific platform
npm run android  # For Android
npm run ios      # For iOS (macOS only)
npm run web      # For web browser
```

## 📱 Mobile App Development

### Running on Physical Devices

1. Install the **Expo Go** app on your mobile device
2. Scan the QR code displayed in the terminal or browser
3. The app will load on your device

### Running on Simulators

- **iOS Simulator**: Press `i` in the terminal or run `npm run ios`
- **Android Emulator**: Press `a` in the terminal or run `npm run android`

### Building for Production

```bash
# Build for Android
npm run build:android

# Build for iOS (requires macOS)
npm run prebuild
```

## 🛠️ Development Scripts

### Backend (`brgykonek-backend`)

```bash
npm run dev          # Start development server with auto-reload
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run migrate      # Run database migrations
```

### Web Application (`brgy-konek-web`)

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run watch        # Build with watch mode
npm run test         # Run tests
```

### Mobile Application (`brgykonek-mobile`)

```bash
npm start            # Start Expo development server
npm run android      # Run on Android
npm run ios          # Run on iOS
npm run web          # Run on web browser
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 🔧 Configuration

### Backend Configuration

- **Port**: Default 3000 (configurable via `.env`)
- **Database**: MongoDB (configurable via `MONGO_URI`)
- **JWT**: Token-based authentication
- **Email**: SMTP configuration for OTP functionality

### Web Application Configuration

- **Port**: Default 4200
- **Framework**: Angular 19
- **Styling**: Tailwind CSS
- **Charts**: ApexCharts and Chart.js

### Mobile Application Configuration

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: Zustand

## 📁 Project Structure

```
BrgyKonek Apps/
├── brgy-konek-web/          # Angular web application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # Reusable components
│   │   │   ├── pages/       # Page components
│   │   │   ├── services/    # API services
│   │   │   └── utils/       # Utility functions
│   │   └── assets/          # Static assets
│   └── package.json
├── brgykonek-backend/       # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── middleware/      # Express middleware
│   └── package.json
└── brgykonek-mobile/        # React Native mobile app
    ├── app/                 # Expo Router pages
    ├── components/          # Reusable components
    ├── services/            # API services
    └── package.json
```

## 🧪 Testing

### Backend Testing

```bash
cd brgykonek-backend
npm run test
```

### Web Application Testing

```bash
cd brgy-konek-web
npm run test
```

## 🚀 Deployment

### Backend Deployment

1. Build the application:
   ```bash
   npm run build
   ```
2. Set production environment variables
3. Deploy to your preferred hosting service (Heroku, AWS, etc.)

### Web Application Deployment

1. Build the application:
   ```bash
   npm run build
   ```
2. Deploy the `dist/brgy-konek-web` folder to your web server

### Mobile Application Deployment

1. Build for production:
   ```bash
   npm run build:android  # For Android
   npm run prebuild       # For iOS
   ```
2. Submit to respective app stores

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

#### Backend Issues

- **MongoDB Connection**: Ensure MongoDB is running and accessible
- **Port Conflicts**: Change the port in `.env` if 3000 is occupied
- **Email Configuration**: Verify SMTP settings for OTP functionality

#### Web Application Issues

- **Angular CLI**: Ensure you have the latest version installed globally
- **Port Conflicts**: Angular will automatically use the next available port

#### Mobile Application Issues

- **Expo CLI**: Ensure you have the latest version installed globally
- **Simulator Issues**: Restart simulators if they become unresponsive
- **Metro Bundler**: Clear cache with `npx expo start --clear`

### Getting Help

- Check the console for error messages
- Verify all prerequisites are installed
- Ensure all environment variables are properly configured
- Check that all services (MongoDB, etc.) are running
