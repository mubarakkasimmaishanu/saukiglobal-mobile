# SaukiGlobal Mobile Integration API Reference (v1)

This documentation provides comprehensive details for integrating the React.js/mobile frontend application with the SaukiGlobal backend system.

---

## 1. Authentication Flow & Headers

All authenticated request types must pass the standard token header containing the API key generated for the user at login or registration.

### Headers Setup
```http
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

---

## 2. Authentication Endpoints

### 2.1 User Registration
*   **Endpoint:** `POST /api/v1/auth.php?action=register`
*   **Request Body (JSON):**
    ```json
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "08012345678",
      "password": "securepassword",
      "transaction_pin": "1234",
      "referral_code": "SAUKI10",
      "kyc_type": "nin",
      "nin": "12345678901"
    }
    ```
*   **Response (Success - 200 OK):**
    ```json
    {
      "status": true,
      "message": "Registration successful",
      "data": {
        "token": "a1b2c3d4e5f6...",
        "user": {
          "id": 42,
          "email": "jane@example.com",
          "name": "Jane Doe",
          "virtual_accounts": [
            {
              "bank_name": "PalmPay",
              "account_number": "9991234567",
              "account_name": "JANE DOE / SAUKI",
              "bank_code": "999991"
            }
          ]
        }
      }
    }
    ```

### 2.2 User Login
*   **Endpoint:** `POST /api/v1/auth.php?action=login`
*   **Request Body (JSON):**
    ```json
    {
      "email": "jane@example.com",
      "password": "securepassword"
    }
    ```
*   **Response (Success - 200 OK):**
    ```json
    {
      "status": true,
      "message": "Login successful",
      "data": {
        "token": "a1b2c3d4e5f6...",
        "user": {
          "id": 42,
          "email": "jane@example.com",
          "name": "Jane Doe",
          "wallet": 1500.00
        }
      }
    }
    ```

### 2.3 Forgot Password OTP & Reset Flow
1.  **Request OTP Code:**
    *   **Endpoint:** `POST /api/v1/auth.php?action=forgot_password`
    *   **Request Body (JSON):**
        ```json
        { "email": "jane@example.com" }
        ```
    *   **Response:**
        ```json
        { "status": true, "message": "If an account exists with this email, a reset code has been sent." }
        ```

2.  **Verify OTP Code:**
    *   **Endpoint:** `POST /api/v1/auth.php?action=verify_reset_code`
    *   **Request Body (JSON):**
        ```json
        { "email": "jane@example.com", "code": "4892" }
        ```
    *   **Response:**
        ```json
        { "status": true, "message": "Verification code is valid", "data": { "email": "jane@example.com", "code": "4892" } }
        ```

3.  **Confirm New Password:**
    *   **Endpoint:** `POST /api/v1/auth.php?action=reset_password`
    *   **Request Body (JSON):**
        ```json
        { "email": "jane@example.com", "code": "4892", "password": "newsecurepassword" }
        ```
    *   **Response:**
        ```json
        { "status": true, "message": "Password has been reset successfully" }
        ```

---

## 3. Lookups & Dashboard Stats

### 3.1 Fetch Unified Dashboard Stats
*   **Endpoint:** `POST /api/v1/services.php?action=getDashboardStats`
*   **Headers:** Includes `Authorization` Bearer token.
*   **Response:**
    ```json
    {
      "status": true,
      "message": "Dashboard stats retrieved",
      "data": {
        "wallet": {
          "balance": 2450.50,
          "referral_commission": 120.00
        },
        "transactions": {
          "success": 24,
          "pending": 2,
          "failed": 1
        },
        "notifications_count": 3,
        "kyc_status": "verified",
        "tier": "Member"
      }
    }
    ```

### 3.2 Fetch Virtual Accounts list
*   **Endpoint:** `POST /api/v1/services.php?action=getVirtualAccounts`
*   **Response:**
    ```json
    {
      "status": true,
      "message": "Virtual accounts retrieved",
      "data": [
        {
          "bank_name": "PalmPay",
          "account_number": "9991234567",
          "account_name": "JANE DOE / SAUKI",
          "bank_code": "999991",
          "provider": "payvessel",
          "status": "active"
        }
      ]
    }
    ```

### 3.3 Fetch Airtime Networks list
*   **Endpoint:** `POST /api/v1/services.php?action=getAirtimeNetworks`
*   **Response:**
    ```json
    {
      "status": true,
      "message": "Airtime networks retrieved",
      "data": [
        { "id": 1, "network": "MTN", "networkStatus": "On" },
        { "id": 2, "network": "AIRTEL", "networkStatus": "On" }
      ]
    }
    ```

### 3.4 Fetch Data Plans list
*   **Endpoint:** `POST /api/v1/services.php?action=getDataPlans`
*   **Request Body (JSON):**
    ```json
    { "network_id": 1 }
    ```
*   **Response:**
    ```json
    {
      "status": true,
      "message": "Data plans retrieved",
      "data": [
        {
          "id": 12,
          "name": "MTN 1GB SME",
          "price": 240.00,
          "type": "SME",
          "network_id": 1
        }
      ]
    }
    ```

### 3.5 Fetch Cable TV Providers list
*   **Endpoint:** `POST /api/v1/services.php?action=getCableProviders`

### 3.6 Fetch Cable TV Plans list
*   **Endpoint:** `POST /api/v1/services.php?action=getCablePlans`
*   **Request Body (JSON):**
    ```json
    { "provider_id": "DSTV" }
    ```

### 3.7 Fetch Electricity Providers list
*   **Endpoint:** `POST /api/v1/services.php?action=getElectricityProviders`

### 3.8 Fetch Exam Providers list
*   **Endpoint:** `POST /api/v1/services.php?action=getExamProviders`

---

## 4. Financial & VTU Transaction Dispatching

All purchasing and service requests route to:
`POST /api/v1/services.php?type=<service_type>`

For **ALL** endpoints listed below, the request must include:
*   `Authorization` Bearer token header.
*   `pin` parameter containing the user's 4-digit transaction PIN (for secure verification).

---

### 4.1 Airtime Purchase
*   **Endpoint:** `POST /api/v1/services.php?type=airtime`
*   **Request Payload:**
    ```json
    {
      "network": 1,
      "amount": 200,
      "phone": "08012345678",
      "networktype": "VTU",
      "pin": "1234"
    }
    ```
*   **Response:**
    ```json
    {
      "status": true,
      "message": "Airtime top-up processed successfully",
      "reference": "TXN_171239847192"
    }
    ```

### 4.2 Data Purchase
*   **Endpoint:** `POST /api/v1/services.php?type=data`
*   **Request Payload:**
    ```json
    {
      "network": 1,
      "plan": 12,
      "phone": "08012345678",
      "pin": "1234"
    }
    ```

### 4.3 Cable TV Payment
*   **Endpoint:** `POST /api/v1/services.php?type=bills`
*   **Request Payload:**
    ```json
    {
      "type": "cable",
      "provider": "dstv",
      "customer_id": "1029384756",
      "amount": 5000,
      "plan": "DSTV Compact",
      "pin": "1234"
    }
    ```

### 4.4 Electricity Bill Token Generation
*   **Endpoint:** `POST /api/v1/services.php?type=bills`
*   **Request Payload:**
    ```json
    {
      "type": "electricity",
      "provider": "ikedc",
      "customer_id": "01029384756",
      "amount": 3000,
      "pin": "1234"
    }
    ```

### 4.5 Exam Pins Purchase
*   **Endpoint:** `POST /api/v1/services.php?type=exam`
*   **Request Payload:**
    ```json
    {
      "provider": 1,
      "quantity": 2,
      "pin": "1234"
    }
    ```

---

## 5. Unified Transaction History & Verification

### 5.1 Paginated and Filtered Transactions list
*   **Endpoint:** `POST /api/v1/services.php?action=getTransactions`
*   **Request Body (JSON):**
    ```json
    {
      "limit": 50,
      "offset": 0,
      "type": "data",
      "status": "success"
    }
    ```
*   **Response:**
    ```json
    {
      "status": true,
      "message": "Transactions retrieved",
      "data": [
        {
          "id": "TXN_1029384756",
          "type": "Data",
          "amount": 240.00,
          "status": "Success",
          "date": "May 26, 2026 19:40",
          "details": "MTN 1GB SME (08012345678)"
        }
      ]
    }
    ```

### 5.2 Polling / Verify Transaction Status
*   **Endpoint:** `GET /api/v1/verify.php?reference=<reference_id>`
*   **Response:**
    ```json
    {
      "status": true,
      "message": "Transaction status retrieved",
      "data": {
        "reference": "TXN_1029384756",
        "type": "data",
        "amount": 240.00,
        "status": "success",
        "service_name": "MTN SME",
        "created_at": "2026-05-26 19:40:00"
      }
    }
    ```

---

## 6. Secure Wallet Funding (Online Payments)

### 6.1 Payment Initialization
*   **Endpoint:** `POST /api/v1/fund.php`
*   **Request Body (JSON):**
    ```json
    {
      "amount": 1000,
      "gateway": "paystack"
    }
    ```
    *(Gateways supported: `paystack`, `korapay` [which initializes PayVessel checkout], `monnify`, `bank_transfer`)*
*   **Response:**
    ```json
    {
      "status": true,
      "message": "Payment initialized",
      "data": {
        "checkout_url": "https://checkout.paystack.com/a1b2c3d4...",
        "reference": "TXN_171239847192",
        "gateway": "paystack"
      }
    }
    ```

---

## 7. Error Codes & Format

All failures return a standard format to ease mobile handler catching:

```json
{
  "status": false,
  "message": "Error description statement"
}
```

Common HTTP status codes returned by the API:
*   `400 Bad Request` — Missing parameter constraints.
*   `401 Unauthorized` — Invalid or expired API token / session.
*   `403 Forbidden` — Inactive user account.
*   `405 Method Not Allowed` — Invalid request method.
*   `429 Too Many Requests` — Triggered by secure rate limiters.
*   `500 Internal Server Error` — Database or system failures.
