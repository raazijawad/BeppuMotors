import { Head, Link } from '@inertiajs/react';

export default function Stock() {
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
            <main className="flex flex-1 items-center justify-center bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Stock page coming soon.</p>
            </main>
        </div>
    );
}
