# Wallmann Reklamationer

Mobil registrering af reklamationssager og kontoroversigt.

Dette projekt indeholder kun den offentlige brugerflade. Sagsoplysninger, billeder, adgangskoder og serverkode ligger ikke i dette projekt.

Sælgerappen åbnes fra index.html. Kontoret bruger office.html. Adgang kræver et personligt aktiveringslink, en godkendt browser og en personlig kode. Alle rettigheder kontrolleres på serveren.

Felter og målinger er til dokumentation. De udgør ikke en automatisk afgørelse af en reklamation.

## Version 1.1.0

Sager får ved afsluttet overførsel et kort nummer, fx R26-0001. Interne ID'er bevares til gentagne overførselsforsøg. Kontorets fælles oversigt kan søge kunde, kontakt, adresse, by, postnummer, telefon, mail, reference, ordre og begge sagsnumre samt filtrere besigtigelsesdato, sælger og status. Resultater hentes 50 ad gangen.

Begge apps kontrollerer version.json ved åbning og hvert femte minut, mens appen er synlig. En ny version vises som en knap; ingen automatisk genindlæsning. Sælgerkladden gemmes før opdatering. Kontoret skal først gemme ændret opfølgning. Login kan kræves igen efter opdatering.

Ved næste udgivelse: opdatér versionsnummer i update.js, version.json og HTML-filernes JS/CSS-parametre samlet i samme udgivelse. Publicér aldrig serverkode, kundedata eller lokale gennemgangsfiler i dette repository.


## 1.3.0
Saved cases, including closed cases, can be edited with a reason and revision history. Reopening requires a reason. The responsible seller or office can share a case with active colleagues; shared access is enforced for metadata, history, photos and attachments. Office search includes narrative fields and closed cases. Office-only notes remain private.

Attachments on saved cases accept PDF, images, EML/MSG, text, CSV, DOCX and XLSX, up to 4 MiB each and 50 per case. Files remain in the private case folder and download through authenticated requests. Attachment contents are not full-text indexed.

Case metadata renders before photo downloads, with a maximum of three concurrent image requests and a bounded in-memory cache. The camera drawer follows pointer movement and respects reduced-motion preferences.

## 1.3.1
Attachment preview loads on demand via the existing authenticated endpoint. EML displays decoded headers and text-only mail content (no remote images or active HTML); multipart, base64 and quoted-printable supported. Images, text/CSV and browser-native PDF preview; MSG, Word and Excel still require download. HEIC/PDF availability depends on the browser. Original files are unchanged.

## 1.4.0
Shared timeline loads on expansion in pages of20 and combines case creation, registered inspection, revision events, attachments and dated call/visit/agreement/notes. Notes are immutable, idempotent on retry, retain case status and are visible only to current case participants and office. Internal office notes never enter the timeline. Follow-up may be assigned to office or existing case sellers with an optional date; server validates membership and dates, prevents removing a participant with a pending action, and clears reminders when closing. Sheet columns are added on first write. Search cards show customer/city, a bounded matching excerpt and follow-up summary without additional case-file reads. File chooser and drag/drop share validation and upload logic (4MiB,50file limits retained); direct dragging from mail programs depends on their browser integration.

## 1.5.0
Visit tools on saved cases: own-note dictation uses the device keyboard (Danish dictation must be enabled); no app audio capture, audio upload or paid transcription API. Text requires explicit approval before timeline save. Editable visit report is assembled from factual case fields, excluding office notes/history, with an agreement placeholder that must be reviewed; saved as a private TXT attachment, never automatically sent. Canvas arrows and optional captions create JPEG attachment copies (max2200px, quality0.9), retaining originals. Existing attachment authorization/size limits/revision checks apply. Generated File objects are retained for retry idempotency; errors keep dialog contents.

## 1.5.1
Besøgsreferater gemmes som PDF med Wallmann-logo, godkendt tekst, sidenumre og op til 10 valgte billeder. Gemte billedmarkeringer kan vælges som bilag. PDF'en gemmes privat på sagen via den eksisterende filoverførsel og kan vises eller downloades. Ingen automatisk afsendelse. Interne kontornoter medtages ikke. PDF-værktøjet (pdf-lib 1.17.1, MIT) hentes først ved brug; PDF-billeder skaleres til højst 1800 pixels og originalerne bevares. Grænsen på 4 MiB pr. bilag gælder også referater.

## 1.5.2
Besøgsreferatets PDF vises inden godkendelse, med sideknapper og mulighed for at rette tekst/billedvalg. Kun den viste fil gemmes ved godkendelse. Forhåndsvisning gemmer ikke et bilag. PDF.js 5.6.205 (Apache-2.0) indlæses lokalt ved brug og tegner én side ad gangen, også på telefoner.
