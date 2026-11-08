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

## 2. Zahlenschloss-Fotos
Echte Fotos (Schwarz, Pink, Grün, Orange, Gelb, Blau, weißer Grund) nach
`OneDrive\Dokumente\Claude\pfalz-loadout-shop\medien\zubehoer\zahlenschloss\` legen →
`src/components/LockBadge.tsx` von SVG auf Fotos umstellen (Farbwechsel per Überblendung).

## 3. Für echte Bestellungen (trägt die Inhaberin selbst in Vercel ein)
`SMTP_PASS`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` (zuerst Sandbox), `BANK_INHABER`, `BANK_IBAN`, `BANK_BIC`, `BANK_NAME` → danach Testbestellung PayPal + Überweisung inkl. Mails.

## 4. Offen
- Versandpauschale / Gratisgrenze (Platzhalter 4,90 € / 75 €)
- Rucksack-Fotos ohne Wasserzeichen; Gewehrriemen-Freisteller
- Kurzvideos fürs Materiallabor (Drehanweisungen in den Platzhaltern)
- AGB + Datenschutz rechtlich prüfen lassen
- Livegang: Domain pfalz-loadout.de vom Vercel-Projekt `website-pfalz-multiservice` auf `pfalz-loadout-shop` umziehen, `SITE_URL` setzen, `PAYPAL_ENV=live`
