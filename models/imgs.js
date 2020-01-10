const express = require('express')
const bodyParser = require('body-parser')
const router = express.Router();
const multer = require('multer');
fs = require('fs-extra');

router.use(bodyParser.urlencoded({ extended: true }))

let storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
  };

let upload = multer({ storage: storage, fileFilter: fileFilter });

function upIMG(req, res) {
    try {
        let img = fs.readFileSync(req.file.path);
        let encode_image = img.toString('base64');
        // Define a JSONobject for the image attributes for saving to database

        let finalImg = {
            filename: req.file.filename,
            contentType: req.file.mimetype,
            data: new Buffer(encode_image, 'base64')
        };

        return finalImg;
    }catch(e){
        return false;
    }
}

module.exports = {upload, upIMG};