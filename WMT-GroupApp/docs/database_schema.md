# Database Schema Diagram (Mongoose Models)

## 1. User Model
```js
{
  name: String,
  email: String (Unique),
  password: String (Hashed),
  role: Enum['user', 'admin'],
  profileImage: String,
  createdAt: Date
}
```

## 2. Restaurant Model
```js
{
  name: String,
  cuisine: String,
  location: String,
  priceRange: Enum['$', '$$', '$$$', '$$$$'],
  images: [String],
  description: String,
  averageRating: Number,
  numReviews: Number,
  admin: ObjectId (Ref: User),
  createdAt: Date
}
```

## 3. Booking Model
```js
{
  user: ObjectId (Ref: User),
  restaurant: ObjectId (Ref: Restaurant),
  date: Date,
  time: String,
  guests: Number,
  status: Enum['pending', 'approved', 'rejected', 'cancelled'],
  specialRequests: String,
  createdAt: Date
}
```

## 4. Review Model
```js
{
  user: ObjectId (Ref: User),
  restaurant: ObjectId (Ref: Restaurant),
  rating: Number (1-5),
  comment: String,
  createdAt: Date
}
```

## 5. Payment Model
```js
{
  user: ObjectId (Ref: User),
  booking: ObjectId (Ref: Booking),
  amount: Number,
  currency: String,
  status: Enum['pending', 'completed', 'failed'],
  transactionId: String (Unique),
  paymentMethod: String,
  createdAt: Date
}
```
