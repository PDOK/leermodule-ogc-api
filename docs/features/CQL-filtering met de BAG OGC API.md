# CQL-filtering met de BAG OGC API

## Leerdoelen

Na het doorlopen van deze module kun je:

- uitleggen wat CQL (Common Query Language) is;
- attributen filteren binnen een OGC API Features-collectie;
- eenvoudige CQL-expressies schrijven;
- meerdere filtervoorwaarden combineren met `AND`, `OR` en `NOT`;
- tekstfilters toepassen met `LIKE` en `IN`;
- CQL-filtering combineren met een ruimtelijke filter (`bbox`);
- BAG-adressen gericht opvragen met behulp van CQL.

---

## Introductie

Een OGC API Features-service kan grote hoeveelheden gegevens bevatten. Vaak ben je slechts geïnteresseerd in een klein deel van de dataset.

Met **CQL (Common Query Language)** stuur je filtervoorwaarden mee naar de server. Hierdoor ontvang je alleen de objecten die voldoen aan de opgegeven criteria. Dit voorkomt onnodig dataverkeer en maakt applicaties efficiënter.

In deze module gebruiken we de BAG OGC API collectie **Adres**:

```text
https://api.pdok.nl/kadaster/bag/ogc/v2-preprod/collections/adres/items
```

---

## Wat is CQL?

CQL is een gestandaardiseerde querytaal van het Open Geospatial Consortium (OGC) voor het filteren van geografische gegevens.

Een filter wordt opgegeven via de queryparameter:

```text
filter=
```

Een eenvoudige query ziet er als volgt uit:

```http
https://api.pdok.nl/kadaster/bag/ogc/v2-preprod/collections/adres/items?filter=postcode='2513 AA'
```

Deze aanvraag retourneert helaas geen adressen. Probeer het nogmaals zonder spatie in de postcode:

```http
https://api.pdok.nl/kadaster/bag/ogc/v2-preprod/collections/adres/items?filter=postcode='2513AA'
```

Deze retourneert uitsluitend adressen met postcode 2513 AA.

**:arrow_right: Vraag waarom werkt de eerste query niet en zonder spaties wel?**

??? success "Bekijk het antwoord"

    In deze dataset is de postcode opgeslagen zonder spatie. Het CQL-filter werkt direct op de waarden in de dataset. Een waarde voor postcode met spaties komt niet voor.

---

## Beschikbare attributen om mee te filteren "Queryables"

Voordat je een CQL-filter kunt schrijven, moet je weten op welke attributen gefilterd mag worden. Deze attributen worden binnen OGC API Features aangeduid als **queryables**.

Queryables beschrijven de attributen van een object die gebruikt kunnen worden in een filterexpressie. Voor de BAG-adrescollectie zijn dat bijvoorbeeld attributen zoals `postcode`, `huisnummer`, `woonplaats_naam` en `openbare_ruimte_naam`. Deze velden zijn zichtbaar in de collectie en kunnen worden gebruikt in CQL-expressies.

Voorbeelden van queryables binnen de BAG-adrescollectie zijn:

```text
postcode
huisnummer
huisletter
woonplaats_naam
openbare_ruimte_naam
provincie_naam
status
adresseerbaar_object_type
```

Een queryable kan vervolgens direct in een filter worden gebruikt:

```http
...?filter=postcode='2513AA'
```

of:

```http
...?filter=woonplaats_naam='Den Haag'
```

Het concept *queryables* is belangrijk omdat niet ieder attribuut automatisch filterbaar is. Door de queryables van een collectie te raadplegen weet je welke eigenschappen door de API worden ondersteund voor filtering.

Bij een OGC API Features-service kunnen queryables opgevraagd worden via het endpoint:

```text
/collections/{collectionId}/queryables
```

Voor de BAG-adrescollectie is dat:

```text
https://api.pdok.nl/kadaster/bag/ogc/v2-preprod/collections/adres/queryables
```

Een goede werkwijze is om eerst de queryables te bekijken en daarna pas CQL-filters op te stellen. Zo voorkom je dat filters verwijzen naar velden die niet door de API ondersteund worden. Bij PDOK worden deze velden ook getoond via het queryables-endpoint van de collectie.

### Beschikbare mogelijkheden in een OGC API "Conformance Classes"

Hoe weet je welke filtermogelijkheden een OGC API daadwerkelijk ondersteunt?

Daarvoor kun je de **Conformance Classes** raadplegen. Een conformance class beschrijft een onderdeel van een OGC-standaard dat door een implementatie wordt ondersteund. De BAG OGC API publiceert deze informatie via het conformance-endpoint.

