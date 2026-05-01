# Workspace

## Overview

pnpm workspace monorepo using TypeScript. This project is a **Clinical Decision Support System (CDSS)** — an AI-powered mobile app for doctors, featuring voice/text input, AI differential diagnosis, suggested tests, treatment guidance, and emergency alerts.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Mobile**: Expo (React Native) + Expo Router
- **AI**: OpenAI GPT (case analysis) + Whisper (voice transcription) via Replit AI Integration

## Artifacts

- `artifacts/api-server` — Express + TypeScript REST API (port 8080, path `/api`)
- `artifacts/cdss-mobile` — Expo React Native mobile app (Expo Router)

## Key Libraries

- `lib/api-spec` — OpenAPI spec + Orval codegen config
- `lib/api-client-react` — Generated React Query hooks + custom fetch
- `lib/api-zod` — Generated Zod schemas from OpenAPI spec
- `lib/db` — Drizzle ORM schema and migrations (patient_cases, case_analyses tables)
- `lib/integrations-openai-ai-server` — OpenAI server integration helpers

## Database Schema

- `patient_cases` — stores patient info, symptoms, chief complaint, status, emergency flag
- `case_analyses` — stores AI analysis results (diagnoses, tests, treatments, follow-up questions)

## Key API Endpoints

- `GET /api/cases` — list all cases
- `POST /api/cases` — create case
- `GET /api/cases/:id` — get case with analyses
- `PUT /api/cases/:id` — update case
- `DELETE /api/cases/:id` — delete case
- `POST /api/cases/:id/analyze` — AI analysis (GPT, returns differential diagnoses with confidence levels, tests, treatments)
- `POST /api/transcribe` — standalone audio-to-text (Whisper)
- `POST /api/cases/:id/transcribe` — transcribe audio for a specific case

## Mobile App Features

- Cases list tab (sorted by emergency first, then date)
- New Case tab — dual voice/text input, patient info, clinical presentation
- Case detail screen — tabbed view: diagnoses, tests, treatments, follow-up, raw analysis
- About/settings tab
- Voice recording uses `expo-audio` (NOT deprecated expo-av)
- Navy/teal medical color theme

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Metro Config Note

`artifacts/cdss-mobile/metro.config.js` is configured with `watchFolders` pointing to the workspace root so Metro can resolve workspace packages (like `@workspace/api-client-react`) from their source in `lib/`.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
