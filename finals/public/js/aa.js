$(function() {

    $(document).ready(function() {

        //first part just detects current weekday and passes it in as checkbox
        let day = new Date().getDay();
        $('input[name=weekday]')[day].checked = true;

        //On hitting submit button
        $('#submit').on('click', function() {
            let checked = findCheckedBoxes();
            submitQuery(checked);
        });

        function findCheckedBoxes() {
            return $('input[type="checkbox"]').filter(
                (index, element) => {
                    return $(element).prop('checked')
                }
            );
        }

        function submitQuery(checked) {
            let c = checked.toArray();
            const query = {
                weekday: [],
                times: [],
                type: []
            }
            c.forEach(
                (element) => {
                    query[element.name].push(element.value);
                    // console.log(element.name, element.value, query[element.name]); 
                }
            )
            if (findStar(query['weekday'])) {
                query['weekday'] = null
            }
            if (findStar(query['type'])) {
                query['type'] = null
            }
            if (findStar(query['times'])) {
                query['times'] = null
            }
            console.log(query);
            getData(query).then(renderPage);

        }

        function findStar(arr) {
            return arr.find(
                (str) => str === '*'
            )
        }

        function renderPage(results) {
            console.log(results);
            let count = 0; 
            results.features.forEach((feature) => {
                feature.properties.meetings.forEach((meeting) => {
                    meeting.instances.forEach((instance) => {
                        count++;
                    })
                })
            })
            if (true || count > 0) {
                $('#count').text(`You found ${count} meetings!`).show(); 
                drawMap(results);
            }
            // else {
            //     $('#count').text(`No meetings were found!`).show(); 
            //     $('#map').hide(); 
            // }
        }

        function getData(query) {
            return new Promise((resolve, reject) => {
                $.post({
                    url: '/getAAdata',
                    data: query,
                    success: (result) => {
                        resolve(result);
                    }
                });
            });
        }
    });
});





//Leaflet Part
let mymap;
let mapData = [];

function drawMap(geoData) {
    if (mymap === undefined) {
        mymap = L.map('map').setView([40.753239, -73.98571], 13);

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox.streets',
            accessToken: 'pk.eyJ1IjoicmFiYXJiYW5lbCIsImEiOiJjazJ6YmFxdHIwZzdtM21zMWFwbnhydGJlIn0.hI0jJbRsdZbv82MU2q0JXA'
        }).addTo(mymap);
    }

    // if (mapData !== undefined) {
        mapData.forEach((dot) => dot.clearLayers());
    // }
    
    mapData = [];
    
    for (let f = 0; f < geoData.features.length; f++) {
        let feature = geoData.features[f];
        let address = feature.properties.address;
        let dot = L.geoJSON(feature).bindTooltip(`${address}`).addTo(mymap);
        mapData.push(dot);
        let popUpContent = [`<h3>${address}</h3><br/><ul>`]; 
        
        for (let m =0, max = feature.properties.meetings.length; m < max; m++) {
            let meeting = feature.properties.meetings[m];
            
            let innerContent = ['<table class="instanceTable"><tr><th>Days</th><th>Start</th><th>End</th><th>Type</th><th>Interest</th></tr>']; 
            
            for (let i = 0, max = meeting.instances.length; i < max; i++) {
                let inst = meeting.instances[i]; 
                let row = `<tr>`;
                row += `<td>${inst.weekday}</td>`;
                row += `<td>${inst.startTime}</td>`;
                row += `<td>${inst.endTime}</td>`;
                let type = inst.type;
                if (type.search(' = ')) {
                    type = type.replace(/^.* = /,'');
                }
                type = type.replace(/ meeting$/,'');
                row += `<td>${type}</td>`;
                row += `<td>${inst.interest}</td>`;
                row += `</tr>`;
                innerContent.push(row);
            }
            innerContent.push('</table>');
            popUpContent.push(`<li class="meetingItem"><span class="meetingText">${meeting.name}</span><br/>${innerContent.join('')}</li>`);
        }
        
        popUpContent.push('</ul>');
        dot.bindPopup(popUpContent.join(''), {
            minWidth: 500
        });
        
        
        dot.on('click', function() {
            dot.openPopup();
            $('.meetingItem').on('click', function () {
            let table = $(this).find('table');
            if (table.hasClass('show')) {
                table.removeClass('show');
            }
            else {
                table.addClass('show'); 
            }
        }); 
        });
    }
    
    // mapData = L.geoJSON(geoData).addTo(mymap);
}

function showTable(event) {
    console.log(event.target);
}
