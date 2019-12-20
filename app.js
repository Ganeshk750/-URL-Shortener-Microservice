const express = require('express');
const app = express();
const cors = reqire('cors');
const mongoose = require('mongoose');
const bodyPaser = require('body-parser');



app.use(bodyPaser.json());
app.use(cors());




const post = process.env.PORT || 3000;
app.listen(post,() =>{
    console.log(`Server is running on port ${port}`);
})