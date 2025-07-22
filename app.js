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

// Get MongoDB URI from environment or use fallback
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://wasay:wasay%40654@cluster0.5vx6n24.mongodb.net/solar-system';

// Connect to MongoDB with proper options to avoid deprecation warnings
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // These options help avoid the deprecation warnings
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
}).then(() => {
    console.log("MongoDB Connection Successful");
}).catch((err) => {
    console.log("MongoDB Connection Error: " + err);
    // Don't exit the process, let tests continue with connection errors
});

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
    console.log("Received Planet ID " + req.body.id);
    
    planetModel.findOne({
        id: req.body.id
    }).then((planetData) => {
        if (!planetData) {
            return res.status(404).send({error: "Planet not found"});
        }
        res.send(planetData);
    }).catch((err) => {
        console.error("Database error:", err);
        res.status(500).send({error: "Error in Planet Data"});
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