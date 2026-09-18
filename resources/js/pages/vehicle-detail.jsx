import { Deferred, Head, Link, router, usePage } from '@inertiajs/react';
import { Bell, User, UserCheck } from 'lucide-react';
import { useState } from 'react';
import Footer from '@/components/footer';

export default function VehicleDetail({
    selectedMonth = null,
    auctionNotifications = [],
    documentNotifications = [],
}) {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const user = usePage().props.auth?.user ?? null;
    const isAdmin = user?.role === 'admin';
    const [activeMonth, setActiveMonth] = useState(
        selectedMonth || currentMonth,
    );
    const [showNotifications, setShowNotifications] = useState(false);

    const safeAuctionNotifications = auctionNotifications ?? [];
    const safeDocumentNotifications = documentNotifications ?? [];

    const totalNotificationCount =
        safeAuctionNotifications.length + safeDocumentNotifications.length;

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <Head title="Vehicle Detail" />
            <nav className="relative h-16 w-full border-b border-white/10 md:h-20">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a]"></div>
                <div className="relative flex h-full items-center pl-6 md:pl-10">
                    <Link
                        href="/"
                        prefetch={['mount', 'hover']}
                        cacheFor={300000}
                        className="text-sm font-medium text-white/70 hover:text-white"
                    >
                        &larr; Back
                    </Link>
                    <span className="ml-4 text-sm font-semibold text-white">
                        Vehicle Details Page
                    </span>
                    <div className="relative mr-4 ml-auto flex items-center gap-1 md:mr-8">
                        <Link
                            href="/profile"
                            className="relative flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10 md:hidden"
                            aria-label="Profile"
                        >
                            <User className="h-5 w-5" />
                        </Link>
                        {isAdmin && (
                            <Link
                                href="/admin/users"
                                className="relative flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10 md:hidden"
                                aria-label="Users"
                            >
                                <UserCheck className="h-5 w-5" />
                            </Link>
                        )}
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
                                <Deferred
                                    data={[
                                        'auctionNotifications',
                                        'documentNotifications',
                                    ]}
                                    fallback={
                                        <div className="absolute top-11 right-0 z-50 w-72 rounded-lg border border-[#19140035] bg-white p-4 text-xs text-[#706f6c] shadow-lg md:w-80 dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#A1A09A]">
                                            Loading notifications&hellip;
                                        </div>
                                    }
                                >
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
                                                {safeAuctionNotifications.map(
                                                    (n) => (
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
                                                                    {
                                                                        n.vehicle_name
                                                                    }
                                                                </span>
                                                                <span className="min-w-0 flex-1 truncate text-[10px] text-[#706f6c] md:text-xs dark:text-[#A1A09A]">
                                                                    {
                                                                        n.description
                                                                    }
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
                                                    ),
                                                )}
                                                {safeDocumentNotifications.map(
                                                    (n) => (
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
                                                                    {
                                                                        n.vehicle_name
                                                                    }
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
                                                                    In sell
                                                                    auction,
                                                                    document
                                                                    isn&apos;t
                                                                    submitted
                                                                    yet
                                                                </span>
                                                                <span className="font-semibold text-green-600">
                                                                    {parseFloat(
                                                                        n.price,
                                                                    )}
                                                                </span>
                                                            </span>
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Deferred>
                            </>
                        )}
                    </div>
                </div>
            </nav>
            <main className="flex flex-1 flex-col overflow-y-auto bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <div className="flex w-full flex-1 flex-col gap-8 px-6 pt-4 pb-6 md:pt-8 md:pb-32">
                    <div className="mt-8 grid w-full grid-cols-2 gap-4 gap-y-5 md:grid-cols-6 md:gap-4">
                        <Link
                            href={`/incomes?date=${activeMonth}-01`}
                            prefetch={['hover']}
                            cacheFor={300000}
                            className="flex h-24 cursor-pointer items-center justify-center rounded-lg border border-[#19140035] bg-white shadow-sm hover:shadow-md md:h-28 dark:border-[#3E3E3A] dark:bg-[#161615]"
                        >
                            <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                +
                            </span>
                        </Link>
                        <Link
                            href={`/expenses?date=${activeMonth}-01`}
                            prefetch={['hover']}
                            cacheFor={300000}
                            className="flex h-24 cursor-pointer items-center justify-center rounded-lg border border-[#19140035] bg-white shadow-sm hover:shadow-md md:h-28 dark:border-[#3E3E3A] dark:bg-[#161615]"
                        >
                            <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                -
                            </span>
                        </Link>
                        <Link
                            href={`/stock?date=${activeMonth}-01`}
                            prefetch={['hover']}
                            cacheFor={300000}
                            className="flex h-24 cursor-pointer items-center justify-center rounded-lg border border-[#19140035] bg-white shadow-sm hover:shadow-md md:h-28 dark:border-[#3E3E3A] dark:bg-[#161615]"
                        >
                            <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Stock
                            </span>
                        </Link>
                        <Link
                            href="/customer"
                            prefetch={['hover']}
                            cacheFor={300000}
                            className="flex h-24 cursor-pointer items-center justify-center rounded-lg border border-[#19140035] bg-white shadow-sm hover:shadow-md md:h-28 dark:border-[#3E3E3A] dark:bg-[#161615]"
                        >
                            <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Customers
                            </span>
                        </Link>
                        <Link
                            href="/auction"
                            prefetch={['hover']}
                            cacheFor={300000}
                            className="flex h-24 cursor-pointer items-center justify-center rounded-lg border border-[#19140035] bg-white shadow-sm hover:shadow-md md:h-28 dark:border-[#3E3E3A] dark:bg-[#161615]"
                        >
                            <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Auction
                            </span>
                        </Link>
                        <Link
                            href={`/cashbook?date=${activeMonth}-01`}
                            prefetch={['hover']}
                            cacheFor={300000}
                            className="flex h-24 cursor-pointer items-center justify-center rounded-lg border border-[#19140035] bg-white shadow-sm hover:shadow-md md:h-28 dark:border-[#3E3E3A] dark:bg-[#161615]"
                        >
                            <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Cash Book
                            </span>
                        </Link>
                        <Link
                            href="/export"
                            prefetch={['hover']}
                            cacheFor={300000}
                            className="col-span-2 flex h-20 cursor-pointer items-center justify-center rounded-lg border border-[#19140035] bg-white shadow-sm hover:shadow-md md:col-span-1 md:h-28 dark:border-[#3E3E3A] dark:bg-[#161615]"
                        >
                            <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Export
                            </span>
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
