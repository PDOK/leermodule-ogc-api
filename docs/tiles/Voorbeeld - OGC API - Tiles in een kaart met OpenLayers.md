# OGC API - Tiles in een kaart met OpenLayers

In deze oefening tonen wij de BRT Achtergrondkaart (OGC API - Tiles) in een webmap. Daarvoor gebruiken wij de JavaScript library [OpenLayers](https://openlayers.org/).

Waarom nog een library (naast MapLibre dat in de andere oefeningen wordt gebruikt)? OGC API's zijn standaarden. Dat betekent dat je niet vastzit aan één stuk software: elke client die de standaard begrijpt, kan de data gebruiken. In deze casus zie je dat met eigen ogen. Bovendien is OpenLayers sterk in het werken met andere projecties dan WebMercator. Daarom maken we deze kaart in het Nederlandse coördinatenstelsel **RD New (EPSG:28992)**.

Het doel is ook nu niet om OpenLayers zelf te leren; we gebruiken OpenLayers om de werking van de OGC API's te laten zien.

## Bekijk het voorbeeld

De voorbeeldcode vind je in deze repository in de folder `docs/voorbeelden/openlayers-tiles`.

**:arrow_right: Bekijk** [../voorbeelden/openlayers-tiles/index.html](../voorbeelden/openlayers-tiles/index.html)

Als je zelf met het voorbeeld wilt experimenteren, dan kun je de bestanden naar je eigen computer kopiëren.

**:arrow_right: Maak een nieuwe folder aan en zet daarin een kopie van `index.html` en `main.js` uit `docs/voorbeelden/openlayers-tiles`**

**:arrow_right: Start een lokale webserver in die folder:**

    cd %jouwfolder
    python -m http.server

**:arrow_right: Ga in je webbrowser naar `localhost:8000`**

Je ziet nu de BRT Achtergrondkaart.

**:arrow_right: Open het netwerk-tabblad in de developer tools en herlaad de pagina**

!!! question "Vraag"

    Welke requests naar `api.pdok.nl` zie je?

??? success "Antwoord"

    - Een request naar `.../brt-achtergrondkaart/ogc/v1/styles/standaard__netherlandsrdnewquad?f=json`: de style (OGC API - Styles, onderdeel van de Tiles API).
    - Veel requests naar `.../brt-achtergrondkaart/ogc/v1/tiles/NetherlandsRDNewQuad/{z}/{y}/{x}?f=mvt`: de vector tiles (OGC API - Tiles).
    - Requests naar `.../resources/fonts/...`: lettertypes voor de labels.

## Hoe zit de code in elkaar?

### Aanroep bibliotheken

In `index.html` worden drie libraries ingeladen van jsDelivr, elk met een vast versienummer:

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ol@10.11.0/ol.css" />
    <script src="https://cdn.jsdelivr.net/npm/proj4@2.22.0/dist/proj4.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/ol@10.11.0/dist/ol.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/ol-mapbox-style@13.8.0/dist/olms.js"></script>

| Library | Waarvoor? |
| --- | --- |
| `ol` | OpenLayers zelf: de kaart, de kaartlagen en de bronnen. |
| `proj4` | [proj4js](https://proj4js.org/): rekent coördinaten om tussen projecties, zoals van lengte- en breedtegraad naar RD. |
| `ol-mapbox-style` | Vertaalt een Mapbox style (zoals de styles van PDOK) naar opmaak voor OpenLayers. |

!!! tip "Vaste versies"

    Gebruik in je eigen code ook altijd een vast versienummer, zoals `ol@10.11.0`. Zonder versienummer krijg je steeds de nieuwste versie, en die kan je kaart ongemerkt breken.

De rest van de logica staat in `main.js`. We lopen de code nu stap voor stap door.

### Maak RD New bekend bij OpenLayers

OpenLayers kent standaard alleen Web Mercator (EPSG:3857) en lengte- en breedtegraad (EPSG:4326). RD New (EPSG:28992) moet je zelf toevoegen:

    proj4.defs('EPSG:28992', '+proj=sterea +lat_0=52.1561605555556 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.4171,50.3319,465.5524,-0.398957388243,0.343987817378,-1.87740163998,4.0725 +units=m +no_defs');
    ol.proj.proj4.register(proj4);
    const rd = ol.proj.get('EPSG:28992');
    const rd_tile_matrix_extent = [-285401.92, 22598.08, 595401.92, 903401.92];
    rd.setExtent(rd_tile_matrix_extent);

De lange tekst is de definitie van RD New: een stereografische projectie rond Amersfoort, op de Bessel-ellipsoïde. Met `ol.proj.proj4.register` laat je OpenLayers deze definitie gebruiken. Tot slot geef je de projectie een `extent`: het gebied waarbinnen de kaart geldig is.

!!! info "Waar komt die definitie vandaan?"

    De hierboven gebruikte definitie van de projectie voor RD New wordt ook gebruikt in de oefening [Casus - Maak een kaart met OGC API - Tiles](<../tiles/Casus - Maak een kaart met OGC API - Tiles.md#pas-mainjs-aan>).

### Beschrijf het tegelschema

Tegels in RD zijn anders ingedeeld dan tegels in Web Mercator. Hoe ze liggen, staat in de Tile Matrix Set **NetherlandsRDNewQuad**. Die heb je al gezien in [Verken OGC API - Tiles in de browser](<../tiles/Verken OGC API - Tiles in de browser.md>).

**:arrow_right: Open <https://api.pdok.nl/kadaster/brt-achtergrondkaart/ogc/v1/tileMatrixSets/NetherlandsRDNewQuad?f=json>**

**:arrow_right: Zoek bij de eerste entry in `tileMatrices` (id: 0) de waarden van `pointOfOrigin`, `cellSize` en `tileWidth` op**

Deze waarden gebruik je vervolgens in `main.js`:

    const resolutions = [];
    for (let z = 0; z <= 12; z++) {
        resolutions.push(3440.64 / Math.pow(2, z)); // cellSize van zoomniveau z
    }
    const tileGrid = new ol.tilegrid.TileGrid({
        extent: rd_tile_matrix_extent, // tegel 0/0/0 beslaat precies dit gebied
        origin: [-285401.92, 903401.92], // linkerbovenhoek van tegel 0/0/0
        resolutions: resolutions,
        tileSize: 256
    });

Een `resolution` is in OpenLayers het aantal meters per pixel, en dat is precies de `cellSize` uit de Tile Matrix Set. Bij elk volgend zoomniveau halveert die waarde.

!!! question "Vraag"

    Een tegel is 256 pixels breed. Hoeveel meter beslaat één tegel op zoomniveau 0? En hoeveel tegels zijn er dan nodig om heel Nederland te tonen?

??? success "Antwoord"

    256 × 3440,64 = 880.803,84 meter. Dat is één tegel: heel Nederland (en ruim daaromheen) past op zoomniveau 0 in één tegel. Dat is ook precies de breedte van de `extent` die je eerder instelde: 595.401,92 − −285.401,92 = 880.803,84.

!!! info "MapLibre vs. OpenLayers"

    In de [MapLibre-casus](<../tiles/Casus - Maak een kaart met OGC API - Tiles.md>) gaf je dezelfde informatie op met `origin` en `extentAtZoom0`. De libraries verschillen, de Tile Matrix Set is hetzelfde. Daar is de standaard voor!

### Voeg de vector tiles toe

Nu je OpenLayers hebt verteld hoe de tegels liggen, kun je ze inladen:

    const achtergrondkaart = new ol.layer.VectorTile({
        declutter: true,
        source: new ol.source.VectorTile({
            format: new ol.format.MVT(), // het Mapbox Vector Tile formaat
            projection: rd,
            tileGrid: tileGrid,
            url: 'https://api.pdok.nl/kadaster/brt-achtergrondkaart/ogc/v1/tiles/NetherlandsRDNewQuad/{z}/{y}/{x}?f=mvt'
        })
    });

De `url` vind je op de landing page van de API, bij Tiles, of in de TileJSON: <https://api.pdok.nl/kadaster/brt-achtergrondkaart/ogc/v1/tiles/NetherlandsRDNewQuad?f=tilejson>. Let op de volgorde in de URL: eerst de rij (`{y}`), dan de kolom (`{x}`). Het formaat `MVT` staat voor Mapbox Vector Tiles. Met `declutter: true` voorkomt OpenLayers dat labels over elkaar heen vallen.

### Style toepassen

Zonder opmaak tekent OpenLayers alle vector tiles in een standaardkleur. Daarom gebruiken we de style die PDOK al aanbiedt:

    olms.applyStyle(
        achtergrondkaart,
        'https://api.pdok.nl/kadaster/brt-achtergrondkaart/ogc/v1/styles/standaard__netherlandsrdnewquad?f=json',
        { updateSource: false, resolutions: resolutions }
    );

- `updateSource: false` zorgt ervoor dat `ol-mapbox-style` de bron (en dus ons tegelschema) niet vervangt.
- `resolutions` vertelt `ol-mapbox-style` welk zoomniveau bij welke resolutie hoort. De style gebruikt namelijk zoomniveaus om te bepalen welke kaartlagen zichtbaar zijn.

**:arrow_right: Vervang de style door een andere NetherlandsRDNewQuad style van <https://api.pdok.nl/kadaster/brt-achtergrondkaart/ogc/v1/styles>, bijvoorbeeld de 'Dark Mode' variant**

!!! warning "Gebruik één Tile Matrix Set"

    Kies je een WebMercatorQuad style of tileset, dan past die niet bij het tegelschema in RD. Gebruik in deze casus dus steeds NetherlandsRDNewQuad.

## Uitbreiding: inzoomen tot op de stoeprand met de BGT

De BRT Achtergrondkaart houdt op bij zoomniveau 12. Wil je verder inzoomen, dan heb je een kaart met meer detail nodig. Die is er: de **Basisregistratie Grootschalige Topografie (BGT)**, ook als OGC API - Tiles. In deze uitbreiding combineer je de BRT en de BGT tot één kaartlaag, waarop je kunt inzoomen tot zoomniveau 19.

!!! info "Wat is de BGT?"

    De BGT is de gedetailleerde, digitale kaart van heel Nederland, op een schaal van ongeveer 1:500 tot 1:5.000. Elk gebouw, elke stoep, elk fietspad en elke sloot staat er als apart object in. De BGT wordt bijgehouden door de bronhouders: gemeenten, provincies, waterschappen, Rijkswaterstaat, ProRail en andere organisaties.

Het resultaat staat klaar in `main.js.extra`, in dezelfde folder als `main.js`.

**:arrow_right: Hernoem in je eigen folder `main.js` naar `main.js.org`, en daarna `main.js.extra` naar `main.js`:**

    ren main.js main.js.org
    ren main.js.extra main.js

**:arrow_right: Herlaad de pagina en zoom in op het centrum van Amersfoort, tot je niet verder kunt**

Hieronder lopen we op hoofdlijnen door wat er in de code is veranderd. Vergelijk de twee bestanden er zelf naast, bijvoorbeeld in VS Code met *Compare Selected*.

### De BGT-tegels: alleen op zoomniveau 12

**:arrow_right: Open <https://api.pdok.nl/kadaster/bgt/ogc/v1/tiles/NetherlandsRDNewQuad?f=json> en zoek `tileMatrixSetLimits` op**

!!! question "Vraag"

    Op welke zoomniveaus biedt de BGT tegels aan?

??? success "Antwoord"

    Alleen op zoomniveau 12 (`"tileMatrix": "12"`). De BGT gebruikt dezelfde Tile Matrix Set NetherlandsRDNewQuad als de BRT, maar vult er maar één niveau van.

Daarom krijgt de BGT een eigen `TileGrid`, met `minZoom: 12`. Zo vraagt OpenLayers nooit tegels op een niveau waar ze niet bestaan. De URL en de style (`bgt_achtergrondvisualisatie__netherlandsrdnewquad`) vind je, net als bij de BRT, op de landing page van de API: <https://api.pdok.nl/kadaster/bgt/ogc/v1>.

### Overzoomen: verder inzoomen dan de tegels

Hoe kun je inzoomen tot niveau 19, als er alleen tegels op niveau 12 zijn? OpenLayers gebruikt dan de tegels van niveau 12 en tekent ze steeds groter. Dat heet **overzoomen**. Daarom loopt de lijst met `resolutions` voor de kaart (de `View`) nu tot en met 19, terwijl de tegelschema's maar tot en met 12 gaan.

**:arrow_right: Zoom in tot niveau 19 en bekijk in het netwerk-tabblad welke tegels er worden opgevraagd**

Je ziet alleen requests naar `.../NetherlandsRDNewQuad/12/...`. Toch blijft de kaart scherp.

!!! tip "Waarom blijft de kaart scherp?"

    Een vector tile bevat geen pixels, maar coördinaten. OpenLayers tekent de lijnen en vlakken op elk zoomniveau opnieuw, dus blijft alles scherp. Bij rasterkaarten (plaatjes) werkt dat niet: die worden wazig als je ze vergroot.

!!! info "Weetje: voorbij de Tile Matrix Set"

    De Tile Matrix Set NetherlandsRDNewQuad stopt bij zoomniveau 16. Zoomniveau 17 tot en met 19 bestaan dus alleen in onze eigen code. Op niveau 19 is een pixel 3440,64 / 2^19 ≈ 0,0066 meter: minder dan 7 millimeter! Dus, ja, je zoomt echt in tot op de stoeprand :-)

### Eén kaartlaag met een LayerGroup

Je wilt niet dat de BRT en de BGT tegelijk zichtbaar zijn. Daarom geef je elke laag een bereik:

| Laag | Instelling | Zichtbaar op |
| --- | --- | --- |
| BRT | `minResolution: resolutions[12]` | zoomniveau 2 t/m 12 |
| BGT | `maxResolution: resolutions[12]` | zoomniveau 13 t/m 19 |

Vervolgens stop je beide lagen in een `ol.layer.Group`. Voor de kaart is dat één laag: de basiskaart. Ook de groep heeft een `minResolution` en `maxResolution`. Die gelden voor alle lagen in de groep tegelijk.

!!! tip "Resolutie of zoomniveau?"

    - `minResolution` telt mee (*inclusief*), `maxResolution` niet (*exclusief*). Daardoor sluiten de BRT en de BGT precies op elkaar aan, zonder overlap en zonder gat.
    - Lagen hebben ook `minZoom` en `maxZoom`. Die doen hetzelfde, maar dan in zoomniveaus. Resoluties zijn preciezer: een resolutie zegt direct hoeveel meter er in een pixel past, welk tegelschema je ook gebruikt.
    - In de console van de developer tools zie je bij elke zoomstap het zoomniveau en de resolutie. Zo zie je precies waar de kaart omslaat.

!!! tip "Handig: de groep als geheel aansturen"

    Een groep kun je in één keer aan- of uitzetten of doorzichtig maken. Probeer in de console van de developer tools maar eens `basiskaart.setOpacity(0.5)` of `basiskaart.setVisible(false)`.

!!! question "Vraag"

    Waarom ligt het omslagpunt tussen zoomniveau 12 en 13? Wat zou er gebeuren als je de BGT al vanaf zoomniveau 10 toont?

??? success "Antwoord"

    Op zoomniveau 12 en lager is de BRT Achtergrondkaart beschikbaar en heeft de BGT nog geen tegels. Zou je de BGT al vanaf niveau 10 tonen, dan moet OpenLayers voor hetzelfde scherm 16 keer zoveel BGT-tegels van niveau 12 ophalen (4 × 4 per tegel van niveau 10). Dat zijn veel requests vol details die je op dat niveau toch niet ziet. Probeer het maar: zet `omslagResolutie` op `resolutions[10]` en kijk in het netwerk-tabblad.

## Evalueer het eindresultaat

!!! question "Vraag"

    Je hebt nu met twee verschillende libraries kaarten gemaakt op basis van dezelfde OGC API's. Wat was er hetzelfde, en wat was er anders? Wat zegt dat over de waarde van standaarden?

??? success "Antwoord"

    De URL's, de Tile Matrix Set en de styles van PDOK bleven precies hetzelfde. Alleen de code om ze te gebruiken verschilde. Omdat de API's een open standaard volgen, kun je zelf de client kiezen die het best bij je past, en kun je later overstappen zonder dat de dataleverancier iets hoeft te veranderen.

## Conclusie

Je hebt een webmap in RD New gemaakt die OGC API - Tiles toont. Laten we nagaan wat we gedaan hebben:

| Onderdeel | Beschrijving |
| --- | --- |
| Voorbeeld | Voorbeeldcode klaarzetten en de requests naar de API's bekijken. |
| RD New | De projectie EPSG:28992 registreren met proj4js. |
| Tegelschema | De Tile Matrix Set NetherlandsRDNewQuad vertalen naar een `TileGrid`. |
| Vector tiles | De BRT Achtergrondkaart inladen en opmaken met een PDOK style. |
| Uitbreiding | De BGT toevoegen, overzoomen tot zoomniveau 19, en BRT en BGT samenvoegen in één LayerGroup. |
