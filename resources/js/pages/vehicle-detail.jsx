import { Head, Link, router, useForm } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { useState } from 'react';
import Footer from '@/components/footer';

export default function VehicleDetail({
    incomes = [],
    customers = [],
    selectedDate = null,
    view = null,
    auctionNotifications = [],
    documentNotifications = [],
}) {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const [selectedDay, setSelectedDay] = useState(today);
    const [filterDate, setFilterDate] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);

    const totalNotificationCount =
        auctionNotifications.length + documentNotifications.length;

    const showList = view === 'list';
    const [showForm, setShowForm] = useState(false);
    const [viewingIncome, setViewingIncome] = useState(null);

    const { data, setData, post, processing, reset } = useForm({
        income_name: '',
        amount: '',
        description: '',
        date: selectedDate || today,
        customer_id: '',
    });

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setSelectedDay(newDate);
        setData('date', newDate);
        setFilterDate(newDate);
    };

    const filteredIncomes = filterDate
        ? incomes.filter((v) => v.date === filterDate)
        : incomes;

    const handleAddIncome = (e) => {
        e.preventDefault();
        post('/incomes', {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <Head title="Vehicle Detail" />
            <nav className="relative h-16 w-full border-b border-white/10 md:h-20">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a]"></div>
                <div className="relative flex h-full items-center pl-6 md:pl-10">
                    {showList ? (
                        <button
                            onClick={() =>
                                router.get(
                                    `/vehicle-detail?date=${selectedDay}`,
                                )
                            }
                            className="text-sm font-medium text-white/70 hover:text-white"
                        >
                            &larr; Back
                        </button>
                    ) : (
                        <Link
                            href="/"
                            className="text-sm font-medium text-white/70 hover:text-white"
                        >
                            &larr; Back
                        </Link>
                    )}
                    <span className="ml-4 text-sm font-semibold text-white">
                        Vehicle Details Page
                    </span>
                    <div className="relative mr-4 ml-auto md:mr-8">
                        <button
                            onClick={() => setShowNotifications((v) => !v)}
                            className="relative flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10"
                            aria-label="Notifications"
                        >
                            <Bell className="h-5 w-5" />
                            {totalNotificationCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                    {totalNotificationCount}
                                </span>
                            )}
                        </button>
                        {showNotifications && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowNotifications(false)}
                                />
                                <div className="absolute top-11 right-0 z-50 w-72 overflow-hidden rounded-lg border border-[#19140035] bg-white shadow-lg md:w-80 dark:border-[#3E3E3A] dark:bg-[#161615]">
                                    <div className="border-b border-[#19140035] px-4 py-2.5 text-sm font-semibold dark:border-[#3E3E3A]">
                                        Notifications
                                    </div>
                                    {totalNotificationCount === 0 ? (
                                        <p className="px-4 py-6 text-center text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                            No notifications.
                                        </p>
                                    ) : (
                                        <div className="max-h-80 overflow-y-auto">
                                            {auctionNotifications.map((n) => (
                                                <button
                                                    key={n.id}
                                                    onClick={() => {
                                                        setShowNotifications(
                                                            false,
                                                        );
                                                        router.get(
                                                            `/auction/buy?highlight=${n.buy_auction_id}`,
                                                        );
                                                    }}
                                                    className="flex w-full flex-col gap-0.5 border-b border-[#19140035]/50 px-4 py-2.5 text-left hover:bg-gray-50 dark:border-[#3E3E3A]/50 dark:hover:bg-[#1a1a19]"
                                                >
                                                    <span className="flex min-w-0 items-center gap-2">
                                                        <span className="shrink-0 text-xs font-medium md:text-sm">
                                                            {n.vehicle_name}
                                                        </span>
                                                        <span className="min-w-0 flex-1 truncate text-[10px] text-[#706f6c] md:text-xs dark:text-[#A1A09A]">
                                                            {n.description}
                                                        </span>
                                                        <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-500 dark:bg-red-900/40">
                                                            Unpaid
                                                        </span>
                                                    </span>
                                                    <span className="flex items-center justify-between text-[10px] text-[#706f6c] md:text-xs dark:text-[#A1A09A]">
                                                        <span>
                                                            {n.shopname ||
                                                                n.date ||
                                                                ''}
                                                        </span>
                                                        <span className="font-semibold text-green-600">
                                                            {parseFloat(
                                                                n.price,
                                                            )}
                                                        </span>
                                                    </span>
                                                </button>
                                            ))}
                                            {documentNotifications.map((n) => (
                                                <button
                                                    key={n.id}
                                                    onClick={() => {
                                                        setShowNotifications(
                                                            false,
                                                        );
                                                        router.get(
                                                            '/auction/sell',
                                                        );
                                                    }}
                                                    className="flex w-full flex-col gap-0.5 border-b border-[#19140035]/50 px-4 py-2.5 text-left hover:bg-gray-50 dark:border-[#3E3E3A]/50 dark:hover:bg-[#1a1a19]"
                                                >
                                                    <span className="flex min-w-0 items-center gap-2">
                                                        <span className="shrink-0 text-xs font-medium md:text-sm">
                                                            {n.vehicle_name}
                                                        </span>
                                                        <span className="min-w-0 flex-1 truncate text-[10px] text-[#706f6c] md:text-xs dark:text-[#A1A09A]">
                                                            {n.chassisnumber ||
                                                                'Sell Auction'}
                                                        </span>
                                                        <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-600 dark:bg-orange-900/40">
                                                            No Document
                                                        </span>
                                                    </span>
                                                    <span className="flex items-center justify-between text-[10px] text-[#706f6c] md:text-xs dark:text-[#A1A09A]">
                                                        <span>
                                                            In sell auction,
                                                            document isn&apos;t
                                                            submitted yet
                                                        </span>
                                                        <span className="font-semibold text-green-600">
                                                            {parseFloat(
                                                                n.price,
                                                            )}
                                                        </span>
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </nav>
            <main className="flex flex-1 flex-col overflow-y-auto bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <div className="flex w-full flex-1 flex-col gap-8 px-6 pt-4 pb-32 md:pt-8">
                    <div className="flex items-center gap-3">
                        <input
                            type="date"
                            value={selectedDay}
                            onChange={handleDateChange}
                            className="rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                        />
                        {filterDate && (
                            <button
                                onClick={() => {
                                    setFilterDate('');
                                    setSelectedDay(today);
                                }}
                                className="rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm font-medium dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                            >
                                Reset
                            </button>
                        )}
                    </div>

                    {showList ? (
                        <div className="mx-auto w-full max-w-md rounded-lg border border-[#19140035] bg-white p-3 shadow-sm md:p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                            <div className="mb-3 flex items-center justify-between md:mb-4">
                                <h2 className="text-base font-semibold md:text-lg">
                                    Income List
                                </h2>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="rounded-md bg-[#00447C] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#003d6f] md:px-4 md:py-2 md:text-sm"
                                >
                                    + Add Income
                                </button>
                            </div>
                            {filteredIncomes.length === 0 ? (
                                <p className="text-xs text-[#706f6c] md:text-sm dark:text-[#A1A09A]">
                                    No income added yet.
                                </p>
                            ) : (
                                <div className="flex flex-col gap-0">
                                    <div className="flex items-center border-b border-[#19140035] pb-1 dark:border-[#3E3E3A]">
                                        <div className="w-20 text-[10px] font-semibold text-[#706f6c] md:w-24 md:text-xs dark:text-[#A1A09A]">
                                            Date
                                        </div>
                                        <div className="w-14 text-[10px] font-semibold text-[#706f6c] md:w-16 md:text-xs dark:text-[#A1A09A]">
                                            Time
                                        </div>
                                        <div className="flex-1 text-[10px] font-semibold text-[#706f6c] md:text-xs dark:text-[#A1A09A]">
                                            Details
                                        </div>
                                        <div className="w-20 text-right text-[10px] font-semibold text-green-600 md:w-24 md:text-xs">
                                            Amount
                                        </div>
                                    </div>
                                    {filteredIncomes.map((v) => (
                                        <div
                                            key={v.id}
                                            onClick={() => setViewingIncome(v)}
                                            className="flex cursor-pointer items-center border-b border-[#19140035]/50 py-1 hover:bg-gray-50 dark:border-[#3E3E3A]/50 dark:hover:bg-[#1a1a19]"
                                        >
                                            <div className="w-20 truncate text-[10px] text-[#706f6c] md:w-24 md:text-xs dark:text-[#A1A09A]">
                                                {v.date || ''}
                                            </div>
                                            <div className="w-14 truncate text-[10px] text-[#706f6c] md:w-16 md:text-xs dark:text-[#A1A09A]">
                                                {v.created_at
                                                    ? new Date(
                                                          v.created_at,
                                                      ).toLocaleTimeString(
                                                          'en-US',
                                                          {
                                                              hour: '2-digit',
                                                              minute: '2-digit',
                                                              hour12: true,
                                                          },
                                                      )
                                                    : ''}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-[10px] font-medium md:text-xs">
                                                    {v.income_name}
                                                </p>
                                                {v.description && (
                                                    <p className="truncate text-[9px] text-[#706f6c] md:text-[10px] dark:text-[#A1A09A]">
                                                        {v.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="w-20 text-right text-[10px] font-semibold text-green-600 md:w-24 md:text-xs">
                                                +{v.amount}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button
                                onClick={() =>
                                    router.get(
                                        `/vehicle-detail?date=${selectedDay}`,
                                    )
                                }
                                className="mt-3 rounded-md border border-[#19140035] px-2.5 py-1.5 text-xs font-medium md:mt-4 md:px-4 md:py-2 md:text-sm dark:border-[#3E3E3A]"
                            >
                                Back
                            </button>
                        </div>
                    ) : (
                        <div className="mt-8 grid w-full grid-cols-2 gap-4 gap-y-5 md:grid-cols-6 md:gap-4">
                            <div
                                onClick={() =>
                                    router.get(
                                        `/vehicle-detail?date=${selectedDay}&view=list`,
                                    )
                                }
                                className="flex h-24 cursor-pointer items-center justify-center rounded-lg border border-[#19140035] bg-white shadow-sm hover:shadow-md md:h-28 dark:border-[#3E3E3A] dark:bg-[#161615]"
                            >
                                <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    +
                                </span>
                            </div>
                            <Link
                                href={`/expenses?date=${selectedDay}`}
                                className="flex h-24 cursor-pointer items-center justify-center rounded-lg border border-[#19140035] bg-white shadow-sm hover:shadow-md md:h-28 dark:border-[#3E3E3A] dark:bg-[#161615]"
                            >
                                <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    -
                                </span>
                            </Link>
                            <Link
                                href={`/stock?date=${selectedDay}`}
                                className="flex h-24 cursor-pointer items-center justify-center rounded-lg border border-[#19140035] bg-white shadow-sm hover:shadow-md md:h-28 dark:border-[#3E3E3A] dark:bg-[#161615]"
                            >
                                <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Stock
                                </span>
                            </Link>
                            <Link
                                href="/customer"
                                className="flex h-24 cursor-pointer items-center justify-center rounded-lg border border-[#19140035] bg-white shadow-sm hover:shadow-md md:h-28 dark:border-[#3E3E3A] dark:bg-[#161615]"
                            >
                                <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Customers
                                </span>
                            </Link>
                            <Link
                                href="/auction"
                                className="flex h-24 cursor-pointer items-center justify-center rounded-lg border border-[#19140035] bg-white shadow-sm hover:shadow-md md:h-28 dark:border-[#3E3E3A] dark:bg-[#161615]"
                            >
                                <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Auction
                                </span>
                            </Link>
                            <Link
                                href={`/cashbook?date=${selectedDay}`}
                                className="flex h-24 cursor-pointer items-center justify-center rounded-lg border border-[#19140035] bg-white shadow-sm hover:shadow-md md:h-28 dark:border-[#3E3E3A] dark:bg-[#161615]"
                            >
                                <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Cash Book
                                </span>
                            </Link>
                            <Link
                                href="/export"
                                className="col-span-2 flex h-20 cursor-pointer items-center justify-center rounded-lg border border-[#19140035] bg-white shadow-sm hover:shadow-md md:col-span-1 md:h-28 dark:border-[#3E3E3A] dark:bg-[#161615]"
                            >
                                <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Export
                                </span>
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-md rounded-lg border border-[#19140035] bg-white p-6 shadow-lg md:mx-0 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <h2 className="mb-4 text-lg font-semibold">
                            Income Information
                        </h2>
                        <form onSubmit={handleAddIncome}>
                            <div className="mb-4">
                                <label className="mb-1 block text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Customer
                                </label>
                                <select
                                    value={data.customer_id}
                                    onChange={(e) =>
                                        setData('customer_id', e.target.value)
                                    }
                                    className="w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                >
                                    <option value="">
                                        Select customer (optional)
                                    </option>
                                    {customers.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="mb-1 block text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Income Name
                                </label>
                                <input
                                    type="text"
                                    value={data.income_name}
                                    onChange={(e) =>
                                        setData('income_name', e.target.value)
                                    }
                                    className="w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                    placeholder="Enter income name"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="mb-1 block text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Amount
                                </label>
                                <input
                                    type="text"
                                    value={data.amount}
                                    onChange={(e) =>
                                        setData('amount', e.target.value)
                                    }
                                    className="w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                    placeholder="Enter amount"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="mb-1 block text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Description
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    className="w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                    placeholder="Enter description"
                                    rows={3}
                                />
                            </div>
                            <input type="hidden" value={data.date} />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-md bg-[#00447C] px-4 py-2 text-sm font-medium text-white hover:bg-[#003d6f]"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        reset();
                                    }}
                                    className="rounded-md border border-[#19140035] px-4 py-2 text-sm font-medium dark:border-[#3E3E3A]"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {viewingIncome && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-md rounded-lg border border-[#19140035] bg-white p-6 shadow-lg md:mx-0 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <h2 className="mb-4 text-lg font-semibold">
                            Income Details
                        </h2>
                        <div className="mb-4 flex flex-col gap-3">
                            <div>
                                <p className="text-[10px] font-medium text-[#706f6c] md:text-xs dark:text-[#A1A09A]">
                                    Income Name
                                </p>
                                <p className="text-sm font-semibold md:text-base">
                                    {viewingIncome.income_name}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-medium text-[#706f6c] md:text-xs dark:text-[#A1A09A]">
                                    Amount
                                </p>
                                <p className="text-sm font-semibold text-green-600 md:text-base">
                                    +{viewingIncome.amount}
                                </p>
                            </div>
                            <div className="flex gap-8">
                                <div>
                                    <p className="text-[10px] font-medium text-[#706f6c] md:text-xs dark:text-[#A1A09A]">
                                        Date
                                    </p>
                                    <p className="text-sm md:text-base">
                                        {viewingIncome.date || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-medium text-[#706f6c] md:text-xs dark:text-[#A1A09A]">
                                        Time
                                    </p>
                                    <p className="text-sm md:text-base">
                                        {viewingIncome.created_at
                                            ? new Date(
                                                  viewingIncome.created_at,
                                              ).toLocaleTimeString('en-US', {
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                                  hour12: true,
                                              })
                                            : '-'}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-medium text-[#706f6c] md:text-xs dark:text-[#A1A09A]">
                                    Description
                                </p>
                                <p className="text-sm whitespace-pre-wrap md:text-base">
                                    {viewingIncome.description || '-'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setViewingIncome(null)}
                            className="rounded-md bg-[#00447C] px-4 py-2 text-sm font-medium text-white hover:bg-[#003d6f]"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}
