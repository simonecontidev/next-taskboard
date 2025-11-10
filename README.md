# 🧭 Next Taskboard — A Modern Productivity Playground

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![MUI](https://img.shields.io/badge/MUI-6.0-007FFF?logo=mui)](https://mui.com/)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-11.0-EF007B?logo=framer)](https://www.framer.com/motion/)
[![GSAP](https://img.shields.io/badge/GSAP-3.12-green?logo=greensock)](https://greensock.com/)
[![DnD Kit](https://img.shields.io/badge/DnD--Kit-Drag%20%26%20Drop-orange)](https://github.com/clauderic/dnd-kit)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel)](https://next-taskboard.vercel.app)

---

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

![preview](public/preview.jpg)

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

# 4. Open in browser
http://localhost:3000 ✨

```
---

## Folder Structure

src/
├─ app/
│  ├─ layout.tsx             # MUI SSR-safe provider
│  └─ page.tsx               # Home + Theme toggle
│
├─ components/
│  ├─ ToDoContainer.tsx      # Main board
│  ├─ SortableTodoItem.tsx   # DnD-enabled task card
│  ├─ TaskDetailsDialog.tsx  # Task modal
│  └─ ColorModeProvider.tsx  # Theme context
│
├─ lib/
│  └─ persist.ts             # localStorage helpers
│
├─ theme.ts                  # Dynamic palette
└─ types.ts                  # Shared types

---

## Next Iterations
	•	🔁 Undo action for delete/reorder
	•	🧩 Subtasks inline editor
	•	☁️ Cloud sync (Supabase or Firebase)
	•	🔗 Shareable public board links
	•	🧪 Test suite with Playwright + Jest


---

## Design Philosophy
“Organize your tasks — and make it feel good.”

	•	Focus: clarity, smooth motion, zero clutter
	•	Aesthetic: modern, fluid, MUI-native
	•	Goal: merge productivity with playful UX
	•	Tone: confident, focused, elegant
	•	Influence: Notion, Linear, and modern motion systems

---

## License
MIT License — free to use, fork, and adapt for educational or portfolio purposes.

⸻

“Next Taskboard turns productivity into flow.” 🧭
