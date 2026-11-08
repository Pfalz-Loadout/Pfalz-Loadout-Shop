# Nächste Schritte (Stand 08.11.2026, Sitzungsende)

## 1. IFAK: Abschnitt „Was gehört rein?“ (Wunsch der Inhaberin)
Quelle/Inspiration: Blogartikel taktik-training-medizin.de „Individual First Aid Kit (IFAK) – Was muss rein?“ (25.02.2021).
**Nicht wörtlich übernehmen** (Urheberrecht) – eigene, kurze Texte schreiben, ggf. Quelle verlinken.
Inhaltlicher Kern:
- IFAK = persönliche Erste-Hilfe-Ausstattung am Mann/an der Frau, ersetzt keinen Notfallrucksack; nur so viel packen, wie sauber in die Pouch passt; regelmäßig üben.
- Packen nach Schema xABCDE bzw. M.A.R.C.H.: Schwerpunkt kritische Blutungen + Atemwege.
- Typischer Inhalt: Emergency Bandage, Hämostyptische Gaze, Kompressen, Fixierbinde, Permanentmarker (zum Tourniquet), Atemwegshilfe (Guedel-/Wendl-Tubus), Chest Seals, Rettungsdecke, Pflaster/Wundschnellverband; Tourniquet besser außen griffbereit; Schere in Reichweite.
Umsetzungsidee: interaktive „Packliste“ beim IFAK (Labor oder Produktbühne) – Kategorien M/A/R/C/H zum Antippen, jeweils 1–2 Sätze.
Pflicht-Hinweise: „Lieferung ohne Inhalt“, „keine medizinische Beratung – Inhalt nach eigener Ausbildung wählen, Kurs empfohlen“.

Zweite Quelle (PPF Germany, Blog „IFAK: Was in dein Erste-Hilfe-Kit für den Einsatz gehört“, 05.10.2026) – ebenfalls nur Inspiration, eigene Worte:
- Kern (Hartford Consensus III): Handschuhe, Tourniquet (nur CoTCCC-empfohlen), Druckverband, hämostyptische Gaze; dazu 2 Chest Seals (vented), Trauma-Schere, Marker, Rettungsdecke.
- Warum Gaze Pflicht ist: Studie Eastridge 2012 – nur ca. 13,5 % der tödlichen Blutungen an Armen/Beinen (Tourniquet), ca. 19 % Leiste/Achsel/Hals → Wound Packing.
- Packen in Schichten: vorne Blutstillung, Mitte Brustkorb, hinten Wärme/Reserve; Tourniquet außen; Rip-Away-Pouch (passt zu PL_IFAK!); immer gleicher Platz.
- Nicht rein: Bagatell-Pflaster, Medikamente, Schienen, Übungsmaterial.
- Wartung: Ablaufdaten (Gaze, Chest Seals), Hitze im Auto, nach Einsatz auffüllen, üben.
- Idee für den Shop: Packliste-Grafik in der Pouch (Schichten antippbar) + Quellenangaben (TCCC, ERC 2025, S3-Leitlinie Polytrauma) + Hinweis „ersetzt keine Ausbildung“. Rip-Away-Funktion des IFAK als Kaufargument verknüpfen.

**Erledigt (08.11.2026):** Abschnitt „Packliste“ (`src/components/sections/Packliste.tsx`, `src/app/packliste.css`) nach dem Materiallabor: M.A.R.C.H.-Reiter, Zonen-Marker auf dem Foto der offenen Pouch, „Gehört nicht rein“, Pflege, Rip-Away-Argument, Pflichthinweise + Quellen. Texte sollte die Inhaberin noch fachlich gegenlesen.

## 2. Zahlenschloss-Fotos
**Umgestellt (08.11.2026):** LockBadge zeigt jetzt ein echtes Foto oben rechts im Vorschaubild (kein Einflug), Farbleuchten wechselt alle 4 s mit kurzem Aufleuchten.
Retuschierter Ausschnitt verworfen („hässlich“) → liegt nur noch in `zahlenschloss\_alt\`. Die Inhaberin hat ORIGINAL-Produktfotos (800×800, weißer Grund, hochkant, Farben schwarz/pink/grün/orange/gelb/blau) im Chat gezeigt – sie müssen als Dateien in den Ordner:
`medien\zubehoer\zahlenschloss\schwarz.jpg, pink.jpg, gruen.jpg, orange.jpg, gelb.jpg, blau.jpg`
Dann: `python -I scripts/schloss-freistellen.py` (rembg-venv) → `node scripts/medien.mjs zs-` → fertig (Komponente + Manifest sind vorbereitet). Bis dahin erscheint KEIN Schloss im Bild.
Außerdem gezeigt: Gruppenfoto aller Farben auf dunklem Grund mit Pfalz-Loadout-Logo – Kandidat fürs Materiallabor/Range-Bag-Zubehör.

## 2c. Weitere Änderungen 08.11.2026
- Wolken-Rand der Produktfotos entfernt (wieder weißer Rahmen).
- Bildwechsel per Pfeil links/rechts auf dem Vorschaubild (`src/components/ShotArrows.tsx`), Zähler unten rechts.
- Gurt: je Farbe 2 Fotos (stehend, liegend, freigestellt), bei „+ QD-Öse“ wird `sl-qd-teile` als 3. Bild angehängt und angezeigt (`optionStage` in shop.ts).

## 2b. Range Bag (KWT) Bildreihenfolge
**Erledigt (08.11.2026):** immer 1. Front mit Klettfeld (Patch), 2. MOLLE-Seite, 3. offen. Schwarz-Front war vorher gar nicht drin. Camo hat kein Foto der Klett-Seite → fehlt noch.

## 3. Für echte Bestellungen (trägt die Inhaberin selbst in Vercel ein)
`SMTP_PASS`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` (zuerst Sandbox), `BANK_INHABER`, `BANK_IBAN`, `BANK_BIC`, `BANK_NAME` → danach Testbestellung PayPal + Überweisung inkl. Mails.

## 4. Offen
- Versandpauschale / Gratisgrenze (Platzhalter 4,90 € / 75 €)
- Rucksack-Fotos ohne Wasserzeichen; Gewehrriemen-Freisteller
- Kurzvideos fürs Materiallabor (Drehanweisungen in den Platzhaltern)
- AGB + Datenschutz rechtlich prüfen lassen
- Livegang: Domain pfalz-loadout.de vom Vercel-Projekt `website-pfalz-multiservice` auf `pfalz-loadout-shop` umziehen, `SITE_URL` setzen, `PAYPAL_ENV=live`
