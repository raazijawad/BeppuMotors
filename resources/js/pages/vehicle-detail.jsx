import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import Footer from '@/components/footer';

export default function VehicleDetail() {
    const [showList, setShowList] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [vehicleName, setVehicleName] = useState('');
    const [shopName, setShopName] = useState('');

    const handleAddVehicle = () => {
        if (vehicleName && shopName) {
            setVehicles([...vehicles, { vehicleName, shopName }]);
            setVehicleName('');
            setShopName('');
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
                <div className="flex w-full flex-col gap-8 px-6 pt-20 md:pt-8 pb-6">
                    {showList ? (
                        <div className="w-full rounded-lg border border-[#19140035] bg-white p-6 shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold">Added Vehicles</h2>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="rounded-md bg-[#00447C] px-4 py-2 text-sm font-medium text-white hover:bg-[#003d6f]"
                                >
                                    + Add Vehicle
                                </button>
                            </div>
                            {vehicles.length === 0 ? (
                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">No vehicles added yet.</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {vehicles.map((v, i) => (
                                        <div key={i} className="rounded-md border border-[#19140035] p-3 dark:border-[#3E3E3A]">
                                            <p className="text-sm font-medium">{v.vehicleName}</p>
                                            <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">{v.shopName}</p>
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
                        <div className="grid w-full grid-cols-2 gap-4 gap-y-8 md:grid-cols-5 md:gap-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    onClick={i === 0 ? () => setShowList(true) : undefined}
                                    className={`flex h-44 items-center justify-center rounded-lg border border-[#19140035] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615] md:h-28 ${i === 0 ? 'cursor-pointer hover:shadow-md' : ''} ${i === 4 ? 'col-span-2 md:col-span-1' : ''}`}
                                >
                                    <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                        {i === 0 ? '+' : i === 1 ? '-' : i === 2 ? 'Stock' : i === 3 ? 'Customers' : 'Oction'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-lg border border-[#19140035] bg-white p-6 shadow-lg dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <h2 className="mb-4 text-lg font-semibold">Vehicle Information</h2>
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Vehicle Name
                            </label>
                            <input
                                type="text"
                                value={vehicleName}
                                onChange={(e) => setVehicleName(e.target.value)}
                                className="w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                placeholder="Enter vehicle name"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Shop Name
                            </label>
                            <input
                                type="text"
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                className="w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                placeholder="Enter shop name"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddVehicle}
                                className="rounded-md bg-[#00447C] px-4 py-2 text-sm font-medium text-white hover:bg-[#003d6f]"
                            >
                                Submit
                            </button>
                            <button
                                onClick={() => { setShowForm(false); setVehicleName(''); setShopName(''); }}
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
