import { Head, Link, useForm, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
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

export default function BuyAuction({ buyAuctions = [], selectedMonth = null }) {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [activeMonth, setActiveMonth] = useState(selectedMonth || currentMonth);
    const [showForm, setShowForm] = useState(false);
    const [confirmPaidId, setConfirmPaidId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [highlightId, setHighlightId] = useState(null);

    const changeMonth = (delta) => {
        const newMonth = addMonths(activeMonth, delta);
        setActiveMonth(newMonth);
        router.get('/auction/buy', { date: `${newMonth}-01` }, { preserveState: true, replace: true });
    };

    useEffect(() => {
        const highlight = new URLSearchParams(window.location.search).get('highlight');
        if (!highlight) return;

        window.history.replaceState({}, '', '/auction/buy');

        const target = buyAuctions.find((item) => String(item.id) === highlight && !item.paid);
        if (target) {
            setConfirmPaidId(target.id);
            setHighlightId(target.id);
            setTimeout(() => {
                document.getElementById(`buy-auction-row-${target.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 pt-4 pb-32 sm:px-6 md:px-8 md:pt-6 lg:px-16">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <button onClick={() => changeMonth(-1)} className="rounded-md p-1 text-[#706f6c] hover:bg-gray-100 hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:bg-[#2a2a28] md:p-1.5">
                                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                            </button>
                            <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                {getMonthLabel(activeMonth)}
                            </span>
                            <button onClick={() => changeMonth(1)} className="rounded-md p-1 text-[#706f6c] hover:bg-gray-100 hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:bg-[#2a2a28] md:p-1.5">
                                <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                            </button>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            className="rounded-md bg-[#00447C] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#003d6f] md:px-4 md:py-2 md:text-sm"
                        >
                            + Buy
                        </button>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-[#19140035] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <table className="w-full text-left text-[10px] md:text-xs">
                            <thead className="border-b border-[#19140035] dark:border-[#3E3E3A]">
                                <tr className="bg-[#FDFDFC] dark:bg-[#0a0a0a]">
                                    <th className="px-3 py-2 md:px-4 lg:px-5 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Date</th>
                                    <th className="px-3 py-2 md:px-4 lg:px-5 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Vehicle Name</th>
                                    <th className="px-3 py-2 md:px-4 lg:px-5 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Company</th>
                                    <th className="px-3 py-2 md:px-4 lg:px-5 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Colour</th>
                                    <th className="px-3 py-2 md:px-4 lg:px-5 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Shop Name</th>
                                    <th className="px-3 py-2 md:px-4 lg:px-5 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Chassis Number</th>
                                    <th className="px-3 py-2 md:px-4 lg:px-5 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Description</th>
                                    <th className="px-3 py-2 md:px-4 lg:px-5 font-semibold text-[#706f6c] dark:text-[#A1A09A]">For Who</th>
                                    <th className="border-r border-[#19140035] dark:border-[#3E3E3A] px-3 py-2 md:px-4 lg:px-5 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Price</th>
                                    <th className="border-r border-[#19140035] dark:border-[#3E3E3A] px-3 py-2 md:px-4 lg:px-5 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Paid</th>
                                </tr>
                            </thead>
                            <tbody>
                                {buyAuctions.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-3 py-6 text-center text-[#706f6c] dark:text-[#A1A09A]">No buy auction items yet.</td>
                                    </tr>
                                ) : (
                                    buyAuctions.map((item) => (
                                        <tr
                                            key={item.id}
                                            id={`buy-auction-row-${item.id}`}
                                            className={`border-b border-[#19140035]/50 dark:border-[#3E3E3A]/50 ${item.paid ? 'bg-green-100 dark:bg-green-900/30' : highlightId === item.id ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'hover:bg-gray-50 dark:hover:bg-[#1a1a19]'}`}
                                        >
                                            <td className="px-3 py-1.5 md:px-4 lg:px-5">{item.date}</td>
                                            <td className="px-3 py-1.5 md:px-4 lg:px-5 font-medium">{item.vehicle_name}</td>
                                            <td className="px-3 py-1.5 md:px-4 lg:px-5">{item.company}</td>
                                            <td className="px-3 py-1.5 md:px-4 lg:px-5">{item.colour}</td>
                                            <td className="px-3 py-1.5 md:px-4 lg:px-5">{item.shopname}</td>
                                            <td className="px-3 py-1.5 md:px-4 lg:px-5">{item.chassisnumber}</td>
                                            <td className="px-3 py-1.5 md:px-4 lg:px-5 min-w-[150px] whitespace-nowrap">{item.description}</td>
                                            <td className="px-3 py-1.5 md:px-4 lg:px-5">{item.for_who}</td>
                                            <td className="border-r border-[#19140035] dark:border-[#3E3E3A] px-3 py-1.5 md:px-4 lg:px-5 font-semibold text-green-600">{parseFloat(item.price)}</td>
                                            <td
                                                onClick={() => !item.paid && setConfirmPaidId(item.id)}
                                                className="border-r border-[#19140035] dark:border-[#3E3E3A] px-3 py-1.5 text-center md:px-4 lg:px-5 cursor-pointer"
                                            >
                                                {item.paid ? (
                                                    <span className="text-[10px] font-semibold text-green-600 md:text-xs">Paid</span>
                                                ) : (
                                                    <span className="text-[10px] font-medium text-green-600 hover:text-green-700 md:text-xs">Paid</span>
                                                )}
                                            </td>
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
            {confirmPaidId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-sm rounded-lg border border-[#19140035] bg-white p-5 shadow-lg dark:border-[#3E3E3A] dark:bg-[#161615] md:p-6">
                        <h2 className="mb-4 text-base font-semibold md:text-lg">Confirm Payment</h2>
                        <p className="mb-4 text-sm text-[#706f6c] dark:text-[#A1A09A]">Are you sure you want to mark this item as paid?</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    router.post(`/auction/buy/${confirmPaidId}/paid`);
                                    setConfirmPaidId(null);
                                    setHighlightId(null);
                                }}
                                className="rounded-md bg-green-600 px-4 py-2 text-xs font-medium text-white hover:bg-green-700 md:text-sm"
                            >
                                Confirm Paid
                            </button>
                            <button
                                onClick={() => { setConfirmPaidId(null); setHighlightId(null); }}
                                className="rounded-md border border-[#19140035] px-4 py-2 text-xs font-medium dark:border-[#3E3E3A] md:text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {confirmDeleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-sm rounded-lg border border-[#19140035] bg-white p-5 shadow-lg dark:border-[#3E3E3A] dark:bg-[#161615] md:p-6">
                        <h2 className="mb-4 text-base font-semibold md:text-lg">Confirm Delete</h2>
                        <p className="mb-4 text-sm text-[#706f6c] dark:text-[#A1A09A]">Are you sure you want to delete this item? This will also remove the linked expense.</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    router.delete(`/auction/buy/${confirmDeleteId}`);
                                    setConfirmDeleteId(null);
                                }}
                                className="rounded-md bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700 md:text-sm"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="rounded-md border border-[#19140035] px-4 py-2 text-xs font-medium dark:border-[#3E3E3A] md:text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className={(showForm || confirmPaidId || confirmDeleteId) ? 'blur-sm pointer-events-none' : ''}>
                <Footer />
            </div>
        </div>
    );
}
