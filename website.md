FOLLOW THIS INSTRUCTIONS AND ALLIGN IT WITH THE EXISTING CODE IN THE WORKSPACE.

ZADDYS Website Development Brief

Payment Integration & Order Management

Website

www.zaddys.ng

Brand

ZADDYS
Creamery & Grills
Made for moments.

⸻

Objective

Build a premium, mobile-first food ordering website where customers can:

* Browse the menu
* Create an account
* Place orders
* Pay securely online via Paystack
* Receive order confirmation
* Track order status
* Receive delivery manually by our team

This is Phase 1 before Quickserve integration.

⸻

Customer Journey

1. Customer visits www.zaddys.ng
2. Browses products
3. Adds items to cart
4. Signs up or logs in
5. Enters delivery information
6. Pays online via Paystack
7. Order appears in Admin Dashboard
8. Admin manually processes and dispatches order
9. Customer receives status updates

⸻

User Authentication

Allow:

* Sign Up
* Login
* Forgot Password

Collect:

* Full Name
* Phone Number
* Email Address
* Password

Users should also be able to:

* Save multiple delivery addresses
* View order history
* Reorder previous orders

⸻

Product Pages

Every product should contain:

* Product Name
* Category
* Description
* Price
* Product Images
* Quantity Selector
* Add to Cart Button

Products organized into:

* Creamery
* Ramen
* Grills
* Fresh
* Croissants
* Moment Boxes

⸻

Shopping Cart

Customer can:

* Increase quantity
* Reduce quantity
* Remove products
* View subtotal
* View delivery fee
* View total payable

⸻

Checkout

Collect:

Customer Name

Phone Number

Email

Delivery Address

Nearest Landmark

City

Delivery Notes

Preferred Delivery Time

⸻

Payment

Integrate Paystack.

Payment methods should include:

* Debit Card
* Bank Transfer
* USSD
* Bank Account
* Apple Pay (where supported)
* Mobile Money (where available through Paystack)

Payment flow:

Customer clicks:

Pay Securely

↓

Redirect to Paystack Checkout

↓

Customer completes payment

↓

Paystack verifies payment

↓

Website verifies transaction on the server using Paystack’s verification endpoint

↓

Create order only after successful verification

↓

Display:

“Payment Successful”

↓

Redirect customer to:

Order Confirmation Page

⸻

Important

Never rely on frontend payment success.

Developer must verify every Paystack transaction from the backend before marking payment successful.

⸻

After Successful Payment

Automatically:

Generate:

Order Number

Example:

ZD-20260724-0001

Store:

Customer Details

Products Ordered

Quantity

Amount Paid

Payment Reference

Payment Method

Transaction ID

Date

Order Status

Initial status:

Pending Confirmation

⸻

Customer Confirmation

Immediately after payment:

Show:

✅ Payment Successful

Thank you for your order.

Order Number:

ZD-20260724-0001

We’ve received your order and will begin preparing it shortly.

⸻

Also send:

Email Confirmation

and

SMS or WhatsApp notification (future phase).

⸻

Admin Dashboard

Admin login required.

Dashboard should display:

New Orders

Preparing

Ready

Dispatched

Delivered

Cancelled

Each order should contain:

Customer Name

Phone

Address

Products

Quantity

Payment Status

Order Time

Delivery Notes

⸻

Admin Actions

Buttons:

Accept Order

Preparing

Ready for Dispatch

Dispatched

Delivered

Cancelled

Every status update should automatically notify the customer.

⸻

Order Notifications

Customer should receive:

Order Received

↓

Preparing

↓

Out for Delivery

↓

Delivered

⸻

Delivery Fee

Admin should be able to configure:

Delivery fee by location.

Examples:

Ilorin GRA

Tanke

Fate

Adewole

University Road

etc.

⸻

Inventory

Each product should have:

Available

Out of Stock

Hidden

⸻

Coupons (Future Ready)

Developer should create support for:

Discount Codes

Example:

WELCOME10

DATE20

MOMENTS15

Can remain disabled until needed.

⸻

Analytics Dashboard

Show:

Daily Orders

Weekly Orders

Monthly Revenue

Best Selling Products

Repeat Customers

Average Order Value

Payment Success Rate

⸻

Security

Use HTTPS.

Passwords must be hashed.

Validate every request.

Protect Admin Panel.

Implement CSRF protection.

Use secure authentication.

⸻

Mobile Experience

Website must be fully responsive.

Over 90% of customers will order from mobile devices.

Mobile-first design is mandatory.

⸻

Performance

Target:

Homepage loads in under 3 seconds.

Product pages load instantly.

Images optimized.

Lazy loading enabled.




BREAKDOWN 
**Recommended Tech Stack**

