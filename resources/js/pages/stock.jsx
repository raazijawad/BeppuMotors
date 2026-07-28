import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Footer from '@/components/footer';

export default function Stock({ stocks = [] }) {
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        name: '',
        company: '',
        colour: '',
        shopname: '',
        chassisnumber: '',
        description: '',
        price: '',
        t_price: '',
        n_price: '',
        a_price: '',
        expected_profit: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/stock', {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <Head title="Stock" />
            <nav className="relative h-16 md:h-20 w-full border-b border-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a]"></div>
                <div className="relative flex h-full items-center pl-6 md:pl-10">
                    <Link href="/vehicle-detail" className="text-sm font-medium text-white/70 hover:text-white">
                        &larr; Back
                    </Link>
                    <span className="ml-4 text-sm font-semibold text-white">
                        Stock Page
                    </span>
                </div>
            </nav>
            <main className="flex-1 overflow-y-auto bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <div className="flex flex-col gap-4 px-6 pt-4 pb-6 md:pt-6">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">Stock Items</span>
                        <button
                            onClick={() => setShowForm(true)}
                            className="rounded-md bg-[#00447C] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#003d6f] md:px-4 md:py-2 md:text-sm"
                        >
                            + Add Item
                        </button>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-[#19140035] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <table className="w-full text-left text-[10px] md:text-xs">
                            <thead className="border-b border-[#19140035] dark:border-[#3E3E3A]">
                                <tr className="bg-[#FDFDFC] dark:bg-[#0a0a0a]">
                                    <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Name</th>
                                    <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Company</th>
                                    <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Colour</th>
                                    <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Shop</th>
                                    <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Chassis</th>
                                    <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Description</th>
                                    <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Price</th>
                                    <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">T Price</th>
                                    <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">N Price</th>
                                    <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">A Price</th>
                                    <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Expected Profit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stocks.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="px-2 py-6 text-center text-[#706f6c] dark:text-[#A1A09A]">No stock items added yet.</td>
                                    </tr>
                                ) : (
                                    stocks.map((s) => (
                                        <tr key={s.id} className="border-b border-[#19140035]/50 dark:border-[#3E3E3A]/50 hover:bg-gray-50 dark:hover:bg-[#1a1a19]">
                                            <td className="px-2 py-1.5 font-medium">{s.name}</td>
                                            <td className="px-2 py-1.5">{s.company}</td>
                                            <td className="px-2 py-1.5">{s.colour}</td>
                                            <td className="px-2 py-1.5">{s.shopname}</td>
                                            <td className="px-2 py-1.5">{s.chassisnumber}</td>
                                            <td className="px-2 py-1.5 max-w-[120px] truncate">{s.description}</td>
                                            <td className="px-2 py-1.5">{parseFloat(s.price)}</td>
                                            <td className="px-2 py-1.5">{parseFloat(s.t_price)}</td>
                                            <td className="px-2 py-1.5">{parseFloat(s.n_price)}</td>
                                            <td className="px-2 py-1.5">{parseFloat(s.a_price)}</td>
                                            <td className="px-2 py-1.5 font-semibold text-green-600">{parseFloat(s.expected_profit)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-lg rounded-lg border border-[#19140035] bg-white p-5 shadow-lg dark:border-[#3E3E3A] dark:bg-[#161615] md:p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-base font-semibold md:text-lg">Add Stock Item</h2>
                            <button onClick={() => setShowForm(false)} className="text-sm text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-white">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">Name</label>
                                <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm" required />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">Company</label>
                                <input type="text" value={data.company} onChange={(e) => setData('company', e.target.value)} className="w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm" />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">Colour</label>
                                <input type="text" value={data.colour} onChange={(e) => setData('colour', e.target.value)} className="w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm" />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">Shop Name</label>
                                <input type="text" value={data.shopname} onChange={(e) => setData('shopname', e.target.value)} className="w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm" />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">Chassis Number</label>
                                <input type="text" value={data.chassisnumber} onChange={(e) => setData('chassisnumber', e.target.value)} className="w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm" />
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">Description</label>
                                <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} className="w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm" rows={2} />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">Price</label>
                                <input type="number" value={data.price} onChange={(e) => setData('price', e.target.value)} className="w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm" required />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">T Price</label>
                                <input type="number" value={data.t_price} onChange={(e) => setData('t_price', e.target.value)} className="w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm" required />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">N Price</label>
                                <input type="number" value={data.n_price} onChange={(e) => setData('n_price', e.target.value)} className="w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm" required />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">A Price</label>
                                <input type="number" value={data.a_price} onChange={(e) => setData('a_price', e.target.value)} className="w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm" required />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">Expected Profit</label>
                                <input type="number" value={data.expected_profit} onChange={(e) => setData('expected_profit', e.target.value)} className="w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm" required />
                            </div>
                            <div className="col-span-2 flex gap-2 pt-2">
                                <button type="submit" disabled={processing} className="rounded-md bg-[#00447C] px-4 py-2 text-xs font-medium text-white hover:bg-[#003d6f] disabled:opacity-50 md:text-sm">Submit</button>
                                <button type="button" onClick={() => { reset(); setShowForm(false); }} className="rounded-md border border-[#19140035] px-4 py-2 text-xs font-medium dark:border-[#3E3E3A] md:text-sm">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}
