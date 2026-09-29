# Just Us

A private, shared space for two — built from a single text message into a working app.

## What it does

- **Bucket List** — shared items either person can add, check off, edit, or remove
- **Goals** — individual savings/study/work goals with progress bars, visible to both, editable only by the owner
- **Notes** — a shared board for leaving each other short notes
- **Memories** — photos with captions and a date, stored privately
- **Reminders** — date/time reminders, either shared or private to one person
- **Offline mode** — the app opens and shows the last-seen data with no internet connection

## How it's built

- **Next.js**, hosted on **Vercel** — every push to GitHub deploys automatically
- **Supabase** for the database, login, and private photo storage
- Installed as a **PWA** — added to the home screen, opens full-screen with its own icon, no App Store involved
- Closed to exactly two accounts — no public sign-up
- Row Level Security on every table, so the database itself enforces who can see and edit what, not just the screen

## Status

All planned features are live and in daily use. Built entirely from an iPad, in chat with Claude, no local development environment — Vercel builds and runs the app; the iPad only writes files and pushes to GitHub.
