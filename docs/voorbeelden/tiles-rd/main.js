import * as maplibregl from "https://cdn.jsdelivr.net/npm/maplibre-gl@6.16.0/dist/maplibre-gl.mjs";
import proj4 from "https://cdn.jsdelivr.net/npm/proj4@2.22.0/+esm";

// RD New (EPSG:28992), with the NetherlandsRDNewQuad Tile Matrix Set
maplibregl.addProjection({
    name: 'EPSG:28992',
    projection: proj4('EPSG:4326', '+proj=sterea +lat_0=52.1561605555556 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.4171,50.3319,465.5524,-0.398957388243,0.343987817378,-1.87740163998,4.0725 +units=m +no_defs'),
    tileMatrixSet: {
        origin: [-285401.92, 903401.92], // top left corner of tile 0/0/0 in RD coordinates
        extentAtZoom0: 880803.84 // width of tile 0/0/0 in meters
    }
});

const style = await (await fetch('https://api.pdok.nl/kadaster/brt-achtergrondkaart/ogc/v1/styles/standaard__netherlandsrdnewquad?f=json')).json(); // style URL
style.projection = { type: 'EPSG:28992' };

const map = new maplibregl.Map({
    container: 'map', // container id
    style: style,
    center: [5.44, 52.05], // starting position [lng, lat]
    zoom: 2, // starting zoomlevel
    minZoom: 2, // minimum zoomlevel zoom out
    maxZoom: 9 // maximum zoomlevel zoom in
});
