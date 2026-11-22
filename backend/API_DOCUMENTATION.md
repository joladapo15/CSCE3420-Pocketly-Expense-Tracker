# Pocketly API Documentation

## Overview

Pocketly is a personal expense tracker that helps students manage their income and expenses.

The backend is built with Node.js, Express, and PostgreSQL. It provides REST APIs for user authentication, profile management, transactions, categories, and dashboard reports.

### Base URL

`http://localhost:5001`

### Authentication

Protected endpoints require a JSON Web Token (JWT).

Include the token in the request header:

```http
Authorization: Bearer <token>
```

The token is returned after a successful login.

### Content Type

For requests that send JSON data, include:

```http
Content-Type: application/json
```

### Main API Groups

| API Group | Description |
|-----------|-------------|
| Authentication | Register and log in users |
| Profile | View and update account information |
| Categories | Retrieve transaction categories |
| Transactions | Add, view, edit, delete, and filter transactions |
| Dashboard | Display financial summaries and reports |


## Authentication APIs

### Register User

**Endpoint:** `POST /api/auth/register`

**Description:** Create a new user account.

**Authentication:** Not required.

**Request Body:**

```json
{
  "full_name": "Test User",
  "email": "testuser@example.com",
  "password": "Test12345",
  "institution_name": "University of North Texas",
  "phone_number": "1234567890"
}
```

**Required Fields:** `full_name`, `email`, `password`

**Optional Fields:** `institution_name`, `phone_number`

**Validation:**
- Name and email cannot be empty.
- Email must have a valid format.
- Password must contain at least 8 characters and one number.

**Success Response:** `201 Created`

```json
{
  "message": "Account created successfully.",
  "user": {
    "user_id": 1,
    "full_name": "Test User",
    "email": "testuser@example.com",
    "institution_name": "University of North Texas",
    "phone_number": "1234567890",
    "created_at": "2026-11-19T19:00:00.000Z"
  }
}
```

**Common Errors:**
- `400 Bad Request` – Invalid input.
- `409 Conflict` – Email already registered.
- `500 Internal Server Error` – Server error.

### Login User

**Endpoint:** `POST /api/auth/login`

**Description:** Log in with an existing account and receive a JWT token.

**Authentication:** Not required.

**Request Body:**

```json
{
  "email": "testuser@example.com",
  "password": "Test12345"
}
```

**Required Fields:** `email`, `password`

**Success Response:** `200 OK`

```json
{
  "message": "Login successful.",
  "token": "<jwt_token>",
  "user": {
    "user_id": 1,
    "full_name": "Test User",
    "email": "testuser@example.com"
  }
}
```

**Notes:**
- JWT tokens expire after 1 hour.
- Include the token in the Authorization header for protected endpoints.
- The frontend should redirect users to login when their token expires.

**Common Errors:**
- `400 Bad Request` – Missing email or password.
- `401 Unauthorized` – Invalid email or password.
- `500 Internal Server Error` – Server error.
```

## Profile APIs

All profile endpoints require JWT authentication.

Include the header:

`Authorization: Bearer <token>`

### Get User Profile

**Endpoint:** `GET /api/profile`

**Description:** Retrieve the currently logged-in user's profile.

**Authentication:** Required.

**Success Response:** `200 OK`

```json
{
  "user": {
    "user_id": 1,
    "full_name": "Test User",
    "email": "testuser@example.com",
    "institution_name": "University of North Texas",
    "phone_number": "1234567890",
    "created_at": "2026-11-19T19:00:00.000Z"
  }
}
```

**Common Errors:**
- `401 Unauthorized` – Missing or invalid token.
- `404 Not Found` – User not found.
- `500 Internal Server Error` – Server error.

### Update User Profile

**Endpoint:** `PUT /api/profile`

**Description:** Update the logged-in user's profile information.

**Authentication:** Required.

**Request Body:**

```json
{
  "full_name": "Updated User",
  "institution_name": "University of North Texas",
  "phone_number": "1234567890"
}
```

**Required Fields:** `full_name`

**Optional Fields:** `institution_name`, `phone_number`

**Validation:**
- `full_name` cannot be empty and must not exceed 100 characters.
- `institution_name` must not exceed 150 characters.
- `phone_number` must not exceed 20 characters.
- Omitted optional fields are stored as `null`.

**Success Response:** `200 OK`

```json
{
  "message": "Profile updated successfully.",
  "user": {
    "user_id": 1,
    "full_name": "Updated User",
    "email": "testuser@example.com",
    "institution_name": "University of North Texas",
    "phone_number": "1234567890",
    "created_at": "2026-11-19T19:00:00.000Z"
  }
}
```

**Common Errors:**
- `400 Bad Request` – Invalid profile information.
- `401 Unauthorized` – Missing or invalid token.
- `404 Not Found` – User not found.
- `500 Internal Server Error` – Server error.

### Change Password

**Endpoint:** `PUT /api/profile/password`

**Description:** Change the logged-in user's password.

**Authentication:** Required.

**Request Body:**

```json
{
  "current_password": "OldPass123",
  "new_password": "NewPass123"
}
```

**Required Fields:** `current_password`, `new_password`

**Validation:**
- Current password must be correct.
- New password must have at least 8 characters and one number.
- New password must be different from the current password.

**Success Response:** `200 OK`

```json
{
  "message": "Password changed successfully."
}
```

**Common Errors:**
- `400 Bad Request` – Invalid new password or same password.
- `401 Unauthorized` – Invalid token or incorrect current password.
- `404 Not Found` – User not found.
- `500 Internal Server Error` – Server error.
```

