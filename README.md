# MedShorts — Medical YouTube Shorts Knowledge Base

A responsive, static HTML app for capturing YouTube Shorts, detailed notes, exam pearls, active-recall questions, review dates, tags, and JSON backups.

## Included
- `index.html` — app layout and entry editor
- `styles.css` — responsive styling
- `app.js` — searchable/filterable library, edit/delete, review status, import/export
- `manifest.webmanifest` and `sw.js` — basic install/offline shell when hosted over HTTPS

## Start on a phone or PC
1. Extract this ZIP into a folder.
2. Open `index.html` in a browser to test it. Some offline/PWA features work only when served over HTTPS or localhost.
3. Add a few entries and test search/edit.
4. Press **Export backup** regularly. Keep the JSON file somewhere backed up.
5. To transfer between devices, export JSON on one device and import it on the other.

## Important: local storage is not cloud sync
This starter uses browser `localStorage`. Each browser/device has its own data. Hosting the HTML file on GitHub Pages does **not** make the saved entries sync between phone and PC. Import/export is the included portable fallback.

## Recommended cross-device cloud-sync architecture
For automatic sync while retaining a custom HTML interface, add **Supabase Auth + Postgres** (or Firebase Auth + Firestore):
- Create a private project.
- Enable email/password or magic-link sign-in.
- Create a `videos` table with columns: `id uuid primary key`, `user_id uuid`, `title text`, `url text`, `subject text`, `topic text`, `creator text`, `priority text`, `status text`, `review_date date`, `takeaway text`, `key_points text`, `reasoning text`, `pearls text`, `questions text`, `source text`, `tags text`, `created_at timestamptz`, `updated_at timestamptz`.
- Enable row-level security. Users must only select/insert/update/delete rows where `auth.uid() = user_id`.
- Add the Supabase JS client and sign-in UI; replace local-only persistence with authenticated database reads/writes.
- Never put a Supabase `service_role` key in browser JavaScript. Only the publishable/anon key is appropriate in client code, and only with correctly configured RLS.
- Keep JSON export/import as a backup even after cloud sync is added.

## Maximum-practical capture workflow
1. In YouTube, use Share → Copy link.
2. Open this app and add the URL, title, subject, and a one-line takeaway.
3. Later, process the video into key points, reasoning, exam pearls, recall questions, and verification source.
4. For a faster capture flow, build a tiny serverless `/capture` endpoint or authenticated form that accepts a shared URL and stores a new `Inbox` record. Android Share Sheet integration generally needs a PWA/native wrapper or an Android automation app; a plain static HTML page cannot automatically intercept YouTube's share action.
5. Metadata/transcript extraction is not guaranteed for every Short. Use official captions or a transcription service where permitted, and verify the generated notes against reliable medical sources.

## Suggested subject tags
Medicine, Surgery, Obstetrics & Gynaecology, Pediatrics, Ophthalmology, ENT, Community Medicine, Pathology, Pharmacology, Microbiology, Forensic Medicine.

## Medical safety
This is a personal learning organizer, not a clinical decision-support system. AI-generated summaries may be wrong or incomplete. Verify treatment recommendations, drug doses, emergency algorithms, diagnostic cutoffs, and current guidelines against authoritative sources. Do not store patient-identifiable information here.


## Supabase cloud sync edition

1. In Supabase, run the SQL table and row-level security policies supplied in the setup instructions.
2. In the live MedShorts app, open **Configure Supabase**, enter your Project URL and publishable key (or legacy anon key), then save. These values are stored in that browser's local storage.
3. Create an account with email and password or sign in. If email confirmation is enabled, confirm your email first.
4. Press **Sync now** on each device. The first sync merges local and cloud records by entry ID and latest updated timestamp. Deletions are stored as tombstones and sync as well.

Never use a Supabase `service_role` or secret key in this static website. The publishable/anon key is not a secret; the table's RLS policies are the access control. Keep JSON exports as backups.
