# Week09 Assignment

In this assignment, I decided to do two separate strategies for recording time. 

I first parsed the object returned from the sensor and created separate properties for the input object into the database, getting month number, day of the month number, year, hour and minute. The only setback is that these are in GMT time. 

I additionally used PostgreSQL's inherent property of TIMESTAMP and created a last column that would record the timestamp in a specific format containing all the information needed. There should be a slight time-delay between these two measurements as the time returned from the sensor would reflect the specific time it was queried, but the TIMESTAMP of PostgreSQL would reflect the time it was inserted into the sensorData table. Since the delay is only seconds, it shouldn't impact the creation of the app at the end of this assignment. I wanted to experiment with time and dates, to see if it was easier to store all the different properties of time on the backend, or if it was easier to simply store one timestamp and then deal with getting specific times or dates on the front-end (since this is often something that is really important in financial data, I wanted to do this topic justice). 

Here is the output from the db: 

