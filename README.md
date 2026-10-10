# SafeTrip

SafeTrip is a database-backed crisis information and assistance website for tourists. It provides verified alerts, hazards, shelters, diplomatic contacts, emergency services, and an assistance request workflow in a responsive web interface.

## Features

### Tourist dashboard

- Database-backed crisis hub with:
  - Scrollable active disaster and advisory feed
  - Severity and verification status
  - Issuer and source attribution
  - Official instructions
  - Issue timestamps
- Live incident map using Leaflet and OpenStreetMap tiles.
- Map markers for:
  - Hazards and closures
  - Shelters and relief hubs
  - Diplomatic missions
  - Tourist location
- Active hazard and road-closure records.
- Responsive two-column shelter and relief-hub cards that collapse to one column on mobile.
- Shelter capacity, distance, amenities, verification time, source, and map links.
- Google Maps links for shelters with stored coordinates.
- Embassy and consulate directory with:
  - Country flags
  - Regions
  - Emergency phone numbers
  - Duty-desk labels
  - Source links
- Emergency contact directory.
- Authenticated urgent-assistance request form.
- Database-generated assistance reference codes.

### Authentication

- Tourist account sign-up.
- Email and password sign-in.
- Guest access.
- Secure, hashed passwords using `bcryptjs`.
- Hashed, seven-day session tokens stored in PostgreSQL.
- Logout and current-user session lookup.
- Protected assistance and authority routes.

### Authority console

- Separate authority workspace.
- Authority-only route protection.
- Alert authoring interface with:
  - Alert title
  - Severity
  - Affected area
  - Official instructions
  - Save-draft and publish actions in the console UI

### Personalization and accessibility

- Free translation support through the MyMemory Translation API.
- Language selector for major Indian and international languages:
  - English, Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati
  - Kannada, Malayalam, Punjabi, Urdu
  - Spanish, French, German, Arabic, Portuguese, Chinese, Japanese
- Translation caching in the browser.
- English fallback when the translation service is unavailable.
- Country flags are preserved during translation.
- Persistent light and dark mode.
- Responsive layouts for desktop, tablet, and mobile.
- Light-mode contrast adjustments for cards, badges, muted text, forms, maps, and controls.
- Keyboard-friendly buttons, links, labels, and accessible map descriptions.

## Technology

- Node.js with ECMAScript modules
- Express 5
- PostgreSQL
- `pg`
- `bcryptjs`
- `dotenv`
- Vanilla HTML, CSS, and JavaScript
- Leaflet
- OpenStreetMap
- MyMemory Translation API

## Requirements

- Node.js 18 or newer
- npm
- PostgreSQL 14 or newer

## Installation

First, fork this repository to your own GitHub account. Then clone your fork and install dependencies:

```bash
git clone https://github.com/<your-username>/<your-fork>.git
cd SafeTrip
npm install
```

Create a `.env` file in the project root and configure the external PostgreSQL database:

```dotenv
DATABASE_URL=postgresql://username:password@localhost:5432/safetrip
PORT=3000
```

Optional SSL configuration:

```dotenv
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
```

The application connects to the configured external database through `DATABASE_URL`. Ensure the database is running and reachable before starting SafeTrip.

## Database setup

Initialize the schema and insert the sample records:

```bash
npm run db:seed
```

The seed file is idempotent for its sample records and includes diverse alerts, hazards, shelters, diplomatic missions, and emergency contacts.

Create or update an authority account:

```bash
npm run db:create-authority -- "Control Room Officer" authority@example.com "ChangeMe123!"
```

Alternatively, provide these values in `.env`:

```dotenv
AUTHORITY_NAME=Control Room Officer
AUTHORITY_EMAIL=authority@example.com
AUTHORITY_PASSWORD=ChangeMe123!
```

Then run:

```bash
npm run db:create-authority
```

Use a strong password outside local development.

## Running the application

Start the database helper and web server:

```bash
npm start
```

For development with automatic server restarts:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Main routes

| Route                | Purpose                              |
| -------------------- | ------------------------------------ |
| `/`                  | Tourist dashboard                    |
| `/guest`             | Guest tourist access                 |
| `/login`             | Sign-in page                         |
| `/signup`            | Sign-up page                         |
| `/assistance`        | Authenticated urgent-assistance form |
| `/authority`         | Authority console                    |
| `/authority-console` | Alias for the authority console      |

## API routes

| Method | Route              | Purpose                                                  |
| ------ | ------------------ | -------------------------------------------------------- |
| `POST` | `/api/auth/signup` | Create a tourist account                                 |
| `POST` | `/api/auth/login`  | Start a session                                          |
| `POST` | `/api/auth/logout` | End the current session                                  |
| `GET`  | `/api/auth/me`     | Return the signed-in user                                |
| `GET`  | `/api/dashboard`   | Return alerts, hazards, shelters, missions, and contacts |
| `GET`  | `/api/alerts`      | Return active alerts                                     |
| `GET`  | `/api/shelters`    | Return open shelters                                     |
| `POST` | `/api/assistance`  | Submit an authenticated assistance request               |

## Project structure

```text
.
├── db/
│   ├── connection.js       PostgreSQL connection configuration
│   ├── schema.sql          Database schema
│   ├── seed.sql            Sample crisis and support records
│   ├── seed.js             Schema and seed runner
│   ├── start.js            External database startup check
│   └── create-authority.js Authority account helper
├── public/
│   ├── app.js              Tourist dashboard rendering and interactions
│   ├── auth.html           Login and sign-up page
│   ├── auth.js             Authentication form behavior
│   ├── authority.html      Authority console
│   ├── i18n.js             Translation selector and API integration
│   ├── theme.js            Persistent light/dark theme
│   ├── styles.css          Main responsive styles
│   └── auth.css            Authentication page styles
├── server.js               Express server and API routes
└── package.json            Scripts and dependencies
```

## Translation notes

Translations use the free MyMemory Translation API directly from the browser. No API key is required by the current implementation.
