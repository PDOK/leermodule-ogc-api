# Ruimtelijke filtering met CQL2 op de BAG Woonplaats-collectie

## Leerdoelen

Na het doorlopen van deze module kun je:

- uitleggen wat ruimtelijke filtering is;
- het verschil benoemen tussen een `bbox` en een ruimtelijke CQL-filter;
- ruimtelijke relaties beschrijven met CQL2 spatial operators;
- bepalen welke spatial operators door een OGC API worden ondersteund;
- ruimtelijke filters combineren met attribuutfilters;
- spatial operators toepassen op de BAG Woonplaats-collectie. 

---

## Van BBOX naar ruimtelijke relaties

In eerdere voorbeelden hebben we een `bbox` gebruikt om objecten binnen een rechthoekig gebied op te vragen.

Voor de BAG Woonplaats-collectie:

```http
https://api.pdok.nl/kadaster/bag/ogc/v2-preprod/collections/woonplaats/items?
bbox=4.28,52.05,4.33,52.09
```

Met een bounding box selecteer je alle woonplaatsen die binnen het opgegeven gebied vallen.

Soms wil je echter een specifiekere ruimtelijke relatie beschrijven:

- Welke woonplaatsen liggen volledig binnen een gebied?
- Welke woonplaatsen raken een gebied?
- Welke woonplaatsen overlappen een gebied?
- Welke woonplaatsen liggen volledig buiten een gebied?

Voor deze situaties ondersteunt de BAG OGC API ruimtelijke functies via CQL2. 

---

## Controleren of spatial operators worden ondersteund

Elke OGC API publiceert via het endpoint `/conformance` welke delen van de standaard worden ondersteund.

Voor de BAG API:

```text
https://api.pdok.nl/kadaster/bag/ogc/v2-preprod/conformance
```

Op de conformance-pagina zijn onder meer de volgende conformance classes aanwezig: 

```text
basic-spatial-functions
basic-spatial-functions-plus
spatial-functions
```

Deze conformance classes geven aan dat ruimtelijke CQL2-functies ondersteund worden. 

---

## Voorbeeldgeometrie

In de voorbeelden gebruiken we een zoekgebied dat als polygoon wordt beschreven.

```text
(5.04,52.11) +-------------------+ (5.05,52.11)
             |                   |
             |    ZOEKGEBIED     |
             |                   |
(5.04,52.10) +-------------------+ (5.05,52.10)
```

Dezelfde geometrie in Well-Known Text (WKT):

```wkt
POLYGON((
    5.04 52.10,
    5.05 52.10,
    5.05 52.11,
    5.04 52.11,
    5.04 52.10
))
```

Dit gebied gebruiken we om woonplaatsgeometrieën mee te vergelijken.

---

## S_INTERSECTS

Zoek woonplaatsen die geheel of gedeeltelijk binnen het zoekgebied vallen.

```cql
S_INTERSECTS(
    geometry,
    POLYGON((
        5.04 52.10,
        5.05 52.10,
        5.05 52.11,
        5.04 52.11,
        5.04 52.10
    ))
)
```

Visualisatie:

```text
+-------------------+
|     #######       |
|   ###########     |
|     #######       |
+-------------------+
```

Een deel van de woonplaats mag buiten het zoekgebied liggen.

---

## S_WITHIN

Zoek woonplaatsen die volledig binnen het zoekgebied liggen.

```cql
S_WITHIN(
    geometry,
    POLYGON((
        5.04 52.10,
        5.05 52.10,
        5.05 52.11,
        5.04 52.11,
        5.04 52.10
    ))
)
```

Visualisatie:

```text
+-------------------+
|                   |
|      #####        |
|      #####        |
|                   |
+-------------------+
```

De volledige woonplaatsgeometrie moet binnen de polygoon liggen.

---

## S_CONTAINS

Zoek woonplaatsen die de opgegeven polygoon volledig bevatten.

```cql
S_CONTAINS(
    geometry,
    POLYGON((
        5.04 52.10,
        5.05 52.10,
        5.05 52.11,
        5.04 52.11,
        5.04 52.10
    ))
)
```

Visualisatie:

```text
#######################
#######################
## +-------------+   ##
## | ZOEKGEBIED  |   ##
## +-------------+   ##
#######################
#######################
```

De woonplaats omvat het volledige zoekgebied.

---

## S_TOUCHES

