# Family Letter Desk

A single-page app for a family law practice in England and Wales. It drafts:

- client care letters
- advice letters
- notices of hearing
- outcome letters after a hearing
- attendance notes
- closing letters

Letters can be filled in by hand, or from uploaded court orders and attendance notes.
Copy a finished letter into Word with **Copy for Word**.

There is no server and no account. Everything runs in the browser. Details are kept in that
browser's local storage and are never sent anywhere by the app itself.

## Put it on GitHub Pages

1. Create a new repository and upload everything in this folder, including `vendor/` and `.nojekyll`.
2. Open **Settings > Pages**, choose **Deploy from a branch**, then `main` and `/ (root)`.
3. After a minute the app is at `https://YOUR-NAME.github.io/REPO-NAME/`.

The repository holds no client data. Only the app code is public. On a free GitHub plan Pages sites
are public, so do not put your firm's details into the code. Type them into the app instead. They are
saved in your browser only. Make sure each browser or computer you use has its own firm details filled in.

You can also run it from your own computer with no GitHub at all:

```
cd letter-desk-site
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Opening `index.html` directly from the folder may stop the PDF
reader from loading, so use the small server.

## Reading uploaded documents

The panel at the top of every tab, **Fill from documents**, has three ways to read documents.
The first needs nothing installed.

### 1. Built-in reader (default, no AI)

Works offline. Documents are read in the browser and go nowhere.

- **File types:** PDF, Word (.docx), .odt, .rtf, text files, and photos or scans (png, jpg, webp).
  Old .doc files must be saved as .docx first.
- **Scanned pages:** pages with no text layer are read with text recognition (OCR) built into the app.
  It can misread words and figures, so the result always carries a warning to check against the original.
  Clear scans at normal size work best, and up to 25 scanned pages per file are read.
- **What it finds:** case number, court, judge, dates, hearing types, each numbered paragraph of an order
  (including paragraphs that wrap over several lines), deadlines, costs wording, the next hearing, final orders,
  and attendance note times, who was present and action points.
- **Your client:** it finds the Applicant and Respondent. Choose which one is your client and the orders are rewritten
  ("The Applicant shall..." becomes "You must..."), with legal wording such as *shall*, *forthwith* and
  *pursuant to* replaced by plain English.
- **Summaries:** it writes a short factual summary from the orders (which hearing, when, before whom, how many orders).
  It does not write a narrative of what was argued or decided, and it does not understand what an order means.
  For that, add your own wording in the letter or use a local AI.
- **Not covered:** handwriting, very poor scans, password-protected files, and judgement-based wording.

### 2. Local AI with Ollama

A model that runs on your own computer reads the documents, so client information never leaves it.
It understands the documents and writes the plain-English summaries.

1. Install Ollama from ollama.com and download an instruction-tuned model of about 7 to 14 billion
   parameters. You need roughly 16 GB of memory for that size. Larger models read more reliably.
2. Let the web page talk to Ollama. Ollama blocks other websites by default.
   Set the allowed origin to wherever you open the app, then restart Ollama:
   - GitHub Pages: `OLLAMA_ORIGINS=https://YOUR-NAME.github.io`
   - the local server above: `OLLAMA_ORIGINS=http://localhost:8000`

   On Windows, set it as an environment variable and restart Ollama.
   On Mac, run `launchctl setenv OLLAMA_ORIGINS "https://YOUR-NAME.github.io"` and restart the app.
   On Linux, add it to the service with `systemctl edit ollama`.
3. In the app choose **Local AI with Ollama**, leave the address as `http://localhost:11434`,
   click **Test connection**, and pick your model.
4. Leave the context size at 16384 or raise it. Ollama silently cuts off longer documents at its default size.

Chrome may ask you to allow the site to connect to devices on your network. Allow it.
Safari blocks a secure page from calling a local address, so use Chrome, Edge or Firefox, or use the local server option.

### 3. LM Studio or any OpenAI-compatible local server

