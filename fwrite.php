<?php
$file = fopen("markers.txt","w");
$text=serialize($_POST["obj"]);
echo fwrite($file, $text);
fclose($file);
?> 