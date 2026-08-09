import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Footer from '@/components/footer';
import Invoice from '@/components/invoice';

export default function Customer({ customers = [], stocks = [] }) {
    const [showForm, setShowForm] = useState(false);
    const [showSaleModal, setShowSaleModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedVehicles, setSelectedVehicles] = useState([]);

    const today = new Date().toISOString().slice(0, 10);
    const [invoiceDate, setInvoiceDate] = useState(today);

    const { data, setData, post, processing, reset } = useForm({
        name: '',
        phone: '',
        address: '',
    });

    // add customer function
    const handleAddCustomer = (e) => {
        e.preventDefault();
        post('/customers', {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    // open customer detail function
    const handleOpenCustomer = (customer) => {
        setSelectedCustomer(customer);
        setSelectedVehicles([]);
    };

    // back to customers list function
    const handleBackToCustomers = () => {
        setSelectedCustomer(null);
        setSelectedVehicles([]);
    };

    // add vehicle to invoice function
    const handleSelectVehicle = (stock) => {
        const amount = Number(stock.price) || Number(stock.n_price) || '';
        setSelectedVehicles((prev) => [...prev, { ...stock, amount }]);
        setShowSaleModal(false);
    };

    // remove vehicle from invoice function
    const handleRemoveVehicle = (stockId) => {
        setSelectedVehicles((prev) => prev.filter((v) => v.id !== stockId));
    };

    // change invoice amount function
    const handleAmountChange = (stockId, value) => {
        setSelectedVehicles((prev) => prev.map((v) => (v.id === stockId ? { ...v, amount: value } : v)));
    };

    // open sale modal function
    const handleOpenSaleModal = () => {
        setShowSaleModal(true);
    };

    // save invoice function
    const handleSaveInvoice = () => {
        if (!selectedCustomer || selectedVehicles.length === 0) return;
        const lines = selectedVehicles.map((v) => ({ stock_id: v.id, amount: v.amount }));
        router.post(
            `/customers/${selectedCustomer.id}/invoices`,
            { lines, date: invoiceDate },
            {
                onSuccess: () => {
                    setSelectedVehicles([]);
                },
            },
        );
    };

    // delete customer function
    const handleDeleteCustomer = (customer) => {
        if (confirm(`Delete customer "${customer.name}"?`)) {
            router.delete(`/customers/${customer.id}`, {
                onSuccess: () => setSelectedCustomer(null),
            });
        }
    };

    // delete invoice function
    const handleDeleteInvoice = (invoice) => {
        if (confirm('Delete this invoice?')) {
            router.delete(`/invoices/${invoice.id}`, {
                preserveScroll: true,
            });
        }
    };

    const purchasedStockIds = selectedCustomer
        ? new Set((selectedCustomer.invoices || []).map((inv) => inv.stock_id))
        : new Set();

    const invoiceNo = `INV-${(selectedCustomer?.invoices?.length || 0) + 1}`;

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <Head title="Customers" />
            <nav className="relative h-16 md:h-20 w-full border-b border-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a]"></div>
                <div className="relative flex h-full items-center pl-6 md:pl-10">
                    <Link href="/vehicle-detail" className="text-sm font-medium text-white/70 hover:text-white">
                        &larr; Back
                    </Link>
                    <span className="ml-4 text-sm font-semibold text-white">
                        {selectedCustomer ? `${selectedCustomer.name} - Invoice` : 'Customers'}
                    </span>
                </div>
            </nav>
            <main className="flex-1 overflow-y-auto bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <div className="flex flex-col gap-4 px-6 pt-4 pb-6 md:pt-6">
                    {!selectedCustomer ? (
                        <>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">Customers List</span>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="rounded-md bg-[#00447C] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#003d6f] md:px-4 md:py-2 md:text-sm"
                                >
                                    + Add Customer
                                </button>
                            </div>

                            {customers.length === 0 ? (
                                <p className="rounded-lg border border-[#19140035] bg-white px-4 py-6 text-center text-sm text-[#706f6c] shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#A1A09A]">
                                    No customers added yet. Click "+ Add Customer" to add one.
                                </p>
                            ) : (
                                <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                                    {customers.map((customer) => (
                                        <div
                                            key={customer.id}
                                            onClick={() => handleOpenCustomer(customer)}
                                            className="flex cursor-pointer flex-col justify-between gap-3 rounded-lg border border-[#19140035] bg-white p-4 shadow-sm hover:shadow-md dark:border-[#3E3E3A] dark:bg-[#161615]"
                                        >
                                            <div>
                                                <p className="text-sm font-semibold">{customer.name}</p>
                                                <p className="mt-1 truncate text-xs text-[#706f6c] dark:text-[#A1A09A]">{customer.phone || 'No contact'}</p>
                                            </div>
                                            <p className="text-xs font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                                {(customer.invoices || []).length} vehicle{(customer.invoices || []).length === 1 ? '' : 's'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleBackToCustomers}
                                className="w-fit text-sm font-medium text-[#00447C] hover:underline dark:text-[#6cb2e6]"
                            >
                                &larr; Back to Customers
                            </button>

                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">Sold Vehicles</span>
                                <div className="flex flex-wrap items-center gap-2">
                                    <label className="flex items-center gap-2 text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                        Date
                                        <input
                                            type="date"
                                            value={invoiceDate}
                                            onChange={(e) => setInvoiceDate(e.target.value)}
                                            className="rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                        />
                                    </label>
                                    <button
                                        onClick={handleOpenSaleModal}
                                        className="rounded-md bg-[#00447C] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#003d6f] md:px-4 md:py-2 md:text-sm"
                                    >
                                        + Sale a Car
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCustomer(selectedCustomer)}
                                        className="rounded-md border border-red-300 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 md:px-4 md:py-2 md:text-sm"
                                    >
                                        Delete Customer
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-lg border border-[#19140035] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-[10px] md:text-xs">
                                        <thead className="border-b border-[#19140035] dark:border-[#3E3E3A]">
                                            <tr className="bg-[#FDFDFC] dark:bg-[#0a0a0a]">
                                                <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Date</th>
                                                <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Vehicle</th>
                                                <th className="px-2 py-2 font-semibold text-[#706f6c] dark:text-[#A1A09A]">Amount</th>
                                                <th className="px-2 py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedVehicles.length > 0 &&
                                                selectedVehicles.map((v) => (
                                                    <tr key={v.id} className="border-b border-[#19140035]/50 dark:border-[#3E3E3A]/50">
                                                        <td className="px-2 py-1.5 text-[#706f6c] dark:text-[#A1A09A]">{invoiceDate}</td>
                                                        <td className="px-2 py-1.5 font-medium">{v.name}</td>
                                                        <td className="px-2 py-1.5">{v.amount}</td>
                                                        <td className="px-2 py-1.5 text-right">
                                                            <button
                                                                onClick={() => handleRemoveVehicle(v.id)}
                                                                className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                                                            >
                                                                Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            {(selectedCustomer.invoices || []).map((inv) => (
                                                <tr key={inv.id} className="border-b border-[#19140035]/50 dark:border-[#3E3E3A]/50">
                                                    <td className="px-2 py-1.5">{inv.date}</td>
                                                    <td className="px-2 py-1.5 font-medium">{inv.stock?.name || 'Vehicle'}</td>
                                                    <td className="px-2 py-1.5">{parseFloat(inv.amount)}</td>
                                                    <td className="px-2 py-1.5 text-right">
                                                        <button
                                                            onClick={() => handleDeleteInvoice(inv)}
                                                            className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {selectedVehicles.length === 0 && (selectedCustomer.invoices || []).length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="px-2 py-6 text-center text-[#706f6c] dark:text-[#A1A09A]">
                                                        No vehicles sold yet. Click "+ Sale a Car" to add one.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {selectedVehicles.length > 0 && (
                                <Invoice
                                    customer={selectedCustomer}
                                    lines={selectedVehicles}
                                    invoiceNo={invoiceNo}
                                    date={invoiceDate}
                                    showSave
                                    saving={processing}
                                    onSave={handleSaveInvoice}
                                    onClose={() => setSelectedVehicles([])}
                                    onAmountChange={handleAmountChange}
                                    onRemove={handleRemoveVehicle}
                                    stocks={stocks}
                                    onAddVehicle={handleSelectVehicle}
                                />
                            )}
                        </>
                    )}
                </div>
            </main>

            {showSaleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-lg rounded-lg border border-[#19140035] bg-white p-5 shadow-lg dark:border-[#3E3E3A] dark:bg-[#161615] md:p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-base font-semibold md:text-lg">Select Vehicle to Sell</h2>
                            <button onClick={() => setShowSaleModal(false)} className="text-sm text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-white">&times;</button>
                        </div>
                        {stocks.filter((s) => !purchasedStockIds.has(s.id) && !selectedVehicles.some((v) => v.id === s.id)).length === 0 ? (
                            <p className="py-6 text-center text-sm text-[#706f6c] dark:text-[#A1A09A]">No available vehicles to sell.</p>
                        ) : (
                            <div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
                                {stocks
                                    .filter((s) => !purchasedStockIds.has(s.id) && !selectedVehicles.some((v) => v.id === s.id))
                                    .map((stock) => (
                                        <div
                                            key={stock.id}
                                            className="flex items-center justify-between gap-2 rounded-md border border-[#19140035] px-3 py-2 dark:border-[#3E3E3A]"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold">{stock.name}</p>
                                                <p className="truncate text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                                    {stock.company || stock.shopname || 'No details'} - {parseFloat(stock.price)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleSelectVehicle(stock)}
                                                className="rounded-md bg-[#00447C] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#003d6f]"
                                            >
                                                Select
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-lg rounded-lg border border-[#19140035] bg-white p-5 shadow-lg dark:border-[#3E3E3A] dark:bg-[#161615] md:p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-base font-semibold md:text-lg">Add Customer</h2>
                            <button onClick={() => setShowForm(false)} className="text-sm text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-white">&times;</button>
                        </div>
                        <form onSubmit={handleAddCustomer} className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">Name</label>
                                <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm" required />
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">Phone</label>
                                <input type="text" value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm" />
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">Address</label>
                                <input type="text" value={data.address} onChange={(e) => setData('address', e.target.value)} className="w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm" />
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
