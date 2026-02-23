# BuyDigital Account Tier System — Architecture Reference

## Overview
BuyDigital has two distinct account tiers: **Basic** and **Reseller**. Each tier has its own pricing, dashboard experience, features, and functionality. This document serves as the single source of truth for how the tier system works.

---

## 1. Account Tiers

### Basic Account (Free)
- **Target Audience**: Everyday users who buy data, airtime, and pay bills for personal use.
- **Signup Fee**: ₦0 (Free)
- **Pricing**: Retail prices (standard market rates)
- **Commission**: None
- **Referral Program**: ₦100 per referral

### Reseller Account (Paid Upgrade)
- **Target Audience**: Cyber cafe owners, data vendors, POS agents, and tech entrepreneurs who sell to customers.
- **Upgrade Fee**: ₦2,000 one-time
- **Pricing**: Wholesale/Reseller prices (the lowest in the market)
- **Commission**: Earn per-transaction margin + referral bonuses
- **Referral Program**: ₦500 per referral + 0.5% of referral's lifetime spend

---

## 2. Pricing Comparison

| Service               | Basic (Retail) | Reseller (Wholesale) | Reseller Profit |
|-----------------------|----------------|---------------------|-----------------|
| MTN 1GB CG            | ₦300           | ₦255                 | ₦45             |
| MTN 2GB CG            | ₦600           | ₦510                 | ₦90             |
| MTN 5GB CG            | ₦1,500         | ₦1,275               | ₦225            |
| Airtel 1GB CG         | ₦300           | ₦265                 | ₦35             |
| Airtime (all networks)| 0% discount    | 4% discount          | 4%              |
| WAEC Result Checker   | ₦3,800         | ₦3,500               | ₦300            |
| JAMB E-PIN             | ₦7,500         | ₦7,200               | ₦300            |
| DSTV Compact          | ₦10,500        | ₦10,500              | ₦0 (no margin)  |
| Electricity Token     | Market Price   | Market Price          | ₦0 (no margin)  |

---

## 3. Feature Differences

| Feature                     | Basic          | Reseller          |
|----------------------------|----------------|-------------------|
| Buy Data                    | ✅ Retail price | ✅ Wholesale price |
| Buy Airtime                 | ✅ 0% discount  | ✅ 4% discount     |
| JAMB Services               | ✅              | ✅                 |
| Result Checkers             | ✅              | ✅                 |
| Electricity / Cable         | ✅              | ✅                 |
| NIN Print                   | ✅              | ✅                 |
| Fund Wallet                 | ✅              | ✅                 |
| Wallet Transfer             | ✅              | ✅                 |
| API Access                  | ❌              | ✅ (Coming Soon)   |
| Commission Dashboard        | ❌              | ✅                 |
| Profit Tracker per Txn      | ❌              | ✅                 |
| Referral Bonus (₦)          | ₦100           | ₦500               |
| Priority WhatsApp Support   | ❌              | ✅                 |
| Custom Pricing Tiers        | ❌              | ✅ (Coming Soon)   |
| Bulk Transaction History    | ❌              | ✅                 |

---

## 4. Dashboard Differences

### Basic Dashboard
- **Wallet card**: Shows balance only
- **Quick Services**: Standard grid (Data, Airtime, JAMB, Bills)
- **Recent Transactions**: Simple list
- **Upgrade Banner**: Prominent CTA to upgrade to Reseller
- **No commission/profit tracking**

### Reseller Dashboard
- **Wallet card**: Shows balance + today's earnings
- **Earnings Banner**: Daily commission earned, with "Withdraw" CTA
- **Quick Services**: Same grid, but shows wholesale prices inline
- **Profit Tracker**: Per-transaction profit margin display
- **Recent Transactions**: Enhanced list with profit column
- **Referral Stats**: Active referral count + lifetime earnings
- **No upgrade banner** (already upgraded)

---

## 5. Route Map

| Route              | Basic | Reseller | Description                         |
|--------------------|-------|----------|-------------------------------------|
| `/landing`         | ✅    | ✅        | Public landing page                 |
| `/login`           | ✅    | ✅        | Login                               |
| `/signup`          | ✅    | ✅        | Registration                        |
| `/dashboard`       | ✅    | ✅        | Tier-aware main dashboard           |
| `/upgrade`         | ✅    | ❌        | Upgrade to Reseller (Basic only)    |
| `/data`            | ✅    | ✅        | Buy Data (price varies by tier)     |
| `/airtime`         | ✅    | ✅        | Buy Airtime                         |
| `/fund`            | ✅    | ✅        | Fund Wallet                         |
| `/transfer`        | ✅    | ✅        | Wallet Transfer                     |
| `/jamb`            | ✅    | ✅        | JAMB Services                       |
| `/jamb-pins`       | ✅    | ✅        | JAMB Pins                           |
| `/exams`           | ✅    | ✅        | Result Checkers                     |
| `/cable`           | ✅    | ✅        | Cable TV                            |
| `/electricity`     | ✅    | ✅        | Electricity Bills                   |
| `/nin`             | ✅    | ✅        | NIN Print                           |
| `/history`         | ✅    | ✅        | Transaction History                 |
| `/profile`         | ✅    | ✅        | Profile/Settings                    |
| `/pricing`         | ✅    | ✅        | Pricing List (shows tier prices)    |
| `/referral`        | ✅    | ✅        | Refer & Earn                        |
| `/requests`        | ✅    | ✅        | Requested Services                  |
| `/notifications`   | ✅    | ✅        | Notifications                       |
| `/support`         | ✅    | ✅        | Help & Support                      |

---

## 6. Upgrade Journey (Basic → Reseller)

1. User sees **"Upgrade to Reseller"** banner on dashboard
2. User taps banner → navigates to `/upgrade`
3. Upgrade page shows:
   - Side-by-side comparison of Basic vs Reseller
   - Pricing examples showing potential savings
   - A calculator: "If you sell 10 data per day, you earn ₦X/month"
   - CTA: "Upgrade for ₦2,000"
4. User confirms payment → PIN entry
5. On success: `user.isReseller = true` is set
6. Dashboard immediately switches to Reseller view
7. Congratulations modal appears

---

## 7. Backend API Contract

### GET `/user/profile`
Returns user with `isReseller` boolean flag.

### POST `/user/upgrade`
Request: `{ pin: "1234" }`
Response: `{ success: true, user: { ...updatedUser, isReseller: true } }`
Deducts ₦2,000 from wallet.

### GET `/pricing/:tier`
Returns the pricing list for the given tier (`basic` or `reseller`).

---

© 2026 BuyDigital.ng — Internal Architecture Reference