Start the server in LM Studio (Developer tab), switch on **Enable CORS**, choose
**Local AI with LM Studio or another OpenAI-compatible server**, set the address
(LM Studio uses `http://localhost:1234`) and the model name.

## Summaries of uploaded documents

Click **Summarise documents** in the document panel. You get an overview, upcoming deadlines and hearings, a timeline, and a
short summary and key points for each document. **Copy summary** copies it as text, and **Add overview to this letter** puts the
overview into the matching part of the letter you are working on.

- **Built-in reader:** picks out the key sentences, the orders and the dates by pattern. It does not interpret the documents.
- **Local AI:** writes a proper plain-English summary, with the usual risk that a model makes mistakes. Always check it
  against the documents.

## Standard information

Most firms send the same information sheets with every letter, such as file storage, complaints, data
protection or fraud warnings. The **Standard information library** at the bottom of the form holds these.

- **Add your own:** type a block in, or upload a Word, .odt, .rtf, PDF or text file and it becomes a block.
- **Choose where it goes:** each block has ticks for the letters it goes with by default. On any letter you can also
  tick or untick a block for that letter only.
- **Where it appears:** after the signature, on a new page headed "Important information".
- **Fill in client details:** write `{{client name}}`, `{{our ref}}`, `{{case number}}`, `{{court}}`, `{{other party}}`,
  `{{firm name}}`, `{{firm address}}`, `{{firm contact}}`, `{{case worker}}`, `{{date}}`, `{{hearing date}}` or `{{retention}}`
  and the app fills them in. A missing detail shows as a yellow blank.
- **Layout in the text:** start a line with `-` for a bullet, `1.` for a numbered item, or `##` for a subheading.
- **Starter blocks:** three starter blocks are included (file storage, fraud warning, how to contact us). They are only
  examples, so replace them with your firm's own wording.
- **Back up and share:** use **Export library** to save the library as a file, and **Import library** to load it on another
  computer or browser. The library is stored in the browser, so exporting is also your backup.
- **Attendance notes:** these are internal, so they never get standard information added.

## Check everything

Small local models make mistakes, and the built-in reader only matches patterns. Missing
information shows as a yellow `[blank]`, and a **Please check** list notes anything uncertain.
The standard legal paragraphs are written for England and Wales and should be checked against your firm's own precedents
before use. Nothing here is legal advice, and every letter must be read before it is sent.

## Privacy notes

- With the built-in reader or a local AI, documents stay on your computer.
- Letter details and settings are saved in the browser's local storage. Clear them
  with **Clear matter details**, or by clearing site data, on shared computers.
- The app loads no fonts, scripts or analytics from the internet. `vendor/` holds the PDF, Word and
  scan readers (PDF.js, JSZip and Tesseract.js with its English data, all open source).


## Matters, security and output (added)

- **Matters**: each client is a separate matter, stored in this browser only. Duplicate, rename, delete, or load an example. Export a backup regularly (Settings > Backup); clearing browser data loses matters.
- **Encryption and lock**: Settings > Security lets you set a passphrase. Matters are then stored encrypted (AES-GCM, key from PBKDF2) and the app locks after idle time. A lost passphrase cannot be recovered.
- **Letters**: 15 documents in three groups: client letters (care, advice, progress, appointment, documents request, notice of hearing, outcome, offer, costs update, closing), other parties (to solicitors, to court, consent order, instructions to counsel) and attendance notes.
- **Output**: Download Word (.docx with letterhead, logo, signature, footer), print or save as PDF, copy, and save to the matter file. The email helper opens a short email with no client details; attach the Word file yourself.
- **Time and costs**: time ledger in 6-minute units, disbursements, estimate calculator, CSV export. Feeds the progress and costs letters.
- **Checklists**: opening, matter-specific, hearing and closing prompts with N/A and your own items. They are prompts, not compliance advice.
- **Wording**: Settings > Standard wording edits the fixed legal paragraphs; record who reviewed the wording. The supplied wording has had no legal review.
- **Local AI extras**: "Explain in plain English" needs Ollama or LM Studio. Identifiers (emails, phones, NI numbers, sort codes, account numbers, postcodes, dates of birth, plus your own words) are replaced with codes before sending and restored afterwards. You are warned if the AI address is not on your own network.
- **Import**: Settings > Import matter details reads a CSV (template provided) to create matters.

