import * as maplibregl from "https://esm.sh/maplibre-gl";
import OGCFeatureCollection from './mapbox-gl-ogc-feature-collection.patched.js';

const map = new maplibregl.Map({
    container: 'map', // container id
    style: 'https://api.pdok.nl/kadaster/brt-achtergrondkaart/ogc/v1/styles/standaard__webmercatorquad?f=json', // style URL
    center: [5.44, 52.05], // starting position [lng, lat]
    zoom: 7, // starting zoomlevel
    minZoom: 6, // minimum zoomlevel zoom out
    maxZoom: 14 // maximum zoomlevel zoom in
});

map.on('load', () => {
    const provinciegebiedsource = 'provincie-src'

    new OGCFeatureCollection(provinciegebiedsource, map, {
        url: 'https://api.pdok.nl/kadaster/bestuurlijkegebieden/ogc/v1',
        collectionId: 'provinciegebied',
        limit: 100
    })

    map.addLayer({
        'id': 'provinciegebied-outline',
        'source': provinciegebiedsource,
        'type': 'line',
        'paint': {
            'line-color': '#000000',
            'line-width': 2
        }
    });
})