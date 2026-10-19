/* Field definitions are shared by the phone form and office case view. */
window.ClaimsSchema = {
  sellers: ['Alexander','Claus','Daniel','Emil','Jørn','Kalle','Kim','Lasse'],
  customer: [
    ['reference','Kundens reference / eksisterende sagsnummer','text'],
    ['customer','Kunde / forhandler','text',true],['contact','Kontaktperson','text',true],
    ['phone','Telefon','tel'],['email','E-mail','email'],['address','Adresse for besigtigelsen','text',true],
    ['postcode','Postnummer','text'],['city','By','text'],['visitDate','Besigtigelsesdato','date',true],
    ['order','Ordre- eller fakturanummer','text']
  ],
  product: [
    ['productGroup','Produktgruppe','select',['Gulv','Bordplade','Loft- / vægpanel','Andet']],
    ['product','Produktnavn / varenummer','text'],['batch','Batch / produktionsnummer','text'],
    ['material','Materiale og overflade','text'],['purchased','Købsdato','date'],['installed','Monteringsdato','date'],
    ['installer','Montør / firma','text'],['room','Rum / placering','text'],['area','Berørt areal (m²)','number'],
    ['discovered','Hvornår blev forholdet opdaget?','date']
  ],
  types: {
    water:{name:'Vand / fugt',intro:'Registrér målingerne med enhed, metode og målested. Et fugttal alene fortæller ikke årsagen.',fields:[
      ['waterSource','Hvor kan fugten komme fra?','select',['Ukendt','Utæt installation','Spild / rengøring','Undergulv','Udefra','Andet']],
      ['floorMoisture','Fugt i gulvmateriale (%)','number'],['subfloorMoisture','Måling i undergulv','number'],
      ['moistureUnit','Enhed for undergulv','select',['Ikke målt','% RF','% CM','Træfugt %','Instrumentets skala']],
      ['airHumidity','Luftfugtighed (% RF)','number'],['roomTemperature','Rumtemperatur (°C)','number'],
      ['instrument','Måler og målemetode','text'],['measurementLocation','Målested, dybde og tidspunkt','textarea'],
      ['noMeasurement','Hvis ikke målt: hvad mangler?','textarea']],checks:['Synlig opfugtning','Hævede kanter / samlinger','Misfarvning','Lugt','Fugtspærre undersøgt','Vandkilden undersøgt']},
    installation:{name:'Mulig monteringsfejl',intro:'Beskriv det observerede og de mål, der er taget.',fields:[
      ['installationMethod','Monteringsmetode','select',['Ukendt','Svømmende','Limning','Skruer / søm','Andet']],
      ['subfloor','Undergulv / konstruktion','text'],['edgeGap','Afstand til faste bygningsdele (mm)','number'],
      ['flatness','Målt afvigelse / målelængde','text'],['underlay','Underlag og fugtspærre','text'],
      ['heating','Gulvvarme','select',['Ukendt','Ingen','Vandbåren','Elektrisk']],
      ['surfaceTemperature','Overfladetemperatur (°C)','number'],['installationNotes','Observationer ved montering','textarea']],checks:['Monteringsvejledning gennemgået','Overgange undersøgt','Fiksering undersøgt','Samlinger undersøgt','Opstartsprotokol for gulvvarme foreligger']},
    production:{name:'Mulig produktionsfejl',intro:'Dokumentér variationen og hvor mange enheder der er berørt.',fields:[
      ['defect','Hvilken fejl ses?','textarea'],['affectedUnits','Antal berørte brædder / enheder','number'],
      ['unopenedUnits','Antal uåbnede pakker','number'],['dimension','Mål / afvigelse med enhed','text'],
      ['comparison','Sammenligning med ubeskadiget produkt','textarea']],checks:['Batch fotograferet','Fejlen findes i flere pakker','Fejlen ses før montering','Prøve gemt']},
    transport:{name:'Transport / emballage',intro:'Dokumentér emballage og produkt hver for sig.',fields:[
      ['received','Modtagelsesdato','date'],['carrier','Transportør / fragtbrev','text'],['packages','Antal berørte kolli','number'],
      ['packaging','Emballagens tilstand','textarea'],['transportDamage','Skadens placering og omfang','textarea']],checks:['Emballage fotograferet','Skade noteret ved modtagelse','Emballage gemt','Skaden opdaget ved udpakning']},
    surface:{name:'Overflade / farve / slid',intro:'Tag både et oversigtsbillede og et nærbillede.',fields:[
      ['surfaceIssue','Overfladens forandring','textarea'],['exposure','Lys, belastning og brug','textarea'],
      ['cleaning','Rengørings- og plejemidler','text'],['cleaningMethod','Pleje og rengøringsmetode','textarea']],checks:['Ridser','Pletter','Glansforskel','Farveforskel','Afskalning','Referenceområde fotograferet']},
    movement:{name:'Fuger / deformation',intro:'Notér både omfang og konkrete mål.',fields:[
      ['movementKind','Forandring','select',['Åbne fuger','Krumning / skålning','Bulning','Højdeforskel','Andet']],
      ['gap','Største fuge / højdeforskel (mm)','number'],['extent','Udbredelse i rummet','textarea'],
      ['climate','Indeklima og variation over tid','textarea']],checks:['Samlinger fotograferet','Målestok med på foto','Optræder flere steder','Ændrer sig med årstiden']},
    sound:{name:'Lyd / bevægelse ved gang',intro:'Beskriv hvor og hvornår forholdet optræder.',fields:[
      ['sound','Beskrivelse af lyden','textarea'],['soundPlace','Placering og udbredelse','textarea'],
      ['soundWhen','Hvornår optræder det?','textarea'],['movement','Mærkbar bevægelse','select',['Ikke undersøgt','Ja','Nej']]],checks:['Lyd kan gentages','Bevægelse mærkes','Området er markeret på foto']},
    other:{name:'Andet / årsag ukendt',intro:'Beskriv forholdet uden at fastslå årsagen.',fields:[
      ['observation','Hvad observeres?','textarea'],['extentOther','Omfang og placering','textarea'],
      ['investigation','Hvad er undersøgt?','textarea']],checks:['Oversigtsbillede taget','Nærbillede taget','Yderligere oplysninger nødvendige']}
  },
  closing:[['description','Kundens beskrivelse','textarea',true],['assessment','Sælgerens observationer','textarea'],['proposal','Forslag til næste skridt','textarea']],
  statuses:['Ny','Under behandling','Afventer oplysninger','Afsluttet']
};
