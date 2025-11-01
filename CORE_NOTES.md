# BrgyKonek System - Core Technical Documentation

## 📋 **System Overview**

**BrgyKonek** is a comprehensive barangay management system designed for Barangay Masaguisi, Bongabong, Oriental Mindoro. The system consists of three interconnected applications providing complete digital governance solutions for both administrators and residents.

### **System Architecture**
- **Architecture Pattern**: Microservices-like with separate frontend, backend, and mobile applications
- **Communication**: RESTful API with JSON data exchange
- **Database**: MongoDB (NoSQL) for flexible document storage
- **Authentication**: JWT-based token authentication with role-based access control

---

## 🏗️ **Technical Stack**

### **Backend API (brgykonek-backend)**
- **Runtime**: Node.js v18+
- **Framework**: Express.js 4.18.2
- **Language**: TypeScript 5.3.3
- **Database**: MongoDB with Mongoose ODM 8.0.3
- **Authentication**: JWT (jsonwebtoken 9.0.2) + Argon2/Bcrypt for password hashing
- **Email Service**: Nodemailer 7.0.4 with SMTP
- **Documentation**: Swagger UI with JSDoc
- **Security**: Helmet, CORS, Rate Limiting, Express Validator
- **File Handling**: Multer for file uploads
- **Templates**: Pug for email templates

### **Web Application (brgy-konek-web)**
- **Framework**: Angular 19.1.0 (Latest stable)
- **Language**: TypeScript 5.7.2
- **Styling**: Tailwind CSS 3.4.17
- **Charts**: Chart.js 4.5.0 + ng2-charts 8.0.0, ApexCharts 3.54.1
- **Icons**: Heroicons + Feather Icons via ng-icons
- **Forms**: Angular Reactive Forms
- **HTTP Client**: Angular HttpClient with Axios 1.10.0
- **Rich Text**: Angular Editor (Kolkov) 3.0.0-beta.2
- **Build Tool**: Angular CLI 19.1.8

### **Mobile Application (brgykonek-mobile)**
- **Framework**: React Native 0.79.2 with Expo SDK 53.0.9
- **Language**: TypeScript 5.8.3
- **Navigation**: Expo Router 5.0.3 (File-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native) 3.4.0
- **State Management**: Zustand 4.5.1
- **Forms**: React Hook Form 7.58.1 with validation
- **Charts**: React Native Gifted Charts 1.4.63
- **Storage**: Expo Secure Store 14.2.3
- **UI Components**: React Native Elements + Custom components
- **Toast**: React Native Toast Message 2.3.0

---

## 🗄️ **Database Architecture**

### **MongoDB Collections**
1. **Users Collection**
   - User authentication and profile data
   - Roles: resident, staff, admin
   - Address hierarchy: Province → Municipality → Barangay → Sitio
   - Timestamps for audit trail

2. **Complaints Collection**
   - Citizen complaint management
   - Status tracking: Pending, In Progress, Resolved
   - Priority levels: Low, Medium, High
   - File attachments support
   - Resolution notes

3. **Announcements Collection**
   - Public announcements and news
   - Rich content with image support
   - Category-based organization
   - Scheduling capabilities

4. **OTP Collection**
   - Email verification tokens
   - Password reset tokens
   - Time-based expiration

### **Data Relationships**
- Users → Complaints (One-to-Many)
- Users → Announcements (One-to-Many for admin creation)
- Users → OTP (One-to-Many for verification)

---

## 🔐 **Security Implementation**

### **Authentication & Authorization**
- **JWT Tokens**: Stateless authentication with 7-day expiration
- **Password Security**: Argon2 + Bcrypt for password hashing
- **OTP Verification**: Email-based 2FA for sensitive operations
- **Role-Based Access Control**: Granular permissions by user type

### **API Security**
- **Rate Limiting**: 100 requests per 15-minute window per IP
- **CORS**: Configured for cross-origin requests
- **Helmet**: Security headers implementation
- **Input Validation**: Express Validator + Joi for data sanitization
- **File Upload Security**: Multer with size and type restrictions

### **Data Protection**
- **Password Hashing**: Never store plain text passwords
- **Token Expiration**: Automatic session invalidation
- **Input Sanitization**: XSS and injection prevention
- **Secure Headers**: CSP, HSTS, and other security headers

---

## 🚀 **API Architecture**

### **RESTful Endpoints**
```
Base URL: http://localhost:3000/api

Authentication:
POST /auth/register          - User registration
POST /auth/login             - User login
POST /auth/request-otp       - OTP request
POST /auth/verify-otp        - OTP verification
POST /auth/reset-password    - Password reset

Complaints:
GET    /complaints           - List complaints
POST   /complaints           - Create complaint
PUT    /complaints/:id       - Update complaint
DELETE /complaints/:id       - Delete complaint

Announcements:
GET    /announcements        - List announcements
POST   /announcements        - Create announcement
PUT    /announcements/:id    - Update announcement
DELETE /announcements/:id    - Delete announcement

Administrator:
GET    /administrator/users  - List users
PUT    /administrator/users/:id - Update user
DELETE /administrator/users/:id - Delete user
```

