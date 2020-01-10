// load the things we need
let mongoose = require('mongoose');

// define the schema for our user model
let userSchema = mongoose.Schema({
    fname:{
        type: String,
        required: true
    },
    image: {
        filename:{
            type: String
        },
        data: Buffer,
        contentType: String
    },
    status:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    bio:{
        type: String,
        required: true 
    }
});

// // methods ======================
// // generating a hash
// userSchema.methods.generateHash = function (password) {
//     return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
// };

// // checking if password is valid
// userSchema.methods.validPassword = function (password) {
//     return bcrypt.compareSync(password, this.local.password);
// };

// create the model for users and expose it to our app
const User = module.exports = mongoose.model('User', userSchema);