Zoek woonplaatsen die de grens van het zoekgebied raken.

```cql
S_TOUCHES(
    geometry,
    POLYGON((
        5.04 52.10,
        5.05 52.10,
        5.05 52.11,
        5.04 52.11,
        5.04 52.10
    ))
)
```

Visualisatie:

```text
      #####
      #####
+-------------------+
|                   |
|                   |
+-------------------+
```

De geometrieën delen alleen een grens of hoekpunt.

---

## S_DISJOINT

Zoek woonplaatsen die volledig buiten het zoekgebied liggen.

```cql
S_DISJOINT(
    geometry,
    POLYGON((
        5.04 52.10,
        5.05 52.10,
        5.05 52.11,
        5.04 52.11,
        5.04 52.10
    ))
)
```

Visualisatie:

```text
#####

                    +-----------+
                    | ZOEKGEBIED|
                    +-----------+
```

Er bestaat geen overlap tussen beide geometrieën.

---

## S_OVERLAPS

Zoek woonplaatsen die het zoekgebied gedeeltelijk overlappen.

```cql
S_OVERLAPS(
    geometry,
    POLYGON((
        5.04 52.10,
        5.05 52.10,
        5.05 52.11,
        5.04 52.11,
        5.04 52.10
    ))
)
```

Visualisatie:

```text
      ########
+-------------------+
|     #####         |
|     #####         |
+-------------------+
```

Een deel van de woonplaats ligt binnen het gebied en een deel erbuiten.

---

## S_CROSSES

Zoek woonplaatsen die door een lijn worden gekruist.

```cql
S_CROSSES(
    geometry,
    LINESTRING(
        5.035 52.095,
        5.055 52.115
    )
)
```

Visualisatie:

```text
\
 \
  \
+-------------------+
| \                 |
|  \                |
+---\---------------+
     \
      \
```

Deze operator wordt vaak gebruikt bij analyses met wegen, waterlopen of spoorlijnen.

---

## S_EQUALS

Zoek woonplaatsen waarvan de geometrie exact gelijk is aan de opgegeven geometrie.

```cql
S_EQUALS(
    geometry,
    POLYGON((
        5.04 52.10,
        5.05 52.10,
        5.05 52.11,
        5.04 52.11,
        5.04 52.10
    ))
)
```

De begrenzing van de woonplaats moet exact overeenkomen met de opgegeven polygoon.

---

## Spatial operators combineren met attributen

Ruimtelijke filters kunnen worden gecombineerd met attribuutfilters.

Voorbeeld:

```cql
S_INTERSECTS(
    geometry,
    POLYGON((
        4.29 52.07,
        4.31 52.07,
        4.31 52.08,
        4.29 52.08,
        4.29 52.07
    ))
)
AND naam='Den Haag'
```

Hiermee worden alleen woonplaatsen gezocht die:

1. het zoekgebied raken;
2. de naam `Den Haag` hebben.

---

## Praktijkvoorbeeld BAG Woonplaats

De Woonplaats-collectie bevat de geometrische begrenzingen van woonplaatsen. Daardoor is deze collectie bijzonder geschikt voor het demonstreren van ruimtelijke operatoren.

Bijvoorbeeld:

```http
https://api.pdok.nl/kadaster/bag/ogc/v2-preprod/collections/woonplaats/items?
filter=S_INTERSECTS(geometry,POLYGON((4.29 52.07,4.31 52.07,4.31 52.08,4.29 52.08,4.29 52.07)))
```

Deze query retourneert woonplaatsen die het opgegeven gebied geheel of gedeeltelijk overlappen.

---

## Samenvatting

Spatial operators beschrijven een ruimtelijke relatie tussen een object en een geometrie.

| Operator | Betekenis |
|-----------|-----------|
| S_INTERSECTS | raakt of overlapt |
| S_DISJOINT | volledig gescheiden |
| S_TOUCHES | raakt de grens |
| S_WITHIN | ligt volledig binnen |
| S_CONTAINS | bevat volledig |
| S_OVERLAPS | overlapt gedeeltelijk |
| S_CROSSES | kruist |
| S_EQUALS | exact dezelfde geometrie |

Controleer altijd eerst het conformance-endpoint van een OGC API om te bepalen welke spatial operators ondersteund worden. De BAG OGC API publiceert hiervoor de spatial conformance classes `basic-spatial-functions`, `basic-spatial-functions-plus` en `spatial-functions`. 