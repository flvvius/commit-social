# social-media-app

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines Next.js, Convex, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Convex** - Reactive backend-as-a-service platform
- **Authentication** - Clerk
- **PWA** - Progressive Web App support
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
npm install
```

## Convex Setup

This project uses Convex as a backend. You'll need to set up Convex before running the app:

```bash
npm run dev:setup
```

Follow the prompts to create a new Convex project and connect it to your application. See [Convex + Clerk guide](https://docs.convex.dev/auth/clerk) for auth setup.

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
Your app will connect to the Convex cloud backend automatically.







## Project Structure

```
social-media-app/
├── apps/
│   ├── web/         # Frontend application (Next.js)
├── packages/
│   ├── backend/     # Convex backend functions and schema
│   │   ├── convex/    # Convex functions and schema
│   │   └── .env.local # Convex environment variables
```

## Available Scripts

- `npm run dev`: Start all applications in development mode
- `npm run build`: Build all applications
- `npm run dev:web`: Start only the web application
- `npm run dev:setup`: Setup and configure your Convex project
- `npm run check-types`: Check TypeScript types across all apps
- `cd apps/web && npm run generate-pwa-assets`: Generate PWA assets

## Styling and gradients

We've added a vibrant, accessible gradient system powered by Tailwind CSS v4 and OKLCH tokens:

- App background: applied via the `bg-app` class in `apps/web/src/index.css` for subtle colorful blobs that adapt to dark mode.
- Primary gradient helpers:
	- `bg-gradient-primary` – background gradient (purple → pink → blue)
	- `text-gradient-primary` – gradient text utility
	- `gradient-border` – decorative 1px gradient border using a mask

Use them in components/pages as regular classes. Examples:

```tsx
// Button (shadcn):
<Button variant="gradient">Get Started</Button>

// Any element background:
<div className="rounded-xl p-6 bg-gradient-primary text-white">…</div>

// Gradient text:
<h1 className="text-3xl font-bold text-gradient-primary">Commit</h1>
```

Brand colors are defined as OKLCH variables in `apps/web/src/index.css` under `:root` and have dark-mode adjustments. Tweak `--brand-pink`, `--brand-purple`, and `--brand-blue` to fine-tune the palette.
