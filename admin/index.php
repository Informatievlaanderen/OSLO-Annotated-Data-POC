<?php

require 'helpers.php';

// Config
$filename = '../example/index.html';
$pageUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']) . 'example/';

// Current state
$html = file_get_contents($filename);
$jsonld = trim(between($html, 'type="application/ld+json">', '</script'));

// Make sure there is a json-ld script tag
if (empty($jsonld)) {
	if (strpos($html, '</body>')) {
		$html = str_replace('</body>', '<script type="application/ld+json">{}</script></body>', $html);
	} elseif (strpos($html, '</head>')) {
		$html = str_replace('</head>', '<script type="application/ld+json">{}</script></head>', $html);
	}
	$jsonld = between($html, 'type="application/ld+json">', '</script');
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
	$out['before'] = strlen($html);

	// Replace json-ld
	$replacement = json_decode(file_get_contents('php://input'), true);
	$html = between($html, 'type="application/ld+json">', '</script', PHP_EOL . trim($replacement['jsonld']) . PHP_EOL);
	$out['after'] = strlen($html);
	$out['written'] = file_put_contents($filename, $html);
	$out['success'] = $out['written'] && ($out['after'] != $out['written']);

	require 'writeLocationsToHtml.php';
	exit(json_encode($out));
}

require 'template.html.php';
