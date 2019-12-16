$(function() {
    $(document).ready(function() {
        $("#slider-range").slider({
            range: true,
            min: new Date('2019.11.12').getTime() / 1000,
            max: new Date().getTime() / 1000,
            step: 86400,
            values: [new Date('2019.11.12').getTime() / 1000,
                new Date('2019.11.30').getTime() / 1000
            ],
            slide: function(event, ui) {
                $("#amount").val((new Date(ui.values[0] * 1000).toDateString()) + " - " + (new Date(ui.values[1] * 1000)).toDateString());
            }
        });

        $("#amount").val((new Date($("#slider-range").slider("values", 0) * 1000).toDateString()) +
            " - " + (new Date($("#slider-range").slider("values", 1) * 1000)).toDateString());

        $('#submit').on('click', function() {
            let range = findRange();
            let parsedRange = range.split(' - ');
            sendQuery(parsedRange);
        });

        function findRange() {
            return $("#amount").val();
        }

        function sendQuery(range) {
            console.log(range);
            const query = {
                start: new Date(range[0]).toISOString(),
                end: new Date(range[1]).toISOString()
            };
            getData(query).then(renderPage);
        }

        function renderPage(results) {
            console.log(results);
            $('#wrapper').empty();
            createGraph(results);
        }

        function getData(query) {
            return new Promise((resolve, reject) => {
                $.post({
                    url: '/sensorGrab',
                    data: query,
                    success: (result) => {
                        resolve(result);
                    }
                });
            });
        }

        function createGraph(results) {
            console.log(results);
            let labels = []; 
            let temps = []; 
            
            for (let i=0; i<results.length; i++) {
                labels += results[i].day + ',';
                labels = labels.split(',');
                temps += results[i].avg + ',';
                temps = temps.split(',');
            }
            
            var container = document.getElementById('wrapper');
            var data = {
                categories: labels,
                series: [{
                        name: 'Temperature',
                        data: temps
                    },
                ]
            };
            var options = {
                chart: {
                    width: 1500,
                    height: 500,
                    title: 'Temperature in my room'
                },
                yAxis: {
                    title: 'Degrees Farenheit',
                    pointOnColumn: true
                },
                xAxis: {
                    title: 'Date',
                    type: 'datetime',
                    dateFormat: 'MM-DD-YYYY'
                },
                series: {
                    showDot: false,
                    zoomable: true
                },
                tooltip: {
                    suffix: 'Degrees Farenheit'
                }
            };

            var theme = {
                chart: {
                    fontFamily: 'courier',
                    fontWeight: 'bold',
                    background: {
                        color: '#F2EFE9',
                        opacity: 0.5
                    }
                },
                series: {
                    colors: [
                        '#BFB48F', '#B42335', '#63141D', '#9CAFB7', '#320A0F',
                        '#564E58', '#617178', '#8a9a9a', '#516f7d', '#dddddd'
                    ]
                },
                title: {
                    fontSize: 50,
                    fontFamily: 'Courier',
                    fontWeight: 'bold',
                    color: 'black'
                },
                xAxis: {
                    title: {
                        fontSize: 16,
                        fontFamily: 'Courier',
                        fontWeight: 'bold',
                        color: 'black'
                    }
                },
                yAxis: {
                    title: {
                        fontSize: 16,
                        fontFamily: 'Courier',
                        fontWeight: 'bold',
                        color: 'black'
                    }
                }
            };

            tui.chart.registerTheme('myTheme', theme);

            // For apply theme

            options.theme = 'myTheme';

            var chart = tui.chart.lineChart(container, data, options);
        }

    });
});