# Mnemonic

A local-first spaced repetition web app with topic graphs.

## Quick Start

```bash
bun install      # Install dependencies
bun run dev      # Start development server
bun run build    # Build for production
bun test         # Run all tests
```

## Architecture

**Monorepo with bun workspaces:**
- `packages/core` - Shared types, FSRS logic, database schema
- `packages/web` - React application

**Stack:**
- React 18 + TypeScript
- Zustand (state management)
- Tailwind CSS + shadcn/ui
- KaTeX (LaTeX rendering)
- Dexie.js (IndexedDB)
- ts-fsrs (scheduling algorithm)
- Vite (build tool)
- Bun (package manager + runtime)

## Key Conventions

- **Local-first**: All data stored in IndexedDB, no server required
- **Card types**: Basic (Q&A), Cloze (`{{c1::hidden}}`), Formula (auto-reversible)
- **FSRS**: Uses ts-fsrs for spaced repetition scheduling
- **2-button reviews**: Forgot (Again) / Remembered (Good) simplicity
- **Design system**: "Mathematical Zen" aesthetic with Newsreader + DM Sans fonts

## Project Structure

```
packages/
  core/src/
    models/     # Card, Topic, Session, Stats interfaces
    db/         # Dexie schema, database service, seeds
    fsrs/       # Scheduler and queue builder
    utils/      # Cloze parser, helpers
  web/src/
    components/
      ui/       # shadcn/ui components (Button, Card, etc.)
      review/   # ReviewCard, ReviewControls, SessionProgress
      cards/    # QuickAddModal, CardBrowser, CardForm
      topics/   # TopicTree, TopicPicker
    pages/      # Dashboard, Review, Cards, Topics
    stores/     # Zustand stores (review, card, topic)
    hooks/      # useKeyboardShortcuts, etc.
    styles/     # globals.css with CSS variables
```

## Key Files

- `packages/core/src/db/database.ts` - All database operations
- `packages/core/src/fsrs/scheduler.ts` - FSRS integration
- `packages/web/src/stores/review-store.ts` - Review session state
- `packages/web/src/styles/globals.css` - Design system variables

## Testing

```bash
bun test                    # Run all tests
bun test --filter core      # Core package only
bun test --filter web       # Web package only
```

Uses Vitest + Testing Library. Core tests use fake-indexeddb for database testing.
