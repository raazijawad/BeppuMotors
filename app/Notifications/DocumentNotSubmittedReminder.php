<?php

namespace App\Notifications;

use App\Models\SellAuction;
use Illuminate\Notifications\Notification;

class DocumentNotSubmittedReminder extends Notification
{
    public function __construct(public SellAuction $sellAuction) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'sell_auction_id' => $this->sellAuction->id,
            'vehicle_name' => $this->sellAuction->stock?->name,
            'chassisnumber' => $this->sellAuction->stock?->chassisnumber,
            'auction_price' => (float) $this->sellAuction->auction_price,
        ];
    }
}
