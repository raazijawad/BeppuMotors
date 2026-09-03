import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Bell, ChevronLeft, ChevronRight, Landmark, Search, User, UserCheck, X } from 'lucide-react';
import { useState } from 'react';
import Footer from '@/components/footer';

const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

function getMonthLabel(ym) {
    const [y, m] = ym.split('-');
    return `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
}

function addMonths(ym, delta) {
    const [y, m] = ym.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function VehicleDetail({
    incomes = [],
    customers = [],
    drawers = [],
    selectedDate = null,
    selectedMonth = null,
    view = null,
    auctionNotifications = [],
    documentNotifications = [],
}) {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const user = usePage().props.auth?.user ?? null;
    const isAdmin = user?.role === 'admin';
    const [activeMonth, setActiveMonth] = useState(selectedMonth || currentMonth);
    const [selectedDay, setSelectedDay] = useState(today);
    const [filterDate, setFilterDate] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [searching, setSearching] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const totalNotificationCount =
        auctionNotifications.length + documentNotifications.length;

    const showList = view === 'list';
    const [showForm, setShowForm] = useState(false);
    const [viewingIncome, setViewingIncome] = useState(null);
    const [showDrawerSelect, setShowDrawerSelect] = useState(false);
    const [selectedDrawer, setSelectedDrawer] = useState(null);

    const { data, setData, post, processing, reset } = useForm({
        income_name: '',
        amount: '',
        description: '',
        date: selectedDate || today,
        customer_id: '',
        drawer_id: '',
    });

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setSelectedDay(newDate);
        setData('date', newDate);
        setFilterDate(newDate);
    };

    const monthIncomes = incomes.filter((v) => v.date?.startsWith(activeMonth));

    const filteredIncomes = filterDate
        ? monthIncomes.filter((v) => v.date === filterDate)
        : monthIncomes;

    const searchFilteredIncomes = searchTerm
        ? incomes.filter((v) => {
              const term = searchTerm.toLowerCase();
              return (
                  v.date?.toLowerCase().includes(term) ||
                  v.income_name?.toLowerCase().includes(term) ||
                  v.customer?.name?.toLowerCase().includes(term) ||
                  v.description?.toLowerCase().includes(term) ||
                  String(v.amount).includes(term)
              );
          })
        : monthIncomes;

    const showIncomes = searching ? searchFilteredIncomes : filteredIncomes;

    const handleAddIncome = (e) => {
        e.preventDefault();
        post('/incomes', {
            onSuccess: () => {
                reset();
                setSelectedDrawer(null);
                setShowDrawerSelect(false);
                setShowForm(false);
            },
        });
    };

    const changeMonth = (delta) => {
        const newMonth = addMonths(activeMonth, delta);
        setActiveMonth(newMonth);
        setFilterDate('');
        setSelectedDay(today);
        router.get(
            '/vehicle-detail',
            { date: `${newMonth}-01`, view: showList ? 'list' : '' },
            { preserveState: true, replace: true },
        );
    };

    const resetMonth = () => {
        if (activeMonth === currentMonth) return;
        setActiveMonth(currentMonth);
        setFilterDate('');
        setSelectedDay(today);
        router.get(
            '/vehicle-detail',
            { date: `${currentMonth}-01`, view: showList ? 'list' : '' },
            { preserveState: true, replace: true },
        );
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
                                    `/vehicle-detail?date=${activeMonth}-01`,
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
                        <div className="relative mr-4 ml-auto flex items-center gap-1 md:mr-8">
                        {!showList && (
                        <>
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
                        </>
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
                <div className="flex w-full flex-1 flex-col gap-8 px-6 pt-4 pb-6 md:pt-8 md:pb-32">
                    {showList && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => changeMonth(-1)}
                                className={`rounded-md p-1 text-[#706f6c] hover:bg-gray-100 hover:text-[#1b1b18] md:p-1.5 dark:text-[#A1A09A] dark:hover:bg-[#2a2a28] ${searching ? 'hidden md:block' : ''}`}
                            >
                                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                            </button>
                            <span
                                className={`text-center text-xs font-medium text-[#706f6c] md:text-sm dark:text-[#A1A09A] ${searching ? 'hidden md:inline' : ''}`}
                            >
                                {getMonthLabel(activeMonth)}
                            </span>
                            <button
                                onClick={() => changeMonth(1)}
                                className={`rounded-md p-1 text-[#706f6c] hover:bg-gray-100 hover:text-[#1b1b18] md:p-1.5 dark:text-[#A1A09A] dark:hover:bg-[#2a2a28] ${searching ? 'hidden md:block' : ''}`}
                            >
                                <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                            </button>
                            {activeMonth !== currentMonth && (
                                <button
                                    onClick={resetMonth}
                                    className={`ml-2 rounded-md border border-[#19140035] px-2 py-1 text-[10px] font-medium text-[#706f6c] hover:bg-gray-100 hover:text-[#1b1b18] md:text-xs dark:border-[#3E3E3A] dark:text-[#A1A09A] dark:hover:bg-[#2a2a28] ${searching ? 'hidden md:block' : ''}`}
                                >
                                    Reset
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setSearching(!searching);
                                    if (searching) setSearchTerm('');
                                }}
                                className="rounded-md p-1 text-[#706f6c] hover:bg-gray-100 hover:text-[#1b1b18] md:p-1.5 dark:text-[#A1A09A] dark:hover:bg-[#2a2a28]"
                            >
                                {searching ? (
                                    <X className="h-4 w-4 md:h-5 md:w-5" />
                                ) : (
                                    <Search className="h-4 w-4 md:h-5 md:w-5" />
                                )}
                            </button>
                            <input
                                autoFocus={searching}
                                type="text"
                                placeholder="Enter date or name or amount"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`rounded-md border border-[#19140035] bg-white px-3 py-1.5 text-xs text-[#1b1b18] md:text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white ${searching ? 'flex-1 md:w-48 md:flex-none' : 'hidden'}`}
                            />
                            <input
                                type="date"
                                value={selectedDay}
                                onChange={handleDateChange}
                                className={`ml-auto rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white ${searching ? 'hidden md:block' : ''}`}
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
                    )}

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
                            {showIncomes.length === 0 ? (
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
                                    {showIncomes.map((v) => (
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
                                        `/vehicle-detail?date=${activeMonth}-01`,
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
                                        `/vehicle-detail?date=${activeMonth}-01&view=list`,
                                    )
                                }
                                className="flex h-24 cursor-pointer items-center justify-center rounded-lg border border-[#19140035] bg-white shadow-sm hover:shadow-md md:h-28 dark:border-[#3E3E3A] dark:bg-[#161615]"
                            >
                                <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    +
                                </span>
                            </div>
                            <Link
                                href={`/expenses?date=${activeMonth}-01`}
                                className="flex h-24 cursor-pointer items-center justify-center rounded-lg border border-[#19140035] bg-white shadow-sm hover:shadow-md md:h-28 dark:border-[#3E3E3A] dark:bg-[#161615]"
                            >
                                <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    -
                                </span>
                            </Link>
                            <Link
                                href={`/stock?date=${activeMonth}-01`}
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
                                href={`/cashbook?date=${activeMonth}-01`}
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
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                Income Information
                            </h2>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setSelectedDrawer(null);
                                    setShowDrawerSelect(false);
                                    reset();
                                }}
                                className="text-sm text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-white"
                            >
                                &times;
                            </button>
                        </div>
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
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={data.amount}
                                        onChange={(e) =>
                                            setData('amount', e.target.value)
                                        }
                                        className="w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                        placeholder="Enter amount"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowDrawerSelect(!showDrawerSelect)}
                                        className={`shrink-0 rounded-md border px-2 ${selectedDrawer ? 'border-[#00447C] bg-[#00447C]/10 text-[#00447C] dark:border-[#6cb2e6] dark:bg-[#6cb2e6]/10 dark:text-[#6cb2e6]' : 'border-[#19140035] text-[#706f6c] dark:border-[#3E3E3A] dark:text-[#A1A09A]'}`}
                                    >
                                        <Landmark className="h-5 w-5" />
                                    </button>
                                </div>
                                {selectedDrawer && (
                                    <p className="mt-1 text-[10px] text-[#00447C] md:text-xs dark:text-[#6cb2e6]">
                                        Add to: {selectedDrawer.name}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedDrawer(null);
                                                setData('drawer_id', '');
                                            }}
                                            className="ml-1 inline-flex items-center text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-white"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </p>
                                )}
                                {showDrawerSelect && (
                                    <div className="mt-2 max-h-40 overflow-y-auto rounded-md border border-[#19140035] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                                        {(() => {
                                            const grouped = drawers.reduce((acc, d) => {
                                                const rootId = d.parent_id ?? d.id;
                                                if (!acc[rootId]) acc[rootId] = [];
                                                acc[rootId].push(d);
                                                return acc;
                                            }, {});
                                            const latest = Object.values(grouped)
                                                .map((group) => {
                                                    const filtered = group.filter((e) => e.date <= today);
                                                    if (filtered.length === 0) return null;
                                                    return filtered.reduce((a, b) => {
                                                        if (b.date > a.date) return b;
                                                        if (b.date === a.date) {
                                                            const aTime = new Date(a.created_at || 0).getTime();
                                                            const bTime = new Date(b.created_at || 0).getTime();
                                                            if (bTime > aTime) return b;
                                                        }
                                                        return a;
                                                    });
                                                })
                                                .filter(Boolean)
                                                .sort((a, b) => a.name.localeCompare(b.name));
                                            if (latest.length === 0) {
                                                return (
                                                    <p className="px-3 py-2 text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                                        No drawers found
                                                    </p>
                                                );
                                            }
                                            return latest.map((drawer) => (
                                                <button
                                                    key={drawer.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedDrawer(drawer);
                                                        setData('drawer_id', drawer.id);
                                                        setShowDrawerSelect(false);
                                                    }}
                                                    className="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-gray-50 dark:hover:bg-[#2a2a28]"
                                                >
                                                    <span className="font-medium">{drawer.name}</span>
                                                    <span className="text-green-600">+{parseFloat(drawer.amount)}</span>
                                                </button>
                                            ));
                                        })()}
                                    </div>
                                )}
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
                                    disabled={processing || !data.drawer_id}
                                    className="rounded-md bg-[#00447C] px-4 py-2 text-sm font-medium text-white hover:bg-[#003d6f] disabled:opacity-50"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setSelectedDrawer(null);
                                        setShowDrawerSelect(false);
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
            <div className={showForm ? 'pointer-events-none blur-sm' : ''}>
                <Footer />
            </div>
        </div>
    );
}
