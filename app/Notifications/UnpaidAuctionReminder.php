<?php

namespace App\Notifications;

use App\Models\BuyAuction;
use Illuminate\Notifications\Notification;

class UnpaidAuctionReminder extends Notification
{
    public function __construct(public BuyAuction $buyAuction)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'buy_auction_id' => $this->buyAuction->id,
            'vehicle_name' => $this->buyAuction->vehicle_name,
            'price' => (float) $this->buyAuction->price,
        ];
    }
}