## Categories APIs

### Get All Categories

**Endpoint:** `GET /api/categories`

**Description:** Retrieve all available income and expense categories.

**Authentication:** Required.

**Request Body:** None.

**Success Response:** `200 OK`

```json
{
  "categories": [
    {
      "category_id": 1,
      "name": "Food & Drinks",
      "type": "expense"
    },
    {
      "category_id": 3,
      "name": "Transportation",
      "type": "expense"
    },
    {
      "category_id": 9,
      "name": "Salary",
      "type": "income"
    }
  ]
}
```

**Notes:**
- Categories are sorted by `category_id` in ascending order.
- The `type` field indicates whether the category is for income or expenses.
- The frontend can use this API to populate category dropdowns when adding or editing transactions.
- The response contains only `category_id`, `name`, and `type`.

**Common Errors:**
- `401 Unauthorized` – Missing or invalid token.
- `500 Internal Server Error` – Server error.

## Transactions APIs

All transaction endpoints require JWT authentication.

Include the header: `Authorization: Bearer <token>`

### Get Transactions

**Endpoint:** `GET /api/transactions`

**Description:** Retrieve all transactions belonging to the logged-in user. Transactions can be searched and filtered.

**Authentication:** Required.

**Request Body:** None.

**Optional Query Parameters:**

| Parameter | Description |
|-----------|-------------|
| `search` | Search transaction descriptions (case-insensitive, maximum 200 characters) |
| `type` | Filter by `income` or `expense` |
| `category_id` | Filter by a positive category ID |
| `start_date` | Filter transactions from this date (`YYYY-MM-DD`) |
| `end_date` | Filter transactions up to this date (`YYYY-MM-DD`) |

**Example Request:**

`GET /api/transactions?type=expense&start_date=2026-11-01&end_date=2026-11-30`

**Success Response:** `200 OK`

```json
{
  "transactions": [
    {
      "transaction_id": 16,
      "category_id": 1,
      "category_name": "Food & Drinks",
      "type": "expense",
      "amount": "15.50",
      "description": "Lunch at UNT",
      "transaction_date": "2026-11-19",
      "created_at": "2026-11-19T18:00:00.000Z"
    }
  ]
}
```

**Notes:**
- Only transactions belonging to the logged-in user are returned.
- Transactions are sorted by date in descending order.
- Multiple filters can be used together.
- Returns an empty `transactions` array when no records match.
- Both date filters are inclusive.

### Add Transaction

**Endpoint:** `POST /api/transactions`

**Description:** Create a new income or expense transaction.

**Authentication:** Required.

**Request Body:**

```json
{
  "category_id": 1,
  "type": "expense",
  "amount": 15.50,
  "description": "Lunch at UNT",
  "transaction_date": "2026-11-19"
}
```

**Required Fields:** `category_id`, `type`, `amount`, `transaction_date`

**Optional Fields:** `description`