* **Frontend:** Next.js (React), Tailwind CSS, Framer Motion (for smooth mobile animations).
* **Backend / API:** Next.js Server Actions / Node.js (Express or NestJS).
* **Database & Auth:** PostgreSQL with Prisma ORM, NextAuth.js or Supabase Auth (bcrypt hashing, JWT sessions).
* **Payment Gateway:** Paystack API (Standard Redirect or Popup + Server Webhook verification).
* **Media & Assets:** Cloudinary or AWS S3 with Next.js Image Optimization.
* **Transactional Email/SMS:** Resend / SendGrid (Email) and Termii / Twilio (SMS/WhatsApp notifications).

---

**Core Database Schema**

| Model | Key Fields | Purpose |
| --- | --- | --- |
| **Users** | `id`, `fullName`, `email`, `phone`, `passwordHash`, `role` (CUSTOMER, ADMIN) | Identity and authentication |
| **Addresses** | `id`, `userId`, `zoneId`, `address`, `landmark`, `city`, `notes` | Saved customer delivery locations |
| **DeliveryZones** | `id`, `name` (e.g., Tanke, Fate, GRA), `fee`, `isActive` | Configurable dynamic delivery rates |
| **Products** | `id`, `name`, `category`, `price`, `description`, `imageUrl`, `status` (AVAILABLE, OUT_OF_STOCK, HIDDEN) | Menu items & inventory state |
| **Orders** | `id`, `orderNumber` (`ZD-YYYYMMDD-XXXX`), `userId`, `totalAmount`, `deliveryFee`, `status`, `paymentStatus` | Master order tracking |
| **OrderItems** | `id`, `orderId`, `productId`, `quantity`, `unitPrice`, `subtotal` | Itemized order lines |
| **Payments** | `id`, `orderId`, `reference`, `channel`, `amount`, `verifiedAt`, `rawPayload` | Audit trail for Paystack transactions |
| **Coupons** | `id`, `code`, `discountPercent`, `maxUses`, `expiryDate`, `isActive` | Phase-ready discount engine |

---

**Payment & Order Processing Lifecycle**

```text
[Cart / Checkout] 
       │ (User selects Delivery Zone & enters Address)
       ▼
[Backend: Init Paystack] ──> Returns Authorization URL & generates unique Reference
       │
       ▼
[Customer Completes Payment on Paystack]
       │
       ├─────────────────────────────────────────┐
       ▼ (Direct Redirect)                       ▼ (Asynchronous Webhook)
[Customer Returns to /checkout/verify]    [Paystack Server hits /api/webhooks/paystack]
       │                                         │
       └───────────────┬─────────────────────────┘
                       ▼
         [Server verifies transaction via Paystack API]
                       │
             ┌─────────┴─────────┐
             │ Payment Valid?    │
             ├─────────┬─────────┤
            YES        NO
             │         │
             ▼         ▼
     [Create Order]   [Display Error / Re-prompt]
     [Send Email]
     [Alert Admin]
     [Redirect: Order Confirmation]

```

* **Idempotency Safeguard:** The webhook handler and verification endpoint must check if the Paystack `reference` has already been processed to prevent duplicate order generation.

---

**Sitemap & Core Interfaces**

* **Customer Web (Mobile-First):**
* `/` — High-converting landing page with quick category filters (Creamery, Ramen, Grills, etc.).
* `/menu` — Category-tabbed product listings with real-time stock tags.
* `/cart` & `/checkout` — Streamlined single-page checkout with dynamic delivery fee calculations based on selected zone.
* `/account/orders` — Order history with status tracker and one-click "Reorder".
* `/order/[orderNumber]` — Live progress tracker (`Order Received` $\rightarrow$ `Preparing` $\rightarrow$ `Dispatched` $\rightarrow$ `Delivered`).


* **Admin Operations Suite:**
* `/admin/orders` — Kanban/List view segmented by live status tabs with instant sound alerts for incoming orders.
* `/admin/menu` — Toggle product availability (`Available`, `Out of Stock`, `Hidden`) and edit prices.
* `/admin/delivery-zones` — Real-time adjustment of zone fees (Ilorin GRA, Tanke, Adewole, etc.).
* `/admin/analytics` — Visual breakdown of revenue, repeat rates, average order value (AOV), and top-selling items.



---

**Security & Performance Checklist**

* **Payload & Secret Protection:** Store Paystack Secret Keys strictly in server-side environment variables; never expose them to client bundles.
* **Webhook Validation:** Verify the `x-paystack-signature` header using HMAC SHA512 against the raw request body.
* **Input Sanitization & Rate Limiting:** Enforce Zod validation on all API requests and apply Redis/Upstash rate limiting on authentication and checkout routes.
* **Image Optimization:** Serve responsive WebP/AVIF formats with fixed aspect ratios and lazy loading below the fold to ensure sub-3-second load times on 3G/4G networks.  YOUR RECOMMENDATION IS IMPORTANT TO MAKE THIS HIGLY STANDARDIZED. I USE DJANGO FOR MY ZADDY CREAMRY AND GRILLS CMD ROOM