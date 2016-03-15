<?php
// La funcion debe imprimir una URL donde ADI dirigira al usuario en caso de exito o '-1' en caso de error

/*
	This script is called by the U-Pasaporte server when an user has been correctly authenticated.
	In this phase you can perform different kind of checks and filtering for this user.
	You can still block a user to access your service from this script.
*/
ini_set( "session.use_cookies",  0 );
ini_set( "magic_quotes_runtime", 0 );
ini_set( "magic_quotes_gpc",	 0 );


// First we check whether the call is actually coming from U-Pasaporte
$firma = base64_decode( $_POST['firma'] );
unset( $_POST['firma'] );
$public_key = openssl_pkey_get_public( file_get_contents( 'https://www.u-cursos.cl/upasaporte/certificado' ) );
$result     = openssl_verify( array_reduce( $_POST, create_function( '$a,$b', 'return $a.$b;' ) ), $firma, $public_key );
openssl_free_key( $public_key );
// Si el resultado es negativo significa que el mensaje no está siendo enviado por U-Pasaporte y por lo tanto debemos retornar un error.
// if $result is false, the message is NOT coming from U-Pasaporte, we need to abort.
if( ! $result ) exit( '-1' );


// Si el script llega a este punto, significa que
// ADI valido al usuario con exito y envio la informacion de este a traves del arreglo $_POST.
// Este script por su parte debe validar al usuario (por ejemplo, que cumpla un determinado perfil)
// e imprimir una URL donde ADI dirigira al usuario.
// Se recomienda crear una session en este punto y entregar el id en la URL que se imprime
// Ej:


/*
From this point you can perform checks regarding the user information.
The information arrives in the $_POST array.

We recommend you to start a session and send the session_id as part of the redirect URL.
*/
session_start();
$_SESSION = array(
	'carreras'			=> unserialize( urldecode( $_POST['carreras'] ) ),
	'rut'				=> $_POST['rut'],
	'nombre_completo'	=> $_POST['nombre_completo'],
	'valido'			=> TRUE,
);

//You need to finalise the script redirecting the user to your redirect URL
exit( 'https://'.$_SERVER['SERVER_NAME'].'/receiver.php?'.session_name().'='.session_id() );