**Validation:**
- `category_id` must be a positive integer.
- `type` must be either `income` or `expense`.
- `amount` must be a positive number, with no more than two decimal places, and cannot exceed 9999999999.99.
- `transaction_date` must be a valid date in `YYYY-MM-DD` format.
- The selected category must match the transaction type.
- The description must be a string if provided.

**Success Response:** `201 Created`

```json
{
  "message": "Transaction created successfully.",
  "transaction": {
    "transaction_id": 16,
    "user_id": 4,
    "category_id": 1,
    "type": "expense",
    "amount": "15.50",
    "description": "Lunch at UNT",
    "transaction_date": "2026-11-19",
    "created_at": "2026-11-19T18:00:00.000Z"
  }
}
```

### Update Transaction

**Endpoint:** `PUT /api/transactions/:id`

**Description:** Update an existing transaction belonging to the logged-in user.

**Authentication:** Required.

**Example Request:**

`PUT /api/transactions/16`

**Request Body:**

```json
{
  "category_id": 1,
  "type": "expense",
  "amount": 18.50,
  "description": "Updated lunch expense",
  "transaction_date": "2026-11-19"
}
```

**Required Fields:** `category_id`, `type`, `amount`, `transaction_date`

**Optional Fields:** `description`

**Validation:**
- The transaction ID must be a positive integer.
- The request body follows the same validation rules as Add Transaction.
- All required transaction fields must be provided.
- Users can update only their own transactions.

**Success Response:** `200 OK`

```json
{
  "message": "Transaction updated successfully.",
  "transaction": {
    "transaction_id": 16,
    "user_id": 4,
    "category_id": 1,
    "type": "expense",
    "amount": "18.50",
    "description": "Updated lunch expense",
    "transaction_date": "2026-11-19",
    "created_at": "2026-11-19T18:00:00.000Z"
  }
}
```

### Delete Transaction

**Endpoint:** `DELETE /api/transactions/:id`

**Description:** Delete an existing transaction belonging to the logged-in user.

**Authentication:** Required.

**Example Request:**

`DELETE /api/transactions/16`

**Request Body:** None.

**Success Response:** `200 OK`

```json
{
  "message": "Transaction deleted successfully."
}
```

**Notes:**
- The transaction ID must be a positive integer.
- Users can delete only their own transactions.
- A transaction that does not exist or belongs to another user returns `404 Not Found`.

### Common Errors

| Status Code | Description |
|-------------|-------------|
| `400 Bad Request` | Invalid transaction data, transaction ID, category, type, or date filter |
| `401 Unauthorized` | Missing or invalid JWT token |
| `404 Not Found` | Transaction not found or does not belong to the logged-in user |
| `500 Internal Server Error` | Server error |

### Frontend Integration Notes

- Include the JWT token in the `Authorization` header for every transaction request.
- Retrieve available categories using `GET /api/categories`.
- Use the selected `category_id` when creating or updating transactions.
- Send `amount` as a JSON number, not a string.
- PostgreSQL numeric amounts are returned as strings, such as `"15.50"`. Convert them to numbers when performing calculations or displaying charts.
- Use `YYYY-MM-DD` for transaction dates.
- Do not include `user_id` in the request body. The backend identifies the logged-in user through the JWT token.
- The `PUT` endpoint requires the complete transaction data, not only the modified fields.
- Example IDs, timestamps, and transaction values in this documentation are illustrative.


## Dashboard APIs

All dashboard endpoints require JWT authentication.

Include the header: `Authorization: Bearer <token>`

### Get Dashboard Summary

**Endpoint:** `GET /api/dashboard/summary`

**Description:** Retrieve the logged-in user's total income, total expenses, and current balance across all recorded transactions.

**Authentication:** Required.

**Request Body:** None.

**Success Response:** `200 OK`

```json
{
  "current_balance": 808.75,
  "total_income": 850,
  "total_expenses": 41.25
}
```

**Notes:**
- The summary includes all transactions belonging to the logged-in user.
- Current balance is calculated as total income minus total expenses.
- This endpoint does not support date filters.
- All three values are returned as JSON numbers.
- Users without transactions receive zero for all three values.

### Get Recent Transactions

**Endpoint:** `GET /api/dashboard/recent`

**Description:** Retrieve up to five of the logged-in user's most recent transactions.

**Authentication:** Required.

