# Port Settings and build the landing page

Type: task
Status: open
Blocked by: 25

## Question

Implement `/app/settings` (Profile form via `getProfile`/`updateProfile`, avatar = Clerk `imageUrl`; Display preferences = card size in localStorage; Account: sign out, `mountUserProfile`, delete account = soft-delete rows then Clerk user deletion), the SSR `/` landing hero (name, pitch, strip of `/diddls` images, Sign in / Sign up, signed-in redirect to `/app`), and the root `notFoundComponent`.

Done when: Profile round-trips, account deletion soft-deletes and signs out, `/` renders server-side; typecheck/lint/build green.
