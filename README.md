# Meeting Room Booking App (MRBA)

A modern meeting room booking application built with Next.js 16, TypeScript, and Tailwind CSS v4.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [HeroUI](https://www.heroui.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Form Handling:** [React Hook Form](https://react-hook-form.com/)
- **Backend Services:** [Firebase](https://firebase.google.com/) (Authentication + Firestore)
- **Package Manager:** [Yarn](https://yarnpkg.com/)

## Getting Started

### Prerequisites

- Node.js 18.17.0 or higher
- Yarn package manager
- Firebase project (for authentication and database)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd mrba
```

2. Install dependencies:

```bash
yarn install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Run the development server:

```bash
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
mrba/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth route group (login, register)
│   │   ├── (dashboard)/        # Dashboard route group
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── providers.tsx       # App providers (HeroUI)
│   │   └── globals.css         # Global styles (Tailwind v4)
│   ├── components/
│   │   ├── layout/             # Layout components (Header, Sidebar, Footer)
│   │   ├── ui/                 # Reusable UI components
│   │   └── features/           # Feature-specific components
│   │       ├── auth/           # Authentication components
│   │       ├── rooms/          # Room-related components
│   │       └── bookings/       # Booking-related components
│   ├── lib/
│   │   ├── firebase/           # Firebase configuration
│   │   └── utils/              # Utility functions
│   ├── services/               # API services (Firebase operations)
│   │   ├── auth.service.ts     # Authentication service
│   │   ├── rooms.service.ts    # Rooms service
│   │   └── bookings.service.ts # Bookings service
│   ├── store/                  # Zustand stores
│   │   ├── auth.store.ts       # Auth state
│   │   ├── rooms.store.ts      # Rooms state
│   │   └── bookings.store.ts   # Bookings state
│   ├── types/                  # TypeScript types
│   │   ├── auth.types.ts
│   │   ├── room.types.ts
│   │   └── booking.types.ts
│   ├── hooks/                  # Custom React hooks
│   └── constants/              # App constants
├── .husky/                     # Git hooks
└── [config files]              # Various configuration files
```

## Available Scripts

| Script               | Description                  |
| -------------------- | ---------------------------- |
| `yarn dev`           | Start development server     |
| `yarn build`         | Build for production         |
| `yarn start`         | Start production server      |
| `yarn lint`          | Run ESLint                   |
| `yarn lint:fix`      | Run ESLint with auto-fix     |
| `yarn format`        | Format code with Prettier    |
| `yarn format:check`  | Check code formatting        |
| `yarn stylelint`     | Run Stylelint on CSS         |
| `yarn stylelint:fix` | Run Stylelint with auto-fix  |
| `yarn type-check`    | Run TypeScript type checking |
| `yarn validate`      | Run all validations          |

## Code Quality

This project uses several tools to maintain code quality:

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting with import sorting
- **Stylelint** - CSS linting
- **Husky** - Git hooks for pre-commit validation
- **lint-staged** - Run linters on staged files

### Pre-commit Hooks

When you commit code, the following checks run automatically:

1. ESLint fixes JavaScript/TypeScript issues
2. Prettier formats the code
3. Stylelint fixes CSS issues

## Path Aliases

The project uses TypeScript path aliases for cleaner imports:

| Alias            | Path                 |
| ---------------- | -------------------- |
| `@/*`            | `./src/*`            |
| `@/components/*` | `./src/components/*` |
| `@/lib/*`        | `./src/lib/*`        |
| `@/types/*`      | `./src/types/*`      |
| `@/hooks/*`      | `./src/hooks/*`      |
| `@/store/*`      | `./src/store/*`      |
| `@/services/*`   | `./src/services/*`   |
| `@/utils/*`      | `./src/lib/utils/*`  |
| `@/constants/*`  | `./src/constants/*`  |

## Firebase Setup

### Creating a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Follow the setup wizard
4. Enable Authentication (Email/Password)
5. Create a Firestore database

### Firestore Collections

The app uses the following collections:

- `users` - User profiles
- `rooms` - Meeting rooms
- `bookings` - Room bookings

### Security Rules

Configure Firestore security rules to protect your data:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    match /rooms/{roomId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    match /bookings/{bookingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

## Git Flow

This project follows Git Flow branching strategy:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature branches

## License

This project is private and not licensed for public use.

---

Built with Next.js 16 and TypeScript.
