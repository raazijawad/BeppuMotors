import { Head, Link } from '@inertiajs/react';
import { Landmark } from 'lucide-react';
import Footer from '@/components/footer';

export default function Cashbook({ entries = [], selectedMonth = null }) {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const activeMonth = selectedMonth || currentMonth;

    const totalIncome = entries.filter((e) => e.type === 'income').reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const totalExpense = entries.filter((e) => e.type === 'expense').reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const netAmount = totalIncome - totalExpense;

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
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                            Month: {activeMonth}
                        </span>
                        <Link href="/drawer" className="ml-auto">
                            <Landmark className="h-5 w-5 text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-white md:h-6 md:w-6" />
                        </Link>
                    </div>

                    <div className="mx-auto w-full max-w-3xl rounded-lg border border-[#19140035] bg-white p-3 shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615] md:p-4">
                        <div className="flex flex-row border-b border-[#19140035] pb-2 dark:border-[#3E3E3A]">
                            <div className="w-16 text-[8px] font-semibold text-[#706f6c] dark:text-[#A1A09A] md:w-24 md:text-xs">Date</div>
                            <div className="w-12 text-[8px] font-semibold text-[#706f6c] dark:text-[#A1A09A] md:w-16 md:text-xs">Time</div>
                            <div className="flex-1 text-[8px] font-semibold text-[#706f6c] dark:text-[#A1A09A] md:text-xs">Details</div>
                            <div className="w-16 text-center text-[8px] font-semibold text-green-600 md:w-24 md:text-xs">+</div>
                            <div className="w-16 text-center text-[8px] font-semibold text-red-600 md:w-24 md:text-xs">-</div>
                        </div>

                        {entries.length === 0 ? (
                            <p className="py-4 text-center text-[10px] text-[#706f6c] dark:text-[#A1A09A] md:text-sm">No entries yet.</p>
                        ) : (
                            entries.map((entry) => (
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
        </div>
    );
}
