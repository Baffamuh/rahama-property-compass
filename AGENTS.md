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
- All business data (properties, enquiries, zones, agents, sales, activity) is stored as JSON rows in one `app_records` table keyed by (collection, id); src/lib/store.ts loads it and every page reads only through `useStore`/`actions`. Why: one flexible table keeps the free tier simple and RLS decides what visitors vs admins see.
- Admin sign-in uses backend auth; admin access is checked via the has_role() database function on user_roles, never client storage. Why: secure role checks.
- Vercel builds: vite.config.ts switches nitro to the `vercel` preset when `VERCEL` env is set; Lovable builds keep their own target. Why: default output is a Cloudflare worker, which Vercel can't run.
- Property photos are resized and logo-watermarked in the browser (src/lib/image-upload.ts), uploaded to the private `property-photos` bucket and referenced by 10-year signed links. Why: workspace blocks public buckets; zero-cost, no image service.
