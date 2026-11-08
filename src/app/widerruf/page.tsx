import type { Metadata } from 'next';
import { SHOP } from '@/data/shop';

export const metadata: Metadata = { title: 'Widerrufsbelehrung – PFALZ LOADOUT', alternates: { canonical: '/widerruf' } };

/** Muster-Widerrufsbelehrung nach Anlage 1 zu Art. 246a § 1 Abs. 2 S. 2 EGBGB (Warenkauf) */
export default function Widerruf() {
  const c = SHOP.contact;
  return (
    <article className="wrap legal">
      <h1 className="display">Widerruf</h1>
      <h2>Widerrufsbelehrung</h2>
      <h2>Widerrufsrecht</h2>
      <p>Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.</p>
      <p>
        Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist,
        die Waren in Besitz genommen haben bzw. hat. Bei mehreren Waren, die Sie im Rahmen einer einheitlichen Bestellung bestellt haben und
        die getrennt geliefert werden, beginnt die Frist an dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der
        Beförderer ist, die letzte Ware in Besitz genommen haben bzw. hat.
      </p>
      <p>
        Um Ihr Widerrufsrecht auszuüben, müssen Sie uns ({c.company}, Inh. {c.owner}, {c.street}, {c.zip} {c.city}, Telefon: {c.phone},
        E-Mail: {c.email}) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder E-Mail) über Ihren Entschluss,
        diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht
        vorgeschrieben ist.
      </p>
      <p>Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.</p>
      <h2>Folgen des Widerrufs</h2>
      <p>
        Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten
        (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene,
        günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die
        Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel,
        das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in
        keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
      </p>
      <p>
        Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder bis Sie den Nachweis erbracht haben, dass Sie
        die Waren zurückgesandt haben, je nachdem, welches der frühere Zeitpunkt ist.
      </p>
      <p>
        Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an dem Sie uns über den Widerruf
        dieses Vertrags unterrichten, an uns zurückzusenden oder zu übergeben. Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist
        von vierzehn Tagen absenden.
      </p>
      <p>Sie tragen die unmittelbaren Kosten der Rücksendung der Waren.</p>
      <p>
        Sie müssen für einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust auf einen zur Prüfung der Beschaffenheit,
        Eigenschaften und Funktionsweise der Waren nicht notwendigen Umgang mit ihnen zurückzuführen ist.
      </p>
      <h2>Muster-Widerrufsformular</h2>
      <p>(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)</p>
      <p>
        An {c.company}, Inh. {c.owner}, {c.street}, {c.zip} {c.city}, E-Mail: {c.email}:
        <br />
        Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)
        <br />
        – Bestellt am (*)/erhalten am (*)
        <br />
        – Name des/der Verbraucher(s)
        <br />
        – Anschrift des/der Verbraucher(s)
        <br />
        – Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)
        <br />
        – Datum
        <br />
        (*) Unzutreffendes streichen.
      </p>
    </article>
  );
}
