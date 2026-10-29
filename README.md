# Rahama Property Compass

# RAHAMA PROPERTY HUB — FULL BUILD

Act as my senior full-stack engineering partner. I am building a production-oriented real-estate sales website and administration portal for Rahama Land and Property Development Ltd., based in Azare, Bauchi State, Nigeria (RC NO. 9871926).

Please build not only Phase 1, but build out the full application: the visual foundation, public property catalogue and details, WhatsApp enquiry flow, and the administrative management dashboard with mock data and realistic states ready for database connectivity.

## Brand Identity & Assets
- Use the attached logo (RC NO. 9871926, "RAHAMA LAND AND PROPERTY").
- Color palette: Deep forest green, clean white, warm neutrals, and sharp lime accents matching the architectural house emblem in the logo.
- Company details: Rahama Land and Property Development Ltd., Azare, Bauchi State, Nigeria. RC Number: 9871926.

## Required Public Routes & Features
- `/` — Homepage: Hero with quick search filter (type, location, budget), featured properties (land plots and houses), services (Land Sales, Property Development, Title Documentation, Site Inspections), trust metrics, company about preview, and contact CTA.
- `/properties` — Searchable and filterable catalogue: Filters by property type (Residential Land, Commercial Land, House/Villa), location/area in Azare & Bauchi, price range in NGN (₦), and size (plots, sqm, hectares). Responsive grid cards with status badges (Available, Reserved, Sold).
- `/properties/:slug` — Detailed property view: High quality photo gallery, pricing in ₦, reference code (e.g. RHM-AZR-001), size and measurement units, features list, location details, interactive inquiry form, and a dedicated "Chat on WhatsApp" button with pre-filled encoded message including property title and reference code.
- `/services` — Full company services showcase.
- `/about` — About Rahama Land and Property Development Ltd., company mission, leadership, and RC credentials.
- `/contact` — Contact page with phone numbers, WhatsApp, office address in Azare, and general enquiry form.
- `/privacy` — Privacy and legal disclaimer.

## Admin Dashboard Routes & Management Portal
- `/admin/login` — Clean, secure administrative login interface.
- `/admin` — Protected overview dashboard: Total inventory, available listings, active enquiries, total valuation, and recent activity.
- `/admin/properties` — Complete property management table: List, search, filter by status, modal/page to Create New Property, Edit Property, toggle status (Draft, Published, Reserved, Sold, Archived), and manage images and details.
- `/admin/enquiries` — Leads and enquiry pipeline: View buyer submissions, property reference, contact details, date, status tags (New, Contacted, Viewing Scheduled, Closed), and internal notes.

Make the UI polished, mobile-first, responsive, and include realistic, clearly structured initial sample data for Azare/Bauchi properties.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://rahama-property-compass.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7d1805bf-4504-4ece-bfb5-4b9012a9a086).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
