import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import Footer from '@/components/footer';

function formatAmountInput(value, integerDigits = 8) {
    const cleaned = String(value ?? '')
        .replace(/,/g, '')
        .replace(/[^\d.]/g, '');

    const [whole = '', fraction = ''] = cleaned.split('.');

    const grouped = whole
        .slice(0, integerDigits)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return cleaned.includes('.')
        ? `${grouped}.${fraction.slice(0, 2)}`
        : grouped;
}

function formatPrefillAmount(value) {
    const raw = String(value ?? '').replace(/,/g, '');
    return formatAmountInput(raw.replace(/\.0+$/, ''));
}

function formatDisplayAmount(value) {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(value);
    if (Number.isNaN(num)) return String(value);
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export default function Stock({ stocks = [] }) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [confirming, setConfirming] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [search, setSearch] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const searchInputRef = useRef(null);

    useEffect(() => {
        if (searchOpen) searchInputRef.current?.focus();
    }, [searchOpen]);

    const filteredStocks = stocks.filter((s) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return [
            s.name,
            s.company,
            s.colour,
            s.shopname,
            s.chassisnumber,
            s.description,
        ].some((field) => String(field ?? '').toLowerCase().includes(q));
    });

    const totalExpectedProfit = filteredStocks.reduce(
        (sum, s) => sum + (Number(s.expected_profit) || 0),
        0,
    );

    useEffect(() => {
        const check = () => setIsSmallScreen(window.innerWidth <= 414 && window.innerHeight <= 900);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const { data, setData, post, put, processing, reset, transform } = useForm({
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

    const stripCommas = (d) => ({
        ...d,
        price: String(d.price ?? '').replace(/,/g, ''),
        t_price: String(d.t_price ?? '').replace(/,/g, ''),
        n_price: String(d.n_price ?? '').replace(/,/g, ''),
        a_price: String(d.a_price ?? '').replace(/,/g, ''),
        expected_profit: String(d.expected_profit ?? '').replace(/,/g, ''),
    });

    const closeForm = () => {
        reset();
        setShowForm(false);
        setEditingId(null);
    };

    const openAddForm = () => {
        reset();
        setEditingId(null);
        setShowForm(true);
    };

    const openEditForm = (s) => {
        reset();
        Object.keys(data).forEach((key) =>
            setData(
                key,
                key.endsWith('_price') || key === 'price' || key === 'expected_profit'
                    ? formatPrefillAmount(s[key])
                    : (s[key] ?? ''),
            ),
        );
        setEditingId(s.id);
        setShowForm(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            setConfirming(true);
            return;
        }
        transform(stripCommas);
        post('/stock', {
            onSuccess: () => {
                router.flushAll();
                router.prefetch('/vehicle-detail', {}, { cacheFor: 300000 });
                closeForm();
            },
        });
    };

    const saveUpdate = (id) => {
        setConfirming(false);
        transform(stripCommas);
        put(`/stock/${id}`, {
            onSuccess: () => {
                router.flushAll();
                router.prefetch('/vehicle-detail', {}, { cacheFor: 300000 });
                closeForm();
            },
        });
    };

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <Head title="Stock" />
            <nav className="relative h-16 md:h-20 w-full border-b border-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a]"></div>
                <div className="relative flex h-full items-center pl-6 md:pl-10">
                    <Link href="/vehicle-detail" prefetch={['mount', 'hover']} cacheFor={300000} className="text-sm font-medium text-white/70 hover:text-white">
                        &larr; Back
                    </Link>
                    <span className="ml-4 text-sm font-semibold text-white">
                        Stock Page
                    </span>
                </div>
            </nav>
            <main className="flex-1 overflow-y-auto bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <div className="flex flex-col gap-4 px-6 pt-4 pb-6 md:pt-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className={`flex items-center gap-4 ${searchOpen ? 'w-full' : ''}`}>
                            {!searchOpen && (
                                <>
                                    <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">Stock Items</span>
                                    <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                        Total Vehicles : {stocks.length}
                                    </span>
                                </>
                            )}
                            {searchOpen ? (
                                <span className="flex w-full items-center gap-1">
                                    <input
                                        ref={searchInputRef}
                                        type="search"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Escape') {
                                                setSearch('');
                                                setSearchOpen(false);
                                            }
                                        }}
                                        placeholder="Search..."
                                        className="w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs text-[#1b1b18] placeholder-[#706f6c] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-white md:w-48 md:text-sm"
                                    />
                                    <button
                                        onClick={() => {
                                            setSearch('');
                                            setSearchOpen(false);
                                        }}
                                        aria-label="Close search"
                                        className="shrink-0 text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-white"
                                    >
                                        &times;
                                    </button>
                                </span>
                            ) : (
                                <button
                                    onClick={() => setSearchOpen(true)}
                                    aria-label="Search"
                                    className="shrink-0 text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-white"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.34-4.34m1.09-5.41a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0Z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        {!searchOpen && (
                            <button
                                onClick={openAddForm}
                                className="shrink-0 rounded-md bg-[#00447C] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#003d6f] md:px-4 md:py-2 md:text-sm"
                            >
                                + Add Item
                            </button>
                        )}
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
                                {filteredStocks.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="px-2 py-6 text-center text-[#706f6c] dark:text-[#A1A09A]">{search.trim() ? 'No stock items match your search.' : 'No stock items added yet.'}</td>
                                    </tr>
                                ) : (
                                    filteredStocks.map((s) => (
                                        <tr
                                            key={s.id}
                                            onClick={() => openEditForm(s)}
                                            className="cursor-pointer border-b border-[#19140035]/50 dark:border-[#3E3E3A]/50 hover:bg-gray-50 dark:hover:bg-[#1a1a19]"
                                        >
                                            <td className="px-2 py-1.5 font-medium">{s.name}</td>
                                            <td className="px-2 py-1.5">{s.company}</td>
                                            <td className="px-2 py-1.5">{s.colour}</td>
                                            <td className="px-2 py-1.5">{s.shopname}</td>
                                            <td className="px-2 py-1.5">{s.chassisnumber}</td>
                                            <td className="px-2 py-1.5 max-w-[120px] truncate">{s.description}</td>
                                            <td className="px-2 py-1.5">{formatDisplayAmount(s.price)}</td>
                                            <td className="px-2 py-1.5">{formatDisplayAmount(s.t_price)}</td>
                                            <td className="px-2 py-1.5">{formatDisplayAmount(s.n_price)}</td>
                                            <td className="px-2 py-1.5">{formatDisplayAmount(s.a_price)}</td>
                                            <td className="px-2 py-1.5 font-semibold text-green-600">{formatDisplayAmount(s.expected_profit)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {filteredStocks.length > 0 && (
                                <tfoot className="border-t-2 border-[#19140035] bg-[#FDFDFC] font-semibold dark:border-[#3E3E3A] dark:bg-[#0a0a0a]">
                                    <tr>
                                        <td colSpan={10} className="px-2 py-2 text-right text-[#706f6c] dark:text-[#A1A09A]">
                                            Total Expected Profit
                                        </td>
                                        <td className="px-2 py-2 text-green-600">
                                            {formatDisplayAmount(totalExpectedProfit)}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </main>

            {showForm && (
                <div
                    className="add-stock-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-sm"
                    style={isSmallScreen ? { alignItems: 'flex-start', padding: '40px 8px 8px' } : undefined}
                >
                    <div
                        className="add-stock-modal mx-4 w-full max-w-lg rounded-lg border border-[#19140035] bg-white p-5 shadow-lg dark:border-[#3E3E3A] dark:bg-[#161615] md:p-6"
                        style={isSmallScreen ? { padding: '6px', margin: '0 auto' } : undefined}
                    >
                        <div className={isSmallScreen ? "mb-1 flex items-center justify-between" : "mb-4 flex items-center justify-between"}>
                            <h2 className={isSmallScreen ? "text-xs font-semibold" : "text-base font-semibold md:text-lg"}>{editingId ? 'Edit Stock Item' : 'Add Stock Item'}</h2>
                            <button onClick={closeForm} className="text-sm text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-white">&times;</button>
                        </div>
                        <form
                            onSubmit={handleSubmit}
                            className="stock-fields grid grid-cols-2 gap-3"
                            style={isSmallScreen ? { gridTemplateColumns: 'repeat(1, 1fr)', gap: '4px' } : undefined}
                        >
                            <div className="col-span-2 sm:col-span-1" style={isSmallScreen ? { gridColumn: 'span 2' } : undefined}>
                                <label className={isSmallScreen ? "mb-0.5 block text-[11px] font-medium text-[#706f6c] dark:text-[#A1A09A]" : "mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs"}>Name</label>
                                <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className={isSmallScreen ? "w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white" : "w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm"} required />
                            </div>
                            <div className="col-span-2 sm:col-span-1" style={isSmallScreen ? { gridColumn: 'span 2' } : undefined}>
                                <label className={isSmallScreen ? "mb-0.5 block text-[11px] font-medium text-[#706f6c] dark:text-[#A1A09A]" : "mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs"}>Company</label>
                                <input type="text" value={data.company} onChange={(e) => setData('company', e.target.value)} className={isSmallScreen ? "w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white" : "w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm"} />
                            </div>
                            <div className="col-span-2 sm:col-span-1" style={isSmallScreen ? { gridColumn: 'span 2' } : undefined}>
                                <label className={isSmallScreen ? "mb-0.5 block text-[11px] font-medium text-[#706f6c] dark:text-[#A1A09A]" : "mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs"}>Colour</label>
                                <input type="text" value={data.colour} onChange={(e) => setData('colour', e.target.value)} className={isSmallScreen ? "w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white" : "w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm"} />
                            </div>
                            <div className="col-span-2 sm:col-span-1" style={isSmallScreen ? { gridColumn: 'span 2' } : undefined}>
                                <label className={isSmallScreen ? "mb-0.5 block text-[11px] font-medium text-[#706f6c] dark:text-[#A1A09A]" : "mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs"}>Shop Name</label>
                                <input type="text" value={data.shopname} onChange={(e) => setData('shopname', e.target.value)} className={isSmallScreen ? "w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white" : "w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm"} />
                            </div>
                            <div className="col-span-2 sm:col-span-1" style={isSmallScreen ? { gridColumn: 'span 2' } : undefined}>
                                <label className={isSmallScreen ? "mb-0.5 block text-[11px] font-medium text-[#706f6c] dark:text-[#A1A09A]" : "mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs"}>Chassis Number</label>
                                <input type="text" value={data.chassisnumber} onChange={(e) => setData('chassisnumber', e.target.value)} className={isSmallScreen ? "w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white" : "w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm"} />
                            </div>
                            <div className="col-span-2" style={isSmallScreen ? { gridColumn: 'span 2' } : undefined}>
                                <label className={isSmallScreen ? "mb-0.5 block text-[11px] font-medium text-[#706f6c] dark:text-[#A1A09A]" : "mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs"}>Description</label>
                                <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} className={isSmallScreen ? "w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white" : "w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm"} rows={2} />
                            </div>
                            <div className="col-span-2 sm:col-span-1" style={isSmallScreen ? { gridColumn: 'span 2' } : undefined}>
                                <label className={isSmallScreen ? "mb-0.5 block text-[11px] font-medium text-[#706f6c] dark:text-[#A1A09A]" : "mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs"}>Price</label>
                                <input type="text" inputMode="decimal" value={data.price} onChange={(e) => setData('price', formatAmountInput(e.target.value))} className={isSmallScreen ? "w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white" : "w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm"} required />
                            </div>
                            <div className="col-span-2 sm:col-span-1" style={isSmallScreen ? { gridColumn: 'span 2' } : undefined}>
                                <label className={isSmallScreen ? "mb-0.5 block text-[11px] font-medium text-[#706f6c] dark:text-[#A1A09A]" : "mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs"}>T Price</label>
                                <input type="text" inputMode="decimal" value={data.t_price} onChange={(e) => setData('t_price', formatAmountInput(e.target.value))} className={isSmallScreen ? "w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white" : "w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm"} />
                            </div>
                            <div className="col-span-2 sm:col-span-1" style={isSmallScreen ? { gridColumn: 'span 2' } : undefined}>
                                <label className={isSmallScreen ? "mb-0.5 block text-[11px] font-medium text-[#706f6c] dark:text-[#A1A09A]" : "mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs"}>N Price</label>
                                <input type="text" inputMode="decimal" value={data.n_price} onChange={(e) => setData('n_price', formatAmountInput(e.target.value))} className={isSmallScreen ? "w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white" : "w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm"} />
                            </div>
                            <div className="col-span-2 sm:col-span-1" style={isSmallScreen ? { gridColumn: 'span 2' } : undefined}>
                                <label className={isSmallScreen ? "mb-0.5 block text-[11px] font-medium text-[#706f6c] dark:text-[#A1A09A]" : "mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs"}>A Price</label>
                                <input type="text" inputMode="decimal" value={data.a_price} onChange={(e) => setData('a_price', formatAmountInput(e.target.value, 12))} className={isSmallScreen ? "w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white" : "w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm"} />
                            </div>
                            <div className="col-span-2 sm:col-span-1" style={isSmallScreen ? { gridColumn: 'span 2' } : undefined}>
                                <label className={isSmallScreen ? "mb-0.5 block text-[11px] font-medium text-[#706f6c] dark:text-[#A1A09A]" : "mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs"}>Expected Profit</label>
                                <input type="text" inputMode="decimal" value={data.expected_profit} onChange={(e) => setData('expected_profit', formatAmountInput(e.target.value))} className={isSmallScreen ? "w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white" : "w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm"} required />
                            </div>
                            <div className="col-span-2 flex gap-2 pt-2" style={isSmallScreen ? { gridColumn: 'span 2', gap: '8px', paddingTop: '4px' } : undefined}>
                                <button type="submit" disabled={processing} className={isSmallScreen ? "rounded-md bg-[#00447C] px-4 py-2 text-xs font-medium text-white hover:bg-[#003d6f] disabled:opacity-50" : "rounded-md bg-[#00447C] px-4 py-2 text-xs font-medium text-white hover:bg-[#003d6f] disabled:opacity-50 md:text-sm"}>{editingId ? 'Update' : 'Submit'}</button>
                                <button type="button" onClick={closeForm} className={isSmallScreen ? "rounded-md border border-[#19140035] px-4 py-2 text-xs font-medium dark:border-[#3E3E3A]" : "rounded-md border border-[#19140035] px-4 py-2 text-xs font-medium dark:border-[#3E3E3A] md:text-sm"}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {confirming && editingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-sm rounded-lg border border-[#19140035] bg-white p-5 shadow-lg md:p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <h2 className="mb-4 text-base font-semibold md:text-lg">
                            Confirm Update
                        </h2>
                        <p className="mb-4 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            Are you sure you want to save the changes to this
                            item?
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => saveUpdate(editingId)}
                                disabled={processing}
                                className="rounded-md bg-[#00447C] px-4 py-2 text-xs font-medium text-white hover:bg-[#003d6f] disabled:opacity-50 md:text-sm"
                            >
                                Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirming(false)}
                                className="rounded-md border border-[#19140035] px-4 py-2 text-xs font-medium md:text-sm dark:border-[#3E3E3A]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className={showForm || confirming ? 'blur-sm pointer-events-none' : ''}>
                <Footer />
            </div>
        </div>
    );
}
