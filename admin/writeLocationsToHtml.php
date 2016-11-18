<?php

$data = json_decode($replacement['jsonld']);

$graph = '@graph';
$org = $data->$graph[0];

$locations = implode('', array_map(function ($location) {
  return '<h3 style="margin:1em 0 0;">' . htmlentities($location->name) . '</h3><p>'
    . htmlentities($location->address->streetAddress) . ', '
    . htmlentities($location->address->addressLocality) . ' '
    . htmlentities($location->address->addressCountry); 

}, $org->location ?? []));

$html = between($html, '<!--locations-->', '<!--/locations-->', PHP_EOL . $locations . PHP_EOL);

file_put_contents($filename, $html);