### **Middleware Stack**
1. **Request Logger**: Logs all incoming requests
2. **Rate Limiting**: Prevents API abuse
3. **Authentication**: JWT token validation
4. **Authorization**: Role-based access control
5. **Validation**: Input sanitization and validation

---

## 🎨 **Frontend Architecture**

### **Angular Web App Structure**
```
src/app/
├── components/          # Reusable UI components
│   └── shared/         # Shared components (modals, forms, etc.)
├── pages/              # Route-based page components
│   ├── admin/          # Admin dashboard pages
│   ├── resident/       # Resident interface pages
│   └── auth/           # Authentication pages
├── services/           # API service layer
├── utils/              # Utility functions
└── types/              # TypeScript type definitions
```

### **Key Angular Features**
- **Lazy Loading**: Route-based code splitting for performance
- **Reactive Forms**: Form validation and state management
- **Dependency Injection**: Service-based architecture
- **Change Detection**: Optimized with Zone.js
- **TypeScript**: Full type safety and IntelliSense

### **Mobile App Structure**
```
app/
├── admin/              # Admin screens
├── auth/               # Authentication screens
├── resident/           # Resident screens
├── user/               # User-specific screens
└── _layout.tsx         # Root layout with navigation

components/
├── layouts/            # Screen layouts
└── ui/                 # Reusable UI components

services/               # API services
utils/                  # Utility functions
```

### **Mobile App Features**
- **Expo Router**: File-based routing system
- **NativeWind**: Tailwind CSS for React Native
- **Secure Storage**: Encrypted local storage for tokens
- **Toast Notifications**: User feedback system
- **Gesture Handling**: Touch and swipe interactions

---

## 📊 **Data Visualization**

### **Chart Libraries**
- **Chart.js**: Line charts, bar charts, pie charts for web
- **ApexCharts**: Advanced interactive charts for web
- **React Native Gifted Charts**: Mobile-optimized charts

### **Analytics Features**
- **Complaints by Sitio**: Geographic distribution analysis
- **Issue Type Analytics**: Categorization and trends
- **User Activity**: Dashboard statistics and metrics
- **Real-time Updates**: Live data refresh capabilities

---

## 🔄 **State Management**

### **Web Application**
- **Angular Services**: Injectable services for state management
- **RxJS Observables**: Reactive programming patterns
- **HTTP Interceptors**: Request/response handling
- **Local Storage**: Client-side data persistence

### **Mobile Application**
- **Zustand**: Lightweight state management
- **Async Storage**: Persistent data storage
- **Context API**: Component-level state sharing
- **Secure Storage**: Encrypted sensitive data

---

## 📱 **Cross-Platform Features**

### **Shared Functionality**
- **Authentication**: Consistent login/logout across platforms
- **Real-time Sync**: Data synchronization between web and mobile
- **File Upload**: Image and document handling
- **Push Notifications**: Mobile notification system
- **Offline Support**: Limited offline functionality

### **Platform-Specific Features**
- **Web**: Rich text editor, advanced charts, admin dashboard
- **Mobile**: Camera integration, biometric auth, offline mode

---

## 🛠️ **Development Tools**

### **Code Quality**
- **TypeScript**: Type safety across all applications
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting (mobile app)
- **Jest**: Unit testing framework (backend)

### **Build Tools**
- **Angular CLI**: Web app build and development
- **Expo CLI**: Mobile app development and building
- **TypeScript Compiler**: Type checking and compilation
- **Webpack**: Module bundling (Angular)

### **Development Workflow**
- **Hot Reload**: Real-time code changes
- **Source Maps**: Debugging support
- **Environment Configuration**: Development/production settings
- **API Documentation**: Swagger UI integration

---

## 🚀 **Deployment Architecture**

### **Production Setup**
- **Backend**: Node.js server with PM2 process management
- **Database**: MongoDB Atlas or self-hosted MongoDB
- **Web App**: Static files served via Nginx/Apache
- **Mobile**: App store distribution (iOS App Store, Google Play)

### **Environment Configuration**
- **Development**: Local development with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Live system with SSL certificates

### **Monitoring & Logging**
- **Request Logging**: All API requests logged
- **Error Tracking**: Comprehensive error handling
- **Performance Monitoring**: Response time tracking
- **Health Checks**: System status endpoints

---

## 📈 **Performance Optimizations**

### **Frontend Optimizations**
- **Lazy Loading**: Route-based code splitting
- **Image Optimization**: Compressed and optimized images
- **Bundle Splitting**: Separate vendor and app bundles
- **Caching**: Browser caching for static assets

