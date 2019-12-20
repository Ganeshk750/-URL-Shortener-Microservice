const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const bodyPaser = require('body-parser');
const path = require('path');



app.use(bodyPaser.json());
app.use(cors());

//api
app.get('/new/:urlShort(*)',(req,res,next) =>{
    const {urlShort} = req.params;
   // console.log(urlShort);
    return res.json({urlShort});
});

//get express static content
app.use(express.static(__dirname +'/public'));

app.get('/',(req,res) =>{
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port,() =>{
    console.log(`Server is running on port ${port}`);
});