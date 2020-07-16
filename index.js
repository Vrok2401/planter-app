const express = require('express');
const app = express();
const axios = require('axios');
const router = express.Router();
const path = require('path');

const Plant = require('./Plant');
const { response } = require('express');

const apikey = 'aXROVGlucUdKMG1SbUk2eDJIUHZYUT09';

app.use(express.static(path.join(__dirname,'./client/build')));

app.get('/', (req, res) => {
    const index = path.join(__dirname,'./client/build/index.html');
    
    res.sendFile(index, function(err) {
        if (err) {
            res.status(500).send(err);
        }
    });
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

    var querystr;
    if (type == 'q') {
        querystr = `https://trefle.io/api/v1/plants/search?token=${apikey}&q=${name}`;
    } else {
        querystr = `https://trefle.io/api/v1/plants?token=${apikey}&filter[${type}]=${name}&order[scientific_name]=asc`;
    }
    
    console.log(type+" search: "+name);
    console.log(querystr);
    axios.get(querystr)
    .then( (response) => {
        if (!response.data || response.data === undefined || response.data.meta.total === 0) {
            console.log("Search: No plants found");
            res.status(200).send('');
        } else {
            console.log("Search: "+response.data.meta.total+" result(s) found");
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
    var url = `https://trefle.io`+req.query.link+`?token=${apikey}`;
    console.log(url);

    axios.get(url)
    .then( (response)  => {
        data = null;
        //console.log(response.data.data);
        if (response.data.data == undefined) {
            res.status(400).send(error);
            console.log("Error: "+error);
        } else {
            data = response.data.data;
        }
        //console.log(data);
        common_name = "N/A";
        if (data.common_name != null) { 
            //capitalise first letter of common name
            common_name = data.common_name.charAt(0).toUpperCase()+data.common_name.slice(1);
        }
        scientific_name = data.scientific_name;
        genus = data.genus.name;
        family = data.family.name;
        image_url = null;
        if (data.image_url !== undefined) {
            image_url = data.image_url;
        }

        //get order and above data through family link
        var family_url = `https://trefle.io`+data.family.links.self+`?token=${apikey}`;
        axios.get(family_url)
        .then( (response)  => {
            console.log('Retrieving order data');
            var family_data = response.data.data;
            plantValue = new Plant ({
                common_name: common_name,
                scientific_name: scientific_name,
                genus: genus,
                family: family,
                order: family_data.division_order.name,
                class: family_data.division_order.division_class.name,
                division: family_data.division_order.division_class.division.name,
                image: image_url
            });

            //save plant record
            plantValue.save()
            .then(result=> {
                console.log("Success: "+result);
                res.status(200).json(result);
            })
            .catch(error=> {
                res.status(400).send(error);
                console.log("Error: "+error);
            });
        })
        .catch(error => {
            res.status(400).send(error);
            console.log(error);
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