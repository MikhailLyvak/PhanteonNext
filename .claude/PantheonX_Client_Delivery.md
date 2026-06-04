# PantheonX — Cabinet Audit Findings

**Date:** 2026-05-29
**Scope:** Authenticated cabinet (Personal Data, Subscriptions, Academy / Study Platform, Certificates, Webinars), post-login landing, global `/login` and `/forgotPassword` flows, `/privacy`, and mobile (390×844) experience.
**Out of scope:** Screener (`/dashboard`, `screener.pantheonx.club`), Trading Bots / Algotrading flow, billing/paywall flow, KYC.

---

## Critical — Fix First

### 1. Privacy Policy is placeholder text

- **Problem:** `/privacy` (linked from every footer) renders the literal string `Privacy policy content goes here...`. Users consent to data processing at registration without any real policy published.
- **Impact:** GDPR breach for EU users; major credibility hit for a paid product.
- **Fix:** Publish actual Privacy Policy and Terms of Service. Link both from registration/login consent text.

### 2. "Forgot password" is non-functional

- **Problem:** "Забули пароль?" link on `/login` does nothing on click. Direct URL `/forgotPassword` returns a generic English Next.js 404.
- **Impact:** Users who forget passwords have no recovery path → lost paying customers.
- **Fix:** Implement email-based password reset. Until shipped, remove the link from the login screen.

### 3. "Налаштування" (Settings) link goes to a "coming soon" page

