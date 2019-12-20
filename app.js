const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const bodyPaser = require('body-parser');



app.use(bodyPaser.json());
app.use(cors());

//api
app.get('/new/:urlShort(*)',(req,res,next) =>{
    const {urlShort} = req.params;
    console.log(urlShort);
});


const port = process.env.PORT || 3000;
app.listen(port,() =>{
    console.log(`Server is running on port ${port}`);
});