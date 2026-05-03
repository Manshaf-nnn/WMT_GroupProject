# API Documentation

## Base URL
`http://localhost:5000/api` (Local)
`https://wmt-group-app-backend.onrender.com/api` (Render - Example)

## Endpoints

### 1. Authentication
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| POST | `/auth/register` | Create a new user account | No |
| POST | `/auth/login` | Login and get JWT token | No |
| GET | `/auth/profile` | Get logged-in user profile | Yes |

### 2. Restaurants
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| GET | `/restaurants` | List all restaurants (with filters) | No |
| GET | `/restaurants/:id` | Get details of a single restaurant | No |
| POST | `/restaurants` | Create a new restaurant | Admin |
| PUT | `/restaurants/:id` | Update restaurant details | Admin |
| DELETE | `/restaurants/:id`| Remove a restaurant | Admin |

### 3. Bookings
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| POST | `/bookings` | Request a table booking | Yes |
| GET | `/bookings/my` | View my booking history | Yes |
| GET | `/bookings` | List all bookings (Admin View) | Admin |
| PATCH | `/bookings/:id` | Approve or Reject a booking | Admin |

### 4. Reviews
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| POST | `/reviews` | Add a review and rating | Yes |
| GET | `/reviews/:id` | Get reviews for a restaurant | No |

### 5. Payments
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| POST | `/payments` | Simulate a payment | Yes |
| GET | `/payments/my` | View my payment history | Yes |
