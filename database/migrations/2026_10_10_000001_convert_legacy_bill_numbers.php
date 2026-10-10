<?php

use App\Models\Customer;
use App\Support\BillNumber;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    public function up(): void
    {
        Customer::query()
            ->whereNotNull('bill_prefix')
            ->chunkById(100, function ($customers) {
                foreach ($customers as $customer) {
                    $this->convertCustomer($customer);
                }
            });
    }

    private function convertCustomer(Customer $customer): void
    {
        $billPrefix = (string) $customer->bill_prefix;

        $storedNumbers = $customer->invoices()
            ->whereNotNull('bill_number')
            ->pluck('bill_number')
            ->unique()
            ->values();

        $conversions = [];
        foreach ($storedNumbers as $stored) {
            $converted = BillNumber::convert($billPrefix, $stored);

            if ($converted !== null && $converted !== $stored) {
                $conversions[$stored] = $converted;
            }
        }

        if ($conversions === []) {
            return;
        }

        $taken = array_fill_keys(
            $storedNumbers
                ->reject(fn ($number) => array_key_exists($number, $conversions))
                ->all(),
            true,
        );

        ksort($conversions);

        foreach ($conversions as $stored => $converted) {
            if (isset($taken[$converted])) {
                Log::warning('Skipped bill number conversion due to collision.', [
                    'customer_id' => $customer->id,
                    'bill_number' => $stored,
                    'target' => $converted,
                ]);

                continue;
            }

            $taken[$converted] = true;

            $customer->invoices()
                ->where('bill_number', $stored)
                ->update(['bill_number' => $converted]);
        }
    }

    public function down(): void
    {
        // Legacy bill numbers cannot be restored.
    }
};
