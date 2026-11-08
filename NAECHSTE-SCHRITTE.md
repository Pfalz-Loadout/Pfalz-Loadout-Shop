# Nächste Schritte – Übergabe (Stand 08.11.2026, ca. 13:30)

Vorschau: https://pfalz-loadout-shop.vercel.app (Vercel-Login). Push auf `main` = Vercel-Build.
Repo: github.com/Pfalz-Loadout/Pfalz-Loadout-Shop. Lokal: `C:\Users\d-bee\dev\pfalz-loadout-shop`.
Node portabel: `export PATH="/c/Users/d-bee/AppData/Local/nodejs-portable/node-v26.13.0-win-x64:$PATH"`.
Python (Bildbearbeitung): `/c/Users/d-bee/.shopify/rembg-venv/Scripts/python.exe -I …`.
Medien: `OneDrive\Dokumente\Claude\pfalz-loadout-shop\medien` → `node scripts/medien.mjs [filter]` (AVIF/WebP + media.generated.json, misst je Bild den Freiraum oben rechts `tr`).
Hinweis: Im Chat eingefügte Bilder landen NICHT auf der Platte (außer Upload-Pfad wird genannt) → Person legt sie in den Medienordner.
Deploy-Status prüfen: `curl -s https://api.github.com/repos/Pfalz-Loadout/Pfalz-Loadout-Shop/commits/<sha>/status` (Vercel-MCP-Abfrage wurde vom Berechtigungsfilter blockiert).

## OFFEN – zuerst klären
1. **„Baue das Logo ein. Ändere aber Codes“** (letzte Nachricht der Inhaberin, unklar): Welches Logo (eigener Patch mit Pfalz-Loadout-Logo?), wohin, und welche Codes (Produktcodes PL_KWT…, Seriennummern „SN IFAK-0425“…)? Kein neues Logo im Ordner gefunden.
2. **Landschaftsfoto** `medien\einsatz\pfalz-sandstein-weitblick.jpg` (Pexels, Patrick Schulze, 6000×4000) für Intro/Logo/Hero: sieht nach **Sächsischer Schweiz** aus, nicht Pfalz → Herkunft bei Pexels prüfen; Tausch = neue Datei + `extract` in `scripts/medien.mjs` (Keys `pfalz-scope`, `pfalz-weit`).
3. **§-19-Hinweis im Footer**: auf der Seite sonst entfernt (nur Warenkorb/Kasse/Rechtstexte) – soll er auch im Footer weg?
4. **Bild-Effekte Vorschaubilder**: Vorschläge gemacht (Empfehlung: Scan-Reveal beim Bildwechsel + langsamer Zoom), Auswahl steht aus.

## Erledigt in dieser Sitzung (Auszug)
- Header-Logo mit Fadenkreuz (`src/components/Logo.tsx`, Rahmen per `scripts/logo-rahmen.py`), Foto im Scope.
- Intro `src/components/ScopeIntro.tsx`: 3 rote Punkte während das 2800-px-Foto lädt (Vorladen per Skript im `<body>`), dann Zoom 3,4× auf den Berg, Fernrohr fliegt ins Header-Logo; einmal pro Besuch (sessionStorage), kein Überspringen-Text, Notaus 7 s.
- Hero: Foto in der Wortmarke (background-clip: text) mit langsamer Kamerafahrt (`src/app/logo.css`).
- Zahlenschloss (`LockBadge.tsx`): Originalfotos 6 Farben (`scripts/schloss-freistellen.py`), nur farbiges Gehäuse leuchtet beim Wechsel, rechtsbündig unter der Seriennummer, Größe aus Freiraum (`lockSpace`, nie über dem Produkt).
- IFAK-Patch (`PatchBadge.tsx`, `scripts/patch-freistellen.py`): immer sichtbar, Kreuz im IFAK-Rot, leuchtet alle ~4,5 s.
- Infopunkte: hochwertige Karte, nur temporär (Hover/Antippen, 3,5 s). Bildwechsel: Leiste ‹ 1/3 › mittig unten.
- Vorschaubild kippt mit der Maus, Bühne nicht mehr angeheftet („Alle Daten“ klappt nur nach unten).
- KWT: Front (Klett) zuerst; Coyote 5 Ansichten inkl. Seite + Fronttasche; Infopunkte aufgeklappt (Magazine, 2 Waffenfächer bis 6 Zoll, Arbeitsmatte); WaffG-§12-Text; „Zerlegt“ mit Coyote-Nahaufnahmen (4:3); Labor: Wasser perlt ab, Reißverschluss-Foto, Arbeitsmatte mit grüner KWT + Pistole.
- IFAK: Rückseiten, leere Innenansichten, Trägerplatte abgelöst, Infopunkte (Deckel, Gummischlaufen, Netzfach, Trägerplatte, Abreißen, Riemen), Packliste M.A.R.C.H., Labor (Schnellzugriff-Foto, Reißverschluss-Detail).
- Sling: 3 Bilder je Farbe; „+ QD-Öse“ teilt die Vorschau untereinander (Riemen oben, QD an M-LOK unten, `optionSplit`).

## Weiterhin offen (älter)
- Vercel-Variablen SMTP_PASS, PAYPAL_CLIENT_ID/SECRET (Sandbox), BANK_* → Testbestellung
- Versandpauschale/Gratisgrenze (Platzhalter 4,90 € / 75 €)
- Camo-KWT: Foto der Klett-Seite fehlt; Rot/ACU-IFAK teils wenige Fotos
- Kurzvideos fürs Labor (Range-Bag-Innenleben-Video existiert)
- AGB/Datenschutz prüfen lassen; Livegang: Domain pfalz-loadout.de umziehen, SITE_URL, PAYPAL_ENV=live
- IFAK-Packliste-Texte fachlich gegenlesen lassen
