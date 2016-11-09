<?php

if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = '';
        foreach($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
        return $headers;
    }
}


function between ($content, $start, $end, $replace = false) {
    $r = explode($start, $content);
    if (isset($r[1])){
        $s = explode($end, $r[1]);
        return $replace ? $r[0] . $start . $replace . $end . $s[1] : $s[0];
    }
    return $replace ? $content : '';
}

