<?php

namespace App\Http\Controllers;

use App\Models\BuyAuction;
use App\Models\Customer;
use App\Models\Drawer;
use App\Models\Income;
use App\Models\SellAuction;
use App\Models\Stock;
use App\Notifications\DocumentNotSubmittedReminder;
use App\Notifications\FaxReminder;
use App\Notifications\UnpaidAuctionReminder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IncomeController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        if ($request->query('view') === 'list') {
            $date = $request->query('date');

            return redirect('/incomes'.($date ? '?date='.$date : ''));
        }

        $date = $request->query('date');
        $month = $date ? substr($date, 0, 7) : now()->format('Y-m');

        return Inertia::render('vehicle-detail', [
            'selectedDate' => $date,
            'selectedMonth' => $month,
            'auctionNotifications' => Inertia::defer(fn () => $this->auctionNotifications($request)),
            'faxNotifications' => Inertia::defer(fn () => $this->faxNotifications($request)),
            'documentNotifications' => Inertia::defer(fn () => $this->documentNotifications($request)),
            'stockNotifications' => Inertia::defer(fn () => $this->stockNotifications()),
        ]);
    }

    public function incomeIndex(Request $request): Response
    {
        $date = $request->query('date');
        $month = $date ? substr($date, 0, 7) : now()->format('Y-m');

        return Inertia::render('income', [
            'incomes' => Income::with('customer:id,name')
                ->select([
                    'id',
                    'user_id',
                    'customer_id',
                    'income_name',
                    'amount',
                    'description',
                    'date',
                    'sell_auction_id',
                    'created_at',
                ])
                ->where('date', '>=', $month.'-01')
                ->where('date', '<', date('Y-m-d', strtotime($month.'-01 +1 month')))
                ->latest()
                ->get(),
            'customers' => Customer::orderBy('name')->select(['id', 'name'])->get(),
            'drawers' => Drawer::latest()
                ->select(['id', 'name', 'amount', 'parent_id', 'date', 'created_at'])
                ->get(),
            'selectedDate' => $date,
            'selectedMonth' => $month,
        ]);
    }

    private function auctionNotifications(Request $request): array
    {
        $notifications = $request->user()
            ->unreadNotifications()
            ->where('type', UnpaidAuctionReminder::class)
            ->latest()
            ->get();

        $vehicles = BuyAuction::whereIn(
            'id',
            $notifications->pluck('data.buy_auction_id')->filter()->unique()
        )->get()->keyBy('id');

        return $notifications
            ->map(fn ($notification) => [
                'id' => $notification->id,
                'buy_auction_id' => $notification->data['buy_auction_id'] ?? null,
                'vehicle_name' => $notification->data['vehicle_name'] ?? null,
                'price' => $notification->data['price'] ?? null,
                'date' => $vehicles[$notification->data['buy_auction_id'] ?? null]->date ?? null,
                'shopname' => $vehicles[$notification->data['buy_auction_id'] ?? null]->shopname ?? null,
                'description' => $vehicles[$notification->data['buy_auction_id'] ?? null]->description ?? null,
            ])
            ->filter(fn ($notification) => isset($vehicles[$notification['buy_auction_id']]))
            ->values()
            ->toArray();
    }

    private function faxNotifications(Request $request): array
    {
        $notifications = $request->user()
            ->unreadNotifications()
            ->where('type', FaxReminder::class)
            ->latest()
            ->get();

        $vehicles = BuyAuction::whereIn(
            'id',
            $notifications->pluck('data.buy_auction_id')->filter()->unique()
        )->get()->keyBy('id');

        return $notifications
            ->map(fn ($notification) => [
                'id' => $notification->id,
                'buy_auction_id' => $notification->data['buy_auction_id'] ?? null,
                'vehicle_name' => $notification->data['vehicle_name'] ?? null,
                'date' => $vehicles[$notification->data['buy_auction_id'] ?? null]->date ?? null,
                'shopname' => $vehicles[$notification->data['buy_auction_id'] ?? null]->shopname ?? null,
                'faxed' => (bool) ($vehicles[$notification->data['buy_auction_id'] ?? null]->fax ?? false),
                'fax_confirmed' => (bool) ($vehicles[$notification->data['buy_auction_id'] ?? null]->fax_confirmed ?? false),
            ])
            ->filter(fn ($notification) => isset($vehicles[$notification['buy_auction_id']]))
            ->filter(fn ($notification) => ! $notification['faxed'] || ! $notification['fax_confirmed'])
            ->values()
            ->toArray();
    }

    private function documentNotifications(Request $request): array
    {
        $notifications = $request->user()
            ->unreadNotifications()
            ->where('type', DocumentNotSubmittedReminder::class)
            ->latest()
            ->get();

        $sellAuctions = SellAuction::with('stock')
            ->whereIn(
                'id',
                $notifications
                    ->pluck('data.sell_auction_id')
                    ->filter()
                    ->unique(),
            )
            ->get()
            ->keyBy('id');

        return $notifications
            ->map(function ($notification) use ($sellAuctions) {
                $sellAuction = $sellAuctions[$notification->data['sell_auction_id'] ?? null] ?? null;
                $documentSubmitted = (bool) ($sellAuction?->document_submitted
                    ?? ($notification->data['document_submitted'] ?? false));
                $priceIsSet = $sellAuction !== null
                    ? $sellAuction->auction_price !== null
                    : ($notification->data['auction_price'] ?? null) !== null;

                return [
                    'id' => $notification->id,
                    'sell_auction_id' => $notification->data['sell_auction_id'] ?? null,
                    'vehicle_name' => $sellAuction?->stock?->name
                        ?? ($notification->data['vehicle_name'] ?? null),
                    'chassisnumber' => $sellAuction?->stock?->chassisnumber
                        ?? ($notification->data['chassisnumber'] ?? null),
                    'price' => $notification->data['auction_price'] ?? null,
                    'document_submitted' => $documentSubmitted,
                    'price_is_set' => $priceIsSet,
                ];
            })
            ->filter(fn ($notification) => isset($sellAuctions[$notification['sell_auction_id']]))
            ->filter(fn ($notification) => ! $notification['document_submitted'] || ! $notification['price_is_set'])
            ->values()
            ->toArray();
    }

    private function stockNotifications(): array
    {
        return Stock::query()
            ->doesntHave('invoices')
            ->doesntHave('sellAuctions')
            ->where(function ($query) {
                $query->where('vehicle_received', false)
                    ->orWhere('document_received', false)
                    ->orWhere('masho_fax', false);
            })
            ->select(['id', 'name', 'chassisnumber', 'vehicle_received', 'document_received', 'masho_fax'])
            ->latest()
            ->get()
            ->map(fn ($stock) => [
                'id' => 'stock-'.$stock->id,
                'stock_id' => $stock->id,
                'vehicle_name' => $stock->name,
                'chassisnumber' => $stock->chassisnumber,
                'vehicle_received' => (bool) $stock->vehicle_received,
                'document_received' => (bool) $stock->document_received,
                'masho_fax' => (bool) $stock->masho_fax,
            ])
            ->toArray();
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'income_name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0|max:99999999.99',
            'description' => 'nullable|string|max:1000',
            'date' => 'required|date',
            'customer_id' => 'nullable|exists:customers,id',
            'drawer_id' => 'required|exists:drawers,id',
        ]);

        $request->user()->incomes()->create($validated);

        if (! empty($validated['drawer_id'])) {
            $drawer = Drawer::findOrFail($validated['drawer_id']);
            $parentId = $drawer->parent_id ?? $drawer->id;
            $newAmount = floatval($drawer->amount) + floatval($validated['amount']);

            $request->user()->drawers()->create([
                'name' => $drawer->name,
                'amount' => $newAmount,
                'date' => $validated['date'],
                'parent_id' => $parentId,
                'source_type' => 'income',
                'message' => "Income '{$validated['income_name']}' added +{$validated['amount']}",
            ]);
        }

        return back();
    }

    public function destroy(Income $income): RedirectResponse
    {
        $income->delete();

        return back();
    }
}
