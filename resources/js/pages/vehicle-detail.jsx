import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import Footer from '@/components/footer';

export default function VehicleDetail() {
    const [showList, setShowList] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [incomes, setIncomes] = useState([]);
    const [incomeName, setIncomeName] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const handleAddIncome = () => {
        if (incomeName && amount) {
            setIncomes([...incomes, { incomeName, amount }]);
            setIncomeName('');
            setAmount('');
            setShowForm(false);
        }
    };

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <Head title="Vehicle Detail" />
            <nav className="relative h-16 md:h-20 w-full border-b border-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a]"></div>
                <div className="relative flex h-full items-center pl-6 md:pl-10">
                    <Link href="/" className="text-sm font-medium text-white/70 hover:text-white">
                        &larr; Back
                    </Link>
                    <span className="ml-4 text-sm font-semibold text-white">
                        Vehicle Details Page
                    </span>
                </div>
            </nav>
            <main className="flex flex-1 overflow-y-auto bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <div className="flex w-full flex-col gap-8 px-6 pt-10 md:pt-8 pb-6">
                    {showList ? (
                        <div className="w-full rounded-lg border border-[#19140035] bg-white p-6 shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold">Income List</h2>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="rounded-md bg-[#00447C] px-4 py-2 text-sm font-medium text-white hover:bg-[#003d6f]"
                                >
                                    + Add Income
                                </button>
                            </div>
                            {incomes.length === 0 ? (
                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">No income added yet.</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {incomes.map((v, i) => (
                                        <div key={i} className="rounded-md border border-[#19140035] p-3 dark:border-[#3E3E3A]">
                                            <p className="text-sm font-medium">{v.incomeName}</p>
                                            <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">{v.amount}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button
                                onClick={() => setShowList(false)}
                                className="mt-4 rounded-md border border-[#19140035] px-4 py-2 text-sm font-medium dark:border-[#3E3E3A]"
                            >
                                Back
                            </button>
                        </div>
                    ) : (
                        <div className="grid w-full grid-cols-2 gap-4 gap-y-8 md:grid-cols-6 md:gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    onClick={i === 0 ? () => setShowList(true) : undefined}
                                    className={`flex h-44 items-center justify-center rounded-lg border border-[#19140035] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615] md:h-28 ${i === 0 ? 'cursor-pointer hover:shadow-md' : ''}`}
                                >
                                    <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                        {i === 0 ? '+' : i === 1 ? '-' : i === 2 ? 'Stock' : i === 3 ? 'Customers' : i === 4 ? 'Oction' : 'Cash Book'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 md:mx-0 w-full max-w-md rounded-lg border border-[#19140035] bg-white p-6 shadow-lg dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <h2 className="mb-4 text-lg font-semibold">Income Information</h2>
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Income Name
                            </label>
                            <input
                                type="text"
                                value={incomeName}
                                onChange={(e) => setIncomeName(e.target.value)}
                                className="w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                placeholder="Enter income name"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Amount
                            </label>
                            <input
                                type="text"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                placeholder="Enter amount"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                placeholder="Enter description"
                                rows={3}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddIncome}
                                className="rounded-md bg-[#00447C] px-4 py-2 text-sm font-medium text-white hover:bg-[#003d6f]"
                            >
                                Submit
                            </button>
                            <button
                                onClick={() => { setShowForm(false); setIncomeName(''); setAmount(''); }}
                                className="rounded-md border border-[#19140035] px-4 py-2 text-sm font-medium dark:border-[#3E3E3A]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}
