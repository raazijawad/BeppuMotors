<?php

use App\Models\BuyAuction;
use App\Models\SellAuction;
use App\Models\User;
use App\Notifications\DocumentNotSubmittedReminder;
use App\Notifications\UnpaidAuctionReminder;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function () {
    $users = User::all();

    BuyAuction::where('paid', false)
        ->chunkById(100, function ($buyAuctions) use ($users) {
            foreach ($buyAuctions as $buyAuction) {
                foreach ($users as $user) {
                    $alreadyReminded = $user
                        ->notifications()
                        ->where('type', UnpaidAuctionReminder::class)
                        ->whereNull('read_at')
                        ->where('data->buy_auction_id', $buyAuction->id)
                        ->exists();

                    if (! $alreadyReminded) {
                        $user->notify(new UnpaidAuctionReminder($buyAuction));
                    }
                }
            }
        });
})
    ->dailyAt('09:00')
    ->timezone('Asia/Tokyo')
    ->name('unpaid-auction-reminders')
    ->withoutOverlapping();

Schedule::call(function () {
    $users = User::all();

    SellAuction::where('document_submitted', false)
        ->whereDate('created_at', '<', today())
        ->with('stock')
        ->chunkById(100, function ($sellAuctions) use ($users) {
            foreach ($sellAuctions as $sellAuction) {
                foreach ($users as $user) {
                    $alreadyReminded = $user
                        ->notifications()
                        ->where('type', DocumentNotSubmittedReminder::class)
                        ->whereNull('read_at')
                        ->where('data->sell_auction_id', $sellAuction->id)
                        ->exists();

                    if (! $alreadyReminded) {
                        $user->notify(
                            new DocumentNotSubmittedReminder($sellAuction),
                        );
                    }
                }
            }
        });
})
    ->dailyAt('09:00')
    ->timezone('Asia/Tokyo')
    ->name('document-submission-reminders')
    ->withoutOverlapping();
