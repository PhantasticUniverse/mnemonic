# Mnemonic

A local-first spaced repetition web app with topic graphs. Built with a focus on the review experience and mathematical content.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- **Spaced Repetition**: Uses the FSRS algorithm for optimal review scheduling
- **LaTeX Support**: Render mathematical formulas with KaTeX
- **Topic Organization**: Hierarchical topic tree for organizing cards
- **Offline-First**: All data stored locally in IndexedDB
- **Dark Mode**: Automatic and manual theme switching
- **Keyboard Shortcuts**: Fast reviewing with Space, 1/j, 2/k
- **Session Resume**: Continue interrupted review sessions
- **Data Portability**: Export/import your data as JSON
- **Smooth Animations**: Card transitions during review

## Screenshots

The app features a clean, focused interface designed for studying:

- **Dashboard**: View due cards, streak, retention rate, and topic breakdown
- **Review**: Distraction-free card review with 2-button responses (Forgot/Remembered)
- **Cards**: Browse, search, edit, and manage your flashcard collection
- **Topics**: Organize cards in a hierarchical topic tree

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.0 or later)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mnemonic.git
cd mnemonic

# Install dependencies
bun install

# Start development server
bun run dev
```

The app will be available at `http://localhost:3000` (or next available port).

### Build for Production

```bash
bun run build
```

The built files will be in `packages/web/dist/`.

## Usage

### Creating Cards

- Press `Cmd/Ctrl + K` to open the quick-add modal
- Or navigate to the Cards page and click "Add Card"

### Card Types

- **Basic**: Simple question and answer
- **Cloze**: Use `{{c1::hidden text}}` syntax for fill-in-the-blank
  - With hints: `{{c1::hidden::hint}}`
  - Multiple deletions: `{{c1::first}} {{c2::second}}` (creates multiple cards)
- **Formula**: Use `{{f::name::formula}}` for auto-reversible equation cards
  - Example: `{{f::Pythagorean::a^2 + b^2 = c^2}}`
  - Creates two cards: name → formula and formula → name

### Editing Cards

Click the edit button on any card in the Card Browser to modify it.

### LaTeX

Use standard LaTeX syntax in cards:
- Inline: `$E = mc^2$`
- Block: `$$\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$`

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Reveal answer |
| `1` or `j` | Forgot |
| `2` or `k` | Remembered |
| `Cmd/Ctrl + K` | Quick add card |
| `Esc` | Exit/Close |

### Data Management

From the Dashboard, you can:
- **Export Data**: Download a JSON backup of all your cards, topics, and stats
- **Import (Merge)**: Add data from a backup without overwriting existing data
- **Import (Replace)**: Replace all data with the backup contents

## Architecture

```
mnemonic/
├── packages/
│   ├── core/           # Shared logic
│   │   ├── models/     # TypeScript interfaces
│   │   ├── db/         # IndexedDB with Dexie.js
│   │   ├── fsrs/       # Spaced repetition scheduler
│   │   └── utils/      # Cloze/formula parser, helpers
│   └── web/            # React application
│       ├── components/ # UI components
│       ├── pages/      # Route pages
│       ├── stores/     # Zustand state
│       └── styles/     # Tailwind + CSS variables
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **State**: Zustand
- **Database**: Dexie.js (IndexedDB)
- **Scheduling**: ts-fsrs
- **Math**: KaTeX
- **Package Manager**: Bun

## Development

```bash
# Run tests (71 tests)
bun test

# Run tests for a specific package
bun test --filter core
bun test --filter web

# Lint code
bun run lint

# Format code
bun run format
```

### Test Coverage

- **Scheduler tests**: FSRS scheduling, interval formatting, due date calculations
- **Queue builder tests**: Card filtering, topic interleaving, micro/standard modes
- **Parser tests**: Cloze deletions, formula cards, edge cases

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [FSRS](https://github.com/open-spaced-repetition/fsrs4anki) - Free Spaced Repetition Scheduler algorithm
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [KaTeX](https://katex.org/) - Fast LaTeX rendering
