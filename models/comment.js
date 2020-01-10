let mongoose = require('mongoose');

// Comment Schema
let commetSchema = mongoose.Schema({
    comment:{
        type: String,
        required: true
    },
    author:{
        type: String,
        required: true
    },
    blogid:{
        type: String,
        required: true
    },
    namec:{
        type: String,
        required: true
    },
    
    created: {
        type: Date, 
        default: Date.now
    }
});


let Commet = module.exports = mongoose.model('Commets',commetSchema);