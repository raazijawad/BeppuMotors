import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Footer from '@/components/footer';

export default function BuyAuction({ buyAuctions = [] }) {
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        date: '',
        vehicle_name: '',
        company: '',
        colour: '',
        shopname: '',
        chassisnumber: '',
        description: '',
        for_who: '',
        price: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/auction/buy', {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <Head title="Buy Auction" />
            <nav className="relative h-16 md:h-20 w-full border-b border-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a]"></div>
                <div className="relative flex h-full items-center pl-6 md:pl-10">
                    <Link href="/auction" className="text-sm font-medium text-white/70 hover:text-white">
                        &larr; Back
                    </Link>
                    <span className="ml-4 text-sm font-semibold text-white md:text-base">
                        Buy Auction
                    </span>
                </div>
            </nav>
            <main className="flex flex-1 overflow-y-auto bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 pt-4 pb-6 sm:px-6 md:px-8 md:pt-6 lg:px-10">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-base">Buy Auction Items</span>
                        <button
                            onClick={() => setShowForm(true)}
                            className="rounded-md bg-[#00447C] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#003d6f] md:px-4 md:py-2 md:text-sm"
                        >
                            + Buy
                        </button>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-[#19140035] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <table className="w-full text-left text-[10px] md:text-xs lg:text-sm">
                            <thead className="border-b border-[#19140035] dark:border-[#3E3E3A]">
                                <tr className="bg-[#FDFDFC] dark:bg-[#0a0a0a]">
                                    <th className="px-2 py-2 md:px-3 lg:px-4 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Date</th>
                                    <th className="px-2 py-2 md:px-3 lg:px-4 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Vehicle Name</th>
                                    <th className="px-2 py-2 md:px-3 lg:px-4 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Company</th>
                                    <th className="px-2 py-2 md:px-3 lg:px-4 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Colour</th>
                                    <th className="px-2 py-2 md:px-3 lg:px-4 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Shop Name</th>
                                    <th className="px-2 py-2 md:px-3 lg:px-4 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Chassis Number</th>
                                    <th className="px-2 py-2 md:px-3 lg:px-4 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Description</th>
                                    <th className="px-2 py-2 md:px-3 lg:px-4 font-semibold text-[#706f6c] dark:text-[#A1A09A]">For Who</th>
                                    <th className="px-2 py-2 md:px-3 lg:px-4 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {buyAuctions.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-2 py-6 text-center text-[#706f6c] dark:text-[#A1A09A]">No buy auction items yet.</td>
                                    </tr>
                                ) : (
                                    buyAuctions.map((item) => (
                                        <tr key={item.id} className="border-b border-[#19140035]/50 dark:border-[#3E3E3A]/50 hover:bg-gray-50 dark:hover:bg-[#1a1a19]">
                                            <td className="px-2 py-1.5 md:px-3 lg:px-4">{item.date}</td>
                                            <td className="px-2 py-1.5 md:px-3 lg:px-4 font-medium">{item.vehicle_name}</td>
                                            <td className="px-2 py-1.5 md:px-3 lg:px-4">{item.company}</td>
                                            <td className="px-2 py-1.5 md:px-3 lg:px-4">{item.colour}</td>
                                            <td className="px-2 py-1.5 md:px-3 lg:px-4">{item.shopname}</td>
                                            <td className="px-2 py-1.5 md:px-3 lg:px-4">{item.chassisnumber}</td>
                                            <td className="px-2 py-1.5 md:px-3 lg:px-4 max-w-[120px] truncate">{item.description}</td>
                                            <td className="px-2 py-1.5 md:px-3 lg:px-4">{item.for_who}</td>
                                            <td className="px-2 py-1.5 md:px-3 lg:px-4 font-semibold text-green-600">{parseFloat(item.price)}</td>
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
                    <div className="mx-4 w-full max-w-lg rounded-lg border border-[#19140035] bg-white p-5 shadow-lg dark:border-[#3E3E3A] dark:bg-[#161615] md:mx-0 md:p-6 lg:max-w-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-base font-semibold md:text-lg">Buy Auction Item</h2>
                            <button onClick={() => { setShowForm(false); reset(); }} className="text-sm text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-white">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 md:gap-4">
                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">Date</label>
                                <input type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} className="w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:py-2 md:text-sm" required />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">Vehicle Name</label>
                                <input type="text" value={data.vehicle_name} onChange={(e) => setData('vehicle_name', e.target.value)} className="w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:py-2 md:text-sm" required />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">Company</label>
                                <input type="text" value={data.company} onChange={(e) => setData('company', e.target.value)} className="w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:py-2 md:text-sm" />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">Colour</label>
                                <input type="text" value={data.colour} onChange={(e) => setData('colour', e.target.value)} className="w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:py-2 md:text-sm" />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">Shop Name</label>
                                <input type="text" value={data.shopname} onChange={(e) => setData('shopname', e.target.value)} className="w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:py-2 md:text-sm" />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">Chassis Number</label>
                                <input type="text" value={data.chassisnumber} onChange={(e) => setData('chassisnumber', e.target.value)} className="w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:py-2 md:text-sm" />
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">Description</label>
                                <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} className="w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:py-2 md:text-sm" rows={2} />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">For Who</label>
                                <input type="text" value={data.for_who} onChange={(e) => setData('for_who', e.target.value)} className="w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:py-2 md:text-sm" />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">Price</label>
                                <input type="number" value={data.price} onChange={(e) => setData('price', e.target.value)} className="w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:py-2 md:text-sm" required />
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
