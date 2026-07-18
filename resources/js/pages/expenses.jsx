import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Footer from '@/components/footer';

export default function Expenses({ expenses = [], selectedDate = null }) {
    const today = selectedDate || new Date().toISOString().slice(0, 10);

    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        expense_name: '',
        amount: '',
        description: '',
        date: today,
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
                    <Link href={`/vehicle-detail?date=${today}`} className="text-sm font-medium text-white/70 hover:text-white">
                        &larr; Back
                    </Link>
                    <span className="ml-4 text-sm font-semibold text-white">
                        Expenses Page
                    </span>
                </div>
            </nav>
            <main className="flex flex-1 overflow-y-auto bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <div className="flex w-full flex-col gap-8 px-6 pt-10 md:pt-8 pb-6">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                            Date: {today}
                        </span>
                    </div>

                    <div className="mx-auto w-full max-w-md rounded-lg border border-[#19140035] bg-white p-4 shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Expense List</h2>
                            <button
                                onClick={() => setShowForm(true)}
                                className="rounded-md bg-[#00447C] px-4 py-2 text-sm font-medium text-white hover:bg-[#003d6f]"
                            >
                                + Add Expense
                            </button>
                        </div>
                        {expenses.length === 0 ? (
                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">No expenses added yet.</p>
                        ) : (
                            <div className="flex flex-col gap-0">
                                {expenses.map((v) => (
                                    <div key={v.id} className="rounded-md py-0.5">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">{v.expense_name}</p>
                                            <p className="text-xs font-semibold text-red-600">-{v.amount}</p>
                                        </div>
                                        {v.description && (
                                            <p className="mt-1 text-xs text-[#706f6c] dark:text-[#A1A09A]">{v.description}</p>
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
