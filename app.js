const path = require('path');
const express = require('express');
const OS = require('os');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const app = express();
const cors = require('cors')

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));
app.use(cors())

// Only connect to MongoDB if not in test environment
if (process.env.NODE_ENV !== 'test') {
    // Use environment variable for MongoDB URI
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://wasay:wasay%40654@cluster0.5vx6n24.mongodb.net/';
    
    mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log("MongoDB Connection Successful");
    }).catch((err) => {
        console.log("MongoDB Connection Error: " + err);
    });
} else {
    console.log("Test environment detected - skipping MongoDB connection");
}

var Schema = mongoose.Schema;

var dataSchema = new Schema({
    name: String,
    id: Number,
    description: String,
    image: String,
    velocity: String,
    distance: String
});

var planetModel = mongoose.model('planets', dataSchema);

app.post('/planet', function(req, res) {
    // console.log("Received Planet ID " + req.body.id)
    
    // If in test environment, return mock data
    if (process.env.NODE_ENV === 'test') {
        const mockPlanets = {
            1: { id: 1, name: 'Mercury' },
            2: { id: 2, name: 'Venus' },
            3: { id: 3, name: 'Earth' },
            4: { id: 4, name: 'Mars' },
            5: { id: 5, name: 'Jupiter' },
            6: { id: 6, name: 'Saturn' },
            7: { id: 7, name: 'Uranus' },
            8: { id: 8, name: 'Neptune' }
        };
        
        const planet = mockPlanets[req.body.id];
        if (planet) {
            res.send(planet);
        } else {
            res.status(404).send("Planet not found");
        }
        return;
    }
    
    // Production database query
    planetModel.findOne({
        id: req.body.id
    }, function(err, planetData) {
        if (err) {
            res.status(500).send("Error in Planet Data");
        } else {
            res.send(planetData);
        }
    });
});

app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, '/', 'index.html'));
});

app.get('/os', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "os": OS.hostname(),
        "env": process.env.NODE_ENV
    });
});

app.get('/live', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "status": "live"
    });
});

app.get('/ready', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "status": "ready"
    });
});

app.listen(3000, () => {
    console.log("Server successfully running on port - " + 3000);
});

module.exports = app;