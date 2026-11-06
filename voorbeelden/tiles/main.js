import * as maplibregl from "https://cdn.jsdelivr.net/npm/maplibre-gl@6.16.0/dist/maplibre-gl.mjs";

const map = new maplibregl.Map({
    container: 'map', // container id
    style: 'https://api.pdok.nl/kadaster/brt-achtergrondkaart/ogc/v1/styles/standaard__webmercatorquad?f=json', // style URL
    center: [5.44, 52.05], // starting position [lng, lat]
    zoom: 7, // starting zoomlevel
    minZoom: 6, // minimum zoomlevel zoom out
    maxZoom: 14 // maximum zoomlevel zoom in
});