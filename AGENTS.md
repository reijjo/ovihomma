# AGENTS.md

This repository is a small Astro site for `ovia`.

Keep the guide simple and memorable. Prefer the least complex solution that fits the task.

## Project Layout

- `src/pages/` holds all route pages.
- `src/pages/en/` holds the English routes.
- `src/components/` holds shared components used by pages.
- `src/components/layouts/` holds layout-level components like `Head`, `Navbar`, `Footer`, and `Layout`.
- `src/components/ui/` holds small reusable UI primitives.
- `src/components/pages/<page-name>/` holds components used only by one page or route group.
- `src/styles/` holds global CSS and shared style files.
- `public/` holds static assets such as images and icons.

## Common Commands

- `bun install` - install dependencies
- `bun dev` - start the local dev server
- `bun build` - run type checks and create a production build
- `bun preview` - preview the built site locally
- `bun astro ...` - run Astro CLI commands

## Working Notes

- Keep changes aligned with the existing Astro structure.
- Prefer editing existing components and styles over adding new patterns.
- Preserve the bilingual page structure already present in `src/pages/`.
- Co-locate page-specific components with the page they support instead of putting everything in one flat components folder.
- Move a component up into a shared folder only when it is actually reused.
- Respect Astro documentation and Astro best practices.
- Avoid overengineering. If a simple solution works, use it.
- Use ASCII by default unless a file already clearly uses other characters.

## Verification

- Run `bun build` after code changes when possible.
- Check that new routes are added under `src/pages/` and shared pieces stay in `src/components/`.
