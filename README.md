# Trendies Seller Dashboard

A modern seller dashboard built with Next.js App Router, Tailwind CSS, Zustand, and Radix UI. Manage your seller profile, listings, payouts, referrals, and performance with a clean and responsive interface.

## Features

- Seller profile management
- Product listings and catalog import
- Payouts and bonuses tracking
- Referral system with Brevo (Sendinblue) email integration
- Admin and user dashboards
- Responsive design with Tailwind CSS
- State management with Zustand
- Modern UI components using Radix UI and shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm or npm

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/Bytemaster082/trendies-seller.git
   cd trendies-seller
   ```

2. Install dependencies:

   ```sh
   pnpm install
   # or
   npm install
   ```

3. Copy `.env.local.example` to `.env.local` and fill in your environment variables:
   ```
   BREVO_API_KEY=your_brevo_api_key
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

### Running the App

```sh
pnpm dev
# or
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/                # Next.js app directory (App Router)
components/         # Reusable UI and layout components
hooks/              # Custom React hooks
lib/                # Utility libraries and services
public/             # Static assets
styles/             # Global and component styles
```

## Referral System

- Users can invite friends via email using Brevo API.
- Referral codes are generated and tracked.
- Dashboard shows invites, conversions, and rewards.

## Scripts

- `dev` - Start development server
- `build` - Build for production
- `start` - Start production server

## License

MIT

---

**Made with Next.js, Tailwind CSS, Zustand, and Radix UI.**