Bekijk hiervoor:

```text
https://api.pdok.nl/kadaster/bag/ogc/v2-preprod/conformance
```

Wanneer je de conformance-pagina bekijkt zie je onder andere dat deze service ondersteuning biedt voor:

- `ogcapi-features-3/conf/filter`
- `ogcapi-features-3/conf/features-filter`
- `ogcapi-features-3/conf/queryables`
- `ogcapi-features-3/conf/queryables-query-parameters`
- `cql2-text`
- `basic-cql2`
- `advanced-comparison-operators`
- `basic-spatial-functions`
- `spatial-functions`
- `temporal-functions`

Dat betekent onder meer dat:

| Conformance class | Betekenis |
| ----------- | ----------- |
| `filter` | De API ondersteunt filteren van features. |
| `features-filter` | Filters kunnen worden toegepast op een featurecollectie. |
| `queryables` | De API publiceert welke attributen filterbaar zijn. |
| `cql2-text` | CQL2-expressies kunnen als tekst worden aangeleverd. |
| `basic-cql2` | Basisoperatoren zoals `=`, `AND` en `OR` worden ondersteund. |
| `advanced-comparison-operators` | Extra vergelijkingsoperatoren zijn beschikbaar. |
| `spatial-functions` | Ruimtelijke functies kunnen in filters worden gebruikt. |
| `temporal-functions` | Tijdgerelateerde filters worden ondersteund. |

Voordat je geavanceerde filters gaat gebruiken is het daarom verstandig om eerst het **conformance-endpoint** te bekijken. Daar kun je controleren welke onderdelen van CQL en OGC API Features door de betreffende service worden ondersteund.

### URL encoding

Wanneer een filter speciale tekens bevat, zoals spaties, aanhalingstekens of een procentteken (`%`), moeten deze in de URL worden gecodeerd. Dit noemen we *URL encoding*.

Bijvoorbeeld:

```text
filter=openbare_ruimte_naam LIKE 'Snel%'
```

wordt:

```text
filter=openbare_ruimte_naam%20LIKE%20%27Snel%25%27
```