### **Backend Optimizations**
- **Database Indexing**: Optimized MongoDB queries
- **Response Compression**: Gzip compression enabled
- **Connection Pooling**: Efficient database connections
- **Rate Limiting**: API abuse prevention

### **Mobile Optimizations**
- **Code Splitting**: Lazy-loaded screens
- **Image Caching**: Efficient image handling
- **Bundle Optimization**: Metro bundler optimization
- **Memory Management**: Efficient React Native performance

---

## 🔧 **Configuration Management**

### **Environment Variables**
```env
# Backend Configuration
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/brgykonek
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### **Build Configuration**
- **Angular**: angular.json for build settings
- **Expo**: app.json for mobile app configuration
- **TypeScript**: tsconfig.json for compilation settings
- **Tailwind**: tailwind.config.js for styling configuration

---

## 🧪 **Testing Strategy**

### **Backend Testing**
- **Unit Tests**: Jest framework for service testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: MongoDB integration testing

### **Frontend Testing**
- **Unit Tests**: Angular testing utilities
- **Component Tests**: Isolated component testing
- **E2E Tests**: End-to-end user flow testing

### **Mobile Testing**
- **Unit Tests**: React Native testing library
- **Integration Tests**: API integration testing
- **Device Testing**: Physical device testing

---

## 📚 **Key Libraries & Dependencies**

### **Core Dependencies**
- **Express.js**: Web framework for Node.js
- **Mongoose**: MongoDB object modeling
- **Angular**: Full-featured web framework
- **React Native**: Mobile app framework
- **TypeScript**: Type-safe JavaScript

### **UI & Styling**
- **Tailwind CSS**: Utility-first CSS framework
- **Heroicons**: SVG icon library
- **Chart.js**: Data visualization library
- **NativeWind**: Tailwind for React Native

### **Authentication & Security**
- **JWT**: JSON Web Token authentication
- **Argon2**: Password hashing algorithm
- **Helmet**: Security middleware
- **Express Rate Limit**: API rate limiting

### **Development Tools**
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Swagger**: API documentation
- **Jest**: Testing framework

---

## 🎯 **System Capabilities**

### **User Management**
- **Multi-role System**: Resident, Staff, Admin roles
- **Profile Management**: Complete user profile system
- **Account Verification**: Email-based OTP verification
- **Password Security**: Secure password handling

### **Complaint Management**
- **CRUD Operations**: Full complaint lifecycle management
- **File Attachments**: Document and image uploads
- **Status Tracking**: Real-time status updates
- **Priority System**: Three-tier priority classification

### **Announcement System**
- **Rich Content**: HTML content with image support
- **Categorization**: Organized announcement categories
- **Scheduling**: Future announcement scheduling
- **Public Access**: Open announcement viewing

### **Analytics & Reporting**
- **Dashboard Analytics**: Real-time system statistics
- **Geographic Analysis**: Sitio-based complaint distribution
- **Trend Analysis**: Historical data visualization
- **Export Capabilities**: Data export functionality

---

## 🔮 **Technical Highlights**

### **Modern Development Practices**
- **TypeScript**: Full type safety across all applications
- **Component Architecture**: Reusable and maintainable code
- **API-First Design**: RESTful API with comprehensive documentation
- **Responsive Design**: Mobile-first responsive layouts

### **Scalability Features**
- **Microservices Architecture**: Separated concerns for scalability
- **Database Optimization**: Efficient MongoDB queries and indexing
- **Caching Strategies**: Multiple levels of caching implementation
- **Load Balancing Ready**: Architecture supports horizontal scaling

### **Security Best Practices**
- **Zero Trust Security**: Comprehensive authentication and authorization
- **Data Encryption**: Secure data transmission and storage
- **Input Validation**: Multi-layer input sanitization
- **Audit Logging**: Complete system activity tracking

---

## 📋 **Deployment Checklist**

### **Prerequisites**
- [ ] Node.js v18+ installed
- [ ] MongoDB instance running
- [ ] Email service configured
- [ ] SSL certificates (production)
- [ ] Domain configuration

### **Backend Deployment**
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] PM2 process manager setup
- [ ] Reverse proxy configuration
- [ ] Health check endpoints tested

### **Frontend Deployment**
- [ ] Production build generated
- [ ] Static files deployed
- [ ] CDN configuration (optional)
- [ ] Browser caching configured
- [ ] Performance optimization verified

### **Mobile Deployment**
- [ ] Expo build configuration
- [ ] App store assets prepared
- [ ] Testing on physical devices
- [ ] App store submission
- [ ] Push notification setup

---

This comprehensive technical documentation provides a complete overview of the BrgyKonek system architecture, technologies, and implementation details for development, maintenance, and reporting purposes.
