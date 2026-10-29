<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Data lives in a local mock store (src/lib/store.ts, localStorage) with typed models in src/lib/types.ts; swap its `actions` for backend calls when a database is connected, because every page reads only through `useStore`/`actions`.
- Admin sign-in is a demo-only placeholder (sessionStorage); replace with real authentication before going live.
- Vercel builds: vite.config.ts switches nitro to the `vercel` preset when `VERCEL` env is set; Lovable builds keep their own target. Why: default output is a Cloudflare worker, which Vercel can't run.
- Device photos are resized/re-encoded in the browser (src/lib/image-upload.ts) and stored as data URLs until real storage is connected. Why: zero-cost, no upload service.
