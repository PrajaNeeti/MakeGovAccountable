---
wave: 3
depends_on: ["04b-PLAN.md", "04c-PLAN.md", "04d-PLAN.md"]
files_modified:
  - "frontend/src/app/globals.css"
  - "frontend/src/components/layout/Navbar.tsx"
autonomous: true
must_haves:
  - "UI layout and polish improvements are applied"
  - "App is ready for MVP launch"
---

# Phase 4e: Finalize UI/UX Polish and Launch MVP

## Goal
Apply final design tweaks, ensure responsive navigation handles new routes, and finalize the Minimum Viable Product for launch.

<threat_model>
- **UX Degradation:** Medium risk if responsive layouts break on mobile. Mitigation: Ensure all new components use Tailwind's responsive prefixes.
</threat_model>

## Tasks

<task>
  <read_first>
    <file>.planning/phases/04-community-forums-transparency-portal/04-UI-SPEC.md</file>
    <file>frontend/src/components/layout/Navbar.tsx</file>
  </read_first>
  <action>
    Review and polish `frontend/src/components/layout/Navbar.tsx` (or equivalent main navigation).
    Add links to the Transparency Portal (`/transparency`) and ensure the mobile menu handles the new items gracefully.
  </action>
  <acceptance_criteria>
    Navigation includes Transparency link.
    Mobile menu is fully functional without layout breakages.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    <file>.planning/phases/04-community-forums-transparency-portal/04-UI-SPEC.md</file>
    <file>frontend/src/app/globals.css</file>
  </read_first>
  <action>
    Review the app's overall spacing and typography. Ensure consistent padding and margin across the newly added forums and transparency pages by adjusting container classes or global CSS in `frontend/src/app/globals.css` if necessary.
  </action>
  <acceptance_criteria>
    Consistent spacing exists across all major views.
    No obvious visual bugs or misaligned elements.
  </acceptance_criteria>
</task>
