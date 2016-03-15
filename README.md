# Sistema de autenticación de usuarios U-Pasaporte

Este sistema valida las credenciales de un usuario con los servidores de ADI. Puede ser
utilizado por desarrolladores externos para validar usuarios sin requerir la administración de claves.

**ATENCIÓN** Cualquier servicio externo a ADI que utilice este KIT de autenticación
queda sujeto a las normas de Escuela de Ingeniería y Ciencias. Cualquier mal
uso de este KIT será sancionado. Todas las acciones realizadas por los
usuarios son almacenadas en tablas de LOG.

## Actores

* ADI:  servidor de ADI 'www.u-cursos.cl/upasaporte'
* EXTERNO: servidor externo, servicio que utilizará U-Pasaporte para autenticar a sus usuarios.
* USUARIO: el browser del usuario que quiere autenticarse.


## Instalación

Los desarrolladores que deseen utilizar U-Pasaporte deben solicitar acceso a ADI.
Deben proveer de una URL de autenticación en el servidor EXTERNO y el nombre del servicio que utilizará U-Pasaporte.

Una vez aceptada la solicitud ADI configurará el acceso y entregará
un identificador de servicio. Este identificador se debe utilizar como
parámetro en los llamados de autenticación.


# Proceso de autenticación

1. Cuando un USUARIO necesita ser autenticado, el servidor EXTERNO debe desplegar
el formulario de U-Pasaporte. Eso puede realizarse de dos maneras:

	* Botón de login: se puede desplegar el butón "Entrar con U-Pasaporte" utilizando el siguiente código
	
	```
	<script language="JavaScript" src="https://www.u-cursos.cl/upasaporte/javascript?servicio=NOMBRE_SERVICIO"></script>
	```
	
	Donde ```NOMBRE_SERVICIO``` debe reemplazarse por el identificador único entregado por ADI.
	
	* Formulario externo: En algunos casos, como en móviles, es más util enviar al usuario al servicio de U-Pasaporte, para ello debe
	redigir la navegación a la URL
	
	```
	https://www.u-cursos.cl/upasaporte/login?servicio=NOMBRE_SERVICIO
	```

	Donde ```NOMBRE_SERVICIO``` debe reemplazarse por el identificador único entregado por ADI.

2. El USUARIO ingresará sus credenciales en el formulario y la información se validará
por ADI.

3. En caso de error de autenticación, el mismo servicio U-Pasaporte entregará información al usuario, sin indicarlo al EXTERNO.
En caso de éxito, U-Pasaporte invocará por POST la URL de autenticación definida en el servidor EXTERNO, enviando la información del usuario como parámetros.

4. En este momento el servidor EXTERNO tiene seguridad que el usuario fue correctamente autenticado. En esta fase pueden realizarse
las verificaciones y filtrajes adicionales que desee implementar el servicio EXTERNO. Es posible detener el flujo autenticación en esta fase.
Más detalles de las tareas que debe realizar la URL del EXTERNO más abajo.

5. Una vez que el EXTERNO acepta la autenticación, puede generar una sesión en su servidor y transmitirla al usuario.

6. La última operación que debe realizar el EXTERNO es generar una URL de redirección, la cual será transmitida a U-Pasaporte.
Luego U-Pasaporte redireccioná el usuario a esa URL para continuar el flujo de la applicación web del EXTERNO donde puede continuar
con la sesión creada.


# Ejemplo de script en EXTERNO

En el paso 3. del proceso de autenticación, se indica que una vez validado el usuario,
se delega el flujo a la URL de autenticación que se entregó cuando se configuró el servicio.
Esta URL debe realizar algunos pasos de verificación y luego puede implementar la lógica
que considere necesaria.
Los ejemplos de este documento están implementados en PHP,
pero este servicio puede estar implementado en el lenguaje de programación de preferencia del servidor EXTERNO.

En este repositorio incluiremos demostraciones en distintos lenguajes.
Aceptamos pull requests para aumentar la lista de implementaciones.

## Paso 1: Verificación del origen

La URL solo debe aceptar llamados originados desde ADI por medio del método POST, para ello
en cada llamado válido se envía una firma que debe ser verificada utilizando la llave pública
del servidor ```www.u-cursos.cl``` alojado en ```https://www.u-cursos.cl/upasaporte/certificado```.

```PHP
$signature = base64_decode( $_POST['firma'] );
unset( $_POST['firma'] );
$public_key = openssl_pkey_get_public( file_get_contents( 'https://www.u-cursos.cl/upasaporte/certificado' ) );
$result     = openssl_verify( array_reduce( $_POST, create_function( '$a,$b', 'return $a.$b;' ) ), $signature, $public_key );
openssl_free_key( $public_key );
// if $result is false, the message is NOT coming from U-Pasaporte, we need to abort.
if( ! $result ) exit( '-1' );
```
## Paso 2: Lógica personalizada

Si la verificación de servidor es exitosa, el servicio ya puede ejecutar la lógica
que requiera para finalizar la inicialización de sesión. Es responsabilidad de este servicio
el comprobar que el usuario tenga acceso en su servidor.

Dentro del los parámetros del llamado POST se entrega información sobre el usuario autenticado.
**IMPORTANTE:
La informacion que se envia es de caracter no privado, pero debe mantenerse
reservada (no publicar). Algunos de los valores enviados se refieren a los
nombres del usuario, apellidos, RUT e e-mail.**

## Paso 3: Éxito o error

Una vez que el usuario haya sido validado con exito en el servidor externo,
este servicio debe imprimir una URL valida de redireccion. Es MUY RECOMENDADO
que se envie un ID de session valido como parte de la URL.

```PHP
session_start();
$_SESSION = array(
	'nombre_completo'	=> $_POST['nombre_completo'],
	'valido'			=> TRUE,
);
//You need to finalise the script redirecting the user to your redirect URL
exit( 'https://'.$_SERVER['SERVER_NAME'].'/receiver.php?'.session_name().'='.session_id() );
```

En caso de error (por ejemplo, que el usuario no sea valido), este script debe
imprimir un mensaje (distinto a una url) con el error ( o simplemente -1 ).

```PHP
exit("No tiene permisos para acceder a este servicio");
```

# DEBUG

Tanto con el código que genera el botón de ingreso como con la URL directa a U-Pasaporte, es posible incluir
el parámetro de ```debug``` en la URL, de este modo se activa el modo de desarrollo, el cual
despliega la información intercambiada entre los servidores para facilitar la integración.

## Modos de debug

* debug=1
Cuando el usuario ingresa sus credenciales y éstas son correctas, se desplerará la dirección completa donde se ubica
el servicio de autenticación en EXTERNO, además imprime toda la información del usuario que será enviada a ese servicio.

* debug=2
Cuando el usuario ingresa sus credenciales y éstas son correctas, U-Pasaporte se comunicará con el servicio EXTERNO y
entonces desplegará el mensaje o URL de redirección que genera el servicio.


# Contacto

Para solicitar acceso al servicio o para recibir soporte sobre el proceso del mismo, pueden realizarlo a través del [formulario de contacto](https://www.u-cursos.cl/dev/paginas/contacto).
