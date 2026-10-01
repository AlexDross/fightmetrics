# Document store rollout

How fightmetrics.app goes from bundled data files to the Supabase document
store. Background: `docs/STAGE_7_PLAN.md`, "Document store pivot".

**Safe to merge first.** With no `VITE_SUPABASE_*` variables in Vercel the app
runs in local mode, exactly as it does today. With the variables set but the
workspace not seeded yet, it shows the bundled snapshot read-only. Nothing goes
blank at any point.

## 1. Hosted project (Supabase dashboard)

1. Create a project (any name; e.g. `fightmetrics`). Note the **project ref**
   (the subdomain of its URL).
2. **Authentication → Users → Add user → Create new user**: your email, with
   "Auto Confirm User" ticked. Sign-in uses `shouldCreateUser: false`, so the
   owner account has to exist before the first magic link.
3. **Authentication → Sign In / Providers**: turn **off** "Allow new users to
   sign up".
4. **Authentication → URL Configuration**
   - Site URL: `https://fightmetrics.app`
   - Redirect URLs:
     - `https://fightmetrics.app/**`
     - `https://www.fightmetrics.app/**`
     - `http://localhost:54399/callback` (the CLI login)
5. **Project Settings → API Keys**: copy the project URL and the
   **publishable** key (`sb_publishable_…`). Never the secret key.

## 2. Schema

```bash
npx supabase login
npx supabase link --project-ref <ref>
npx supabase db push --dry-run
npx supabase db push
```

The dry run should list exactly two migrations:
`20260729190000_stage7_roles_schema.sql` and
`20260930120000_stage7_document_store.sql`. The second one creates the empty
public `fightmetrics` workspace. Never run `db reset --linked`.

## 3. Owner session, claim, seed (this machine)

Put the two public values in `.env.local` (gitignored) under the **FM_** names
— not `VITE_*`, which would point `npm run dev` at production:

```
FM_SUPABASE_URL=https://<ref>.supabase.co
FM_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Then:

```bash
node scripts/fm-store.mjs login you@example.com --create   # first time only; plain `login` afterwards
node scripts/fm-store.mjs claim
node scripts/fm-store.mjs seed
node scripts/fm-store.mjs status
```

Open the magic link on this computer. `--create` makes the account on that
first sign-in (do it before turning sign-ups off). `claim` makes you the owner; it only
works while the workspace has no owner. `seed` loads the bundled
`src/*Data.js` in one atomic batch, and refuses if the workspace already holds
documents. `status` should show identical counts for the files and the server.

## 4. Vercel

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for **Production**
(and Preview if you want previews live too), then redeploy. Vite inlines them
at build time, so only a new build picks them up.

Also set the same two values as GitHub **repository variables**
`FM_SUPABASE_URL` / `FM_SUPABASE_PUBLISHABLE_KEY`. That switches on
`.github/workflows/snapshot-documents.yml`, which commits the server's public
copy over `src/*Data.js` daily (after the unit suite passes) so research
scripts, the manifest generator and the rollback copy stay current.

## 5. Verify

- https://fightmetrics.app/upcoming loads, and the network panel shows
  `rpc/fm_read_documents` → 200.
- Info tab → sign in with the magic link → "Signed in · owner".
- Change a units-staked value: "Saving…" then "Saved". Reload, and it persists.
  Open it on your phone, and the same value is there.

From here on `/enter-card` and `/grade-card` write to the database. There is
no commit or deploy per card.

## Rollback

The website, the CLI and the snapshot workflow are three separate writers or
readers. Switch ALL of them, in this order, or the bundled files and the
database diverge (the CLI would keep writing the database while the site reads
the files, and the next snapshot would overwrite file-only changes).

1. **Pause writes.** No `/enter-card`, `/grade-card` or in-app edits until done.
2. **Take a complete, validated export** while the database is reachable:
   `node scripts/fm-store.mjs export --write-files`, then `npm test`, then
   commit the four `src/*Data.js` files. (If the database is unreachable, use
   the newest `documents-<run>` artifact from the *Snapshot document store*
   workflow — each run keeps a raw `documents.json` for 90 days.)
3. **Stop the snapshot writer:** `gh variable delete FM_SUPABASE_URL` and
   `gh variable delete FM_SUPABASE_PUBLISHABLE_KEY` (the workflow is inert
   without them).
4. **Switch the CLI to files:** remove the two `FM_SUPABASE_*` lines from
   `.env.local` (or run every command with `--files` / `FM_STORE=files`).
5. **Switch the site:** remove `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_PUBLISHABLE_KEY` from Vercel Production and redeploy
   (`vercel redeploy <current production url> --target production`).

The database itself is untouched. **There is no automatic file → database
sync** (`seed` deliberately refuses an initialized workspace). To switch back
on: if the files changed while rolled back, re-apply those changes through the
CLI after step 4 is restored (`enter_upcoming.mjs` / `grade_upcoming.mjs`, which
write the database once `FM_SUPABASE_*` is back), confirm
`node scripts/fm-store.mjs status` shows matching counts, then restore step 5
and finally step 3.
