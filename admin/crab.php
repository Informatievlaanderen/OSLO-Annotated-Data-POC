<?php

require 'helpers.php';

$path = $_REQUEST['pa'];
$method = $_SERVER['REQUEST_METHOD'];

// Start curl
$curlRequest = curl_init('http://crab.agiv.be' . $path);
curl_setopt($curlRequest, CURLINFO_HEADER_OUT, true); // enable tracking

// Send cookies
$cookies = [];
foreach ($_COOKIE as $key => $value) {
    $cookies[] = $key . '=' . $value;
}
curl_setopt($curlRequest, CURLOPT_COOKIE, implode('; ', $cookies));

// Send headers
$headers = [];
foreach (getallheaders() as $name => $value) {
    if (substr(strtolower($name), 0, 6) == 'x-soap' && !empty($value)) {
        $headers[] = substr($name, 7) . ': ' . $value;
    }
}
curl_setopt($curlRequest, CURLOPT_HEADER, true);
curl_setopt($curlRequest, CURLOPT_HTTPHEADER, $headers);

// More curl options
curl_setopt($curlRequest, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($curlRequest, CURLOPT_RETURNTRANSFER, true);
// curl_setopt( $curlRequest, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT'] );

// Add POST data
if (!in_array($method, ['GET', 'HEAD', 'DELETE'])) {
    $data = file_get_contents('php://input');

    if ($method == 'POST') {
        curl_setopt($curlRequest, CURLOPT_POST, true);
    } else {
        curl_setopt($curlRequest, CURLOPT_CUSTOMREQUEST, $method);
    }
    if ($method != 'DELETE') {
        curl_setopt($curlRequest, CURLOPT_POSTFIELDS, $data);
    }
    $information = curl_getinfo($curlRequest, CURLINFO_HEADER_OUT ); 

    // exit(json_encode($headers));
    // exit(json_encode($information));
}

// Execute curl request
$response = curl_exec($curlRequest);

$split = preg_split('/([\r\n][\r\n])\\1/', $response, 2);
$header = $split[0];
$contents = $split[1] ?? '';

// Propagate response code
$status = curl_getinfo($curlRequest, CURLINFO_HTTP_CODE);
http_response_code($status);

curl_close($curlRequest);

// Propagate headers to response.
$headerText = preg_split('/[\r\n]+/', $header);
foreach ($headerText as $header) {
    header($header);
}

// Note: this works only because the two strings are the same length!
$contents = str_replace('http://crab.agiv.be/', '/admin/crab.php?pa=/', $contents);

// Finished
echo $contents;
