/** Bankverbindung für Vorkasse – kommt ausschließlich aus Umgebungsvariablen. */
export function bankDetails() {
  const { BANK_INHABER, BANK_IBAN, BANK_BIC, BANK_NAME } = process.env;
  if (!BANK_INHABER || !BANK_IBAN) return null;
  return {
    holder: BANK_INHABER,
    iban: BANK_IBAN.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim(),
    bic: BANK_BIC ?? '',
    name: BANK_NAME ?? '',
  };
}
