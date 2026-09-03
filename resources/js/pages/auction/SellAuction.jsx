import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import Footer from '@/components/footer';

export default function SellAuction({ sellAuctions = [], stocks = [] }) {
    const [showPicker, setShowPicker] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [confirmSoldId, setConfirmSoldId] = useState(null);
    const [confirmDocumentId, setConfirmDocumentId] = useState(null);
    const [editingPrice, setEditingPrice] = useState(null);
    const [priceValue, setPriceValue] = useState('');
    const [selectedStock, setSelectedStock] = useState(null);
    const [auctionPriceValue, setAuctionPriceValue] = useState('');
    const [auctionError, setAuctionError] = useState('');

    const openSelectModal = (s) => {
        setSelectedStock(s);
        setAuctionPriceValue('');
        setAuctionError('');
    };

    const handleAuctionSubmit = (e) => {
        e.preventDefault();
        if (!selectedStock) return;
        router.post(
            '/auction/sell',
            { stock_id: selectedStock.id, auction_price: auctionPriceValue },
            {
                onSuccess: () => {
                    setShowPicker(false);
                    setSelectedStock(null);
                    setAuctionPriceValue('');
                    setAuctionError('');
                },
                onError: (errors) => {
                    setAuctionError(
                        errors.stock_id ?? 'Failed to add vehicle.',
                    );
                },
            },
        );
    };

    const handleHoldSubmit = (e) => {
        e.preventDefault();
        if (!selectedStock) return;
        router.post(
            '/auction/sell',
            { stock_id: selectedStock.id, auction_price: null },
            {
                onSuccess: () => {
                    setShowPicker(false);
                    setSelectedStock(null);
                    setAuctionPriceValue('');
                    setAuctionError('');
                },
                onError: (errors) => {
                    setAuctionError(
                        errors.stock_id ?? 'Failed to add vehicle.',
                    );
                },
            },
        );
    };

    const openPriceModal = (item) => {
        setEditingPrice(item.id);
        setPriceValue(item.auction_price ?? '');
    };

    const handlePriceSubmit = (e) => {
        e.preventDefault();
        if (!editingPrice) return;
        router.put(
            `/auction/sell/${editingPrice}`,
            { auction_price: priceValue },
            {
                onSuccess: () => {
                    setEditingPrice(null);
                    setPriceValue('');
                },
            },
        );
    };

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <Head title="Sell Auction" />
            <nav className="relative h-16 w-full border-b border-white/10 md:h-20">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a]"></div>
                <div className="relative flex h-full items-center pl-6 md:pl-10">
                    <Link
                        href="/auction"
                        className="text-sm font-medium text-white/70 hover:text-white"
                    >
                        &larr; Back
                    </Link>
                    <span className="ml-4 text-sm font-semibold text-white">
                        Sell Auction
                    </span>
                </div>
            </nav>
            <main className="flex flex-1 overflow-y-auto bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <div className="flex w-full flex-col gap-3 px-6 pt-4 pb-6 md:gap-6 md:pt-8 md:pb-20">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                            Sell Auction Items
                        </span>
                        <button
                            onClick={() => setShowPicker(true)}
                            className="rounded-md bg-[#00447C] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#003d6f] md:px-4 md:py-2 md:text-sm"
                        >
                            + Sell Vehicle
                        </button>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-[#19140035] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <table className="w-full text-left text-[10px] md:text-xs">
                            <thead className="border-b border-[#19140035] dark:border-[#3E3E3A]">
                                <tr className="bg-[#FDFDFC] dark:bg-[#0a0a0a]">
                                    <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">
                                        Name
                                    </th>
                                    <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">
                                        Company
                                    </th>
                                    <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">
                                        Colour
                                    </th>
                                    <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">
                                        Shop
                                    </th>
                                    <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">
                                        Chassis
                                    </th>
                                    <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">
                                        Description
                                    </th>
                                    <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">
                                        Price
                                    </th>
                                    <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">
                                        T Price
                                    </th>
                                    <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">
                                        N Price
                                    </th>
                                    <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">
                                        A Price
                                    </th>
                                    <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">
                                        Expected Profit
                                    </th>
                                    <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">
                                        Auction Price
                                    </th>
                                    <th className="border-l border-[#19140035] px-2 py-2 dark:border-[#3E3E3A]"></th>
                                    <th className="border-l border-[#19140035] px-2 py-2 dark:border-[#3E3E3A]"></th>
                                    <th className="border-l border-[#19140035] px-2 py-2 dark:border-[#3E3E3A]"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sellAuctions.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={15}
                                            className="px-2 py-6 text-center text-[#706f6c] dark:text-[#A1A09A]"
                                        >
                                            No vehicles added for sale yet.
                                        </td>
                                    </tr>
                                ) : (
                                    sellAuctions.map((item) => (
                                        <tr
                                            key={item.id}
                                            className={`border-b border-[#19140035]/50 dark:border-[#3E3E3A]/50 ${item.sold ? 'bg-green-100 dark:bg-green-900/30' : 'hover:bg-gray-50 dark:hover:bg-[#1a1a19]'}`}
                                        >
                                            <td className="px-2 py-1.5 font-medium">
                                                {item.stock?.name}
                                            </td>
                                            <td className="px-2 py-1.5">
                                                {item.stock?.company}
                                            </td>
                                            <td className="px-2 py-1.5">
                                                {item.stock?.colour}
                                            </td>
                                            <td className="px-2 py-1.5">
                                                {item.stock?.shopname}
                                            </td>
                                            <td className="px-2 py-1.5">
                                                {item.stock?.chassisnumber}
                                            </td>
                                            <td className="max-w-[120px] truncate px-2 py-1.5">
                                                {item.stock?.description}
                                            </td>
                                            <td className="px-2 py-1.5">
                                                {parseFloat(
                                                    item.stock?.price ?? 0,
                                                )}
                                            </td>
                                            <td className="px-2 py-1.5">
                                                {parseFloat(
                                                    item.stock?.t_price ?? 0,
                                                )}
                                            </td>
                                            <td className="px-2 py-1.5">
                                                {parseFloat(
                                                    item.stock?.n_price ?? 0,
                                                )}
                                            </td>
                                            <td className="px-2 py-1.5">
                                                {parseFloat(
                                                    item.stock?.a_price ?? 0,
                                                )}
                                            </td>
                                            <td className="px-2 py-1.5 font-semibold text-green-600">
                                                {parseFloat(
                                                    item.stock
                                                        ?.expected_profit ?? 0,
                                                )}
                                            </td>
                                            <td
                                                onClick={() =>
                                                    openPriceModal(item)
                                                }
                                                className="cursor-pointer px-2 py-1.5 font-semibold text-[#00447C] hover:underline dark:text-blue-400"
                                            >
                                                {item.auction_price !== null &&
                                                item.auction_price !== undefined
                                                    ? parseFloat(
                                                          item.auction_price,
                                                      )
                                                    : 'Set Price'}
                                            </td>
                                            {item.sold ? (
                                                <td className="border-l border-[#19140035] px-2 py-1.5 text-center font-semibold text-green-700 dark:border-[#3E3E3A] dark:text-green-400">
                                                    Sold
                                                </td>
                                            ) : (
                                                <td
                                                    onClick={() => {
                                                        if (
                                                            !item.document_submitted
                                                        ) {
                                                            toast.error(
                                                                'Document not submitted. Cannot be sold — please submit the document first.',
                                                            );
                                                            return;
                                                        }
                                                        setConfirmSoldId(
                                                            item.id,
                                                        );
                                                    }}
                                                    className="cursor-pointer border-l border-[#19140035] px-2 py-1.5 text-center font-medium text-green-600 hover:bg-green-50 dark:border-[#3E3E3A] dark:hover:bg-green-900/30"
                                                >
                                                    Sold
                                                </td>
                                            )}
                                            <td
                                                onClick={() => {
                                                    if (!item.sold)
                                                        setConfirmDeleteId(
                                                            item.id,
                                                        );
                                                }}
                                                className={`border-l border-[#19140035] px-2 py-1.5 text-right font-medium text-red-600 dark:border-[#3E3E3A] ${item.sold ? '' : 'cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/30'}`}
                                            >
                                                {item.sold ? null : 'Unsold'}
                                            </td>
                                            <td
                                                onClick={() => {
                                                    if (
                                                        !item.sold &&
                                                        !item.document_submitted
                                                    )
                                                        setConfirmDocumentId(
                                                            item.id,
                                                        );
                                                }}
                                                className={`border-l border-[#19140035] px-2 py-1.5 text-center font-semibold dark:border-[#3E3E3A] ${item.document_submitted ? 'bg-[#00447C] text-white' : 'cursor-pointer bg-white text-[#00447C] hover:bg-[#00447C]/10 dark:bg-transparent dark:text-blue-400'}`}
                                            >
                                                Document
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {showPicker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-2xl rounded-lg border border-[#19140035] bg-white p-5 shadow-lg md:p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-base font-semibold md:text-lg">
                                Select Vehicle to Sell
                            </h2>
                            <button
                                onClick={() => setShowPicker(false)}
                                className="text-sm text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-white"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-[#19140035] dark:border-[#3E3E3A]">
                            <table className="w-full text-left text-[10px] md:text-xs">
                                <thead className="sticky top-0 border-b border-[#19140035] bg-white dark:border-[#3E3E3A] dark:bg-[#161615]">
                                    <tr>
                                        <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">
                                            Name
                                        </th>
                                        <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">
                                            Company
                                        </th>
                                        <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">
                                            Colour
                                        </th>
                                        <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">
                                            Chassis
                                        </th>
                                        <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">
                                            Price
                                        </th>
                                        <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stocks.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-2 py-6 text-center text-[#706f6c] dark:text-[#A1A09A]"
                                            >
                                                No available stock vehicles.
                                            </td>
                                        </tr>
                                    ) : (
                                        stocks.map((s) => (
                                            <tr
                                                key={s.id}
                                                className="border-b border-[#19140035]/50 last:border-b-0 dark:border-[#3E3E3A]/50"
                                            >
                                                <td className="px-2 py-1.5 font-medium">
                                                    {s.name}
                                                </td>
                                                <td className="px-2 py-1.5">
                                                    {s.company}
                                                </td>
                                                <td className="px-2 py-1.5">
                                                    {s.colour}
                                                </td>
                                                <td className="px-2 py-1.5">
                                                    {s.chassisnumber}
                                                </td>
                                                <td className="px-2 py-1.5">
                                                    {parseFloat(s.price)}
                                                </td>
                                                <td className="px-2 py-1.5 text-right">
                                                    <button
                                                        onClick={() =>
                                                            openSelectModal(s)
                                                        }
                                                        className="rounded-md bg-[#00447C] px-2 py-1 text-[10px] font-medium text-white hover:bg-[#003d6f] disabled:opacity-50 md:text-xs"
                                                    >
                                                        Select
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {confirmDeleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-sm rounded-lg border border-[#19140035] bg-white p-5 shadow-lg md:p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <h2 className="mb-4 text-base font-semibold md:text-lg">
                            Mark as Unsold
                        </h2>
                        <p className="mb-4 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            Are you sure you want to mark this vehicle as
                            unsold? It will go back to the stock page.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    router.delete(
                                        `/auction/sell/${confirmDeleteId}`,
                                    );
                                    setConfirmDeleteId(null);
                                }}
                                className="rounded-md bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700 md:text-sm"
                            >
                                Unsold
                            </button>
                            <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="rounded-md border border-[#19140035] px-4 py-2 text-xs font-medium md:text-sm dark:border-[#3E3E3A]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedStock && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-sm rounded-lg border border-[#19140035] bg-white p-5 shadow-lg md:p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <h2 className="mb-4 text-base font-semibold md:text-lg">
                            Sell Vehicle
                        </h2>
                        <p className="mb-4 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            Adding{' '}
                            <span className="font-semibold text-[#1b1b18] dark:text-white">
                                {selectedStock.name}
                            </span>{' '}
                            to sell auction.
                        </p>
                        <form onSubmit={handleAuctionSubmit}>
                            {auctionError && (
                                <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                    {auctionError}
                                </p>
                            )}
                            <label className="mb-1 block text-[10px] font-medium text-[#706f6c] md:text-xs dark:text-[#A1A09A]">
                                Auction Price
                            </label>
                            <input
                                type="number"
                                value={auctionPriceValue}
                                onChange={(e) =>
                                    setAuctionPriceValue(e.target.value)
                                }
                                className="mb-4 w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs md:py-2 md:text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                placeholder="Optional — set later"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={router.processing}
                                    className="rounded-md bg-[#00447C] px-4 py-2 text-xs font-medium text-white hover:bg-[#003d6f] disabled:opacity-50 md:text-sm"
                                >
                                    Add to Sell Auction
                                </button>
                                <button
                                    type="button"
                                    onClick={handleHoldSubmit}
                                    disabled={router.processing}
                                    className="rounded-md border border-[#19140035] px-4 py-2 text-xs font-medium text-[#706f6c] hover:bg-gray-50 md:text-sm dark:border-[#3E3E3A] dark:text-[#A1A09A] dark:hover:bg-[#1a1a19]"
                                >
                                    Hold
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedStock(null)}
                                    className="rounded-md border border-[#19140035] px-4 py-2 text-xs font-medium md:text-sm dark:border-[#3E3E3A]"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {confirmSoldId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-sm rounded-lg border border-[#19140035] bg-white p-5 shadow-lg md:p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <h2 className="mb-4 text-base font-semibold md:text-lg">
                            Confirm Sold
                        </h2>
                        <p className="mb-4 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            Are you sure you want to mark this vehicle as sold?
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    router.post(
                                        `/auction/sell/${confirmSoldId}/sold`,
                                    );
                                    setConfirmSoldId(null);
                                }}
                                className="rounded-md bg-green-600 px-4 py-2 text-xs font-medium text-white hover:bg-green-700 md:text-sm"
                            >
                                Confirm Sold
                            </button>
                            <button
                                onClick={() => setConfirmSoldId(null)}
                                className="rounded-md border border-[#19140035] px-4 py-2 text-xs font-medium md:text-sm dark:border-[#3E3E3A]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmDocumentId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-sm rounded-lg border border-[#19140035] bg-white p-5 shadow-lg md:p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <h2 className="mb-4 text-base font-semibold md:text-lg">
                            Confirm Documents
                        </h2>
                        <p className="mb-4 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            Have the documents been submitted for this vehicle?
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    router.post(
                                        `/auction/sell/${confirmDocumentId}/documents`,
                                    );
                                    setConfirmDocumentId(null);
                                }}
                                className="rounded-md bg-[#00447C] px-4 py-2 text-xs font-medium text-white hover:bg-[#003d6f] md:text-sm"
                            >
                                Submitted
                            </button>
                            <button
                                onClick={() => setConfirmDocumentId(null)}
                                className="rounded-md border border-[#19140035] px-4 py-2 text-xs font-medium md:text-sm dark:border-[#3E3E3A]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editingPrice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-sm rounded-lg border border-[#19140035] bg-white p-5 shadow-lg md:p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <h2 className="mb-4 text-base font-semibold md:text-lg">
                            Set Auction Price
                        </h2>
                        <form onSubmit={handlePriceSubmit}>
                            <label className="mb-1 block text-[10px] font-medium text-[#706f6c] md:text-xs dark:text-[#A1A09A]">
                                Auction Price
                            </label>
                            <input
                                type="number"
                                value={priceValue}
                                onChange={(e) => setPriceValue(e.target.value)}
                                className="mb-4 w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs md:py-2 md:text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                required
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={router.processing}
                                    className="rounded-md bg-[#00447C] px-4 py-2 text-xs font-medium text-white hover:bg-[#003d6f] disabled:opacity-50 md:text-sm"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingPrice(null);
                                        setPriceValue('');
                                    }}
                                    className="rounded-md border border-[#19140035] px-4 py-2 text-xs font-medium md:text-sm dark:border-[#3E3E3A]"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div
                className={
                    showPicker ||
                    confirmDeleteId ||
                    confirmSoldId ||
                    confirmDocumentId ||
                    editingPrice ||
                    selectedStock
                        ? 'pointer-events-none blur-sm'
                        : ''
                }
            >
                <Footer />
            </div>
        </div>
    );
}
