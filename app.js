const express = require('express');
const app = express();
const cors = require('cors');
const dns = require('dns');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const autoIncrement = require('mongoose-auto-increment');

//set up mongodb
var connection = mongoose.createConnection('mongodb://localhost:27017/cmsDb', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true  });
autoIncrement.initialize(connection);
var Schema = mongoose.Schema;

var shortUrlSchema = new Schema({
    url: {type: String, required: true}
});

shortUrlSchema.plugin(autoIncrement.plugin, { model: 'ShortUrl', field: 'short_url' });
var ShortUrl = connection.model('ShortUrl', shortUrlSchema);



const isDomain = async (req, res, next) => {

    const url_to_shorten = req.body.url;
    const domain_start = url_to_shorten.indexOf('.') + 1;
    const domain_end = url_to_shorten.indexOf('.', domain_start) + 4;
    const domain = url_to_shorten.substring(domain_start, domain_end);

    const options = {
        family: 6,
        hints: dns.ADDRCONFIG | dns.V4MAPPED,
    };

    dns.lookup(domain, function(err, address, family){
            req.domain = address;
            console.log(req.domain);

            next();
    });

    
}


app.use('/', express.static('public'));
app.use(cors({optionsSuccessStatus: 200}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());
app.use(cors());

app.use('/api/shorturl/new', isDomain);

/* //api
app.get('/new/:urlShort(*)',(req,res,next) =>{
    const {urlShort} = req.params;
   // console.log(urlShort);
    return res.json({urlShort});
});
 */



/*
   isValidUrl(): Middleware to check if url on post request follows the specified pattern
                 http(s)://www.[domain].[tld]/[]
*/
var isValidUrl = (req, res, next) => {

    var pattern = new RegExp('^(https?:\\/\\/)'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  
    req.isValid = pattern.test(req.body.url);
  
    next();
  
  }


//get express static content
app.use(express.static(__dirname +'/public'));

app.get('/',(req,res) =>{
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

/* api */
app.post('/api/shorturl/new', isValidUrl, function(req, res){
    
    var url = req.body.url;

    if(!req.domain){

        res.send({"error":"invalid Hostname"});
        
    }else {

        if(req.isValid){

            ShortUrl.findOne({url: url}).then(urlR => {
                if(!urlR){
                    console.log("not found");
    
                    const short_url = new ShortUrl({
                        url: url
                    });
    
                    short_url.save(function(err){
                        if (err) return handleError(err);
    
                        short_url.nextCount(function(err, count){
                            res.send({original_url: url, short_url: count-1});
                        });
                    });
                }else {
                    res.send({original_url: url, short_url: urlR.short_url});
                }

            }).catch(error => {
                next(error);
            });
            
        }else {
            res.send({"error": "invalid URL"});
        }
    }
    
});

/* api */
app.get('/api/shorturl/:i', function(req, res){
    
    var short_url = req.params.i;

    ShortUrl.findOne({short_url: short_url}).then(json => {

        if(json){
            res.redirect(json.url);
        }else {
            res.send({"error": "No short url found for given input"});
        }
        
    })
});

const port = process.env.PORT || 3000;
app.listen(port,() =>{
    console.log(`Server is running on port ${port}`);
});