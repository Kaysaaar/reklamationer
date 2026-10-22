/* Field definitions are shared by the phone form and office case view. */
window.ClaimsSchema = {
  sellers: ['Alexander','Claus','Daniel','Emil','Jørn','Kalle','Kim','Lasse'],
  customer: [
    ['customer','Forhandler / firma','text'],
    ['dealerContact','Forhandlerens kontaktperson','text'],['dealerPhone','Forhandlerens telefon','tel'],['dealerEmail','Forhandlerens e-mail','email'],
    ['endCustomer','Slutkundens navn','text'],['contact','Slutkundens kontaktperson','text'],
    ['phone','Slutkundens telefon','tel'],['email','Slutkundens e-mail','email'],
    ['address','Adresse for besigtigelsen','text'],['postcode','Postnummer','text'],['city','By','text'],
    ['inspectionPlace','Gennemgang','select',['Hos kunden','På lageret']],
    ['visitDate','Besigtigelsesdato','date'],['returnOrder','Returordrenummer i BC (hvis oprettet)','text'],
    ['reference','Kundens reference / eksisterende sagsnummer','text'],['order','Ordre- eller fakturanummer','text']
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
  closing:[['description','Kundens beskrivelse','textarea'],['assessment','Sælgerens observationer','textarea'],['proposal','Forslag til næste skridt','textarea']],
  statuses:['Åben','Afsluttet']
};

ClaimsSchema.product.push(...[["dealerContacted", "Forhandler kontaktet først", "text"], ["dealerInspected", "Besigtiget af forhandler", "text"], ["dealerVisit", "Forhandlerens besigtigelsesdato", "text"], ["installerPhone", "Montørens telefon", "text"], ["installerEmail", "Montørens e-mail", "text"], ["installerAddress", "Montørens adresse", "text"], ["installerPostcode", "Montørens postnummer", "text"], ["installerCity", "Montørens by", "text"], ["dealerAddress", "Forhandlerens adresse", "text"], ["dealerPostcode", "Forhandlerens postnummer", "text"], ["dealerCity", "Forhandlerens by", "text"], ["roomSize", "Rummets størrelse", "text"], ["quantity", "Samlet mængde", "text"], ["discoveredText", "Hvornår blev forholdet opdaget? (kundens oplysning)", "text"], ["buildingUse", "Boligtype / anvendelse", "text"], ["floorCategory", "Gulvtype", "text"], ["acclimation", "Akklimatisering før montage", "text"], ["floorBuild", "Undergulvsopbygning", "text"], ["floorHeat", "Gulvvarme", "text"], ["transition", "Ekspansions-/overgangsprofiler", "text"], ["jointDistance", "Afstand mellem endestød", "text"], ["wallDistance", "Afstand til vægge / rør / karme", "text"], ["cleaning", "Anvendte rengøringsmidler", "text"], ["laying", "Lagt som", "text"], ["boardSize", "Pladens størrelse", "text"], ["woodDecor", "Træsort / farve / dessin", "text"], ["normalTemperature", "Helårshus med normal stuetemperatur", "text"], ["sink", "Vask i skadesområde", "text"], ["hob", "Kogeplade i skadesområde", "text"], ["machine", "Maskine under bordpladen", "text"], ["treatment", "Behandling af massivtræ", "text"], ["backTreatment", "Bagsiden behandlet", "text"], ["frontEdge", "Forkant", "text"], ["boardGap", "Luft mellem bordplade og væg", "text"], ["screwDistance", "Skrueafstande", "text"], ["washers", "Spændeskiver anvendt", "text"], ["shrinkHoles", "Svindhuller i korpustop", "text"], ["otherFixing", "Fastgjort med andet end skruer", "text"], ["backEdge", "Bagkantsliste", "text"], ["panelCategory", "Paneltype", "text"], ["panelDamage", "Hvad er der sket med panelet?", "text"], ["panelBuild", "Konstruktionens opbygning", "text"], ["panelTransition", "Overgangsprofiler fra rum til rum", "text"], ["panelJoint", "Afstand mellem endestød", "text"], ["panelWall", "Afstand til væggen", "text"], ["panelMount", "Montering: clips / klammer / andet", "text"], ["panelAcclimation", "Panelernes akklimatisering", "text"]]);
ClaimsSchema.categoryFields={"floorCategory": "Gulv", "acclimation": "Gulv", "floorBuild": "Gulv", "floorHeat": "Gulv", "transition": "Gulv", "jointDistance": "Gulv", "wallDistance": "Gulv", "cleaning": "Gulv", "laying": "Gulv", "boardSize": "Bordplade", "woodDecor": "Bordplade", "normalTemperature": "Bordplade", "sink": "Bordplade", "hob": "Bordplade", "machine": "Bordplade", "treatment": "Bordplade", "backTreatment": "Bordplade", "frontEdge": "Bordplade", "boardGap": "Bordplade", "screwDistance": "Bordplade", "washers": "Bordplade", "shrinkHoles": "Bordplade", "otherFixing": "Bordplade", "backEdge": "Bordplade", "panelCategory": "Loft- / vægpanel", "panelDamage": "Loft- / vægpanel", "panelBuild": "Loft- / vægpanel", "panelTransition": "Loft- / vægpanel", "panelJoint": "Loft- / vægpanel", "panelWall": "Loft- / vægpanel", "panelMount": "Loft- / vægpanel", "panelAcclimation": "Loft- / vægpanel"};
ClaimsSchema.closing.push(["importSource","Original reklamationsmail","textarea"]);

// Category-specific wording uses the existing stored keys, preserving older cases.
ClaimsSchema.typeFor=function(key,values={},checks={}){
 const base=this.types[key]||this.types.other,category=values.productGroup;
 if(!['Bordplade','Loft- / vægpanel'].includes(category))return base;
 const board=category==='Bordplade',excluded=new Set(['subfloorMoisture','moistureUnit','heating','underlay']);
 const labels={floorMoisture:board?'Fugt i bordpladens materiale (%)':'Fugt i panelmateriale (%)',subfloor:board?'Korpus, understøtning og konstruktion':'Væg-/loftkonstruktion og underlag',edgeGap:board?'Afstand til væg / faste dele (mm)':'Afstand til vægge / faste dele (mm)',affectedUnits:board?'Antal berørte bordplader / dele':'Antal berørte paneler',extent:board?'Placering og udbredelse på bordpladen':'Placering og udbredelse på væg / loft'};
 const fields=base.fields.filter(d=>!excluded.has(d[0])||String(values[d[0]]??'').trim()).map(d=>{const copy=[...d];if(excluded.has(d[0]))copy[1]+=' (tidligere registreret)';else if(labels[d[0]])copy[1]=labels[d[0]];if(d[0]==='waterSource')copy[3]=['Ukendt','Utæt installation','Spild / rengøring','Udefra','Andet'];if(d[0]==='installationMethod')copy[3]=board?['Ukendt','Limning','Skruer / søm','Andet']:['Ukendt','Clips / klammer','Limning','Skruer / søm','Andet'];if(copy[2]==='select'&&values[d[0]]&&!copy[3].includes(values[d[0]]))copy[3]=[...copy[3],values[d[0]]];return copy;});
 const removed=['Fugtspærre undersøgt','Opstartsprotokol for gulvvarme foreligger'];
 return {...base,name:key==='sound'?(board?'Lyd / bevægelse ved brug':'Lyd / bevægelse i paneler'):base.name,fields,checks:base.checks.filter(c=>!removed.includes(c)||(checks[key]||[]).includes(c))};
};

// Cleaning is relevant to every surface, not only floors.
delete ClaimsSchema.categoryFields.cleaning;
