
# FormFlow

**Speed-fill any web form.** A Tampermonkey userscript that detects form fields on any webpage and creates a streamlined overlay for fast form filling with presets, auto-fill, and one-click submit.

🔧 **[Install → Raw Script](https://github.com/hggruppi94/formflow/raw/master/FormFlow.user.js)**

> Built by [Hayden Gruppi](https://hggruppi94.github.io)

---

## 🚀 What It Does

FormFlow adds a ⚡ button to every webpage. Click it, and a side panel appears with all detected form fields in a clean, dark-mode interface. Fill out the panel, hit "Fill Form," and FormFlow populates the real form instantly.

![FormFlow](https://img.shields.io/badge/Version-1.3-22c55e?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-3b82f6?style=for-the-badge)
![Tampermonkey](https://img.shields.io/badge/Tampermonkey-Ready-f59e0b?style=for-the-badge)

---

## ✨ Features

- **⚡ Auto-detect fields** — scans any page for inputs, selects, textareas, checkboxes, and radio buttons
- **🧠 Smart field filtering** — 3-layer detection system filters out ghost fields, UI toggles, and hidden controls
- **📋 Presets** — save and load common form entries per page URL
- **⚡ One-click fill** — populates the real form from your overlay values
- **⚡ Fill & Submit** — fills the form and auto-clicks the submit button
- **🔦 Highlight** — visually outlines all detected fields on the page
- **🔄 Rescan** — re-detects fields if the page changes dynamically
- **📊 Field stats** — shows total fields, required count, and type breakdown
- **🎨 Type badges** — color-coded labels (text, select, checkbox, date, number, email, radio, textarea)
- **💾 Persistent presets** — saved per page URL, persist across browser sessions
- **🌙 Dark mode** — sleek side panel UI
- **🔒 Privacy** — no data transmitted, everything stays in your browser

---

## 🧠 Smart Field Detection (v1.3)

Most form-filling tools pick up ghost fields — hidden checkboxes, UI toggles, settings controls, and framework artifacts that aren't part of the actual form. FormFlow v1.3 uses a **3-layer filtering system** to show only real form fields:

| Layer | What It Checks | What It Catches |
|---|---|---|
| **🔤 Keyword Filter** | Label contains UI words like "hide", "show", "toggle", "descriptions", "enable" | Settings toggles, visibility controls, consent checkboxes |
| **📦 Container Filter** | Element is inside `nav`, `header`, `[role="toolbar"]`, `.settings`, `.config` | Navigation controls, settings panels, toolbar toggles |
| **🏷️ Class/ID Filter** | Element or parent has classes like "toggle", "switch", "control", "setting" | Framework-generated UI controls, custom toggle components |

### Additional Filters
- **Unnamed fields** — checkboxes and radios with no detectable label are skipped
- **Hidden elements** — fields with no visible size or `offsetParent === null` are excluded
- **Non-form inputs** — `file`, `image`, `reset`, `submit`, and `button` types are ignored

---

## 🎯 Use Cases

| Who | What |
|---|---|
| **Operations teams** | Speed-fill repetitive daily forms (time edits, audits, reports) |
| **HR / Admin** | Bulk data entry across employee forms |
| **QA testers** | Rapidly fill test forms with saved presets |
| **Customer support** | Ticket creation with templated responses |
| **Anyone** | Any repetitive web form you fill more than once |

---

## 📦 Installation

### Step 1: Install Tampermonkey
If you don't have it already, install [Tampermonkey](https://www.tampermonkey.net/) for your browser:
- [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

### Step 2: Install FormFlow
**Option A:** Click the install link → Tampermonkey will prompt to install:

🔧 **[Install FormFlow](https://github.com/hggruppi94/formflow/raw/master/FormFlow.user.js)**

**Option B:** Manual install:
1. Open Tampermonkey → **Create a new script**
2. Copy the contents of `FormFlow.user.js`
3. Paste and save

### Step 3: Use It
1. Navigate to any page with a form
2. Click the **⚡ button** in the bottom-right corner
3. Fill out the streamlined panel
4. Click **⚡ Fill Form** or **⚡ Fill & Submit**

---

## 🖥️ How It Works

