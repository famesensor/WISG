let mongoose = require('mongoose');

// Blog Schema
let blogSchema = mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    author:{
        type: String,
        required: true
    },
    body:{
        type: String,
        required: true
    },
    likes:{
        type: Number,
        default: 0
    },
    view:{
        type: Number,
        default: 0
    },
    comments:{
        type: Number,
        default: 0
    },
    image: {
        filename:{
            type: String
        },
        data: Buffer,
        contentType: String
    },
    // comments:[{
    //     text: String,
    //     postedBy: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         postedBy: 'User' 
    //     }
    // }],
    created: {
        type: Date, 
        default: Date.now
    }
});


let Blogs = module.exports = mongoose.model('Blogs',blogSchema);