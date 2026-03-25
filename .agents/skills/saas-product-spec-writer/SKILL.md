---
name: saas-product-spec-writer
description: Converts feature ideas, screen descriptions, or vague product requests into structured PRD-style specs that AI coding tools (Claude, GPT, Gemini) can act on directly. Use this skill whenever the user wants to build a new feature, screen, component, API endpoint, or database schema — especially when the request is rough or incomplete. Trigger on phrases like "I want to build", "add a feature", "how should I structure", "write a spec for", "help me plan this feature", "what should this screen do", or any request to design or implement a product feature. Always use this skill before writing code for a new feature.
---

## What this skill does

Takes a rough feature idea and outputs a clean, structured spec that:
- Defines exactly what to build (no ambiguity)
- Maps user stories to UI components and backend needs
- Identifies edge cases upfront
- Is formatted so Claude/GPT can immediately start building from it

## Product context

This skill is for a **two-vertical SaaS platform**:
- **Studio vertical**: Pilates/yoga/fitness studios — class scheduling, bookings, member management, payments
- **Wellness pro vertical**: Nutritionists, dietitians, fitness coaches — client management, sessions, payments

Builder: Solo founder, AI-assisted development (Claude + GPT + Gemini). Every spec must be implementable by AI coding tools without a human dev interpreting it.

---

## Spec output format

Always produce specs in this structure:

### 1. Feature name & vertical
Which vertical does this belong to? Studio, Wellness Pro, or Both (shared)?

### 2. One-line summary
What does this feature do in plain English?

### 3. User stories
Format: "As a [user], I want to [action] so that [outcome]."
- Keep to 3–5 stories max
- Be specific — no vague verbs like "manage" or "handle"

### 4. Screens / UI components
List every screen or component needed:
- Screen name
- Key UI elements (buttons, forms, tables, modals)
- Empty states
- Loading states
- Error states

### 5. Data model
What needs to be stored? For each entity:
- Table/collection name
- Key fields + data types
- Relationships to other tables

### 6. API endpoints (if applicable)
- Method + route (e.g. POST /api/bookings)
- Request payload
- Response payload
- Auth required: yes/no

### 7. Business logic & rules
Any conditions, calculations, or constraints:
- Validation rules
- Edge cases
- State transitions (e.g. booking: pending → confirmed → cancelled)

### 8. Out of scope
Explicitly list what this spec does NOT cover. Prevents scope creep.

### 9. Build order
Recommended sequence for AI-assisted implementation:
1. Data model first
2. API / backend logic
3. UI components
4. Wire UI to API
5. Edge cases + error states

---

## How to use this skill

**Input from user (can be rough):**
- "I want a class booking feature"
- "Build the client profile screen for wellness pros"
- "How should payments work?"

**Your job:**
1. If the request is too vague, ask ONE clarifying question only — the most important missing detail
2. Fill in reasonable defaults for everything else based on product context above
3. Output the full spec in the format above
4. End with: "Ready to build? Start with the data model."

## Tone & length
- Direct, technical, no filler
- Bullet points over paragraphs
- Spec should be copy-pasteable directly into a coding prompt
- Aim for 300–500 words per spec — enough detail to build from, not a novel