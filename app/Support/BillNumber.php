<?php

namespace App\Support;

class BillNumber
{
    /**
     * Split a bill number "starting" value into its prefix, starting number and
     * zero-padding width.
     *
     * "AK003" => ["AK", 3, 3], "TYN" => ["TYN", 1, 4].
     *
     * @return array{0: string, 1: int, 2: int}
     */
    public static function parse(?string $starting): array
    {
        $starting = (string) $starting;

        if (preg_match('/^(.*?)(\d+)$/', $starting, $matches)) {
            return [$matches[1], (int) $matches[2], strlen($matches[2])];
        }

        return [$starting, 1, 4];
    }

    public static function format(string $prefix, int $width, int $number): string
    {
        return $prefix.str_pad((string) $number, $width, '0', STR_PAD_LEFT);
    }

    /**
     * Rewrite a stored number created by the legacy scheme (the full
     * "starting" value used as a literal prefix plus a zero-padded counter,
     * e.g. "AK003001") into the current scheme ("AK003").
     *
     * Returns null when the stored value is not in legacy form.
     */
    public static function convert(string $billPrefix, string $stored): ?string
    {
        if ($billPrefix === '' || ! str_starts_with($stored, $billPrefix)) {
            return null;
        }

        $counter = substr($stored, strlen($billPrefix));

        if ($counter === '' || ! ctype_digit($counter)) {
            return null;
        }

        [$prefix, $start, $width] = self::parse($billPrefix);

        return self::format($prefix, $width, max($start, $start + (int) $counter - 1));
    }
}
