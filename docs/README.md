# Degree Plan Assistant

> A tool to help university students plan their academic path without the headache.

## The Problem

Planning a 4-year degree at Al Akhawayn University is surprisingly complex. Course
prerequisites overlap, semester availability changes, and one wrong choice can delay
graduation by a full semester. Most students figure this out manually or rely on an
advisor who's already stretched thin.

## What This Does

The Degree Plan Assistant takes a student's completed courses and generates a valid,
optimized course sequence — respecting prerequisites, credit limits, and course
availability per semester.

## My Contribution

- Built the **prerequisite validation logic** — checks whether a proposed schedule
  violates dependency rules across the full course catalog
- Designed the **course sequencing algorithm** that distributes courses across
  semesters while respecting credit hour limits
- Set up the **backend architecture** and contributed to the data model for courses,
  prerequisites, and student progress
- Configured **Docker** setup for consistent local development across the team
- Worked with the **n8n workflow layer** for automating degree-check logic

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Language   | TypeScript, JavaScript            |
| Backend    | Node.js                           |
| Automation | n8n (workflow engine)             |
| DevOps     | Docker, docker-compose            |
| Frontend   | HTML, CSS, JavaScript             |
| Other      | Git                               |

## How to Run

```bash
# Clone the repo
git clone https://github.com/Bsara435/degree-plan-assistant.git
cd degree-plan-assistant

# Start all services with Docker
docker-compose up
```

## Features

- Validates course prerequisites automatically
- Generates semester-by-semester plan
- Flags scheduling conflicts
- Supports different specializations

## What I'd Improve With More Time

- Pull live course data from the university catalog instead of a static list
- Add a visual drag-and-drop planner interface
- Export plans as PDF to share with academic advisors

## Built At

Al Akhawayn University, Ifrane — Academic tool project (2023)
