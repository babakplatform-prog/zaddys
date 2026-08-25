# Zaddy's Creamy and Grills - Corrections & Adjustments

Please implement the following adjustments and bug fixes to the codebase. Ensure consistency across all pages and components.

## 1. UI, Styling & Branding
* **Color Palette Adjustments**: Update the global theme structure. The primary text color should be red on a white background. Black should be used strictly as a minimal accent color.
* **Global Logo Integration**: 
  * Remove the hardcoded static "Zaddy's" text at the top-left corner of the navigation/header.
  * Replace it with the actual logo image file (displaying "Zaddy's" in large text and "Creamy and Grills" underneath).
  * Ensure the logo image is visible, readable, responsive, and consistently rendered across all pages.
* **Splash Screen**: Replace the current spinning/animating hardcoded text with the actual logo image file.

## 2. Onboarding & Authentication Flow
* **Onboarding Landing Page**: Redesign the initial screen to act as a visually appealing advert page, using the layout provided in screrenshoot * as a structural reference.
  * **Design & Layout**: Follow the structure of the reference image but strictly apply Zaddy's brand color palette (primary red on white background, with black used strictly as a minimal accent).
  * **Imagery**: Display rich imagery of foods, drinks, grills, and ice creams in the center showcase.
  * **Actions**: Include two primary action buttons: `Get Started` (routes to the sign-up page) and a `Log in` link (routes to the login page) as seen in the reference with the other content like term/policy. etc but it should be in zaddys style 
* **Social Authentication**: 
  * Remove the `Twitter` and `Facebook` login buttons completely from the UI and logic.
  * Retain only `Continue with Google` and `Continue with Apple`.
* **Registration & Email OTP Verification**: 
  * Remove the current simulated registration flow.
  * Implement an OTP generation and dispatch flow sending a code to the user's registered email address.
  * Provide an OTP input screen for account verification.
  * Upon successful verification, authenticate the user and redirect them to the main app interface with full session access.

## 3. Checkout & Payment Processing (Paystack)
* **Checkout Form Cleanup**: Remove the `City` and `Preferred delivery time` input fields from the checkout flow.
* **Payment Triggering & Flow**: Fix the checkout button. It currently gets stuck on "processing". 
  * It must reliably trigger the Paystack payment gateway directly within the application.
  * **CRITICAL**: Keep the Paystack integration in **TEST MODE** (use test API keys).
* **Post-Payment Redirect**: Upon successful payment confirmation, automatically redirect the user to a dedicated Order Tracking page so they can monitor their order status.
* **Paystack Webhooks**: Implement the backend webhook listener to verify and process Paystack payment success events securely and update order statuses in the database.

## 4. Transactional Emails
* Wire up transactional email dispatches for the following events:
  * **Email Verification**: Sending the OTP upon initial sign-up.
  * **Welcome Email**: Sent automatically after successful account verification.
  * **Order Transactions**: Notifications triggered upon successful checkout and subsequent order tracking updates.

## 5. Minor Copy Adjustments
* **Support Page**: Remove the lengthy placeholder text ("talk to Zaddy's..."). Replace it exactly with: **"Chat with Zaddy's agent"**.

---
**Required Environment Variables / Variable Keys (To verify/add):**
* `PAYSTACK_TEST_PUBLIC_KEY`
* `PAYSTACK_TEST_SECRET_KEY`
* `PAYSTACK_WEBHOOK_SECRET`
* `EMAIL_SERVICE_API_KEY` (for OTP and transactional emails)
* `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
* `APPLE_CLIENT_ID`
* `NEXT_PUBLIC_APP_URL` (for redirects)

## 6. Product Page & Extras (Reference: 1000767634.jpg)
* **Layout Overhaul**: Redesign the product details page to exactly match the grid and card layout in the provided reference image.
* **Visual Extras & Add-ons**: 
  * Replace the current plain checkbox list for extras/add-ons with a clean, image-backed grid layout.
  * **CRITICAL**: Every single extra or add-on (no matter how small) must feature its own background image or thumbnail.
  * Include increment/decrement counters (`+` / `-`) for each extra to easily adjust quantities, matching the reference.

## 7. Global Loading State
* **Custom Loader**: Remove generic spinning text or standard loading circles (avoid the style seen in the bet9ja reference).
* **Zaddy's Spinner**: Implement a centralized, global loading screen featuring the official Zaddy's logo smoothly rotating or pulsing. Use this for page transitions and data fetching.

## 8. Quick Actions (Share & Drinks)
* **Share Button (Icon)**: 
  * Integrate the native Web Share API. When clicked, it should open the device's native sharing drawer, passing the current product's image, title, and URL. 
  * Include a fallback logic that copies the link to the clipboard and triggers a "Link Copied!" toast notification for unsupported browsers.
* **Drinks Button (Glass Icon)**: 
  * When clicked, do not navigate away from the page. Instead, trigger a smooth **bottom-sheet modal overlay**.
  * The bottom sheet should display all available drinks in a visually rich grid (similar to the extras), complete with images, prices, and quick `+`/`-` controls to seamlessly cross-sell without interrupting the food order flow.

## 9. Transactional Email Templates
* **Modern & Formal UI**: Overhaul the HTML email templates (utilizing the existing email provider, e.g., Resend) to look premium, modern, and highly trustworthy to avoid spam filters.
* **Deep Personalization**: Dynamically inject the user's name (e.g., "Dear [Name],") into the greeting of all communications.
* **Clear Call-to-Action**: For the OTP/Verification email, center a prominent, fully styled button reading **"Verify Zaddy's"**.

## 10. The "Wow" Factor (UX Enhancements)
* **Micro-interactions**: Implement subtle bounce or spring animations (using Framer Motion or Tailwind transitions) when users tap the `+` buttons or add items to the cart.
* **Sticky Cart Bar**: As the user scrolls down through the long list of extras, implement a sticky summary bar at the very bottom of the screen showing the dynamic total price and a "Buy Now" button.
* **Theme Contrast**: Ensure the new bottom sheets, modals, and extra grids have explicit layout contrast and look perfectly legible across both dark and light themes.