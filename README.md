# Nested Comments Thread

**A recursive comment system where replies nest to any depth — add, edit, reply and delete, with the whole thread persisted to localStorage.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-nested--comment--systemm.netlify.app-2ea44f?style=flat-square&logo=vercel&logoColor=white)](https://nested-comment-systemm.netlify.app/)
![React 19](https://img.shields.io/badge/React_19-61dafb?style=flat-square&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646cff?style=flat-square&logoColor=white)
![Custom Hooks](https://img.shields.io/badge/Custom_Hooks-0969da?style=flat-square&logoColor=white)

<p align="center">
  <a href="https://nested-comment-systemm.netlify.app/">
    <img src="docs/preview.png" alt="Nested Comments Thread — desktop preview" width="100%">
  </a>
</p>

## Overview

A comment thread is a tree, not a list, and that is the interesting part of this project. Every reply can itself be replied to, so the UI is a recursive component that renders itself for each child, and the state logic has to insert, update and delete nodes at an arbitrary depth without flattening the structure.

All of that logic lives in one custom hook, `useThreads`, which exposes `addThreadItem`, `editThreadItem` and `removeThreadItem`. It persists the tree to `localStorage` on every change, so a reload keeps the conversation.

## Features

- Replies nest to unlimited depth, rendered by a self-recursive `ThreadItem` component
- Add a root comment or reply to any node
- Inline editing with an `edited` flag on the item
- Delete any node, root or nested
- Like / dislike counters per comment
- Initials avatar, author name and relative timestamp per item
- Whole tree persisted to `localStorage` through the `useThreads` hook
- Component-scoped styling with CSS Modules

## Tech Stack

| Layer | Technology |
| --- | --- |
| UI | React 19 |
| State | Custom `useThreads` hook + `localStorage` |
| Styling | CSS Modules |
| Build | Vite, ESLint |

## Screenshots

| Desktop | Mobile |
| :---: | :---: |
| <img src="docs/preview.png" alt="Desktop view"> | <img src="docs/preview-mobile.png" alt="Mobile view" width="230"> |

## Getting Started

```bash
git clone https://github.com/Mister2314/Nested-Comments-Thread.git
cd Nested-Comments-Thread
npm install
npm run dev
```

## Project Structure

```
src/hooks/UseThread.js — the whole thread model: add, edit, remove, persist
src/components/Comment/ThreadItem.jsx — one comment; renders itself for each reply
src/components/Comment/ReplyForm.jsx — inline reply composer
src/utils/utils.js — shared helpers
src/App.jsx — thread root and layout
```

## Notes

The recursion is the easy part — keeping `localStorage` in sync without writing the tree twice is what the hook is really for. Mutating a node at depth *n* means rebuilding every ancestor on the path, and that is exactly what `addThreadItem` does.

## Author

**Xəyal Hüseynli** — Junior Front-End Developer

[Portfolio](https://hypnosdev.vercel.app) · [GitHub](https://github.com/Mister2314) · [LinkedIn](https://www.linkedin.com/in/x%C9%99yal-h%C3%BCseynli-3487b91ba/) · [xeyalhuseynli06@gmail.com](mailto:xeyalhuseynli06@gmail.com)
