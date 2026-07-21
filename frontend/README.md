# PrajaNeeti (formerly MakeGovAccountable)

**PrajaNeeti** is a civic technology platform designed to bring transparency, accountability, and public discourse to government actions. Built with a "Modern Editorial" aesthetic, the platform treats government oversight with the seriousness of a financial newspaper.

## Core Pillars

1. **Information First**
   - A unified feed tracking government activities, legislative changes, and executive actions.
   - Organized by department, allowing citizens to filter and find exactly what they care about.

2. **Data & Oversight (Transparency Ledger)**
   - An open ledger tracking government spending, financial allocations, and audited records.
   - Designed for easy search, pagination, and sorting of official financial data.

3. **Letters & Discourse (Public Forums)**
   - A modern take on "Letters to the Editor."
   - Citizens can submit concerns and discuss ongoing government activities in a highly readable, typography-focused forum.
   - Includes semantic matching to connect similar concerns and related government context.

## Design System: "Modern Editorial"

The UI is built to evoke the feeling of a trusted broadsheet newspaper:
- **Colors**: Uses a warm newspaper off-white (`#F5F5F1`) and a faded charcoal ink (`#383838`) instead of harsh pure black and white.
- **Typography**: 
  - *Playfair Display* for massive mastheads and leading headlines.
  - *Source Sans 3* for highly legible article body text.
  - *Archivo Narrow* for uppercase metadata, tags, and small utility text.
- **Layout**: Complete absence of rounded corners (`0px` border radius). Elements are separated by 1px solid black hairline borders, creating a structured, columnar masonry grid.
- **No Gradients/Shadows**: Flat, stark, and analytical.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS v4 (with strict CSS variables for the editorial theme)
- **Database / Auth**: Supabase
- **Components**: Shadcn UI (heavily modified to remove styling and enforce the editorial look)
- **Typography**: `next/font/google` (Playfair Display, Source Sans 3, Archivo Narrow)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
