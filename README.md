# 🎄 Christmas Quest (Romantic Mini Game)

Single-page React (Vite) app designed for GitHub Pages (no backend).

## ✅ What’s implemented
- **Required flow**: Pre-Landing → Landing → Personalize → Level 1 → Memory 1 → Level 2 → Memory 2 → Level 3 → Memory 3 → Gift Box → Game Over → Surprise Flow → Final Choice → Final Screen
- **Event logging** (localStorage): sessionId + timestamp + current screen + data
- **EmailJS notifications** (frontend-only):
  - Start email: sent once when she taps **Continue** on Pre-Landing
  - Final email: sent once when she reaches the **Final Screen**
  - If final email fails: queued in localStorage and retried once on next page load (no UI)

---

## 🖼️ Add your photos
1. Put your images in:
   - `src/assets/photos/`
2. Edit:
   - `src/content/photos.js`
3. Replace the placeholder entries with your photo paths & captions.

> Tip: keep filenames simple (e.g. `1.jpg`, `2.jpg`) and use JPG/WebP for smaller size.

---

## ✍️ Edit letter, memory shards, notes, riddle
Edit:
- `src/content/messages.js`

You can safely change:
- The apology letter text
- Memory shard lines
- Notes/compliments array
- Riddle question, choices, correctIndex, and hint

---

## 📩 EmailJS setup (Start + Final Summary)
This project uses the **EmailJS browser library via CDN** (in `index.html`), so it works on GitHub Pages with no backend.

1. Create an EmailJS account and add an Email Service.
2. Create **2 templates**:
   - **START** template → set the subject to `{{subject}}`
   - **FINAL** template → also use `{{subject}}`

### Template variables expected
**START email** params:
- `subject`, `sessionId`, `startedAt`, `userAgent`, `referrer`, `timezone`
- optional: `to_email`, `to_name`

**FINAL email** params:
- `subject`, `sessionId`, `startedAt`, `finishedAt`, `durationSeconds`
- `companion`, `vibe`, `nickname`
- `scoreTotal`, `replayCount`, `finalChoice`
- `photosViewedCount`, `lastPhotoIndex`
- `eventLogJson` (string)
- `summaryText` (human readable)
- optional: `to_email`, `to_name`

3. Create a `.env` file in the repo root:
```bash
cp .env.example .env
```
4. Fill in:
- `VITE_EMAILJS_PUBLIC_KEY`
- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID_START`
- `VITE_EMAILJS_TEMPLATE_ID_FINAL`

---

## 🧑‍💻 Run locally
```bash
npm install
npm run dev
```

---

## 🚀 Deploy to GitHub Pages
This repo includes a GitHub Actions workflow: `.github/workflows/deploy.yml`.

Steps:
1. Push to GitHub (default branch: `main`).
2. In GitHub repo settings:
   - **Settings → Pages → Build and deployment**
   - Select **GitHub Actions**.
3. Push to `main` and it will build + deploy automatically.

**Important:** GitHub Pages does not hide client-side env vars. EmailJS keys end up in the built JS bundle. For a romantic one-off, that’s fine — just keep the EmailJS account/service scoped tightly.

---

## 🧠 Notes
- Event logs are stored in `localStorage` as:
  - `cq_sessionId`
  - `cq_events`
- Start email is sent once per session (`cq_startEmailSent`)
- Final email is sent once per session (`cq_finalEmailSent`)
- If final fails, it is queued as `cq_pendingFinalEmail` and retried once.

Have fun 🎁
