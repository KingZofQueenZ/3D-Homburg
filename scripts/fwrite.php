<?php
$file = fopen("../config/markers.txt","w");
$text=$_POST["obj"];
echo fwrite($file, $text);
fclose($file);
?> 