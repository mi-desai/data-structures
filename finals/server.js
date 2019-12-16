let express= require('express'); 
const app = express(); 
app.set('view engine', 'pug');

app.get('/', (req, res) => {
    res.send(`<h1>Misha's Data Structures App Directory</h1>
            <ul><li><a href="/aa.html">AA App.</a></li>
            <li><a href="/process.html">Process Blog App.</a></li>
            <li><a href="/sensor.html">Sensor App.</a></li></ul>`);
}); 

app.get('/process', (req, res) => {
    res.send('index'); 
});

app.get('/sensor', (req, res) => {
    res.send('index'); 
});

app.get('/aa', (req, res) => {
    res.send('index'); 
});

app.listen(8080, () => {
    console.log('http://localhost:8080'); 
}); 
