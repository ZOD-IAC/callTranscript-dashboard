# Call Transcript Dashboard

A single-page dashboard for browsing, filtering, and searching call transcript records. Built for the Adstia Agency frontend engineering task.

## Setup

Requires Node.js 18+.

```bash
git clone https://github.com/ZOD-IAC/callTranscript-dashboard.git
cd callTranscript-dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No environment variables, API keys, or backend setup needed — `calls.json` is served statically from `/public` and fetched client-side.

To verify a production build works:

```bash
npm run build
npm start
```

## Challenges

- **Filters and search felt sluggish.** Every keystroke in the search/duration inputs was updating the URL directly, which re-ran filtering across all 300 records and re-rendered the table on every character. Fixed by keeping those inputs in local component state and only pushing to the URL (and therefore re-filtering) 300ms after typing stops. Checkbox filters (agent, outcome) update immediately since they're single clicks, not typed input.

- **Making "closing the detail view returns you to exactly where you were" actually true.** Rather than treating the detail view as a separate route, the selected call's id is just another URL query parameter (`?call=c_10428`) alongside the filters. Closing it just removes that one param — the page never navigates, so scroll position, filters, and pagination are untouched. This also means a shared link with a call open reopens directly to that call.

- **Composing filters + search + sort + pagination without them drifting out of sync.** All four are derived from one pipeline (filter → sort → slice for the current page) instead of each UI piece tracking its own version of "what's currently shown." The summary strip reads from the same filtered set before pagination, so its totals always match what filtering (not the current page) produced.

- **Handling missing data.** Some records have `sentiment: null` rather than a number, which wasn't obvious from the spec's sample record. Updated the type to `number | null` and handled it explicitly in sorting, display (shows "—"), and color-coding rather than assuming clean data.

## AI usage

I used Claude (Anthropic) throughout this project for:

- **Scaffolding** — initial Next.js + TypeScript + Tailwind + shadcn/ui project structure, including the `Call` type, the URL-state hook (`useDashboardState`), and the filter/sort/summary logic module (`lib/calls.ts`).
- **Component code** — the results table, filters sidebar, summary cards, and the transcript detail modal were written with Claude, then adjusted by me for layout/UX (e.g. switching the detail view from a side panel to a centered modal, moving filters into a sidebar instead of a popover bar, bolding speaker labels in the transcript).
- **Debugging** — diagnosed and fixed a hydration error caused by nesting a `Button` inside a `PopoverTrigger asChild`, a mobile horizontal-overflow issue in the table, and a "setState in effect" React warning in the filter reset logic.
- **Performance** — identified that unfiltered URL updates on every keystroke were causing UI lag, and implemented debounced local state for text/number filter inputs plus memoizing the table component.

All architectural decisions (URL as the single source of truth for filter state, one derived filter→sort→paginate pipeline, sidebar layout for filters, modal for transcript detail) were made and reviewed by me; Claude wrote implementation code against those decisions and I integrated, tested, and adjusted it in my own dev environment.
