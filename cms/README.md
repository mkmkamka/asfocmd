# ASFOC — CMS (Sanity) setup

The site is CMS-ready: members, news/events and documents will be edited by
staff in Sanity Studio, and the frontend reads them via `src/lib/cms.ts`.

## One-time setup (needs a Sanity account — free tier)

1. Create the project (choose "Clean project", dataset `production`):

   ```bash
   npm create sanity@latest -- --template clean --project-plan free
   ```

2. Copy the schemas from `cms/schemas/` into the Studio's `schemaTypes/`
   folder and register them in `schemaTypes/index.ts`:

   ```ts
   import member from "./member";
   import post, { localeString, localeText } from "./post";
   export const schemaTypes = [member, post, localeString, localeText];
   ```

3. Put the project id in the site's env (see `.env.local.example`):

   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=xxxxxxx
   NEXT_PUBLIC_SANITY_DATASET=production
   ```

4. Flip `src/lib/cms.ts` from placeholder data to live fetches (the GROQ
   queries are already written there, commented).

## Who edits what

| Content   | Where it appears                         |
|-----------|------------------------------------------|
| Membru    | Directory list + district map counts      |
| Știre     | News grid on the homepage + news page     |
| Eveniment | Same as Știre, with `eventDate` set       |

Membership applications submitted on the site currently land in
`.data/submissions.json`; in production they should email the secretariat
and/or create a draft `member` document for approval.
