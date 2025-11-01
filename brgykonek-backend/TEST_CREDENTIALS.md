# Test Credentials for BrgyKonek Backend

This document contains test credentials for the BrgyKonek backend system. These credentials are automatically created when running the database migrations.

## 🚀 Quick Start

To set up test data, run the migrations:

```bash
npm run migrate
```

## 👥 Test Users

### Admin User
- **Email:** admin@example.com
- **Password:** adminpass
- **User Type:** admin
- **Name:** Admin User
- **Mobile:** 09991234567
- **Address:** Barangay Hall

### Staff User
- **Email:** staff@example.com
- **Password:** staffpass
- **User Type:** staff
- **Name:** Staff User
- **Mobile:** 09881234567
- **Address:** Barangay Hall

### Resident Users

#### Juan Dela Cruz
- **Email:** juan@example.com
- **Password:** password123
- **User Type:** resident
- **Name:** Juan Dela Cruz
- **Mobile:** 09171234567
- **Address:** 123 Main St
- **Birthdate:** 1990-01-01

#### Maria Santos
- **Email:** maria@example.com
- **Password:** password123
- **User Type:** resident
- **Name:** Maria Santos
- **Mobile:** 09181234567
- **Address:** 456 Second St
- **Birthdate:** 1985-05-15

## 🔐 Authentication

### Login Endpoint
```
POST /api/auth/login
```

### Request Body
```json
{
  "email": "admin@example.com",
  "password": "adminpass"
}
```

### Response
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id_here",
    "name": "Admin User",
    "email": "admin@example.com",
    "mobile_number": "09991234567",
    "user_type": "admin",
    "address": "Barangay Hall",
    "birthdate": "1980-12-12T00:00:00.000Z"
  }
}
```

## 🛡️ User Types & Permissions

### Admin
- Full system access
- Can manage all users
- Can create/edit announcements
- Can view all complaints
- Can access admin dashboard

### Staff
- Can access admin dashboard
- Can manage pending approvals and complaints
- Limited administrative privileges compared to admin

### Resident
- Can view announcements
- Can submit complaints
- Can view own profile
- Limited access to system features

## 📊 Test Data Included

The migration also creates:

### Announcements (10 items)
- Barangay Assembly
- Garbage Collection Schedule
- Free Medical Checkup
- COVID-19 Vaccination Drive
- Barangay Fiesta
- Blood Donation Camp
- Tree Planting Activity
- Youth Sports Fest
- Senior Citizens' Day
- Barangay Clean-Up Drive

### Complaints (30 items)
- Various categories: Noise, Garbage, Vandalism, Water Supply, Road Damage, etc.
- Associated with test residents
- Mix of published and draft status

## 🔧 API Testing

### Using cURL

#### Login as Admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "adminpass"
  }'
```

#### Login as Staff
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff@example.com",
    "password": "staffpass"
  }'
```

#### Login as Resident
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123"
  }'
```

#### Access Protected Route
```bash
curl -X GET http://localhost:3000/api/auth/my-profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 🧪 Testing with Postman

1. Import the API collection (if available)
2. Set up environment variables:
   - `base_url`: http://localhost:3000
   - `admin_token`: (get from login response)
   - `staff_token`: (get from login response)
   - `resident_token`: (get from login response)

## 🗑️ Clean Up Test Data

To remove test data, run:

```bash
npm run migrate:rollback
```

This will remove:
- Test users (admin@example.com, staff@example.com, juan@example.com, maria@example.com)
- Test complaints
- Test announcements

## ⚠️ Security Notes

- These credentials are for **development and testing only**
- Never use these credentials in production
- Change all passwords before deploying to production
- The system uses Argon2 for password hashing
- JWT tokens expire after 7 days (configurable)

## 🔍 Troubleshooting

### Common Issues

1. **"Invalid credentials" error**
   - Ensure you're using the exact email and password from the test credentials
   - Check if migrations have been run

2. **"User with this email already exists" error**
   - Test users already exist in the database
   - Run rollback migration first, then re-run migrations

3. **Database connection issues**
   - Ensure MongoDB is running
   - Check MONGO_URI environment variable

### Reset Database

To completely reset the database:

```bash
# Rollback migrations
npm run migrate:rollback

# Run migrations again
npm run migrate
```

## 📝 Additional Notes

- All test users have complete profile information
- Test data includes realistic Philippine addresses and mobile numbers
- The system supports three user types: resident, staff, admin
- JWT tokens are required for protected routes
- Rate limiting is applied (100 requests per 15 minutes per IP)

---

**Last Updated:** 2025-10-02
**Version:** 1.1.0
