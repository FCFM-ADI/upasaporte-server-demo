const express = require('express'), app = express(), server = require('http').createServer(app);
const bodyParser = require('body-parser');
const https = require('https');
const uid = require('uid-safe').sync;
var REDIRECT_URL;
var CONTENT_PROVIDER_URL='https://www.u-cursos.cl/upasaporte/?';
var APP_NAME='demo';//Replace with yout own app name
/*
For demo purposes, you should use more sofisticated means to
store cookes.
*/
var SESSION = {};

//Parser for URL-Encoded body
app.use(bodyParser.urlencoded({
  extended: true
}));

//We define the route to receive the EXTERNAL authenticator
//called by U-Pasaporte
app.post('/external', function(req,res){
  if(!req.body['ticket']){
    res.statusCode = 400;
    res.end();
    return;
  }
  var url = CONTENT_PROVIDER_URL+'servicio='+APP_NAME+'&ticket='+req.body['ticket'];
  https.get(url, function(r){
    var data = "";
    r.on('data', function(d) {
      data+=d;
    });
    r.on('end', function() {
      if(r.statusCode != 200){
        res.statusCode = 500;
        res.send("Surgió un error finalizando la autenticación. Si el problema persiste, contáctese a soporte.");
        return;
      }
      //From here, we know the call was successful and we can parse the data
      data = JSON.parse(data);

      //Save some data into the session
      var sess_id = uid(24);
      SESSION[sess_id] = data;

			//We create the Redirect URL
			var redirect = REDIRECT_URL+'sessid='+sess_id;
      //We return the REDIRECT_URL to U-Pasaporte
			res.send(redirect);
    });
    r.on('error', function(){
      res.statusCode = 500;
      res.send("Surgió un error finalizando la autenticación. Si el problema persiste, contáctese a soporte.");
    });
  });
});

/*
Here's is where the successful authentications are redirected, from here you can
re-take the app flow.
We use the simple SESSION array to store and retrieve values, you
should use something more sofisticated.
*/
app.get('/authenticated', function(req, res){
  var sess = SESSION[req.query.sessid];
  res.write("<html><head><meta charset='utf-8'></head><body>");
	res.write("<h1>Hola! "+sess.alias+"</h1><br/>");
  res.write("<h2>Session ID: "+req.query.sessid+"</h2><br/>");
  res.write("<h3>Datos recibidos: </h3><br/>");
  res.write("<pre>");
  res.write(JSON.stringify(sess, null, 4));
  res.write("</pre>");
  res.write("</body></html>");
  res.end();
});

server.listen(3000, function(){
	const port = server.address().port === 80 ? "" : ":"+server.address().port;
	REDIRECT_URL = "http://"+require('os').hostname()+port+"/authenticated?";
	console.log('running at port 3000');
	console.log("Redirect URL: "+REDIRECT_URL);
});
