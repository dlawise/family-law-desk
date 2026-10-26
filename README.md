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
