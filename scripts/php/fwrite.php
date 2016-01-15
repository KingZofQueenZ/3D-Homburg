<?php
$file = fopen("../data/markers.txt","w");
$text=$_POST["obj"];
echo fwrite($file, $text);
fclose($file);
?> 