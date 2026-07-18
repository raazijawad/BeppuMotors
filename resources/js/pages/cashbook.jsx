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
                <div className="flex w-full flex-col gap-6 px-6 pt-10 md:pt-8 pb-6">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                            Date: {today}
                        </span>
                    </div>

                    <div className="mx-auto w-full max-w-md rounded-lg border border-[#19140035] bg-white p-4 shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <div className="flex flex-col md:flex-row">
                            <div className="flex-1 md:pr-6">
                                <h2 className="mb-2 text-center text-lg font-semibold text-green-600">+</h2>
                                <hr className="mb-2 border-[#19140035] dark:border-[#3E3E3A]" />
                                {incomes.length === 0 ? (
                                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">No income entries.</p>
                                ) : (
                                    <div className="flex flex-col">
                                        {incomes.map((entry) => (
                                            <div key={entry.id} className="flex items-center justify-between py-0.5">
                                                <p className="text-sm font-medium truncate">{entry.name}</p>
                                                <p className="text-xs font-semibold text-green-600 ml-2">+{entry.amount}</p>
                                            </div>
                                        ))}
                                        <div className="mt-1 flex items-center justify-end px-3 py-1">
                                            <p className="text-xs font-bold text-green-600">Total: +{totalIncome.toFixed(2)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="my-4 h-px w-full bg-[#19140035] md:my-0 md:mx-6 md:h-auto md:w-px dark:bg-[#3E3E3A]"></div>
                            <div className="flex-1 md:pl-6">
                                <h2 className="mb-2 text-center text-lg font-semibold text-red-600">-</h2>
                                <hr className="mb-2 border-[#19140035] dark:border-[#3E3E3A]" />
                                {expenses.length === 0 ? (
                                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">No expense entries.</p>
                                ) : (
                                    <div className="flex flex-col">
                                        {expenses.map((entry) => (
                                            <div key={entry.id} className="flex items-center justify-between py-0.5">
                                                <p className="text-sm font-medium truncate">{entry.name}</p>
                                                <p className="text-xs font-semibold text-red-600 ml-2">-{entry.amount}</p>
                                            </div>
                                        ))}
                                        <div className="mt-1 flex items-center justify-end px-3 py-1">
                                            <p className="text-xs font-bold text-red-600">Total: -{totalExpense.toFixed(2)}</p>
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
