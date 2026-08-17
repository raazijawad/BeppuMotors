import { Head, Link, useForm } from '@inertiajs/react';
import { Car } from 'lucide-react';
import { useState } from 'react';
import Footer from '@/components/footer';

export default function Expenses({ expenses = [], selectedDate = null }) {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const activeDate = selectedDate || today;

    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [showStockFields, setShowStockFields] = useState(false);
    const [filterDate, setFilterDate] = useState('');

    const { data, setData, post, put, processing, reset } = useForm({
        expense_name: '',
        amount: '',
        description: '',
        date: activeDate,
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
        setData('date', activeDate);
        setShowForm(true);
    };

    const openEditForm = (expense) => {
        setEditingExpense(expense);
        const stock = expense.stock;
        setShowStockFields(!!stock);
        setData({
            expense_name: expense.expense_name,
            amount: expense.amount,
            description: expense.description || '',
            date: expense.date,
            name: stock?.name || '',
            company: stock?.company || '',
            colour: stock?.colour || '',
            shopname: stock?.shopname || '',
            chassisnumber: stock?.chassisnumber || '',
            price: stock ? parseFloat(stock.price) : '',
            t_price: stock ? parseFloat(stock.t_price) : '',
            n_price: stock ? parseFloat(stock.n_price) : '',
            a_price: stock ? parseFloat(stock.a_price) : '',
            expected_profit: stock ? parseFloat(stock.expected_profit) : '',
        });
        setShowForm(true);
    };

    const filteredExpenses = filterDate
        ? expenses.filter((v) => v.date === filterDate)
        : expenses;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingExpense) {
            put(`/expenses/${editingExpense.id}`, {
                onSuccess: () => {
                    reset();
                    setEditingExpense(null);
                    setShowForm(false);
                },
            });
        } else {
            post('/expenses', {
                onSuccess: () => {
                    reset();
                    setShowForm(false);
                },
            });
        }
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
                    <div className="flex items-center gap-3">
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
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

                    <div className="mx-auto w-full max-w-md rounded-lg border border-[#19140035] bg-white p-3 shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615] md:p-4">
                        <div className="mb-3 flex items-center justify-between md:mb-4">
                            <h2 className="text-base font-semibold md:text-lg">Expense List</h2>
                            <button
                                onClick={openAddForm}
                                className="rounded-md bg-[#00447C] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#003d6f] md:px-4 md:py-2 md:text-sm"
                            >
                                + Add Expense
                            </button>
                        </div>
                        {filteredExpenses.length === 0 ? (
                            <p className="text-xs text-[#706f6c] dark:text-[#A1A09A] md:text-sm">No expenses added yet.</p>
                        ) : (
                            <div className="flex flex-col gap-0">
                                <div className="flex items-center border-b border-[#19140035] pb-1 dark:border-[#3E3E3A]">
                                    <div className="w-20 text-[10px] font-semibold text-[#706f6c] dark:text-[#A1A09A] md:w-24 md:text-xs">Date</div>
                                    <div className="w-14 text-[10px] font-semibold text-[#706f6c] dark:text-[#A1A09A] md:w-16 md:text-xs">Time</div>
                                    <div className="flex-1 text-[10px] font-semibold text-[#706f6c] dark:text-[#A1A09A] md:text-xs">Details</div>
                                    <div className="w-20 text-right text-[10px] font-semibold text-red-600 md:w-24 md:text-xs">Amount</div>
                                </div>
                                {filteredExpenses.map((v) => (
                                    <div
                                        key={v.id}
                                        onClick={() => openEditForm(v)}
                                        className="flex cursor-pointer items-center border-b border-[#19140035]/50 py-1 hover:bg-gray-50 dark:border-[#3E3E3A]/50 dark:hover:bg-[#1a1a19]"
                                    >
                                        <div className="w-20 truncate text-[10px] text-[#706f6c] dark:text-[#A1A09A] md:w-24 md:text-xs">{v.date || ''}</div>
                                        <div className="w-14 truncate text-[10px] text-[#706f6c] dark:text-[#A1A09A] md:w-16 md:text-xs">
                                            {v.created_at ? new Date(v.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate text-[10px] font-medium md:text-xs">{v.expense_name}</p>
                                            {v.description && <p className="truncate text-[9px] text-[#706f6c] dark:text-[#A1A09A] md:text-[10px]">{v.description}</p>}
                                        </div>
                                        <div className="w-20 text-right text-[10px] font-semibold text-red-600 md:w-24 md:text-xs">-{v.amount}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className={`mx-4 w-full ${showStockFields ? 'md:max-w-4xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto rounded-lg border border-[#19140035] bg-white p-6 shadow-lg dark:border-[#3E3E3A] dark:bg-[#161615]`}>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">{editingExpense ? 'Edit Expense' : 'Expense Information'}</h2>
                            <button
                                type="button"
                                onClick={() => setShowStockFields(!showStockFields)}
                                title="Add vehicle to stock"
                                className={`rounded-md p-1.5 transition-colors ${showStockFields ? 'bg-[#00447C] text-white' : 'text-[#706f6c] hover:bg-gray-100 hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:bg-[#2a2a28] dark:hover:text-white'}`}
                            >
                                <Car className="h-4 w-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={`${showStockFields ? 'md:grid md:grid-cols-2 md:gap-6' : ''}`}>
                                <div>
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
                                </div>
                                {showStockFields && (
                                    <div className="mb-4 rounded-lg border border-[#19140035] p-3 dark:border-[#3E3E3A] md:mb-0">
                                        <p className="mb-3 text-xs font-semibold text-[#706f6c] dark:text-[#A1A09A]">Vehicle / Stock Details</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A]">Name</label>
                                                <input
                                                    type="text"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                    placeholder="Vehicle name"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A]">Company</label>
                                                <input
                                                    type="text"
                                                    value={data.company}
                                                    onChange={(e) => setData('company', e.target.value)}
                                                    className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                    placeholder="Company"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A]">Colour</label>
                                                <input
                                                    type="text"
                                                    value={data.colour}
                                                    onChange={(e) => setData('colour', e.target.value)}
                                                    className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                    placeholder="Colour"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A]">Shop Name</label>
                                                <input
                                                    type="text"
                                                    value={data.shopname}
                                                    onChange={(e) => setData('shopname', e.target.value)}
                                                    className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                    placeholder="Shop name"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A]">Chassis Number</label>
                                                <input
                                                    type="text"
                                                    value={data.chassisnumber}
                                                    onChange={(e) => setData('chassisnumber', e.target.value)}
                                                    className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                    placeholder="Chassis number"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A]">Price</label>
                                                <input
                                                    type="number"
                                                    value={data.price}
                                                    onChange={(e) => setData('price', e.target.value)}
                                                    className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A]">T Price</label>
                                                <input
                                                    type="number"
                                                    value={data.t_price}
                                                    onChange={(e) => setData('t_price', e.target.value)}
                                                    className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A]">N Price</label>
                                                <input
                                                    type="number"
                                                    value={data.n_price}
                                                    onChange={(e) => setData('n_price', e.target.value)}
                                                    className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A]">A Price</label>
                                                <input
                                                    type="number"
                                                    value={data.a_price}
                                                    onChange={(e) => setData('a_price', e.target.value)}
                                                    className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A]">Expected Profit</label>
                                                <input
                                                    type="number"
                                                    value={data.expected_profit}
                                                    onChange={(e) => setData('expected_profit', e.target.value)}
                                                    className="w-full rounded-md border border-[#19140035] bg-white px-2 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-md bg-[#00447C] px-4 py-2 text-sm font-medium text-white hover:bg-[#003d6f]"
                                >
                                    {editingExpense ? 'Update' : 'Submit'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowForm(false); setEditingExpense(null); reset(); }}
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
