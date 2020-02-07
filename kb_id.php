<?php

ini_set("display_errors", 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$file_name = ('./kb_id_results/' . $_POST['filename_post']);
$subject_results = $_POST['results_post'];
$outcome = file_put_contents($file_name, $subject_results, FILE_APPEND);

if ($outcome > 500 AND substr($file_name, -4) === ".txt" AND substr($file_name, -19, 4) === "_202") {
    echo 'written: ' . $outcome;
} else {
    if (is_file($file_name) === FALSE) {
        echo "Failed to save file " . $file_name . "! Please do not close this page, but contact gaspar.lukacs@univie.ac.at! (" . $outcome . ")";
    } else if ($outcome > 500) {
        echo "Failed to save file due to incorrect data! Please do not close this page, but contact gaspar.lukacs@univie.ac.at! (" . $file_name . ")";
    } else {
        echo "Failed to properly save file " . $file_name . "! Please do not close this page, but contact gaspar.lukacs@univie.ac.at! (" . $outcome . ")";
    }
}

?>
