# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**IMPORTANT:** This document is written in English, but always make an effort to communicate with users in **Japanese**.

## Project Overview

KEMOTAG is a digital business card exchange web app for doujin events and meetups. Users can create public profiles (digital business cards) and share them via URL/QR code. The MVP focuses on quick SNS (primarily X/Twitter) navigation from mobile devices.

See `docs/spec.md` for complete MVP specification.

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: Bun 1.1.0
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Linter/Formatter**: Biome *(not ESLint/Prettier)*
- **Database**: Supabase (Cloud project via Supabase CLI) + IndexedDB for local data

## Development Commands

```bash
# Development server
bun dev

# Production build
bun build

# Start production server
bun start

# Lint and check code
bun lint
```
## Rules for Implementation and Revision Proposals

### Basic Principles

1. **Present changes in diff format** (exception: new file creation)
2. **Always state the reason for the change**: “Why this change is necessary”
3. **Clearly specify the scope of impact**: “Files/functions affected by this change”

### Prohibited Actions

* Refactoring existing code not requested
* Code style changes unrelated to the change request
* Rewrites for performance optimization (unless explicitly requested)

### When Creating New Files

* Explicitly mark as `[New File]`
* Explain the role and necessity of the file
* Present the complete file contents in diff format

## Code Style

**IMPORTANT**: This project uses Biome, not ESLint or Prettier.

- **Indentation**: 2 spaces
- **Semicolons**: As needed (ASI)
- **Quotes**: Double quotes
- **Trailing commas**: Always
- **Import organization**: Automatic via Biome

Run `bun lint` before committing. Biome enforces Next.js and React recommended rules.

## Architecture

### URL Structure

- Public profile pages: `/p/{profile_id}`
  - `profile_id`: 15-character base62 random ID (cryptographically secure, not `Math.random()`)
  - Must be URL-safe and non-guessable

### Data Architecture (Planned)

**Cloud Database:**
- `profiles`: Contains `profile_id` (PK), `owner_user_id`, `display_name`, `avatar_url`, `x_username`, timestamps
- `bookmarks`: Contains `user_id`, `profile_id` (unique constraint on pair), `deleted_at` (soft delete), timestamps

**Client-side IndexedDB:**
- `view_history`: Auto-saved on profile view, max 300 items (old entries deleted on overflow)
  - Stores: `profile_id`, `last_viewed_at`, `display_name`, `x_username`
- `saved_local`: User bookmarks saved locally, synced to cloud only when logged in
  - Supports soft delete (`deleted_at`)

### Key Design Principles

#### Core Rules

- DRY (Don't Repeat Yourself)
    - Identify and abstract redundant logic into reusable functions or modules to ensure a Single Source of Truth.

- KISS (Keep It Simple, Stupid)
    - Prioritize simple, idiomatic, and readable code over clever hacks or overly complex abstractions.

- YAGNI (You Ain't Gonna Need It)
    - Implement only what is strictly required for the current task; do not add speculative features or 'just-in-case' generalizations.

#### SOLID Principle

*Adopt only the effective ones among the five principles.*

- SRP (Single Responsibility Principle)
    - A single module (file/function/component) should be changed for only one reason.

- OCP (Open–Closed Principle)
    - Design the structure so that new behavior can be added without breaking existing code.

#### Project Rules

1. **Mobile-first**: All UI optimized for smartphone display
2. **No login required for viewing**: Public profiles accessible without authentication
3. **Login required for creating**: Profile owners must authenticate
4. **Local-first bookmarks**: Bookmarks always saved to IndexedDB, synced to cloud only when logged in
5. **No cloud sync for view history**: History stays local only
6. **Soft deletes**: Use `deleted_at` for bookmarks (both client and cloud)

### Profile Requirements

**Required fields:**
- `display_name`: Handle name (mandatory)
- `avatar`: Avatar image (required, placeholder allowed until complete)
- `x_username`: X (Twitter) username (mandatory, normalized from URL or @username input)

**First-view priority**: Display these three elements immediately on profile load with large, tappable X link button.

### Authentication Flow (Planned)

- First login auto-creates `profiles` record with random `profile_id`
- Set `profiles.owner_user_id = user_id`
- Redirect to profile edit if required fields incomplete
- Non-logged-in users can view profiles and save bookmarks locally
- Logged-in users get bookmark cloud sync via optimistic updates

## Path Aliases

Use `@/*` for imports from `src/`:

```typescript
import { Component } from "@/components/Component"
```

## Out of Scope for MVP

- Event mode (lightweight routing, PWA optimization)
- Bookmark expiration/cleanup
- Additional SNS links beyond X (Discord, Pixiv - architecture should support future addition)
- Mutual exchange/approval/auto-follow features
- Cloud sync for view history
