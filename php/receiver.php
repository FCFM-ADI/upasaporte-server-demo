<?php
session_id( $_GET[ session_name() ] );
session_start();

print '<pre>Authentication has successully finished<br>';
print_r($_SESSION);
