import { Head, Link, router, useForm } from '@inertiajs/react';
import { Car, ChevronLeft, ChevronRight, Gavel, Landmark, Search, X } from 'lucide-react';
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

export default function Expenses({
    expenses = [],
    customers = [],
    drawers = [],
    selectedDate = null,
    selectedMonth = null,
}) {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [activeMonth, setActiveMonth] = useState(selectedMonth || currentMonth);
    const activeDate = selectedDate || today;

    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [showStockFields, setShowStockFields] = useState(false);
    const [filterDate, setFilterDate] = useState('');
    const [auctionData, setAuctionData] = useState(null);
    const [showDrawerSelect, setShowDrawerSelect] = useState(false);
    const [selectedDrawer, setSelectedDrawer] = useState(null);
    const [searching, setSearching] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { data, setData, post, put, processing, reset } = useForm({
        expense_name: '',
        amount: '',
        description: '',
        date: activeDate,
        customer_id: '',
        drawer_id: '',
        name: '',
        company: '',
        colour: '',
        shopname: '',
        chassisnumber: '',
        price: '',
        t_price: '',
        n_price: '',
        a_price: '',
        expected_profit: '',
    });

    const openAddForm = () => {
        reset();
        setEditingExpense(null);
        setShowStockFields(false);
        setSelectedDrawer(null);
        setShowDrawerSelect(false);
        setData('date', activeDate);
        setShowForm(true);
    };

    const openEditForm = (expense) => {
        setEditingExpense(expense);
        const stock = expense.stock;
        const auction = expense.buyAuction || expense.buy_auction;
        setShowStockFields(!!stock);
        setAuctionData(auction || null);
        setSelectedDrawer(null);
        setShowDrawerSelect(false);
        setData({
            expense_name: expense.expense_name,
            amount: expense.amount,
            description: expense.description || '',
            date: expense.date,
            customer_id: expense.customer_id || '',
            drawer_id: '',
            name: stock?.name || '',
            company: stock?.company || '',
            colour: stock?.colour || '',
            shopname: stock?.shopname || '',
            chassisnumber: stock?.chassisnumber || '',
            price: stock ? parseFloat(stock.price) : '',
            t_price: stock ? parseFloat(stock.t_price) : '',
            n_price: stock ? parseFloat(stock.n_price) : '',
            a_price: stock ? stock.a_price : '',
            expected_profit: stock ? parseFloat(stock.expected_profit) : '',
        });
        setShowForm(true);
    };

    const changeMonth = (delta) => {
        const newMonth = addMonths(activeMonth, delta);
        setActiveMonth(newMonth);
        setFilterDate('');
        router.get(
            '/expenses',
            { date: `${newMonth}-01` },
            { preserveState: true, replace: true },
        );
    };

    const resetMonth = () => {
        if (activeMonth === currentMonth) return;
        setActiveMonth(currentMonth);
        setFilterDate('');
        router.get(
            '/expenses',
            { date: `${currentMonth}-01` },
            { preserveState: true, replace: true },
        );
    };

    const monthExpenses = expenses.filter((v) => v.date?.startsWith(activeMonth));

    const filteredExpenses = filterDate
        ? monthExpenses.filter((v) => v.date === filterDate)
        : monthExpenses;

    const searchFilteredExpenses = searchTerm
        ? expenses.filter((v) => {
              const term = searchTerm.toLowerCase();
              return (
                  v.date?.toLowerCase().includes(term) ||
                  v.expense_name?.toLowerCase().includes(term) ||
                  v.customer?.name?.toLowerCase().includes(term) ||
                  v.description?.toLowerCase().includes(term) ||
                  String(v.amount).includes(term)
              );
          })
        : monthExpenses;

    const showExpenses = searching ? searchFilteredExpenses : filteredExpenses;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingExpense) {
            put(`/expenses/${editingExpense.id}`, {
                onSuccess: () => {
                    reset();
                    setSelectedDrawer(null);
                    setShowDrawerSelect(false);
                    setEditingExpense(null);
                    setShowForm(false);
                },
            });
        } else {
            post('/expenses', {
                onSuccess: () => {
                    reset();
                    setSelectedDrawer(null);
                    setShowDrawerSelect(false);
                    setShowForm(false);
                },
            });
        }
    };

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <Head title="Expenses" />
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
                        Expenses Page
                    </span>
                </div>
            </nav>
            <main className="flex flex-1 flex-col overflow-y-auto bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <div className="flex w-full flex-1 flex-col gap-3 px-6 pt-4 pb-6 md:gap-8 md:pt-8 md:pb-32">
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
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className={`ml-auto rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white ${searching ? 'hidden md:block' : ''}`}
                        />
                        {filterDate && (
                            <button
                                onClick={() => setFilterDate('')}
                                className="rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm font-medium dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                            >
                                Reset
                            </button>
                        )}
                    </div>

                    <div className="mx-auto w-full max-w-md rounded-lg border border-[#19140035] bg-white p-3 shadow-sm md:p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <div className="mb-3 flex items-center justify-between md:mb-4">
                            <h2 className="text-base font-semibold md:text-lg">
                                Expense List
                            </h2>
                            <button
                                onClick={openAddForm}
                                className="rounded-md bg-[#00447C] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#003d6f] md:px-4 md:py-2 md:text-sm"
                            >
                                + Add Expense
                            </button>
                        </div>
                        {showExpenses.length === 0 ? (
                            <p className="text-xs text-[#706f6c] md:text-sm dark:text-[#A1A09A]">
                                No expenses added yet.
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
                                    <div className="w-20 text-right text-[10px] font-semibold text-red-600 md:w-24 md:text-xs">
                                        Amount
                                    </div>
                                </div>
                                {showExpenses.map((v) => (
                                    <div
                                        key={v.id}
                                        onClick={() => openEditForm(v)}
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
                                                {v.expense_name}
                                            </p>
                                            {v.buy_auction && (
                                                <p className="text-[9px] font-medium text-[#00447C] md:text-[10px] dark:text-[#6ab0e3]">
                                                    Bought via Auction
                                                </p>
                                            )}
                                            {v.description && (
                                                <p className="truncate text-[9px] text-[#706f6c] md:text-[10px] dark:text-[#A1A09A]">
                                                    {v.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="w-20 text-right text-[10px] font-semibold text-red-600 md:w-24 md:text-xs">
                                            -{v.amount}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div
                        className={`mx-4 w-full ${showStockFields ? 'md:max-w-4xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto rounded-lg border border-[#19140035] bg-white p-6 shadow-lg dark:border-[#3E3E3A] dark:bg-[#161615]`}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                {editingExpense
                                    ? 'Edit Expense'
                                    : 'Expense Information'}
                            </h2>
                            <button
                                type="button"
                                onClick={() =>
                                    setShowStockFields(!showStockFields)
                                }
                                title="Add vehicle to stock"
                                className={`rounded-md p-1.5 transition-colors ${showStockFields ? 'bg-[#00447C] text-white' : 'text-[#706f6c] hover:bg-gray-100 hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:bg-[#2a2a28] dark:hover:text-white'}`}
                            >
                                <Car className="h-4 w-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div
                                className={`${showStockFields ? 'md:grid md:grid-cols-2 md:gap-6' : ''}`}
                            >
                                <div>
                                    <div className="mb-4">
                                        <label className="mb-1 block text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                            Customer
                                        </label>
                                        <select
                                            value={data.customer_id}
                                            onChange={(e) =>
                                                setData(
                                                    'customer_id',
                                                    e.target.value,
                                                )
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
                                            Expense Name
                                        </label>
                                        <input
                                            type="text"
                                            value={data.expense_name}
                                            onChange={(e) =>
                                                setData(
                                                    'expense_name',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                            placeholder="Enter expense name"
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
                                                    setData(
                                                        'amount',
                                                        e.target.value,
                                                    )
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
                                                Deduct from: {selectedDrawer.name}
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
                                                setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                            placeholder="Enter description"
                                            rows={3}
                                        />
                                    </div>
                                    <input type="hidden" value={data.date} />
                                </div>
                                {showStockFields && (
                                    <div className="mb-4 rounded-lg border border-[#19140035] p-3 md:mb-0 dark:border-[#3E3E3A]">
                                        <p className="mb-3 text-xs font-semibold text-[#706f6c] dark:text-[#A1A09A]">
                                            Vehicle / Stock Details
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                                    Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.name}
                                                    onChange={(e) =>
                                                        setData(
                                                            'name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                    placeholder="Vehicle name"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                                    Company
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.company}
                                                    onChange={(e) =>
                                                        setData(
                                                            'company',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                    placeholder="Company"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                                    Colour
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.colour}
                                                    onChange={(e) =>
                                                        setData(
                                                            'colour',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                    placeholder="Colour"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                                    Shop Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.shopname}
                                                    onChange={(e) =>
                                                        setData(
                                                            'shopname',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                    placeholder="Shop name"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                                    Chassis Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.chassisnumber}
                                                    onChange={(e) =>
                                                        setData(
                                                            'chassisnumber',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                    placeholder="Chassis number"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                                    Price
                                                </label>
                                                <input
                                                    type="number"
                                                    value={data.price}
                                                    onChange={(e) =>
                                                        setData(
                                                            'price',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                                    T Price
                                                </label>
                                                <input
                                                    type="number"
                                                    value={data.t_price}
                                                    onChange={(e) =>
                                                        setData(
                                                            't_price',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                                    N Price
                                                </label>
                                                <input
                                                    type="number"
                                                    value={data.n_price}
                                                    onChange={(e) =>
                                                        setData(
                                                            'n_price',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                                    A Price
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.a_price}
                                                    onChange={(e) =>
                                                        setData(
                                                            'a_price',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                                    Expected Profit
                                                </label>
                                                <input
                                                    type="number"
                                                    value={data.expected_profit}
                                                    onChange={(e) =>
                                                        setData(
                                                            'expected_profit',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {auctionData && (
                                <div className="mb-4 rounded-lg border border-[#19140035] bg-gray-50 p-4 dark:border-[#3E3E3A] dark:bg-[#1a1a19]">
                                    <div className="mb-3 flex items-center gap-2">
                                        <Gavel className="h-4 w-4 text-[#00447C]" />
                                        <p className="text-xs font-semibold text-[#706f6c] dark:text-[#A1A09A]">
                                            Auction Details
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                        <div>
                                            <p className="text-[10px] text-[#706f6c] dark:text-[#A1A09A]">
                                                Company
                                            </p>
                                            <p className="text-xs font-medium">
                                                {auctionData.company || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[#706f6c] dark:text-[#A1A09A]">
                                                Colour
                                            </p>
                                            <p className="text-xs font-medium">
                                                {auctionData.colour || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[#706f6c] dark:text-[#A1A09A]">
                                                Shop Name
                                            </p>
                                            <p className="text-xs font-medium">
                                                {auctionData.shopname || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[#706f6c] dark:text-[#A1A09A]">
                                                Chassis Number
                                            </p>
                                            <p className="text-xs font-medium">
                                                {auctionData.chassisnumber ||
                                                    '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[#706f6c] dark:text-[#A1A09A]">
                                                Description
                                            </p>
                                            <p className="text-xs font-medium">
                                                {auctionData.description || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[#706f6c] dark:text-[#A1A09A]">
                                                For Who
                                            </p>
                                            <p className="text-xs font-medium">
                                                {auctionData.for_who || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[#706f6c] dark:text-[#A1A09A]">
                                                Price
                                            </p>
                                            <p className="text-xs font-medium">
                                                {auctionData.price || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[#706f6c] dark:text-[#A1A09A]">
                                                Paid
                                            </p>
                                            <p className="text-xs font-medium">
                                                {auctionData.paid ? (
                                                    <span className="text-green-600">
                                                        Yes
                                                    </span>
                                                ) : (
                                                    <span className="text-red-600">
                                                        No
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={processing || (!editingExpense && !data.drawer_id)}
                                    className="rounded-md bg-[#00447C] px-4 py-2 text-sm font-medium text-white hover:bg-[#003d6f] disabled:opacity-50"
                                >
                                    {editingExpense ? 'Update' : 'Submit'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setSelectedDrawer(null);
                                        setShowDrawerSelect(false);
                                        setEditingExpense(null);
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
            {!showForm && <Footer />}
        </div>
    );
}
