<?php

namespace Tests\Unit;

use App\Support\BillNumber;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class BillNumberTest extends TestCase
{
    public function test_it_parses_the_starting_value_into_prefix_start_and_width()
    {
        $this->assertSame(['AK', 3, 3], BillNumber::parse('AK003'));
        $this->assertSame(['TYN', 5, 4], BillNumber::parse('TYN0005'));
        $this->assertSame(['TYN', 1, 4], BillNumber::parse('TYN'));
        $this->assertSame(['', 1, 4], BillNumber::parse(null));
    }

    public function test_it_formats_a_number_with_the_prefix_and_padding()
    {
        $this->assertSame('AK003', BillNumber::format('AK', 3, 3));
        $this->assertSame('AK1000', BillNumber::format('AK', 3, 1000));
        $this->assertSame('TYN0002', BillNumber::format('TYN', 4, 2));
    }

    /**
     * @return array<string, array{0: string, 1: string, 2: ?string}>
     */
    public static function conversionProvider(): array
    {
        return [
            'three digit legacy' => ['AK003', 'AK003001', 'AK003'],
            'three digit legacy increments' => ['AK003', 'AK003002', 'AK004'],
            'four digit legacy' => ['AK003', 'AK0030001', 'AK003'],
            'four digit legacy increments' => ['AK003', 'AK0030002', 'AK004'],
            'prefix only is identity' => ['TYN', 'TYN0001', 'TYN0001'],
            'already new format' => ['AK003', 'AK003', null],
            'other prefix' => ['AK003', 'AK004', null],
            'not a number' => ['AK003', 'AK003ABC', null],
            'empty prefix' => ['', 'AK003001', null],
        ];
    }

    #[DataProvider('conversionProvider')]
    public function test_it_converts_legacy_numbers(string $billPrefix, string $stored, ?string $expected)
    {
        $this->assertSame($expected, BillNumber::convert($billPrefix, $stored));
    }
}
