const express = require('express'), 
  app = express(),
  server = require('http').createServer(app);
const bodyParser = require('body-parser');
const crypto = require('crypto');
const https = require('https');
const session = require('express-session');
var REDIRECT_URL; 

//Parser for URL-Encoded body
app.use(bodyParser.urlencoded({
  extended: true
}));

//In this demo we show how can be sessions started
//Here we configure express-session
app.use(session({
  secret: 'SAAN(klnaslkdnasl^&%jahsbd',
  cookie: {},
  saveUninitialized: false,
  resave: false
}));

//Be define the route to receive the EXTERNAL authenticator
//called by U-Pasaporte
app.post('/external', function(req,res){
	//We first check the signature
	verify_signature(req.body, 
		//Success callback, here you can perform custom
		//procedures and checks for your service.
		function(){
			//Create session
			//In this demo we show how can be sessions started
			app.use(session({
  				secret: 'SAAN(klnaslkdnasl^&%jahsbd',
  				cookie: {},
  				saveUninitialized: false,
  				resave: false
			}));
	
			//We create the Redirect URL
			var redirect = REDIRECT_URL;
			redirect += 'sessid='+req.session.id;
			redirect += '&alias='+req.body.alias;
			res.send(redirect);
		}, 
		//Failure callback, define the error message
		function(){
			res.send('error');
		});
});

//Here's is where the successful authentications are redirected, from here you can 
//re-take the app flow. Remember to set the session in the client.
app.get('/authenticated', function(req, res){
	res.send(JSON.stringify(req.query));
})

/**
Verify U-Pasaporte signatures
@param params the POST parameters sent from U-Pasaporte
@param success block called on success verifications
@param faulure block called on failed verifications
**/
function verify_signature(params, success, failure){
	const firma = params.firma;
	delete params.firma;
	https.get('https://www.u-cursos.cl/upasaporte/certificado', function(r){
        	var public_key;
        	r.on('data', function(d) {
                        public_key =d;
                });
                r.on('end', function() {
			const signature = Object.keys(params).sort().map(function(key){return decode(params[key])}).reduce(function(p,c){return p+c});
			const verify = crypto.createVerify('RSA-SHA1');
			console.log(signature);
			verify.update(signature);
			if(verify.verify(public_key, firma, 'base64')) success();
			else failure();
                });
        });	
}

function decode(str) {
     return unescape(str.replace(/\+/g, " "));
}

server.listen(3000, function(){
	const port = server.address().port === 80 ? "" : ":"+server.address().port;	
	REDIRECT_URL = "http://"+require('os').hostname()+port+"/authenticated?";
	console.log('running at port 3000');
	console.log("Redirect URL: "+REDIRECT_URL);
});