- **Problem:** Sidebar item "Налаштування" points to `/404page`, which renders only `🫡omming soon...`.
- **Impact:** The primary entry point for password, 2FA, notifications, and account deletion is broken. Signals lack of QA.
- **Fix:** Build the Settings page (needed for items #5 and #11 below), or hide the sidebar entry until ready.

### 4. Cabinet navigation is unreachable on mobile

- **Problem:** On a 390px viewport, both the outer sidebar and the inner cabinet tabs render off-canvas. The hamburger/close icons are positioned at x=650–700px (outside the 390px viewport), so the user has no tappable control to open navigation. Inner cabinet tabs collapse to width=0/height=0.
- **Impact:** Mobile users cannot navigate the cabinet at all — they cannot reach Academy, Subscriptions, or even Logout without retyping URLs.
- **Fix:** Add a visible hamburger button anchored inside the viewport (fixed top-left). Verify on 360, 390, and 414px widths. Make inner cabinet tabs a horizontally scrollable strip on mobile, or merge them into the drawer.

---

## High Priority

### 5. No password change, no 2FA, no account deletion

- **Problem:** Walking through every cabinet section turned up no UI for: changing password, enabling 2FA, viewing active sessions, or deleting account. Personal Data captures only name, phone, and Solana wallet.
- **Impact:** Missing 2FA is unacceptable for a product custodying exchange API keys and a real-money balance. No account deletion = GDPR right-to-be-forgotten violation.
- **Fix:** Build Settings page with: password change, 2FA toggle, active sessions list, account deletion (with confirmation + stated retention policy).

### 6. Two parallel inconsistent navigations

- **Problem:** The outer sidebar and inner cabinet tab strip overlap and disagree. Examples: outer sidebar shows "Навчання" → `/myCabinet/studyPlatform`, while the public header shows "Навчання" → `http://pantheonx.club/interview` (same label, different URL). The outer drawer contains "Блог" and "Трейдинг-чат" that the inner strip lacks; the inner strip has "Академія", "Сертифікати", "Керування підписками", "Вебінари" that the outer lacks.
- **Impact:** Users waste time figuring out which menu owns what. Onboarding and support documentation become much harder.
- **Fix:** Consolidate to one navigation system. The outer drawer holds global areas; the inner strip holds sub-tabs of the current section — never overlap. Pick one canonical name per destination.

### 7. Header "Навчання" link is plain HTTP, not HTTPS

- **Problem:** The header link "Навчання" points to `http://pantheonx.club/interview` while everything else is HTTPS.
- **Impact:** Mixed-content warnings, potential blocked navigation, and a credibility hit on a product handling credentials and API secrets.
- **Fix:** Change `href` to `https://`. Add HSTS header so the protocol cannot be downgraded.

### 8. Post-login destination is a marketing landing page with a Google Form CTA

- **Problem:** After login, users land on `/Trading-Chat` — a sales page whose primary CTA is an external `docs.google.com/forms/...` link.
- **Impact:** Biggest friction point on the activation path. Paying users expect their cabinet (their bots, lessons, balance) — not a pitch for another product served via Google Forms.
- **Fix:** Redirect post-login to the user's last visited cabinet section (or a sensible default like `/myCabinet/personalData`). Move the Trading-Chat landing to a public, logged-out route, or restructure it as an in-cabinet upsell card.

### 9. Webinars page is empty — no data, no empty state, no message

- **Problem:** `/myCabinet/vebinars` renders just the shell with the section title and two empty `<div>`s. No copy, no CTA, no "coming soon".
- **Impact:** Users assume the page is broken and lose trust in the rest of the platform.
- **Fix:** Ship an empty-state component with copy and a CTA (e.g. "Ваша підписка не дає доступ до вебінарів — переглянути підписки" → `/paywall`). If webinars are coming, state the date.

### 10. Persistent failing fetch on every page (Binance ticker API)

- **Problem:** Every page — including the public login screen — triggers `GET https://api.binance.com/api/v3/ticker/price` and logs `net::ERR_CONNECTION_REFUSED` and `TypeError: Failed to fetch` to the console. No visible UI uses the data on the login page.
- **Impact:** Either a legitimate feature is silently broken in production, or dead code is firing on every page load — wasting bandwidth and looking suspect to anyone with DevTools open. Binance's public API is also geo-restricted in several regions.
- **Fix:** Decide whether the data is needed. If yes, proxy the call through your own backend to avoid geo-restrictions. If no, delete the fetch.

---

## Medium Priority

### 11. URL typo: `/myCabinet/vebinars`

- **Problem:** Webinars page lives at `/myCabinet/vebinars` instead of `/myCabinet/webinars`.
- **Impact:** Will be costly to rename once indexed; looks like a developer typo.
- **Fix:** Rename route to `/webinars`. Add 301 redirect from old URL.

### 12. Personal Data form: missing apostrophe + minimal field set

- **Problem:** Label "Імя" should be "Ім'я" (Ukrainian apostrophe). Form has only first name, last name, phone, and Solana wallet — no email row, avatar, birthday, timezone, language, or marketing consent toggle.
- **Impact:** Native speakers will notice the typo immediately. The thin field set offloads every identity/security action to the missing Settings page.
- **Fix:** Fix the apostrophe. Decide whether Personal Data is a contact form (add email/photo/timezone) or whether it merges into Settings.

### 13. `/forgotPassword` renders unbranded English Next.js 404

- **Problem:** Direct visit to `/forgotPassword` shows the default Next.js 404 page in English, despite the audience being Ukrainian-speaking.
- **Impact:** Every unknown URL leaks a generic "Next.js" answer — bad for trust and SEO.
- **Fix:** Add a custom `not-found.tsx` rendering a branded, Ukrainian-localized 404 with a CTA back to `/` or `/myCabinet`.

### 14. Registration form: no password rules, no Terms link, no email-confirmation step

- **Problem:** Registration tab collects email, password, password confirmation. No password-strength meter or rules shown, no hyperlinks in the consent paragraph, no "Check your email" step surfaced after submission.
- **Impact:** Weak-password takeover risk (especially with no 2FA and no password recovery). Missing Terms link compounds finding #1.
- **Fix:** Enforce a minimum password policy (8+ chars, mixed case/digits). Show requirements inline. Convert consent text into hyperlinks: "погоджуєтесь з [Умовами використання] та [Політикою конфіденційності]". Surface email confirmation if required.

### 15. Course cards: dense run-on text crammed into one paragraph

- **Problem:** Course descriptions on Академія and Сертифікати are walls of text without bullets or hierarchy. The "Macro Systems" card contains the entire 10-lecture syllabus in one paragraph.
- **Impact:** Users cannot scan and compare courses; relative information density is inverted from price (the $7 course looks heavier than the $900 one).
- **Fix:** Render curricula as bulleted lists. Truncate card descriptions to ~2 lines with "Read more". Keep prices and lecture counts in consistent positions.

### 16. Certificates page is misnamed — content is Courses & Modules

- **Problem:** `/myCabinet/certificates` opens by default on the "Курси" tab, showing the same three courses with module progress. The "Мої сертифікати" sub-tab is secondary.
- **Impact:** Users clicking "Сертифікати" expect to see certificates, not the course catalog again. Confuses two distinct concepts.
- **Fix:** Default the page to "Мої сертифікати". Move course progress to a "Прогрес" sub-tab on Академія, where it belongs.

---

## Low Priority

### 17. Brand spelling inconsistency: "Pantheon" vs "Phanteon" vs "PantheonX"

- **Problem:** Header logo `alt` says "Pantheon Logo", sidebar logo `alt` says "Phanteon Logo", footer copyright says "PantheonX", URL is `pantheonx.club`.
- **Impact:** Cosmetic but visible to screen readers and to anyone saving the page. Three spellings on one site is a quality signal.
- **Fix:** Standardise on "PantheonX" in all `alt` text, copy, and metadata.

### 18. Cabinet header shows email handle, not user name

- **Problem:** Sidebar shows avatar "A" and heading "andreu.slynchyk+1" — the local part of the email address including the `+1` Gmail alias.
- **Impact:** Exposes the email-alias scheme; looks unprofessional in screenshots.
- **Fix:** Display the first name from Personal Data when present; otherwise fall back to the part of the email before `+` and before `@`.

---

## Summary

| Priority  | Count |
|-----------|-------|
| Critical  | 4     |
| High      | 6     |
| Medium    | 6     |
| Low       | 2     |
| **Total** | **18** |

## Recommended First Sprint

1. **Build the Settings page and fix navigation labels.** Unblocks #3 (Settings 404), #5 (no password change / 2FA / deletion), and reduces the compliance exposure from #1.
2. **Make the cabinet navigable on mobile.** Without this, every mobile user is on a desktop-only product.
3. **Fix the post-login destination.** Land users on their cabinet (not the marketing page) so paid users feel they got what they paid for.
4. **Publish the real Privacy Policy and Terms.** Removes the most visible legal/credibility risk.
