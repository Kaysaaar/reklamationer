# Wallmann Reklamationer

Mobil registrering af reklamationssager og kontoroversigt.

Dette projekt indeholder kun den offentlige brugerflade. Sagsoplysninger, billeder, adgangskoder og serverkode ligger ikke i dette projekt.

Sælgerappen åbnes fra index.html. Kontoret bruger office.html. Adgang kræver et personligt aktiveringslink, en godkendt browser og en personlig kode. Alle rettigheder kontrolleres på serveren.

Felter og målinger er til dokumentation. De udgør ikke en automatisk afgørelse af en reklamation.

## Version 1.1.0

Sager får ved afsluttet overførsel et kort nummer, fx R26-0001. Interne ID'er bevares til gentagne overførselsforsøg. Kontorets fælles oversigt kan søge kunde, kontakt, adresse, by, postnummer, telefon, mail, reference, ordre og begge sagsnumre samt filtrere besigtigelsesdato, sælger og status. Resultater hentes 50 ad gangen.

Begge apps kontrollerer version.json ved åbning og hvert femte minut, mens appen er synlig. En ny version vises som en knap; ingen automatisk genindlæsning. Sælgerkladden gemmes før opdatering. Kontoret skal først gemme ændret opfølgning. Login kan kræves igen efter opdatering.

Ved næste udgivelse: opdatér versionsnummer i update.js, version.json og HTML-filernes JS/CSS-parametre samlet i samme udgivelse. Publicér aldrig serverkode, kundedata eller lokale gennemgangsfiler i dette repository.
