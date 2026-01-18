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
- **Card types**: Basic (Q&A), Cloze (`{{c1::hidden}}`), Formula (`{{f::name::formula}}`)
- **FSRS**: Uses ts-fsrs for spaced repetition scheduling
- **2-button reviews**: Forgot (Again) / Remembered (Good) simplicity
- **Design system**: "Mathematical Zen" aesthetic with Newsreader + DM Sans fonts

## Card Syntax

### Cloze Deletions
```
{{c1::hidden text}}           # Basic cloze
{{c1::hidden::hint}}          # Cloze with hint
{{c1::first}} {{c2::second}}  # Multiple clozes (creates multiple cards)
```

### Formula Cards (Auto-Reversible)
```
{{f::Chain Rule::f'(g(x)) · g'(x)}}
```
Creates two cards:
- Forward: "Chain Rule" → "$f'(g(x)) · g'(x)$"
- Reverse: "$f'(g(x)) · g'(x)$" → "Chain Rule"

## Project Structure

```
packages/
  core/src/
    models/     # Card, Topic, Session, Stats interfaces
    db/         # Dexie schema, database service, seeds
    fsrs/       # Scheduler and queue builder
    utils/      # Cloze parser, formula parser, helpers
  web/src/
    components/
      ui/       # shadcn/ui components (Button, Card, Dialog, etc.)
      review/   # ReviewCard, ReviewControls, SessionProgress
      cards/    # CardFormModal, CardBrowser, QuickAddModal
      topics/   # TopicTree, TopicPicker
    pages/      # Dashboard, Review, Cards, Topics
    stores/     # Zustand stores (review, card, topic)
    hooks/      # useKeyboardShortcuts, etc.
    styles/     # globals.css with CSS variables
```

## Key Files

- `packages/core/src/db/database.ts` - All database operations + export/import
- `packages/core/src/fsrs/scheduler.ts` - FSRS integration
- `packages/core/src/utils/cloze-parser.ts` - Cloze and formula parsing
- `packages/web/src/stores/review-store.ts` - Review session state
- `packages/web/src/components/cards/CardFormModal.tsx` - Create/edit card modal
- `packages/web/src/styles/globals.css` - Design system variables

## Features

- **Session Resume**: Interrupted sessions can be resumed from Dashboard
- **Data Export/Import**: JSON backup with merge or replace modes
- **Card Animations**: Smooth exit/enter transitions during review
- **Edit Cards**: Click edit button in CardBrowser to modify existing cards

## Testing

```bash
bun test                    # Run all tests (71 tests)
bun test --filter core      # Core package only
bun test --filter web       # Web package only
```

**Test files:**
- `packages/core/src/fsrs/scheduler.test.ts` - FSRS scheduling tests
- `packages/core/src/fsrs/queue-builder.test.ts` - Queue building logic tests
- `packages/core/src/utils/cloze-parser.test.ts` - Cloze and formula parsing tests

Uses Vitest + Testing Library.

## Database Services

```typescript
// Card operations
cardService.create(input)
cardService.update(input)
cardService.delete(id)
cardService.getById(id)
cardService.getAll()
cardService.getDueCards()

// Session operations
sessionService.create(input)
sessionService.getActive()
sessionService.hasActiveSession()
sessionService.abandonSession()
sessionService.complete(id)

// Data portability
dataService.exportAll()           // Returns full backup
dataService.importAll(data, mode) // mode: 'merge' | 'replace'

// Stats
statsService.recordReview(remembered, isNew)
statsService.getStreak()
statsService.getRetentionRate(days)
```
