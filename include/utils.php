<?php
/**
 * Generates a random string of a specified length.
 *
 * @param int $length The desired length of the random string.
 * @return string The generated random string.
 */
function random_string($length) {
    $key = '';
    $keys = array_merge(range(0, 9), range('a', 'z'));

    for ($i = 0; $i < $length; $i++) {
        $key .= $keys[array_rand($keys)];
    }

    return $key;
}
?>