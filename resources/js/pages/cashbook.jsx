import { Head, Link, router } from '@inertiajs/react';
import { Landmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Footer from '@/components/footer';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getMonthLabel(ym) {
    const [y, m] = ym.split('-');
    return `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
}

function addMonths(ym, delta) {
    const [y, m] = ym.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function Cashbook({ entries = [], drawers = [], selectedMonth = null }) {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [activeMonth, setActiveMonth] = useState(selectedMonth || currentMonth);
    const [selectedDate, setSelectedDate] = useState('');

    const filteredEntries = selectedDate
        ? entries.filter((e) => e.date === selectedDate)
        : entries;

    const filteredDrawers = selectedDate
        ? drawers.filter((d) => d.date === selectedDate)
        : drawers;

    const totalIncome = filteredEntries.filter((e) => e.type === 'income').reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const totalExpense = filteredEntries.filter((e) => e.type === 'expense').reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const netAmount = totalIncome - totalExpense;

    const [showDrawer, setShowDrawer] = useState(false);
    const [showDrawerForm, setShowDrawerForm] = useState(false);
    const [drawerName, setDrawerName] = useState('');
    const [drawerAmount, setDrawerAmount] = useState('');

    const isDrawerFormFilled = drawerName.trim() !== '' || drawerAmount.trim() !== '';

    const handleDrawerSubmit = () => {
        if (!drawerName || !drawerAmount) return;
        router.post('/drawers', { name: drawerName, amount: drawerAmount }, {
            onSuccess: () => {
                setDrawerName('');
                setDrawerAmount('');
                setShowDrawerForm(false);
            },
        });
    };

    const changeMonth = (delta) => {
        const newMonth = addMonths(activeMonth, delta);
        setActiveMonth(newMonth);
        setSelectedDate('');
        router.get('/cashbook', { date: `${newMonth}-01` }, { preserveState: true, replace: true });
    };

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <Head title="Cash Book" />
            <nav className="relative h-16 md:h-20 w-full border-b border-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a]"></div>
                <div className="relative flex h-full items-center pl-6 md:pl-10">
                    <Link href={`/vehicle-detail?date=${activeMonth}-01`} className="text-sm font-medium text-white/70 hover:text-white">
                        &larr; Back
                    </Link>
                    <span className="ml-4 text-sm font-semibold text-white">
                        Cash Book
                    </span>
                </div>
            </nav>
            <main className="h-[calc(100vh-10rem)] overflow-y-auto bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <div className="flex w-full flex-col gap-3 px-6 pt-4 pb-6 md:gap-6 md:pt-8">
                    <div className="flex items-center gap-2">
                        <button onClick={() => changeMonth(-1)} className="rounded-md p-1 text-[#706f6c] hover:bg-gray-100 hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:bg-[#2a2a28] md:p-1.5">
                            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                        </button>
                        <span className="min-w-[120px] text-center text-xs font-medium text-[#706f6c] dark:text-[#A1A09A] md:min-w-[160px] md:text-sm">
                            {getMonthLabel(activeMonth)}
                        </span>
                        <button onClick={() => changeMonth(1)} className="rounded-md p-1 text-[#706f6c] hover:bg-gray-100 hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:bg-[#2a2a28] md:p-1.5">
                            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                        </button>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="rounded-md border border-[#19140035] bg-white px-2 py-1 text-[10px] text-[#706f6c] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#A1A09A] md:text-xs"
                        />
                        {selectedDate && (
                            <button onClick={() => setSelectedDate('')} className="rounded-md px-2 py-1 text-[10px] font-medium text-[#706f6c] hover:bg-gray-100 hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:bg-[#2a2a28] md:text-xs">
                                Reset
                            </button>
                        )}
                        <button onClick={() => setShowDrawer(true)} className="ml-auto">
                            <Landmark className="h-5 w-5 text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-white md:h-6 md:w-6" />
                        </button>
                    </div>

                    <div className="mx-auto w-full max-w-3xl rounded-lg border border-[#19140035] bg-white p-3 shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615] md:p-4">
                        <div className="flex flex-row border-b border-[#19140035] pb-2 dark:border-[#3E3E3A]">
                            <div className="w-16 text-[8px] font-semibold text-[#706f6c] dark:text-[#A1A09A] md:w-24 md:text-xs">Date</div>
                            <div className="w-12 text-[8px] font-semibold text-[#706f6c] dark:text-[#A1A09A] md:w-16 md:text-xs">Time</div>
                            <div className="flex-1 text-[8px] font-semibold text-[#706f6c] dark:text-[#A1A09A] md:text-xs">Details</div>
                            <div className="w-16 text-center text-[8px] font-semibold text-green-600 md:w-24 md:text-xs">+</div>
                            <div className="w-16 text-center text-[8px] font-semibold text-red-600 md:w-24 md:text-xs">-</div>
                        </div>

                        {filteredEntries.length === 0 ? (
                            <p className="py-4 text-center text-[10px] text-[#706f6c] dark:text-[#A1A09A] md:text-sm">No entries yet.</p>
                        ) : (
                            filteredEntries.map((entry) => (
                                <div key={`${entry.type}-${entry.id}`} className="flex flex-row items-center border-b border-[#19140035]/50 py-1 dark:border-[#3E3E3A]/50">
                                    <div className="w-16 truncate text-[8px] text-[#706f6c] dark:text-[#A1A09A] md:w-24 md:text-xs">{entry.date}</div>
                                    <div className="w-12 truncate text-[8px] text-[#706f6c] dark:text-[#A1A09A] md:w-16 md:text-xs">
                                        {entry.created_at ? new Date(entry.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate text-[8px] font-medium md:text-xs">{entry.name}</p>
                                        {entry.description && <p className="truncate text-[7px] text-[#706f6c] dark:text-[#A1A09A] md:text-[10px]">{entry.description}</p>}
                                    </div>
                                    {entry.type === 'income' ? (
                                        <>
                                            <div className="w-16 text-center text-[8px] font-semibold text-green-600 md:w-24 md:text-xs">+{entry.amount}</div>
                                            <div className="w-16 md:w-24"></div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-16 md:w-24"></div>
                                            <div className="w-16 text-center text-[8px] font-semibold text-red-600 md:w-24 md:text-xs">-{entry.amount}</div>
                                        </>
                                    )}
                                </div>
                            ))
                        )}

                        <div className="flex flex-row items-center border-t border-[#19140035] pt-2 dark:border-[#3E3E3A]">
                            <div className="w-16 md:w-24"></div>
                            <div className="w-12 md:w-16"></div>
                            <div className="flex-1 text-[8px] font-bold md:text-xs">Totals</div>
                            <div className="w-16 text-center text-[8px] font-bold text-green-600 md:w-24 md:text-xs">+{totalIncome.toFixed(2)}</div>
                            <div className="w-16 text-center text-[8px] font-bold text-red-600 md:w-24 md:text-xs">-{totalExpense.toFixed(2)}</div>
                        </div>
                        <hr className="my-2 border-[#19140035] dark:border-[#3E3E3A]" />
                        <div className="flex items-center justify-center py-2">
                            <p className={`text-xs font-bold md:text-sm ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Net: {netAmount >= 0 ? '+' : ''}{netAmount.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            {showDrawer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-2xl rounded-lg border border-[#19140035] bg-white p-4 shadow-lg dark:border-[#3E3E3A] dark:bg-[#161615] md:p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-base font-semibold md:text-lg">Drawer</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={showDrawerForm ? (isDrawerFormFilled ? handleDrawerSubmit : () => setShowDrawerForm(false)) : () => setShowDrawerForm(true)}
                                    className="rounded-md bg-[#00447C] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#003d6f] md:px-4 md:py-2 md:text-sm"
                                >
                                    {showDrawerForm ? (isDrawerFormFilled ? 'Done' : 'Cancel') : '+ Add'}
                                </button>
                                <button onClick={() => setShowDrawer(false)} className="text-sm font-medium text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-white">
                                    &times;
                                </button>
                            </div>
                        </div>
                        <div className="rounded-lg border border-[#19140035] dark:border-[#3E3E3A]">
                                <div className="flex flex-row border-b border-[#19140035] dark:border-[#3E3E3A]">
                                <div className="flex-1 px-3 py-2 text-center text-[10px] font-semibold text-[#706f6c] dark:text-[#A1A09A] md:text-xs border-r border-[#19140035] dark:border-[#3E3E3A]">{selectedDate || new Date().toISOString().slice(0, 10)}</div>
                                <div className="flex-1 px-3 py-2 text-center text-[10px] font-semibold text-[#706f6c] dark:text-[#A1A09A] md:text-xs">New One</div>
                            </div>
                            {showDrawerForm && (
                                <div className="flex flex-row items-center border-b border-[#19140035]/50 dark:border-[#3E3E3A]/50">
                                    <div className="flex-1 p-2">
                                        <input
                                            type="text"
                                            placeholder="Name"
                                            value={drawerName}
                                            onChange={(e) => setDrawerName(e.target.value)}
                                            className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1 text-[10px] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-xs"
                                        />
                                    </div>
                                    <div className="flex-1 p-2">
                                        <input
                                            type="text"
                                            placeholder="Amount"
                                            value={drawerAmount}
                                            onChange={(e) => setDrawerAmount(e.target.value)}
                                            className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1 text-[10px] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-xs"
                                        />
                                    </div>
                                </div>
                            )}
                            {filteredDrawers.map((entry) => (
                                <div key={entry.id} className="flex flex-row items-center">
                                    <div className="flex-1 px-3 py-0.5 text-center border-r border-[#19140035] dark:border-[#3E3E3A]">
                                        <p className="text-[10px] font-medium md:text-xs">{entry.name}</p>
                                    </div>
                                    <div className="flex-1 px-3 py-0.5 text-center text-[10px] font-semibold text-green-600 md:text-xs">+{entry.amount}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
