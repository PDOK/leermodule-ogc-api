// 1. Maak de projectie RD New (EPSG:28992) bekend bij OpenLayers, met behulp van proj4js
proj4.defs('EPSG:28992', '+proj=sterea +lat_0=52.1561605555556 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.4171,50.3319,465.5524,-0.398957388243,0.343987817378,-1.87740163998,4.0725 +units=m +no_defs');
ol.proj.proj4.register(proj4);
const rd = ol.proj.get('EPSG:28992');
const rd_tile_matrix_extent = [-285401.92, 22598.08, 595401.92, 903401.92];
rd.setExtent(rd_tile_matrix_extent);

// 2. De NetherlandsRDNewQuad Tile Matrix Set, zie
//    https://api.pdok.nl/kadaster/brt-achtergrondkaart/ogc/v1/tileMatrixSets/NetherlandsRDNewQuad
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

// 3. OGC API - Tiles: de BRT Achtergrondkaart als vector tiles
const achtergrondkaart = new ol.layer.VectorTile({
    declutter: true,
    source: new ol.source.VectorTile({
        format: new ol.format.MVT(), // het Mapbox Vector Tile formaat
        projection: rd,
        tileGrid: tileGrid,
        url: 'https://api.pdok.nl/kadaster/brt-achtergrondkaart/ogc/v1/tiles/NetherlandsRDNewQuad/{z}/{y}/{x}?f=mvt'
    })
});

// De vector tiles krijgen de opmaak van een PDOK style
olms.applyStyle(
    achtergrondkaart,
    'https://api.pdok.nl/kadaster/brt-achtergrondkaart/ogc/v1/styles/standaard__netherlandsrdnewquad?f=json',
    { updateSource: false, resolutions: resolutions }
);

// 4. De kaart zelf
const map = new ol.Map({
    target: 'map',
    layers: [achtergrondkaart],
    view: new ol.View({
        projection: rd,
        resolutions: resolutions, // alleen zoomen naar de zoomniveaus van de tegels
        center: [155000,463000], //De RD-coördinaten van de Onze Lieve Vrouwetoren in Amersfoort
        zoom: 2, // initieel zoomniveau
        minZoom: 2, // maximaal uitzoomen
        maxZoom: 12, // maximaal inzoomen
        extent: rd_tile_matrix_extent,
    })
});

map.on('click', (event) => {
  console.log(event.coordinate);
});
