const express = require('express');
const app = express();
const axios = require('axios');
const router = express.Router();
const path = require('path');

const Plant = require('./Plant');
const { response } = require('express');

const apikey = 'aXROVGlucUdKMG1SbUk2eDJIUHZYUT09';

if (process.env.NODE_ENV === "production") {
    app.use(express.static('client/public'));
}

app.get('/', (req, res) => {
    const index = path.join(__dirname,'./client/public/index.html');
    console.log(index);
    res.sendFile(index);
});

//Get records
app.get('/getallplants', (req, res) => {
    Plant.find({})
    .then(response => {
        res.status(200).send(response);
    })
    .catch(error => {
        res.status(400).send(error);
    });
});
//Search plants
app.get('/search', (req, res) => {
    type = req.query.type;
    name = req.query.name;
    const querystr = `https://trefle.io/api/plants?${type}=${name}&token=${apikey}`;
    console.log(type+" search: "+name);
    axios.get(querystr)
    .then( (response) => {
        if (!response.data || response.data === undefined) {
            res.status(200).send('Plant not found');
            return;
        } else {
            console.log(response.data);
            console.log("Search found");
            res.status(200).send(response.data);
        }
    })
    .catch(error => {
        res.status(400).send(error);
        console.log(error);
    });
});
//Add record
app.get('/add', (req, res) => {
    var url = req.query.link+`?token=${apikey}`;
    console.log(url);

    axios.get(url)
    .then( (response)  => {
        commonName = "N/A";
        if (response.data.common_name != null) { 
            //capitalise first letter of common name
            commonName = response.data.common_name.charAt(0).toUpperCase()+response.data.common_name.slice(1);
        }
        image_url = null;
        if (response.data.images !== undefined) {
            image_url = response.data.images[0].url;
        }
        plantValue = new Plant ({
            common_name: commonName,
            scientific_name: response.data.scientific_name,
            genus: response.data.genus.name,
            family: response.data.family.name,
            order: response.data.order.name,
            class: response.data.class.name,
            division: response.data.division.name,
            image: image_url
        });
            
        plantValue.save()
        .then(result=> {
            console.log("Success: "+result);
            res.status(200).json("Plant added");
        })
        .catch(error=> {
            res.status(400).send(error);
            console.log("Error: "+error);
        });
    })
    .catch(error => {
        res.status(400).send(error);
        console.log("Error: "+error);
    });
});
//Delete record
app.get('/delete', (req, res) => {
    Plant.deleteOne({ _id: req.query.id }).
    then(response => {
        console.log("Plant deleted");
        res.status(200).json(response);
    })
    .catch(error => {
        res.status(400).json(error);
    });
});

//Delete multiple records (emergency use)
app.get('/deleteMany', (req, res) => {
    Plant.deleteMany({ common_name: req.query.name }).
    then(response => {
        console.log("Plant deleted");
        res.status(200).json(response);
    })
    .catch(error => {
        res.status(400).json(error);
    });
});

app.use('/', router);
app.listen(process.env.PORT || 5000); //needs process.env.PORT for Heroku