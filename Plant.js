const mongoose = require('mongoose');
const db = 'mongodb+srv://Vrok:GSkfDNz7MZCSOcaW@plantcluster-1pmun.gcp.mongodb.net/plantDB?retryWrites=true&w=majority';

mongoose.connect(db)
.then(()=> {
    console.log("Connected to database");
})
.catch(()=> {
    console.log("Could not connect to database");
})

const schema = new mongoose.Schema({
    common_name: {type: String},
    scientific_name: {type: String},
    genus: {type:String},
    family: {type:String},
    order: {type:String},
    class: {type:String},
    division: {type:String},
    image: {type:String}
});

const Plant = mongoose.model('plant', schema);

module.exports = Plant;