### Assignments 10-11

Web URL: <a>http://204.236.247.193:8080/</a>

Note: I've done a lot of background work on the AA Map app to try to get the lat/longs of the addresses into a geoJSON format, which in Leaflet allows for some great styling options that I'd like to incorporate. 

However, the tile layer from Mapbox is not loading for some reason. If you open the inspector on the page, you can see all the data I've piped in from the RDS. The other apps are just rendering their queries as text on a blank page, so those are easier to see. 

## Designs

![Data Structure](https://github.com/mi-desai/data-structures/blob/master/week10-11/AA-Interface.svg)<br/><br/>

The idea here is to be able to dynamically update the query using drop-downs to narrow down what the user is interested in. A tooltip will display all matching meetings. Default query settings will include only the meetings remaining for the rest of the day today, so it will require using moment.js to compare current timestamps to meeting times and weekdays. 

![Data Structure](https://github.com/mi-desai/data-structures/blob/master/week10-11/process-blog-interface.svg)<br/><br/>

When an activity is selected at the bottom, a line path will draw in showing the ranking of the activity in that particular week's blog entries. I hope to use a d3 bump chart I made in studio here. The query will change depending on the activity being selected. 

![Data Structure](https://github.com/mi-desai/data-structures/blob/master/week10-11/Sensor%20Interface.svg)<br/><br/>

The sensor interface will include a line chart whose curves will color with a red or blue tint depending on if the change since the last measurement was positive or negative. The hope is that the callback for the query will occur every 5 seconds or so, such that the chart will reflect real-time data. The lines will show the average for that particular time period last week. 

Text will also be dynamically updated in the description. If below a certain degree threshold, the message will change from "Brrrrrr" to "Ahhhh" and the sentences will dynamically update to reflect the latest measurements. 

Finally, the "slider" graphic at the bottom will show the trend. If temperatures are trending warmer than the prior day, the circle will draw closer to the square red plus. If colder, towards the negative blue circle. I expect it to flucutate in the middle and I hope to accomplish everything in d3 or p5. 
