<?php
// La funcion debe imprimir una URL donde ADI dirigira al usuario en caso de exito o '-1' en caso de error

/*
	This script is called by the U-Pasaporte server when an user has been correctly authenticated.
	In this phase you can perform different kind of checks and filtering for this user.
	You can still block a user to access your service from this script.
*/

if( ! $_POST['ticket'] ) exit( -1 );

$url = 'https://www.u-cursos.cl/upasaporte/';
$servicio = 'NOMBRE_DEL_SERVICIO';
$json = file_get_contents( "$url?servicio=$servicio&ticket=".$_POST['ticket'] );
if( ! $json ) exit( -1 );

$datos = json_decode( $json, TRUE );
if( ! $datos ) exit( -1 );

// Si el script llega a este punto, significa que
// ADI valido al usuario con exito y se recibio la informacion en el arreglo $datos
// Este script por su parte debe validar al usuario (por ejemplo, que cumpla un determinado perfil)
// e imprimir una URL donde ADI dirigira al usuario.
// Se recomienda crear una session en este punto y entregar el id en la URL que se imprime
// Ej:


/*
From this point you can perform checks regarding the user information.
The information arrives in the $data array.

We recommend you to start a session and send the session_id as part of the redirect URL.
*/
session_start();
$_SESSION = array(
	'carreras'			=> unserialize( urldecode( $datos['carreras'] ) ),
	'rut'				=> $datos['rut'],
	'nombre_completo'	=> $datos['nombre_completo'],
	'valido'			=> TRUE,
);

//You need to finalise the script redirecting the user to your redirect URL
exit( 'https://'.$_SERVER['SERVER_NAME'].'/receiver.php?'.session_name().'='.session_id() );
