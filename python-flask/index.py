import urllib2, urllib, json
from flask import Flask, request, session, redirect

app = Flask( __name__ )
app.secret_key = 'unsecretkeyenterobuenoyperfecto_cambiarporfavor';

#Un ejemplo para manejar los datos del lado del servidor y poseer session id seria con redis.
#Para ello es necesario crear un archivo redissession y agregar este Snippet (http://flask.pocoo.org/snippets/75/)
#from redissession import RedisSessionInterface
#app.session_interface = RedisSessionInterface()

url_upasaporte = 'https://www.u-cursos.cl/upasaporte';
servicio = 'NOMBRE_DE_TU_SERVICIO'

@app.route( '/' )
def index():
	html = '<html><head></head><body>'
	html += '<script language="JavaScript" src="'+url_upasaporte+'/javascript?servicio='+servicio+'"></script>'
	html += '</body></html>'
	return html

@app.route( '/externo', methods=['POST'] )
def externo():
	if not request.form['ticket']: return -1

	params = { 'servicio': servicio, 'ticket': request.form['ticket'] }
	data = urllib2.urlopen( url_upasaporte + '/?' + urllib.urlencode( params ) ).read()
	if not data: return -1

	data = json.loads( data )

	#Aqui se puede jugar con los datos :) guardarlos en db,
	#chequear si la persona realmente tiene acceso, etc.

	redirect = 'http://EL_SITIO_DONDE_REDIRIGIR_AL_USUARIO.com'

	#Tambien se puede inicializar la sesion con datos (solo si manejas la sesion del lado del servidor)
	#session.new = True
	#session['nombre'] = data['alias']
	#redirect += '/auth/'+session.sid

	return redirect

'''
#Complemento para la implementacion con redis en donde se envia el session id
@app.route( '/auth/<sessid>' )
def auth( sessid ):
	response = app.make_response( redirect( '/home' ) )
	response.set_cookie( app.session_cookie_name, sessid )
	return response

@app.route( '/home' )
def home():
	#Aqui ya se poseen los datos de la sesion.
	return session['nombre']
'''

if __name__ == '__main__':
	app.run( host='TU_HOST', port=6000, debug=True )

