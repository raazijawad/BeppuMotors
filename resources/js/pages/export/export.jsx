import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import Footer from '@/components/footer';

export default function Export({ countries = [] }) {
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleAddCountry = (e) => {
        e.preventDefault();
        router.post(
            '/export/countries',
            { name },
            {
                onSuccess: () => {
                    setShowForm(false);
                    setName('');
                    setError('');
                },
                onError: (errors) => {
                    setError(errors.name ?? 'Failed to add country.');
                },
            },
        );
    };

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <Head title="Export" />
            <nav className="relative h-16 w-full border-b border-white/10 md:h-20">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a]"></div>
                <div className="relative flex h-full items-center pl-6 md:pl-10">
                    <Link
                        href="/vehicle-detail"
                        className="text-sm font-medium text-white/70 hover:text-white"
                    >
                        &larr; Back
                    </Link>
                    <span className="ml-4 text-sm font-semibold text-white">
                        Export
                    </span>
                </div>
            </nav>
            <main className="flex flex-1 overflow-y-auto bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <div className="flex w-full flex-col gap-3 px-6 pt-4 pb-20 md:gap-6 md:pt-8">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                            Countries
                        </span>
                        <button
                            onClick={() => setShowForm(true)}
                            className="rounded-md bg-[#00447C] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#003d6f] md:px-4 md:py-2 md:text-sm"
                        >
                            + Add Country
                        </button>
                    </div>

                    {countries.length === 0 ? (
                        <p className="text-xs text-[#706f6c] md:text-sm dark:text-[#A1A09A]">
                            No countries added yet.
                        </p>
                    ) : (
                        <div className="grid w-full grid-cols-2 gap-4 gap-y-8 md:grid-cols-6 md:gap-4">
                            {countries.map((country) => (
                                <Link
                                    key={country.id}
                                    href={`/export/${country.id}`}
                                    className="flex h-44 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-[#19140035] bg-white shadow-sm hover:shadow-md md:h-28 dark:border-[#3E3E3A] dark:bg-[#161615]"
                                >
                                    <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                        {country.name}
                                    </span>
                                    <span className="text-[10px] text-[#706f6c]/70 md:text-xs dark:text-[#A1A09A]/70">
                                        {country.customers_count} customer
                                        {country.customers_count === 1
                                            ? ''
                                            : 's'}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-sm rounded-lg border border-[#19140035] bg-white p-5 shadow-lg md:p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <h2 className="mb-4 text-base font-semibold md:text-lg">
                            Add Country
                        </h2>
                        <form onSubmit={handleAddCountry}>
                            {error && (
                                <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                    {error}
                                </p>
                            )}
                            <label className="mb-1 block text-[10px] font-medium text-[#706f6c] md:text-xs dark:text-[#A1A09A]">
                                Country Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mb-4 w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs md:py-2 md:text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white"
                                placeholder="Enter country name"
                                required
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={router.processing}
                                    className="rounded-md bg-[#00447C] px-4 py-2 text-xs font-medium text-white hover:bg-[#003d6f] disabled:opacity-50 md:text-sm"
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setName('');
                                        setError('');
                                    }}
                                    className="rounded-md border border-[#19140035] px-4 py-2 text-xs font-medium md:text-sm dark:border-[#3E3E3A]"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className={showForm ? 'pointer-events-none blur-sm' : ''}>
                <Footer />
            </div>
        </div>
    );
}
