// var geojsonFeature = {
//     "type": "Feature",
//     "properties": {
//         "name": "Coors Field",
//         "amenity": "Baseball Stadium",
//         "popupContent": "This is where the Rockies play!"
//     },
//     "geometry": {
//         "type": "Point",
//         "coordinates": [-104.99404, 39.75621]
//     }
// };

// {
//       "type": "FeatureCollection",
//       "bbox": [100.0, 0.0, -100.0, 105.0, 1.0, 0.0],
//       "features": [
//       //...
//       ]
//   }

// { "type": "FeatureCollection",
//     "features": [
//       { "type": "Feature",
//         "geometry": {"type": "Point", "coordinates": [102.0, 0.5]},
//         "properties": {"prop0": "value0"}
//         },
//       { "type": "Feature",
//         "geometry": {
//           "type": "LineString",
//           "coordinates": [
//             [102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]
//             ]
//           },
//         "properties": {
//           "prop0": "value0",
//           "prop1": 0.0
//           }
//         },
//       { "type": "Feature",
//          "geometry": {
//           "type": "Polygon",
//           "coordinates": [
//              [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
//               [100.0, 1.0], [100.0, 0.0] ]
//              ]
//          },
//          "properties": {
//           "prop0": "value0",
//           "prop1": {"this": "that"}
//           }
//          }
//       ]
//      }



$(function(){
   getAllData().then(
       (results) => {
           console.log(results);
           const features = results.map(
               (meeting) => {
                   return {
                       type: 'Feature', 
                       properties: {
                           
                       },
                       geometry: {
                           type: 'Point', 
                           coordinates: [meeting.longitude, meeting.latitude] 
                       }
                   }
               }
               
               ); 
               
            drawMap({
                type:"FeatureCollection",
                bbox:[100.0, 0.0, -100.0, 105.0, 1.0, 0.0],
                features: features
            });    
        //   $("#output").empty().text(JSON.stringify(geoJSONarray, null, 4));
       }
       
       
       
       )
   function getAllData() {
       return new Promise ((resolve, reject) => {
             $.get({
           url: '/getaadata', 
           success: (result) => {
               resolve(result); 
           }
        }
           );
       }); 
    }
});

let mymap;

function drawMap(geoData) {
    console.log(JSON.stringify(geoData, null, 4)); 
    mymap = L.map('map').setView([40.7128, -74.0060], 8);

    // load a set of map tiles – choose from the different providers demoed here:
    // https://leaflet-extras.github.io/leaflet-providers/preview/
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoicmFiYXJiYW5lbCIsImEiOiJjazJ6YmFxdHIwZzdtM21zMWFwbnhydGJlIn0.hI0jJbRsdZbv82MU2q0JXA'
    }).addTo(mymap);
    
    var queryResult = L.geoJSON(geoData, {
        onEachFeature: onEachFeature
        
    }).addTo(mymap);
    
    // queryResult.addData(geojsonFeature);

}

function onEachFeature(feature, layer) {
    console.log(feature);
    L.marker(feature.geometry.coordinates).addTo(mymap);
   
}