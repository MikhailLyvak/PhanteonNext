# PantheonX Audit — Behind Login

**Date:** 2026-05-11
**Scope:** Authenticated cabinet at https://pantheonx.club/ — sections `myCabinet/*` (Personal Data, Trading Bots, Subscriptions, Academy / Study Platform, Certificates, Webinars), the post-login Trading-Chat landing, the /dashboard screener page, the global `/login` and `/forgotPassword` flows, the `/privacy` page, and the same flows under iPhone-14 (390×844) mobile emulation.
**Out of scope:** Billing / paywall flow, KYC document upload, the external screener subdomain at `screener.pantheonx.club`, public marketing landing pages not reachable from cabinet navigation.

## Key user-path metrics

- Clicks from first touch (`/`) to authenticated state: **3** (auto-redirect to `/login` → fill email → fill password → click Continue)
- Clicks from login to Trading-Bots feature area: **1** (direct sidebar link, but sidebar is hidden offscreen on desktop until interacted with, and unreachable on mobile)
- Clicks from feature area to first completed action: **N/A — could not be completed**; the action requires connecting a real Bybit/Binance/BingX API key, which we declined to submit per skill safety constraints
- Total walkthrough time for a new user: ~12 minutes desktop + 5 minutes mobile
- Got blocked anywhere: **yes** — at exchange API key step (intentional, safety stop); also at "Forgot password" which is non-functional
- Sandbox / demo / paper mode available: **no** — there is no demo mode for the trading-bot connection flow, despite the platform balance reading $2.00 (real money)

## Critical — fix first

### 1. Privacy Policy is placeholder text

- **What:** `/privacy` — linked from the footer of every page including login/registration — renders the literal string `Privacy policy content goes here...` under the heading "Privacy Policy". The user is asked to consent to data processing during registration and login, with a footer link to this page as the only legal artifact.
- **Where:** https://pantheonx.club/privacy (linked from every footer)
- **Why it matters:** This is a GDPR breach for any EU user reaching the site — consent without a published policy is not informed consent. It is also a reputational risk: a paid trading product whose only public legal page is a placeholder signals an unfinished operation to any prospect who clicks the link.
- **Fix:** Publish the actual Privacy Policy text. Add a Terms of Service page. Update the login/registration consent copy to link to both directly, not just to "обробку персональних даних" as inline text.
- **Screenshot:** `./screenshots/14-privacy.png`

### 2. "Forgot password" link is non-functional

- **What:** On the login page, the text "Забули пароль?" is styled with `cursor: pointer` and visually presented as a link, but clicking it does nothing — no navigation, no modal, no network request. The direct URL `/forgotPassword` returns the generic Next.js 404 page (in English).
- **Where:** https://pantheonx.club/login → "Забули пароль?" element; https://pantheonx.club/forgotPassword
- **Why it matters:** A user who forgets their password has no recovery path. They will either re-register a duplicate account (polluting the user table) or churn entirely. For a paid product where users have already paid for subscriptions, courses, and platform balance, a lost password is a lost paying customer.
- **Fix:** Implement password recovery — at minimum an email-link reset flow. Until that ships, hide or remove the "Забули пароль?" text so users do not assume a working flow exists.
- **Screenshot:** `./screenshots/16-forgot-password-clicked.png`, `./screenshots/15-forgot-password.png`

### 3. "Налаштування" (Settings) sidebar link goes to a "coming soon" page

