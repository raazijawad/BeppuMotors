import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Footer from '@/components/footer';

export default function Expenses({ expenses = [], selectedDate = null }) {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const activeDate = selectedDate || today;

    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        expense_name: '',
        amount: '',
        description: '',
        date: activeDate,
    });

    const handleAddExpense = (e) => {
        e.preventDefault();
        post('/expenses', {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <Head title="Expenses" />
            <nav className="relative h-16 md:h-20 w-full border-b border-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a]"></div>
                <div className="relative flex h-full items-center pl-6 md:pl-10">
                    <Link href={`/vehicle-detail?date=${activeDate}`} className="text-sm font-medium text-white/70 hover:text-white">
                        &larr; Back
                    </Link>
                    <span className="ml-4 text-sm font-semibold text-white">
                        Expenses Page
                    </span>
                </div>
            </nav>
            <main className="flex flex-1 overflow-y-auto bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <div className="flex w-full flex-col gap-3 px-6 pt-4 pb-6 md:gap-8 md:pt-8">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                            Date: {activeDate}
                        </span>
                    </div>

                    <div className="mx-auto w-full max-w-md rounded-lg border border-[#19140035] bg-white p-3 shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615] md:p-4">
                        <div className="mb-3 flex items-center justify-between md:mb-4">
                            <h2 className="text-base font-semibold md:text-lg">Expense List</h2>
                            <button
                                onClick={() => setShowForm(true)}
                                className="rounded-md bg-[#00447C] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#003d6f] md:px-4 md:py-2 md:text-sm"
                            >
                                + Add Expense
                            </button>
                        </div>
                        {expenses.length === 0 ? (
                            <p className="text-xs text-[#706f6c] dark:text-[#A1A09A] md:text-sm">No expenses added yet.</p>
                        ) : (
                            <div className="flex flex-col gap-0">
                                {expenses.map((v) => (
                                    <div key={v.id} className="rounded-md py-0.5">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-medium md:text-sm">{v.expense_name}</p>
                                            <p className="text-[10px] font-semibold text-red-600 md:text-xs">-{v.amount}</p>
                                        </div>
                                        {v.description && (
                                            <p className="mt-0.5 text-[10px] text-[#706f6c] dark:text-[#A1A09A] md:mt-1 md:text-xs">{v.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 md:mx-0 w-full max-w-md rounded-lg border border-[#19140035] bg-white p-6 shadow-lg dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <h2 className="mb-4 text-lg font-semibold">Expense Information</h2>
                        <form onSubmit={handleAddExpense}>
                            <div className="mb-4">
                                <label className="mb-1 block text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Expense Name
                                </label>
                                <input
                                    type="text"
                                    value={data.expense_name}
                                    onChange={(e) => setData('expense_name', e.target.value)}
                                    className="w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                    placeholder="Enter expense name"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="mb-1 block text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Amount
                                </label>
                                <input
                                    type="text"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
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
                                    onChange={(e) => setData('description', e.target.value)}
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
                                    onClick={() => { setShowForm(false); reset(); }}
                                    className="rounded-md border border-[#19140035] px-4 py-2 text-sm font-medium dark:border-[#3E3E3A]"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}
