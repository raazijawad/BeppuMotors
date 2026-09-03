import { Head, Link, router } from '@inertiajs/react';
import {
    Landmark,
    ChevronLeft,
    ChevronRight,
    Search,
    X,
    Pencil,
    History,
} from 'lucide-react';
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

export default function Cashbook({
    entries = [],
    drawers = [],
    selectedMonth = null,
}) {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [activeMonth, setActiveMonth] = useState(
        selectedMonth || currentMonth,
    );
    const [selectedDate, setSelectedDate] = useState('');
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const [drawerDate, setDrawerDate] = useState(today);

    const monthEntries = entries.filter((e) => e.date?.startsWith(activeMonth));

    const filteredEntries = selectedDate
        ? monthEntries.filter((e) => e.date === selectedDate)
        : monthEntries;

    const totalIncome = filteredEntries
        .filter((e) => e.type === 'income')
        .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const totalExpense = filteredEntries
        .filter((e) => e.type === 'expense')
        .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const netAmount = totalIncome - totalExpense;

    const [searching, setSearching] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const searchFilteredEntries = searchTerm
        ? entries.filter((e) => {
              const term = searchTerm.toLowerCase();
              return (
                  e.date?.toLowerCase().includes(term) ||
                  e.name?.toLowerCase().includes(term) ||
                  e.customer?.toLowerCase().includes(term) ||
                  e.description?.toLowerCase().includes(term) ||
                  String(e.amount).includes(term)
              );
          })
        : monthEntries;

    const showEntries = searching ? searchFilteredEntries : filteredEntries;

    const [showDrawer, setShowDrawer] = useState(false);
    const [showDrawerForm, setShowDrawerForm] = useState(false);
    const [drawerName, setDrawerName] = useState('');
    const [drawerAmount, setDrawerAmount] = useState('');
    const [editingDrawer, setEditingDrawer] = useState(null);
    const [editName, setEditName] = useState('');
    const [editAmount, setEditAmount] = useState('');
    const [drawerSubmitting, setDrawerSubmitting] = useState(false);
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [showDrawerHistory, setShowDrawerHistory] = useState(false);

    const isDrawerFormFilled =
        drawerName.trim() !== '' || drawerAmount.trim() !== '';

    const getLatestVersion = (entries, date) => {
        const filtered = entries.filter((e) => e.date <= date);
        if (filtered.length === 0) return null;
        return filtered.reduce((latest, e) => {
            if (e.date > latest.date) return e;
            if (e.date === latest.date) {
                const eTime = new Date(e.created_at || 0).getTime();
                const lTime = new Date(latest.created_at || 0).getTime();
                if (eTime > lTime) return e;
            }
            return latest;
        });
    };

    const groupedDrawers = drawers.reduce((acc, d) => {
        const rootId = d.parent_id ?? d.id;
        if (!acc[rootId]) acc[rootId] = [];
        acc[rootId].push(d);
        return acc;
    }, {});

    const filteredDrawers = Object.values(groupedDrawers)
        .map((group) => getLatestVersion(group, drawerDate))
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name));

    const drawerTotal = filteredDrawers.reduce(
        (sum, e) => sum + parseFloat(e.amount || 0),
        0,
    );
    const difference = drawerTotal - netAmount;

    const handleDrawerSubmit = () => {
        if (!drawerName || !drawerAmount || drawerSubmitting) return;
        setDrawerSubmitting(true);
        router.post(
            '/drawers',
            { name: drawerName, amount: drawerAmount, date: drawerDate },
            {
                onFinish: () => setDrawerSubmitting(false),
                onSuccess: () => {
                    setDrawerName('');
                    setDrawerAmount('');
                    setShowDrawerForm(false);
                },
            },
        );
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editName || !editAmount || !editingDrawer || editSubmitting)
            return;
        setEditSubmitting(true);
        router.put(
            `/drawers/${editingDrawer.id}`,
            { name: editName, amount: editAmount, date: drawerDate },
            {
                onFinish: () => setEditSubmitting(false),
                onSuccess: () => {
                    setEditingDrawer(null);
                    setEditName('');
                    setEditAmount('');
                },
            },
        );
    };

    const changeMonth = (delta) => {
        const newMonth = addMonths(activeMonth, delta);
        setActiveMonth(newMonth);
        setSelectedDate('');
        setDrawerDate(today);
        router.get(
            '/cashbook',
            { date: `${newMonth}-01` },
            { preserveState: true, replace: true },
        );
    };

    const resetMonth = () => {
        if (activeMonth === currentMonth) return;
        setActiveMonth(currentMonth);
        setSelectedDate('');
        setDrawerDate(today);
        router.get(
            '/cashbook',
            { date: `${currentMonth}-01` },
            { preserveState: true, replace: true },
        );
    };

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <Head title="Cash Book" />
            <nav className="relative h-16 w-full border-b border-white/10 md:h-20">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a]"></div>
                <div className="relative flex h-full items-center pl-6 md:pl-10">
                    <Link
                        href={`/vehicle-detail?date=${activeMonth}-01`}
                        className="text-sm font-medium text-white/70 hover:text-white"
                    >
                        &larr; Back
                    </Link>
                    <span className="ml-4 text-sm font-semibold text-white">
                        Cash Book
                    </span>
                </div>
            </nav>
            <main className="h-[calc(100vh-4rem)] overflow-y-auto bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] md:h-[calc(100vh-10rem)]">
                <div className="flex w-full flex-col gap-3 px-6 pt-4 pb-6 md:gap-6 md:pt-8">
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
                                className={`rounded-md border border-[#19140035] px-2 py-1 text-[10px] font-medium text-[#706f6c] hover:bg-gray-100 hover:text-[#1b1b18] md:text-xs dark:border-[#3E3E3A] dark:text-[#A1A09A] dark:hover:bg-[#2a2a28] ${searching ? 'hidden md:block' : ''}`}
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
                            value={selectedDate}
                            onChange={(e) => {
                                setSelectedDate(e.target.value);
                                setDrawerDate(e.target.value || today);
                            }}
                            className={`rounded-md border border-[#19140035] bg-white px-2 py-1 text-[10px] text-[#706f6c] md:text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#A1A09A] ${searching ? 'hidden md:block' : ''}`}
                        />
                        {selectedDate && (
                            <button
                                onClick={() => {
                                    setSelectedDate('');
                                    setDrawerDate(today);
                                }}
                                className="rounded-md px-2 py-1 text-[10px] font-medium text-[#706f6c] hover:bg-gray-100 hover:text-[#1b1b18] md:text-xs dark:text-[#A1A09A] dark:hover:bg-[#2a2a28]"
                            >
                                Reset
                            </button>
                        )}
                        <button
                            onClick={() => setShowDrawer(true)}
                            className="ml-auto"
                        >
                            <Landmark className="h-5 w-5 text-[#706f6c] hover:text-[#1b1b18] md:h-6 md:w-6 dark:text-[#A1A09A] dark:hover:text-white" />
                        </button>
                    </div>

                    <div className="mx-auto w-full max-w-3xl rounded-lg border border-[#19140035] bg-white p-3 shadow-sm md:p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <div className="flex flex-row border-b border-[#19140035] pb-2 dark:border-[#3E3E3A]">
                            <div className="w-16 text-[8px] font-semibold text-[#706f6c] md:w-24 md:text-xs dark:text-[#A1A09A]">
                                Date
                            </div>
                            <div className="w-12 text-[8px] font-semibold text-[#706f6c] md:w-16 md:text-xs dark:text-[#A1A09A]">
                                Time
                            </div>
                            <div className="flex-1 text-[8px] font-semibold text-[#706f6c] md:text-xs dark:text-[#A1A09A]">
                                Details
                            </div>
                            <div className="w-16 text-center text-[8px] font-semibold text-green-600 md:w-24 md:text-xs">
                                +
                            </div>
                            <div className="w-16 text-center text-[8px] font-semibold text-red-600 md:w-24 md:text-xs">
                                -
                            </div>
                        </div>

                        {showEntries.length === 0 ? (
                            <p className="py-4 text-center text-[10px] text-[#706f6c] md:text-sm dark:text-[#A1A09A]">
                                No entries yet.
                            </p>
                        ) : (
                            showEntries.map((entry) => (
                                <div
                                    key={`${entry.type}-${entry.id}`}
                                    className="flex flex-row items-center border-b border-[#19140035]/50 py-1 dark:border-[#3E3E3A]/50"
                                >
                                    <div className="w-16 truncate text-[8px] text-[#706f6c] md:w-24 md:text-xs dark:text-[#A1A09A]">
                                        {entry.date}
                                    </div>
                                    <div className="w-12 truncate text-[8px] text-[#706f6c] md:w-16 md:text-xs dark:text-[#A1A09A]">
                                        {entry.created_at
                                            ? new Date(
                                                  entry.created_at,
                                              ).toLocaleTimeString('en-US', {
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                                  hour12: true,
                                              })
                                            : ''}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[8px] font-medium md:text-xs">
                                            {entry.name}
                                        </p>
                                        {entry.customer && (
                                            <p className="truncate text-[7px] text-[#00447C] md:text-[10px] dark:text-[#6cb2e6]">
                                                Customer: {entry.customer}
                                            </p>
                                        )}
                                        {entry.description && (
                                            <p className="truncate text-[7px] text-[#706f6c] md:text-[10px] dark:text-[#A1A09A]">
                                                {entry.description}
                                            </p>
                                        )}
                                    </div>
                                    {entry.type === 'income' ? (
                                        <>
                                            <div className="w-16 text-center text-[8px] font-semibold text-green-600 md:w-24 md:text-xs">
                                                +{entry.amount}
                                            </div>
                                            <div className="w-16 md:w-24"></div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-16 md:w-24"></div>
                                            <div className="w-16 text-center text-[8px] font-semibold text-red-600 md:w-24 md:text-xs">
                                                -{entry.amount}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        )}

                        <div className="flex flex-row items-center border-t border-[#19140035] pt-2 dark:border-[#3E3E3A]">
                            <div className="w-16 md:w-24"></div>
                            <div className="w-12 md:w-16"></div>
                            <div className="flex-1 text-[8px] font-bold md:text-xs">
                                Totals
                            </div>
                            <div className="w-16 text-center text-[8px] font-bold text-green-600 md:w-24 md:text-xs">
                                +{totalIncome.toFixed(2)}
                            </div>
                            <div className="w-16 text-center text-[8px] font-bold text-red-600 md:w-24 md:text-xs">
                                -{totalExpense.toFixed(2)}
                            </div>
                        </div>
                        <hr className="my-2 border-[#19140035] dark:border-[#3E3E3A]" />
                        <div className="flex items-center justify-center gap-3 py-2">
                            <p
                                className={`text-xs font-bold md:text-sm ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                                Net: {netAmount >= 0 ? '+' : ''}
                                {netAmount.toFixed(2)}
                            </p>
                            {difference !== 0 ? (
                                <>
                                    <span className="text-[#706f6c] dark:text-[#A1A09A]">
                                        -
                                    </span>
                                    <span className="text-xs text-[#706f6c] md:text-sm dark:text-[#A1A09A]">
                                        Different: {difference}
                                    </span>
                                    <span className="text-[#706f6c] dark:text-[#A1A09A]">
                                        -
                                    </span>
                                    <span
                                        className={`text-xs font-bold md:text-sm ${difference > 0 ? 'text-green-600' : 'text-red-600'}`}
                                    >
                                        {difference > 0
                                            ? 'You have Extra Money'
                                            : 'Cash Missing'}
                                    </span>
                                </>
                            ) : (
                                <span className="text-xs font-bold text-green-600 md:text-sm">
                                    Account Tied
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            {showDrawer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-2xl rounded-lg border border-[#19140035] bg-white p-4 shadow-lg md:p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-base font-semibold md:text-lg">
                                Drawer
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowDrawerHistory(true)}
                                    title="History"
                                    className="rounded-md border border-[#19140035] p-1.5 text-[#706f6c] hover:text-[#1b1b18] md:p-2 dark:border-[#3E3E3A] dark:text-[#A1A09A] dark:hover:text-white"
                                >
                                    <History className="h-4 w-4 md:h-5 md:w-5" />
                                </button>
                                <button
                                    onClick={
                                        showDrawerForm
                                            ? isDrawerFormFilled &&
                                              !drawerSubmitting
                                                ? handleDrawerSubmit
                                                : () => setShowDrawerForm(false)
                                            : () => setShowDrawerForm(true)
                                    }
                                    disabled={drawerSubmitting}
                                    className="rounded-md bg-[#00447C] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#003d6f] disabled:opacity-50 md:px-4 md:py-2 md:text-sm"
                                >
                                    {showDrawerForm
                                        ? drawerSubmitting
                                            ? 'Saving...'
                                            : isDrawerFormFilled
                                              ? 'Done'
                                              : 'Cancel'
                                        : '+ Add'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDrawer(false);
                                        setEditingDrawer(null);
                                    }}
                                    className="text-sm font-medium text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-white"
                                >
                                    &times;
                                </button>
                            </div>
                        </div>
                        <div className="rounded-lg border border-[#19140035] dark:border-[#3E3E3A]">
                            <div className="flex flex-row border-b border-[#19140035] dark:border-[#3E3E3A]">
                                <div className="flex-1 border-r border-[#19140035] px-3 py-2 text-center text-[10px] font-semibold text-[#706f6c] md:text-xs dark:border-[#3E3E3A] dark:text-[#A1A09A]">
                                    <input
                                        type="date"
                                        value={drawerDate}
                                        onChange={(e) =>
                                            setDrawerDate(e.target.value)
                                        }
                                        className="w-full cursor-pointer bg-transparent text-center text-[10px] font-semibold text-[#706f6c] md:text-xs dark:text-[#A1A09A]"
                                    />
                                    {drawerDate !== today && (
                                        <button
                                            onClick={() => setDrawerDate(today)}
                                            className="mt-1 text-[9px] font-medium text-[#706f6c] hover:text-[#1b1b18] md:text-[10px] dark:text-[#A1A09A] dark:hover:text-white"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                                <div className="flex-1 px-3 py-2 text-center text-[10px] font-semibold text-[#706f6c] md:text-xs dark:text-[#A1A09A]">
                                    Amount
                                </div>
                            </div>
                            {showDrawerForm && (
                                <div className="flex flex-row items-center border-b border-[#19140035]/50 dark:border-[#3E3E3A]/50">
                                    <div className="flex-1 p-2">
                                        <input
                                            type="text"
                                            placeholder="Name"
                                            value={drawerName}
                                            onChange={(e) =>
                                                setDrawerName(e.target.value)
                                            }
                                            className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1 text-[10px] md:text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                        />
                                    </div>
                                    <div className="flex-1 p-2">
                                        <input
                                            type="text"
                                            placeholder="Amount"
                                            value={drawerAmount}
                                            onChange={(e) =>
                                                setDrawerAmount(e.target.value)
                                            }
                                            className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1 text-[10px] md:text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                        />
                                    </div>
                                </div>
                            )}
                            {filteredDrawers.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="flex flex-row items-center"
                                >
                                    {editingDrawer?.id === entry.id ? (
                                        <>
                                            <div className="flex-1 border-r border-[#19140035] px-2 py-0.5 dark:border-[#3E3E3A]">
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) =>
                                                        setEditName(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1 text-[10px] md:text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                />
                                            </div>
                                            <div className="flex flex-1 items-center gap-1 px-2 py-0.5">
                                                <input
                                                    type="text"
                                                    value={editAmount}
                                                    onChange={(e) =>
                                                        setEditAmount(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1 text-[10px] md:text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                />
                                                <button
                                                    onClick={handleEditSubmit}
                                                    disabled={editSubmitting}
                                                    className="rounded bg-[#00447C] px-1.5 py-1 text-[10px] font-medium text-white hover:bg-[#003d6f] disabled:opacity-50 md:text-xs"
                                                >
                                                    {editSubmitting
                                                        ? '...'
                                                        : 'OK'}
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setEditingDrawer(null)
                                                    }
                                                    className="rounded border border-[#19140035] px-1.5 py-1 text-[10px] font-medium md:text-xs dark:border-[#3E3E3A]"
                                                >
                                                    X
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex-1 border-r border-[#19140035] px-3 py-0.5 text-center dark:border-[#3E3E3A]">
                                                <p className="text-[10px] font-medium md:text-xs">
                                                    {entry.name}
                                                </p>
                                            </div>
                                            <div className="flex-1 px-3 py-0.5 text-center text-[10px] font-semibold text-green-600 md:text-xs">
                                                +{parseFloat(entry.amount)}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setEditingDrawer(entry);
                                                    setEditName(entry.name);
                                                    setEditAmount(
                                                        String(
                                                            parseFloat(
                                                                entry.amount,
                                                            ),
                                                        ),
                                                    );
                                                }}
                                                className="px-2 py-0.5 text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-white"
                                            >
                                                <Pencil className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                            <div className="flex flex-row items-center border-t border-[#19140035] dark:border-[#3E3E3A]">
                                <div className="flex-1 px-3 py-1 text-center text-[10px] font-bold text-[#706f6c] md:text-xs dark:text-[#A1A09A]">
                                    Total
                                </div>
                                <div className="flex-1 px-3 py-1 text-center text-[10px] font-bold text-green-600 md:text-xs">
                                    +
                                    {filteredDrawers.reduce(
                                        (sum, e) =>
                                            sum + parseFloat(e.amount || 0),
                                        0,
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDrawerHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-xl rounded-lg border border-[#19140035] bg-white p-4 shadow-lg md:p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-base font-semibold md:text-lg">
                                Drawer History
                            </h2>
                            <button
                                onClick={() => setShowDrawerHistory(false)}
                                className="text-sm font-medium text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-white"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="max-h-[70vh] overflow-y-auto rounded-lg border border-[#19140035] dark:border-[#3E3E3A]">
                            {drawers.length === 0 ? (
                                <p className="py-6 text-center text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                    No drawer history yet.
                                </p>
                            ) : (
                                [...drawers]
                                    .sort(
                                        (a, b) =>
                                            new Date(b.created_at) -
                                            new Date(a.created_at),
                                    )
                                    .map((d) => {
                                        const time = d.created_at
                                            ? new Date(
                                                  d.created_at,
                                              ).toLocaleTimeString('en-US', {
                                                  hour: 'numeric',
                                                  minute: '2-digit',
                                                  hour12: true,
                                              })
                                            : '';
                                        const rootId = d.parent_id ?? d.id;
                                        const prev = drawers
                                            .filter(
                                                (p) =>
                                                    (p.parent_id ?? p.id) ===
                                                        rootId &&
                                                    new Date(p.created_at) <
                                                        new Date(d.created_at),
                                            )
                                            .sort(
                                                (a, b) =>
                                                    new Date(b.created_at) -
                                                    new Date(a.created_at),
                                            )[0];
                                        let changeMsg = d.message;
                                        if (
                                            !changeMsg &&
                                            d.source_type === 'manual'
                                        ) {
                                            const lastAmount = prev
                                                ? prev.amount
                                                : d.amount;
                                            changeMsg = `that ${lastAmount} to ${d.amount}`;
                                        }
                                        const msg =
                                            changeMsg ||
                                            `Amount set to ${d.amount}`;
                                        return (
                                            <div
                                                key={d.id}
                                                className="border-b border-[#19140035]/50 px-4 py-3 last:border-b-0 dark:border-[#3E3E3A]/50"
                                            >
                                                <p className="text-[11px] leading-relaxed text-[#1b1b18] md:text-sm dark:text-[#e5e5e3]">
                                                    <span className="font-semibold">
                                                        {d.date}
                                                    </span>{' '}
                                                    <span className="font-semibold text-[#00447C] dark:text-[#6cb2e6]">
                                                        {d.name}
                                                    </span>{' '}
                                                    <span>
                                                        {d.source_type ===
                                                        'manual'
                                                            ? `has changed the amount at ${time} ${msg}`
                                                            : `${msg} at ${time}${
                                                                  prev
                                                                      ? ` that ${prev.amount} to ${d.amount}`
                                                                      : ''
                                                              }`}
                                                    </span>
                                                </p>
                                            </div>
                                        );
                                    })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