Veelgebruikte coderingen zijn: `spatie = %20`, `' = %27` en `% = %25`
meer informatie over deze manier van encoding is te vinden op de [wikipedia pagina Percent Encoding](https://en.wikipedia.org/wiki/Percent-encoding)
---

## Exacte vergelijkingen

### Gelijk aan

Zoek alle adressen in Appingedam:

```http
...?filter=woonplaats_naam='Appingedam'
```

Zoek alle adressen met postcode 9901AA:

```http
...?filter=postcode='9901AA'
```

### Ongelijk aan

```http
...?filter=woonplaats_naam<>'Appingedam'
```

---

## Numerieke vergelijkingen

Voor numerieke velden kunnen standaard vergelijkingsoperatoren worden gebruikt.

### Groter dan

```http
...?filter=huisnummer > 100
```

### Kleiner dan

```http
...?filter=huisnummer < 50
```

### Beschikbare operatoren

| Operator | Betekenis |
| ----------- | ----------- |
| = | gelijk aan |
| <> | ongelijk aan |
| < | kleiner dan |
| <= | kleiner dan of gelijk aan |
| > | groter dan |
| >= | groter dan of gelijk aan |

---

## Meerdere voorwaarden combineren

### AND

Alle voorwaarden moeten waar zijn.

```http
...?filter=woonplaats_naam='Appingedam' AND huisnummer > 10
```

### OR

Minimaal één voorwaarde moet waar zijn.

```http
...?filter=woonplaats_naam='Appingedam'
OR woonplaats_naam='Sittard'
```

### NOT

Keert een voorwaarde om.

```http
...?filter=NOT woonplaats_naam='Appingedam'
```

---

## Tekstfiltering

### LIKE

Met `LIKE` kan gezocht worden op patronen.

Zoek alle straatnamen die beginnen met "Snel":

```http
...?filter=openbare_ruimte_naam LIKE 'Snel%'
```

Veelgebruikte wildcards:

| Wildcard | Betekenis |
| ----------- | ----------- |
| % | nul of meer tekens |
| _ | exact één teken |

Voorbeelden:

```http
...?filter=openbare_ruimte_naam LIKE '%weg'
```

```http
...?filter=openbare_ruimte_naam LIKE 'Hoofd_%'
```

---

## Werken met IN

Wanneer meerdere waarden toegestaan zijn, kan `IN` de query leesbaarder maken.

```http
...?filter=woonplaats_naam IN ('Appingedam','Sittard')
```

Dit is functioneel gelijk aan:

```http
...?filter=woonplaats_naam='Appingedam'
OR woonplaats_naam='Sittard'
```

---

## CQL combineren met een BBOX

CQL kan gecombineerd worden met een ruimtelijke filter.

Zoek adressen binnen een bepaald gebied én in Appingedam:

```http
https://api.pdok.nl/kadaster/bag/ogc/v2-preprod/collections/adres/items?bbox=6.82,53.31,6.85,53.33&filter=woonplaats_naam='Appingedam'
```

Hiermee worden eerst objecten binnen de opgegeven bounding box geselecteerd. Vervolgens wordt de CQL-filter toegepast.

---

## Praktijkvoorbeelden

### Zoek een postcode

```http
...?filter=postcode='9901AA'
```

### Zoek een postcode en huisnummer

```http
...?filter=postcode='9901AA' AND huisnummer=13
```

### Zoek alle adressen in Groningen

```http
...?filter=provincie_naam='Groningen'
```

### Zoek alleen verblijfsobjecten

```http
...?filter=adresseerbaar_object_type='Verblijfsobject'
```

### Zoek straten die beginnen met "Snel"

```http
...?filter=openbare_ruimte_naam LIKE 'Snel%'
```

---

## URL-encoding

CQL-expressies worden onderdeel van de URL. Speciale tekens en spaties moeten daarom worden geëncodeerd.

Voorbeeld:

```text
woonplaats_naam = 'Appingedam'
```

wordt:

```text
woonplaats_naam%20%3D%20%27Appingedam%27
```

De meeste HTTP-clients en GIS-tools verzorgen dit automatisch.

---

## Oefeningen

### Oefening 1

Maak een query die alle adressen in Appingedam retourneert.

??? success "Antwoord"

    ```http
    https://api.pdok.nl/kadaster/bag/ogc/v2-preprod/collections/adres/items?filter=woonplaats_naam='Appingedam'
    ```

---

### Oefening 2

Maak een query die alle adressen met postcode `9901AA` retourneert.

??? success "Antwoord"

    ```http
    https://api.pdok.nl/kadaster/bag/ogc/v2-preprod/collections/adres/items?filter=postcode='9901AA'
    ```

---

### Oefening 3

Maak een query die alle adressen met een huisnummer groter dan 50 retourneert.

??? success "Antwoord"

    ```http
    https://api.pdok.nl/kadaster/bag/ogc/v2-preprod/collections/adres/items?filter=huisnummer>50
    ```

    Hierbij wordt het queryable `huisnummer` gebruikt in combinatie met de operator `>`.

---

### Oefening 4

Maak een query die alle adressen retourneert waarvan de straatnaam begint met `Snel`.

??? success "Antwoord"

    ```http
    https://api.pdok.nl/kadaster/bag/ogc/v2-preprod/collections/adres/items?filter=openbare_ruimte_naam+LIKE+%27Snel%25%27
    ```

    https://api.pdok.nl/kadaster/bag/ogc/v2-preprod/collections/adres/items?crs=http%3A%2F%2Fwww.opengis.net%2Fdef%2Fcrs%2FOGC%2F1.3%2FCRS84&limit=10&filter=openbare_ruimte_naam+LIKE+%27Snel%25%27

    De wildcard `%` betekent: nul of meer willekeurige tekens.

---

### Oefening 5

Combineer een `bbox` met een CQL-filter op woonplaats.

??? success "Antwoord"

    ```http
    https://api.pdok.nl/kadaster/bag/ogc/v2-preprod/collections/adres/items?bbox=6.82,53.31,6.85,53.33&filter=woonplaats_naam='Appingedam'
    ```

    Eerst worden de adressen binnen de bounding box geselecteerd.
    Vervolgens worden alleen de adressen in woonplaats `Appingedam` teruggegeven.

---

### Bonusopgave

Zoek alle adressen van het Binnenhof in Den Haag met postcode `2513AA`.

??? success "Antwoord"

    ```http
    https://api.pdok.nl/kadaster/bag/ogc/v2-preprod/collections/adres/items?filter=postcode='2513AA'
    ```

    Probeer deze query uit te breiden met een extra filter op
    `openbare_ruimte_naam` of `huisnummer`.

---

**Toelichting**

In deze query worden twee filters gecombineerd:

1. De `bbox` beperkt de resultaten tot een geografisch gebied.
2. De CQL-expressie selecteert alleen adressen waarvan de woonplaats `Appingedam` is.

Daardoor worden uitsluitend adressen binnen het opgegeven gebied én in Appingedam geretourneerd.