## Limits

Tested in Chromium only. Scanned documents depend on OCR quality and can be misread. The built-in reader finds patterns and cannot interpret. Local AI can make mistakes. There is no e-signature, no sending of email and no direct link to Clio or other systems (use CSV import). Check every letter before it goes out.


## Dashboard, templates and forms

- **Dashboard** (opens first): open matters, hearings in the next 14 days, time recorded, items needing attention (hearing soon with no notice saved, costs near the estimate, no activity for 30 days), a backup reminder, and a searchable matters table with an Open/Closed status.
- **Templates**: your firm's standard documents with merge fields such as `{{client name}}` and `{{our ref}}`. Upload a Word, OpenDocument, RTF or text file, add merge fields, then fill it for the current matter and download Word or save to the matter file. Five starter templates are included (acknowledgement, client authority, request to a bank, pension valuation request, request for a previous solicitor's file). Formatting from uploaded files is not kept, only the words.
- **Forms**: internal client information, identity and source of funds record, conflict check and file opening forms, saved per matter, with Word download. These are not court forms; use the current official forms from gov.uk or HMCTS for those. Do not record ID numbers or bank details in them.

## Legal aid injunction and children work

- **Client care letter (legal aid)**: legal aid is now the default funding. Upload the client's witness statement and instruction form in the document panel and read them. The built-in reader fills the client and other party, relationship, children, orders sought (non-molestation with or without notice, occupation, child arrangements, prohibited steps, specific issue), a second-person summary of what happened, police reference, safe contact, language needs, evidence mentioned and legal aid status. Check every line against the statement. The letter then covers who will act, the orders and how they work, evidence of abuse, how legal aid works (certificate scope, contribution, statutory charge, costs protection, the client's duties, the LAA's powers), what the client must provide, safety and helpline information, and the client's signature at the end. Private funding still uses the earlier fee-based letter.
- **Closing letter**: upload the court orders and the hearing attendance notes. "How we represented you" is drafted from the hearings and notes (who attended, the client's instructions, what happened), "The outcome" lists the orders made, and "What the orders mean for you" explains them in plain English (non-molestation, occupation, undertakings, penal notice, child arrangements, prohibited steps, specific issue, duration). Legal aid matters get a legal aid paragraph instead of a final bill.
- The "Add legal aid example" button shows a filled example. Legal and procedural wording was written without legal review: have a solicitor approve it, and confirm current legal aid rules and evidence requirements before use.

## Documents, search, contacts, packs (Clio-style)

- **Documents**: files read in the letters screen, or added in the Documents screen, are kept with the matter as text. Search them by word (one matter or all), view them with matches highlighted, set their type, and fill any letter from the ticked documents without uploading again. "Show what the documents say" lists the facts found with the document each came from. Only the text is stored, not the original file.
- **Details still needed**: each letter lists the blanks it still has at the top of the form. Fill them there and the letter updates.
- **Contacts**: other sides' solicitors, counsel, courts, banks. Link them to a matter and pick them as the recipient of a template.
- **Document packs** (Templates screen): opening, hearing and closing packs, or your own selection, downloaded as one zip of Word files.
- Stored documents and contacts are in the browser only and in backups. Large stores may reach the browser's storage limit, so remove documents you no longer need.

## Reading real documents

- The built-in reader now recognises common court forms (non-molestation order FL404A style, child arrangements order C43 style, notices), takes the order date, judge and court from the text, reads numbered witness statement paragraphs (name, address, children, relationship, dated incidents, police reference, language needs), and drafts the closing letter representation from prose attendance notes. Fake documents in `sample-documents/` show the formats it was tested on. Real documents vary a lot, so check every line.
- With a local AI model (Ollama or LM Studio) selected, the app asks the model separately for the client's circumstances (care letter) and for the representation, outcome and meaning sections (closing letter), then falls back to the built-in reader if the model fails. Identifiers are masked before sending, as set in Settings. This path was tested only with a mock server, not with a real model, so try it on an anonymised matter and judge the quality.

## Testing extraction

`test-corpus/` holds a varied set of fake witness statements, court orders and attendance notes (different layouts, styles, abbreviations, date formats) with the facts each should yield. The built-in reader passes all 150 checks on it. These documents were written by the developer, so real documents from your practice may still differ. Please check every draft against the source documents.

The same corpus is used to test the built-in document summaries (`test-corpus/scripts/sum.js`, `sum2.js`): each document is typed as a witness statement, instruction form, attendance note, court order or notice of hearing, and summarised with its date, orders, children, key incidents and deadlines. Notices of hearing are described as listed hearings, not as past events. The built-in summary picks out facts and key sentences; it does not interpret the documents. A local AI model can write fuller summaries if you connect one in Settings.

## Teaching the built-in reader

The built-in reader is rule-based, so it can be taught your firm's documents. Everything is stored in this browser only.

- **Settings, Teach the reader:** list your usual courts, judges, and the headings your own attendance notes, statements and orders start with. The reader then recognises those documents and uses your spelling of court and judge names.
- **Correct and remember:** after reading documents, open "Something wrong?", pick the field (client name, other party, court, case number, our reference, judge, client address) and type the right value. The reader remembers the label in front of it (for example "Opponent:") and uses it on the next documents. The wrong value is never filled into that field again.
- **Summaries:** each summarised document has a "Wrong type?" choice, which is remembered for documents that start with the same heading, and a "Hide" button on any summary point you do not want.
- Learned rules can be reviewed, forgotten, exported and imported (for sharing with colleagues) under Settings.

A learned label such as "Applicant:" fills the field whichever party your client is, so remove or correct a rule that does not fit a particular matter. `test-corpus/scripts/teach.js` tests these features.

## Scanned documents, PDFs and Word files

Text PDFs, scanned PDFs, photographs, .docx, .odt and .rtf files were tested (`test-corpus/scans`, `test-corpus/scripts`). Findings and what changed:

- Page headers and footers that repeat on every page of a PDF (court name, case number, "Page 1 of 3") are now kept once and the page numbers dropped, so they no longer pile up in the text.
- Poor scans and photos get a second pass: the image is enlarged, evened out, cleaned of speckle and straightened (up to about 6 degrees), and the better reading is used.
- On realistic scans and photos (about 200 dpi, a few degrees of skew, uneven light, noise) all 16 test files read correctly. Images below roughly 150 dpi with heavy noise still read badly. The app now says so ("The image is low resolution", "Recognition was poor") and asks for a clearer scan. Scanning at 200 to 300 dpi, flat and well lit, is best. Scanned pages can take 5 to 130 seconds each. A progress bar shows which scanned page is being read, the percentage and roughly how long is left, and says when a poor page is being read a second time. The Stop button stops a scan read straight away.
- RTF files from Word were filling the text with font and style tables; the RTF reader was rewritten.
- Handwriting is not read.

## Legal aid tracking

On a legal aid matter, Time and costs opens with a Legal aid tracker: costs used against the certificate costs limit (with an extension limit), disbursement limit, emergency certificate expiry, client contribution due and paid, scope and the date it was last reviewed, and a note of work outside the scope. It warns at 75%, 90% and 100% of the limit, when the emergency certificate is close to expiring, when a contribution is overdue and when scope has not been reviewed for 60 days. The Dashboard lists all legal aid matters. These are prompts based on what you enter. They do not replace the certificate or the LAA's current rules.

## Reminders

The Dashboard shows reminders due in the next two weeks, and the Dashboard tab shows how many are due this week: notice of hearing letter not yet saved, outcome letter not yet saved after a hearing, closing letter not sent after an outcome letter, no letter to the client for 8 weeks (changeable in Settings), the legal aid warnings above, and reminders you add yourself. Snooze or dismiss any of them. "Download calendar file" makes an .ics file for your calendar app; it leaves client names out unless you tick the box.

## Case workers and the activity log

Settings, Case workers: list the people who use the app, choose who you are, and new matters are assigned to you. The Dashboard shows your matters (or everyone's), and each matter has an owner you can change. Each matter has an Activity log (Matter file): who edited which fields (names only), saved letters, added documents, recorded time, downloaded Word files, and changed status or owner. Export a matter log as CSV.

This is for organising work. It is not access control, and the log is not tamper-proof: anyone who can open the app in this browser can see and change everything. Use the passphrase lock to protect the data.

To work with a colleague, use Settings, Merge matters from a colleague. Matters are matched by identity; new ones are added, and if both of you changed one, the newer version is kept and your older version is kept beside it, closed and marked "previous version". The app does not sync by itself.

## Backups

- The Dashboard reminds you when your last backup is older than the number of days you choose (default 7), with a Back up now button.
- In Chrome or Edge on a computer you can choose a backup folder (Settings, Automatic backups and storage). The app then saves a dated backup there a few minutes after changes and keeps the last 14. Encrypted if the passphrase lock is on. The browser may ask you to allow access again each time you open the app. Other browsers: use Export all matters.
- The app asks the browser to protect its stored data from being cleared and shows whether it agreed.
- Backups also hold your firm profile, wording, library, contacts, the reader's learned rules and the case worker list.

## Accessibility

Checked with the axe-core tool in light and dark mode at desktop and phone widths across every screen: no violations are reported. Skip link, landmarks, labelled controls, keyboard focus kept inside dialogs (Escape closes, focus returns), arrow keys move along tabs, 24 pixel minimum touch targets, and readable colours in dark mode. Automated checks do not find everything, so a test with a screen reader such as NVDA or VoiceOver is still advisable. `test-corpus/scripts/a11y.js` and `kbd.js` repeat the checks (they need `npm install playwright axe-core`).

## Reminder rules

Settings, Reminder rules: each kind of reminder can be switched off and its timing changed. Notice of hearing letter (days before the hearing), outcome letter (days after the hearing), closing letter (days after the outcome letter), progress update (days without a letter, with a separate interval for legal aid matters if you want one), legal aid limit warnings (two percentages), scope review days, extension wait days, and all legal aid warnings on or off. The standard values are 14, 2, 14, 56 (same for legal aid), 75% and 90%, 60 and 21 days. "Reset to the standard rules" restores them. `test-corpus/scripts/rules.js` and `prog.js` test these and the scan progress and stop button.

## Standard wording and templates (update)
- Settings → Standard wording now also controls: "What we need from you" and "Ending our instructions" in the legal aid care letter (labelled "legal aid care letter"), and in the closing letter the divorce affairs paragraph, the "orders can be varied" paragraph, the file-storage paragraph, the closing sentence and the feedback paragraph. Unedited, the wording is unchanged.
- Templates accept legal aid merge fields: legal aid status, certificate number, legal aid scope, client contribution, costs limit, supervisor, police reference, safe contact.
- Eight new draft starter templates (legal aid means, contribution, certificate amendment; non-molestation, occupation and s8 advice; breach; hearing preparation). They are drafts: have them reviewed before use. Existing users get them added automatically once.

## Matter types and editing (update)
- New matters now default to Non-molestation order. Types: non-molestation, occupation, transfer of tenancy, both orders, child arrangements, prohibited steps, specific issue, section 8, financial remedy, then divorce and others. Existing matters keep their type.
- Letters can be edited directly on the page, with a formatting bar (bold, italic, underline, lists, heading, undo). Template documents can also be edited in the preview; those edits apply to that copy only. Change the template itself through its Text box.
