import { Head, Link } from '@inertiajs/react';
import Footer from '@/components/footer';

export default function Cashbook({ incomes = [], expenses = [], selectedDate = null }) {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const totalIncome = incomes.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const totalExpense = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <Head title="Cash Book" />
            <nav className="relative h-16 md:h-20 w-full border-b border-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a]"></div>
                <div className="relative flex h-full items-center pl-6 md:pl-10">
                    <Link href={`/vehicle-detail?date=${today}`} className="text-sm font-medium text-white/70 hover:text-white">
                        &larr; Back
                    </Link>
                    <span className="ml-4 text-sm font-semibold text-white">
                        Cash Book
                    </span>
                </div>
            </nav>
            <main className="flex flex-1 overflow-y-auto bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <div className="flex w-full flex-col gap-3 px-6 pt-4 pb-6 md:gap-6 md:pt-8">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                            Date: {today}
                        </span>
                    </div>

                    <div className="mx-auto w-full max-w-md rounded-lg border border-[#19140035] bg-white p-3 shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615] md:p-4">
                        <div className="flex flex-col md:flex-row">
                            <div className="flex-1 md:pr-6">
                                <h2 className="mb-1 text-center text-base font-semibold text-green-600 md:mb-2 md:text-lg">+</h2>
                                <hr className="mb-1.5 border-[#19140035] dark:border-[#3E3E3A] md:mb-2" />
                                {incomes.length === 0 ? (
                                    <p className="text-xs text-[#706f6c] dark:text-[#A1A09A] md:text-sm">No income entries.</p>
                                ) : (
                                    <div className="flex flex-col">
                                        {incomes.map((entry) => (
                                            <div key={entry.id} className="flex items-center justify-between py-0.5">
                                                <p className="text-xs font-medium truncate md:text-sm">{entry.name}</p>
                                                <p className="ml-2 text-[10px] font-semibold text-green-600 md:text-xs">+{entry.amount}</p>
                                            </div>
                                        ))}
                                        <div className="mt-0.5 flex items-center justify-end px-2 py-0.5 md:mt-1 md:px-3 md:py-1">
                                            <p className="text-[10px] font-bold text-green-600 md:text-xs">Total: +{totalIncome.toFixed(2)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="my-3 h-px w-full bg-[#19140035] md:my-0 md:mx-6 md:h-auto md:w-px dark:bg-[#3E3E3A]"></div>
                            <div className="flex-1 md:pl-6">
                                <h2 className="mb-1 text-center text-base font-semibold text-red-600 md:mb-2 md:text-lg">-</h2>
                                <hr className="mb-1.5 border-[#19140035] dark:border-[#3E3E3A] md:mb-2" />
                                {expenses.length === 0 ? (
                                    <p className="text-xs text-[#706f6c] dark:text-[#A1A09A] md:text-sm">No expense entries.</p>
                                ) : (
                                    <div className="flex flex-col">
                                        {expenses.map((entry) => (
                                            <div key={entry.id} className="flex items-center justify-between py-0.5">
                                                <p className="text-xs font-medium truncate md:text-sm">{entry.name}</p>
                                                <p className="ml-2 text-[10px] font-semibold text-red-600 md:text-xs">-{entry.amount}</p>
                                            </div>
                                        ))}
                                        <div className="mt-0.5 flex items-center justify-end px-2 py-0.5 md:mt-1 md:px-3 md:py-1">
                                            <p className="text-[10px] font-bold text-red-600 md:text-xs">Total: -{totalExpense.toFixed(2)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
