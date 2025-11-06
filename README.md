# 🧭 Next Taskboard — A Modern Productivity Playground

A sleek, animated **Next.js 15** task board built with **TypeScript**, **MUI v6**, **Framer Motion**, **GSAP**, and **DnD-Kit**.  
Designed as a real-world demo to showcase advanced React patterns, UI/UX micro-interactions, and clean architectural thinking.

> 🧑‍💻 Built by [Simone Conti](https://simoneconti.work) — creative developer blending code and design.

---

## ✨ Features

| Category            | Highlights                                                   |
| ------------------- | ------------------------------------------------------------ |
| 🧠 Core             | Smart task creation, editing, and persistence (LocalStorage) |
| 📦 Data Model       | `Todo` type with Priority, Labels, Due Dates, and Subtasks   |
| ⚡ Drag & Drop      | Reorder tasks vertically with `@dnd-kit/core`                |
| 🎨 Design System    | Material-UI (MUI) v6 + custom dark/light mode via context    |
| 🪄 Motion           | GSAP scroll reveals + Framer Motion transitions              |
| 🎚️ Filters          | Quick + advanced filters (priority, label, due status)       |
| 💬 Feedback         | Snackbar confirmations with undo potential                   |
| 🧩 Architecture     | Clean separation of components, hooks, and lib helpers       |
| 🧭 State Management | Pure React state + persistent sync through `/lib/persist.ts` |

---

## 🛠️ Tech Stack

- **Next.js 15** (App Router + TypeScript)
- **MUI v6** for theme and layout
- **GSAP + ScrollTrigger** for animation sequences
- **Framer Motion** for list transitions
- **DnD Kit** for drag & drop sorting
- **LocalStorage** for data persistence
- **Vercel** ready deployment (zero-config)

---

## 🌓 Dark / Light Mode

Full theme toggling with context persistence.  
Each component adapts automatically using MUI’s `palette.background` and `text` colors.

_(Add GIF preview here if available)_

---

## 🚀 Getting Started

```bash
# 1. Clone
git clone https://github.com/simonecontiart/next-taskboard.git
cd next-taskboard

# 2. Install dependencies
pnpm install

# 3. Run dev server
pnpm dev

Then open http://localhost:3000￼ ✨

```

---

## 🧩 Folder Structure

src/
├─ app/
│ ├─ layout.tsx # MUI SSR-safe provider
│ └─ page.tsx # Home + Theme toggle
├─ components/
│ ├─ ToDoContainer.tsx # Main board
│ ├─ SortableTodoItem.tsx # DnD-enabled task card
│ ├─ TaskDetailsDialog.tsx
│ └─ ColorModeProvider.tsx
├─ lib/
│ └─ persist.ts # localStorage helpers
├─ theme.ts # Dynamic palette
└─ types.ts # Shared types

---

## What This Demonstrates

    •	Responsive, theme-aware UI with zero hydration mismatch
    •	Complex list reordering logic with persisted order
    •	Custom dark/light system integrated with MUI + App Router cache
    •	Performance-friendly GSAP scroll animations
    •	Advanced React patterns for state lifting, filtering, and optimistic UI

---

## Next Iterations

    •	Undo action for delete/reorder
    •	Subtasks inline editor
    •	Cloud sync (Supabase or Firebase)
    •	Shareable public board links
    •	Test suite with Playwright + Jest

---

## License

MIT — Feel free to fork, study, and build upon this.
