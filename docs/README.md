# Degree Plan Assistant

> A tool to help university students plan their academic path without the headache.

## The Problem

Planning a 4-year degree at Al Akhawayn University is surprisingly hard. Course prerequisites
are complex, semester availability varies, and one wrong choice can delay graduation by
a full semester. Most students figure this out manually or rely on an advisor who's
already stretched thin.

## What This Does

The Degree Plan Assistant takes a student's completed courses and target graduation
date, then generates a valid, optimized course sequence — respecting prerequisites,
credit limits, and course availability.

## My Contribution

- Built the **prerequisite validation engine** (TypeScript) — checks whether a proposed
  schedule violates any dependency rules across the full course catalog
- Designed the **course sequencing logic** that distributes courses across semesters
  while respecting credit hour limits
- Worked on the **data model** for representing courses, prerequisites, and student
  progress
- Handled edge cases like repeated courses, elective substitutions, and part-time schedules

## Tech Stack

| Layer    | Technology         |
|----------|--------------------|
| Language | TypeScript         |
| Runtime  | Node.js            |
| Data     | JSON / local store |
| Other    | Git                |

## How to Run

```bash