**Request Body:** None.

**Success Response:** `200 OK`

```json
{
  "transactions": [
    {
      "transaction_id": 16,
      "category_id": 1,
      "category_name": "Food & Drinks",
      "type": "expense",
      "amount": "15.50",
      "description": "Lunch at UNT",
      "transaction_date": "2026-11-19"
    },
    {
      "transaction_id": 17,
      "category_id": 3,
      "category_name": "Transportation",
      "type": "expense",
      "amount": "25.75",
      "description": "Uber to campus",
      "transaction_date": "2026-11-15"
    }
  ]
}
```

**Notes:**
- Returns a maximum of five transactions.
- Transactions are sorted by `transaction_date` in descending order, then by `transaction_id`.
- This endpoint does not support date filters.
- Returns an empty `transactions` array if the user has no transactions.

### Get Spending by Category

**Endpoint:** `GET /api/dashboard/categories`

**Description:** Retrieve the logged-in user's total expenses grouped by category.

**Authentication:** Required.

**Request Body:** None.

**Optional Query Parameters:**

| Parameter | Description |
|-----------|-------------|
| `start_date` | Start date in `YYYY-MM-DD` format |
| `end_date` | End date in `YYYY-MM-DD` format |

**Example Request:**

`GET /api/dashboard/categories?start_date=2026-11-16&end_date=2026-11-19`

**Success Response:** `200 OK`

```json
{
  "categories": [
    {
      "category_id": 1,
      "category_name": "Food & Drinks",
      "total_amount": "15.50",
      "transaction_count": 1
    }
  ]
}
```

**Notes:**
- Only expense transactions are included.
- Results are grouped by category and sorted by total amount in descending order.
- Date filters are optional and can be used separately or together.
- Both date boundaries are inclusive.
- Without date filters, the endpoint includes all recorded expenses.
- Returns an empty `categories` array if no expenses match.
- The frontend can use this response to create a spending-by-category chart.

### Get Monthly Income and Expenses

**Endpoint:** `GET /api/dashboard/monthly`

**Description:** Retrieve the logged-in user's total income and expenses grouped by month.

**Authentication:** Required.

**Request Body:** None.

**Optional Query Parameters:**

| Parameter | Description |
|-----------|-------------|
| `start_date` | Start date in `YYYY-MM-DD` format |
| `end_date` | End date in `YYYY-MM-DD` format |

**Example Request:**

`GET /api/dashboard/monthly?start_date=2026-11-16&end_date=2026-11-19`

**Success Response:** `200 OK`

```json
{
  "monthly": [
    {
      "month": "2026-11",
      "total_income": "0",
      "total_expenses": "15.50"
    }
  ]
}
```

**Notes:**
- Results are grouped by month in `YYYY-MM` format.
- Months are sorted in ascending order.
- Both income and expense transactions are included.
- Date filters are optional and inclusive.
- Without date filters, the endpoint includes all recorded transactions.
- When a partial month is selected, only transactions within the selected dates are counted.
- Only months containing matching transactions are returned.
- Returns an empty `monthly` array if no transactions match.
- The frontend can use this response to display monthly financial trends.

### Dashboard API Errors

| Status Code | Description |
|-------------|-------------|
| `400 Bad Request` | Invalid date filter or start date after end date |
| `401 Unauthorized` | Missing or invalid JWT token |
| `500 Internal Server Error` | Server error |

**Date Validation:**
- Date filters must use `YYYY-MM-DD`.
- Invalid calendar dates are rejected.
- `start_date` cannot be later than `end_date`.
- Date validation applies to the Categories and Monthly endpoints.

### Frontend Integration Notes

- Include the JWT token in the `Authorization` header for every dashboard request.
- Use `/api/dashboard/summary` for Current Balance, Total Income, and Total Expenses cards.
- Use `/api/dashboard/recent` for the recent transactions list.
- Use `/api/dashboard/categories` for the spending-by-category chart.
- Use `/api/dashboard/monthly` for the monthly income and expense chart.
- Apply date filters to the Categories and Monthly endpoints only.
- Summary values are returned as numbers, while PostgreSQL aggregate amounts in Categories and Monthly responses are returned as strings.
- Convert numeric strings to JavaScript numbers when preparing chart data.
- All example transaction values in this documentation are illustrative.