- **What:** The cabinet sidebar — present on every authenticated page on desktop and on mobile — has a "Налаштування" (Settings) link whose `href` is `/404page`. The page renders only the heading `🫡omming soon...`. The route `/404page` is hardcoded into the navigation component.
- **Where:** Cabinet sidebar → Налаштування → `/404page`
- **Why it matters:** It is the primary entry point a user looks for to change password, set up 2FA, manage notifications, or delete their account — none of which exist anywhere else in the product. Pointing a top-level nav item at a literal `/404page` URL is also a fingerprint that even an internal QA pass was not run on the cabinet shell.
- **Fix:** Either build the Settings page (it is needed regardless for findings #4 and #11), or hide the sidebar item until it ships. Do not ship a primary nav item that links to a placeholder.
- **Screenshot:** `./screenshots/13-settings-404.png`

### 4. Exchange API connection screen gives zero permissions guidance and zero security warning

- **What:** Bybit / Binance / BingX connection (Cabinet → Торгові боти → choose exchange) presents a simple form with three fields — optional name, API key, secret key — and a "Save and continue" button. There is no checklist of which permissions to enable on the exchange, no warning to disable withdrawal rights, no link to a step-by-step exchange-specific guide, and no mention of how the keys are stored on the PantheonX side.
- **Where:** Cabinet → Торгові боти → Bybit / Binance / BingX → step `?step=api&exchange=BYBIT`
- **Why it matters:** Two failure modes, both severe. (a) A cautious user gives up here, which is the most common drop point for crypto-bot products and the exact failure this audit was scoped to investigate. (b) A non-cautious user pastes a key that includes withdrawal permission — that is a direct path to user funds being drained, and the platform inherits the support, refund, and reputation cost when it happens.
- **Fix:** Add an inline checklist for each exchange showing the required scopes (e.g. `Spot Read`, `Spot Trade` only) and a prominent red-style warning "Disable Withdrawal" with a 2-line explanation. Link to per-exchange screenshot guides. Consider rejecting submitted keys that have withdrawal scope when the exchange API exposes the scope set on key validation.
- **Screenshot:** `./screenshots/06-bybit-api-step.png`

### 5. Cabinet navigation is unreachable on mobile

- **What:** Both navigation systems — the outer sidebar with cabinet links (Персональні дані, Торгові боти, Screener, Трейдинг-чат, Блог, Навчання, Налаштування, Вихід) and the inner cabinet-section tabs (Академія, Сертифікати, Керування підписками, Вебінари, Графіки) — are rendered into the DOM but positioned outside the viewport on a 390×844 mobile screen. The outer sidebar buttons compute to x=402–698 (viewport is 390px). The inner cabinet tabs compute to width=0, height=0 — they are collapsed to nothing. There are two icon-buttons at the top of the page that look like a hamburger and a close button, but they too sit at x=650 and x=700 — off-canvas — so they cannot be tapped. The user has no visible control inside the viewport that opens a navigation drawer.
- **Where:** Any `myCabinet/*` page at viewport widths ≤ ~768px (verified at 390px / iPhone 14)
- **Why it matters:** On mobile, the user can land on the cabinet only by following the post-login redirect or a bookmarked URL, and once there they cannot navigate at all. They cannot reach Trading Bots, Academy, Subscriptions, or Logout without retyping URLs. A trading product where mobile users cannot navigate is effectively desktop-only — and the funnel data will reflect that.
- **Fix:** Add a visible hamburger button anchored inside the viewport (e.g. fixed top-left, z-index above the off-canvas drawer) that toggles the sidebar `transform: translateX(0)`. Verify on 360px, 390px, and 414px. Ship the same fix for the inner cabinet tabs — either render them as a horizontal scrollable strip on mobile or merge them into the outer sidebar.
- **Screenshot:** `./screenshots/20-mobile-personal-data.png`, `./screenshots/19-mobile-tradingbots.png`, `./screenshots/22-mobile-api-form.png`

## High Priority

### 6. No password change, no 2FA option, no account deletion anywhere in the cabinet

- **What:** A walk through every cabinet section turned up no UI for: changing password, enabling 2FA, viewing recent logins / sessions, deleting account, or rotating exchange API keys (only adding new ones). Personal Data → just first name, last name, phone, Solana wallet. Settings sidebar entry leads to `/404page` (see finding #3).
- **Where:** Whole cabinet — verified by visiting `/myCabinet/personalData`, `/myCabinet/subscriptions`, `/myCabinet/certificates`, `/myCabinet/studyPlatform`, `/myCabinet/vebinars`, `/myCabinet/tradingBots`
- **Why it matters:** For a product that custodies exchange API keys and tracks a real-money platform balance, missing 2FA is a security stance no compliance reviewer will accept. Missing account deletion is a GDPR right-to-be-forgotten violation in the EU. Together with finding #1, the platform fails two distinct GDPR articles.
- **Fix:** Build Settings to host password change, 2FA enable, active sessions list, and account deletion (with a confirmation step and a clearly stated retention policy for closed accounts).
- **Screenshot:** `./screenshots/04-personal-data.png`

### 7. Two parallel inconsistent navigations with same labels pointing to different URLs

- **What:** The site has both an outer left sidebar (drawer) and an inner cabinet tab strip. The two disagree on names and destinations. Examples: the outer sidebar lists "Screener" → `/dashboard`, while the inner strip lists "Графіки" → `/dashboard` (same URL, two different labels). The outer sidebar lists "Навчання" → `/myCabinet/studyPlatform`, while the top public header lists "Навчання" → `http://pantheonx.club/interview` (same label, two different URLs, and the header version downgrades to HTTP — see #8). The outer sidebar contains "Блог", "Трейдинг-чат" which the inner strip does not; the inner strip contains "Академія", "Сертифікати", "Керування підписками", "Вебінари" which the outer does not.
- **Where:** Every authenticated page
- **Why it matters:** Users build a mental model from labels. Two systems with overlapping vocabulary mean every new user wastes time figuring out which menu owns which feature, and which "Навчання" is the right one. It also makes onboarding documentation and customer-support scripting much harder.
- **Fix:** Consolidate to a single navigation system. Pick one canonical name per destination (e.g. "Графіки" or "Скрінер" — not both for `/dashboard`). The outer drawer should hold global product areas, the inner strip should hold sub-tabs within the current section — never overlap.
- **Screenshot:** `./screenshots/03-post-login-landing.png`, `./screenshots/04-personal-data.png`

### 8. Header "Навчання" link is plain HTTP, not HTTPS

- **What:** The top public header link "Навчання" points to `http://pantheonx.club/interview`. Every other link on the site is https. Modern browsers will display a mixed-content warning or auto-upgrade and then fail if the redirect chain is misconfigured.
- **Where:** Header on every page (login, cabinet, Trading-Chat, etc.)
- **Why it matters:** A http:// link in the header of a product that asks for credentials and API secrets is a credibility hit any security-aware user will notice. Browsers may also block navigation or strip the referrer, breaking attribution.
- **Fix:** Change the `href` to `https://pantheonx.club/interview`. Add an HSTS header so it cannot be downgraded.
- **Screenshot:** `./screenshots/04-personal-data.png` (header)

### 9. Post-login destination is a marketing/landing page promoting an external Google Form

- **What:** After a successful login, the user is dropped on `/Trading-Chat`, a long-form sales page about a Telegram-style "Trading Chat" whose primary call-to-action is a Google Forms application link (`docs.google.com/forms/...`). The user just logged into the paid cabinet — they expect to see *their* cabinet, not a pitch to apply to another product.
- **Where:** Login → post-login redirect lands at https://pantheonx.club/Trading-Chat
- **Why it matters:** This is the single biggest friction point on the activation path. A user who paid for a course, a screener subscription, or set up a trading bot expects to land on a state-aware screen — their bots, their lessons, their balance. Instead they get marketing for a different product served via Google Forms, which on a paid platform looks unprofessional and may trigger a "is this site even legit?" reaction.
- **Fix:** Redirect post-login to `/myCabinet/tradingBots` (or whichever section the user last visited). Move the Trading-Chat sales page to a public route only reachable when logged out, or restructure it as an in-cabinet upsell card on the dashboard.
- **Screenshot:** `./screenshots/03-post-login-landing.png`

### 10. /dashboard ("Screener" / "Графіки") shows a NASDAQ:AAPL stock chart by default

- **What:** The cabinet's chart/screener page is an embedded TradingView widget. The default symbol loaded is `NASDAQ:AAPL`. There is no in-app symbol selector, no crypto preset, no relation to the user's bots or subscriptions.
- **Where:** Cabinet → Screener (or Графіки) → `/dashboard`
- **Why it matters:** PantheonX is positioned as a crypto-trading + analytics platform — every other surface (Trading Bots, learning courses, Trading-Chat copy) is about crypto. A default Apple stock chart undermines the positioning at the moment the user first looks at the "screener". Power users will assume this page is broken.
- **Fix:** Default the widget to `BINANCE:BTCUSDT` or to the symbol the user's last bot is configured for. Add a search/symbol picker. Better: replace the bare TradingView embed with an actual screener UI that filters the universe the product claims to filter.
- **Screenshot:** `./screenshots/12-dashboard.png`

### 11. Webinars page is empty with no data, no empty state, no message

- **What:** `/myCabinet/vebinars` renders the cabinet shell with the section title, then two empty `<div>`s where content should be. No data, no "There are no webinars yet" copy, no "Browse upcoming" CTA, no upsell link.
- **Where:** Cabinet → Вебінари → `/myCabinet/vebinars`
- **Why it matters:** Empty content with no orientation is the worst class of empty state — users assume the page is broken and lose trust in the rest of the platform. If webinars genuinely exist behind a subscription wall, the page is a missed revenue opportunity to surface that.
- **Fix:** Ship an empty-state component with copy and a CTA (e.g. "Підписка ще не дає вам доступ до вебінарів — переглянути підписки" linking to `/paywall`). If webinars are coming, say so with a date.
- **Screenshot:** `./screenshots/11-webinars.png`

### 12. Persistent failing fetch on every page: Binance ticker API blocked

- **What:** Every page (including the public login page before authentication) triggers `GET https://api.binance.com/api/v3/ticker/price` and logs two console errors: `net::ERR_CONNECTION_REFUSED` and `TypeError: Failed to fetch`. There is no visible UI consuming the data on the login page.
- **Where:** Every page; observable in DevTools console
- **Why it matters:** Either the call is genuinely needed somewhere and is now broken (something is silently failing in production), or it is dead code firing on every page load — wasting users' bandwidth, polluting their console, and looking suspect to anyone who opens DevTools. The Binance public API was recently restricted from several geographies; depending on user location this can also block legitimate features.
- **Fix:** Decide if the data is needed. If yes, proxy the call through your own backend so geographic restrictions don't surface to users. If no, delete the fetch.
- **Screenshot:** `./screenshots/01-login-page-fresh.png` (footer console reference)

## Medium Priority

### 13. URL typo `/myCabinet/vebinars`

- **What:** The webinars page lives at `/myCabinet/vebinars` (Cyrillic-style transliteration of "вебінари") instead of `/myCabinet/webinars`.
- **Where:** Sidebar → Вебінари → URL bar
- **Why it matters:** Hard to fix later without breaking inbound links once the page has any indexed content. Looks like a developer typo to anyone who notices.
- **Fix:** Move the route to `/myCabinet/webinars`. Add a 301 redirect from the typo'd URL.
- **Screenshot:** `./screenshots/11-webinars.png` (URL bar)

### 14. Personal Data form: "Імя" missing Ukrainian apostrophe and is the only contact data captured

- **What:** The Personal Data form has four fields: "Імя" (should be "Ім'я"), "Прізвище", "Телефон", and "Solana гаманець". There is no account-email row, no avatar, no birthday, no timezone, no language preference, no marketing-consent toggle, and no password-change shortcut.
- **Where:** Cabinet → Персональні дані → `/myCabinet/personalData`
- **Why it matters:** The apostrophe is a small but Ukrainian-language correctness signal that native speakers will notice immediately. The thin field set forces every other identity/security operation into the missing Settings page (#6).
- **Fix:** Fix the apostrophe. Decide whether Personal Data is the contact form (then add email, photo, timezone) or whether it should be merged with Settings.
- **Screenshot:** `./screenshots/04-personal-data.png`

### 15. /forgotPassword renders Next.js default 404 in English

- **What:** Visiting `/forgotPassword` directly shows the unbranded Next.js 404 page in English ("This page could not be found.") despite the product audience being Ukrainian-speaking.
- **Where:** https://pantheonx.club/forgotPassword
- **Why it matters:** Even setting aside finding #2, the absence of a branded localized 404 means every unknown URL on the site (which includes external mistyped marketing links) leaks a generic "Next.js" answer to the user — bad for trust and bad for SEO.
- **Fix:** Add a custom `not-found.tsx` rendering a branded, Ukrainian-localized 404 with a CTA back to `/` or `/myCabinet`.
- **Screenshot:** `./screenshots/15-forgot-password.png`

### 16. Registration form: no password requirements, no Terms link, no visible email confirmation

- **What:** The registration tab on `/login` collects email, password, password confirmation. There is no password-strength meter, no minimum-length hint, no rule list, no link to Terms or Privacy from the consent paragraph, and no "Check your email" confirmation step shown.
- **Where:** /login → Реєстрація tab
- **Why it matters:** Permissive registration enables weak-password takeover, especially when paired with no 2FA (#6) and no password recovery (#2). The missing Terms link compounds finding #1.
- **Fix:** Enforce a minimum policy (e.g. 8+ chars, mixed). Show requirements inline. Make the consent text into two actual hyperlinks: "погоджуєтесь з [Умовами використання] та [Політикою конфіденційності]". Decide whether email confirmation is required and surface it.
- **Screenshot:** `./screenshots/17-registration-tab.png`

### 17. Course cards: dense run-on text crammed into one paragraph

- **What:** On Академія and Сертифікати, course descriptions are dense walls of text without line breaks, bullet lists, or visual hierarchy. The "Macro Systems" card description contains the entire 10-lecture syllabus in one paragraph.
- **Where:** /myCabinet/studyPlatform, /myCabinet/certificates
- **Why it matters:** Users scanning between courses cannot quickly compare them. The $7 Macro Systems looks like an intimidating wall, the $900 "Шлях інвестора" looks tame by comparison — the relative information density is inverted from price.
- **Fix:** Render course curricula as bulleted lists. Truncate card descriptions to 2 lines with "Read more". Keep prices and lecture counts at a consistent position.
- **Screenshot:** `./screenshots/09-study-platform.png`, `./screenshots/10-certificates.png`

### 18. Certificates page is misnamed — content is Courses & Modules

- **What:** `/myCabinet/certificates` opens by default on the "Курси" tab, showing the same three courses with module progress. The sub-tab "Мої сертифікати" presumably holds the actual certificate list, but it is the secondary tab. The breadcrumb and sidebar both call this page "Сертифікати".
- **Where:** Cabinet → Сертифікати → `/myCabinet/certificates`
- **Why it matters:** A user clicking "Сертифікати" expects to see their certificates, not the course catalog again. The information architecture confuses two distinct concepts.
- **Fix:** Default the page to the "Мої сертифікати" tab. Move course progress to a "Прогрес" sub-tab on Академія, where it belongs.
- **Screenshot:** `./screenshots/10-certificates.png`

## Low Priority

### 19. Brand spelling inconsistency: "Pantheon" vs "Phanteon" vs "PantheonX"

- **What:** The logo `alt` text on the header reads "Pantheon Logo". The cabinet sidebar logo `alt` reads "Phanteon Logo". The footer copyright reads "PantheonX". The product URL is `pantheonx.club`.
- **Where:** Throughout the application — header, sidebar, footer
- **Why it matters:** Cosmetic but visible to screen-reader users and to anyone who saves the page. Three spellings of a brand name on the same page is a quality signal.
- **Fix:** Standardise on "PantheonX" in all `alt` text, copy, and metadata.
- **Screenshot:** `./screenshots/03-post-login-landing.png`

### 20. User identity displayed in cabinet header is the email handle, not a name

- **What:** The sidebar avatar circle shows "A" (first letter of email) and the heading reads "andreu.slynchyk+1" — i.e. the local part of the email address including the `+1` Gmail alias.
- **Where:** Cabinet sidebar header on every authenticated page
- **Why it matters:** Exposes the email-alias scheme to the user and to anyone shoulder-surfing. Also looks unprofessional in screenshots.
- **Fix:** Display the first name from Personal Data when present; fall back to the part of the email before `+` and before `@`. Strip the `+alias`.
- **Screenshot:** `./screenshots/04-personal-data.png` (sidebar)

## Areas not covered

- **Billing / paywall flow** — out of scope per the audit request. The "Перейти до підписок" → `/paywall` button was observed but not followed.
- **KYC document flow** — out of scope. No KYC was triggered during the walkthrough.
- **Real exchange API key submission** — declined per skill safety constraints and a runtime permission denial when attempting to submit fake credentials. The audit therefore ends one step short of the bot-activation flow; finding #4 is based on the form state up to but not including submission.
- **Public marketing routes** — only the routes reachable from cabinet navigation were checked (Blog, Trading-Chat, /privacy). A public-side audit may already cover the rest.
- **External screener subdomain** — `screener.pantheonx.club` was linked from the top header but is a different application and out of scope.
- **Email transactional flows** — registration confirmation, password reset (does not exist), receipts — none triggered or inspected.

## Priority summary

- **Critical:** 5
- **High:** 7
- **Medium:** 6
- **Low:** 2

**Total:** 20 findings.

## Top fixes if you only have one week

1. **Build the Settings page and fix the navigation contract.** This single piece of work unblocks findings #3 (Settings 404), #6 (no password change / 2FA / account deletion), and removes the worst compliance exposure created by #1. Hook password change and account deletion to a working backend even if 2FA is phase-two.

2. **Make the cabinet navigable on mobile.** Ship a visible hamburger inside the viewport that opens the off-canvas drawer, and either show the inner cabinet tabs as a horizontal scroll or fold them into the drawer. Without this, every mobile user is on a desktop-only product — and the trading-bot funnel will keep dropping mobile users at the door.

3. **Fix the post-login destination and the exchange-API onboarding.** Land users on `/myCabinet/tradingBots` (or last visited), and add the per-exchange permissions checklist with a "disable withdrawal" warning to the API key form. These two together address the single biggest conversion drop on the path the audit was scoped to investigate.
