import { Head, Link } from '@inertiajs/react';
import Footer from '@/components/footer';

export default function Auction() {
    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <Head title="Auction" />
            <nav className="relative h-16 md:h-20 w-full border-b border-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a]"></div>
                <div className="relative flex h-full items-center pl-6 md:pl-10">
                    <Link href="/vehicle-detail" className="text-sm font-medium text-white/70 hover:text-white">
                        &larr; Back
                    </Link>
                    <span className="ml-4 text-sm font-semibold text-white">
                        Auction
                    </span>
                </div>
            </nav>
            <main className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-[#FDFDFC] pb-20 text-[#1b1b18] dark:bg-[#0a0a0a]">
                <div className="flex w-full max-w-md flex-col gap-4 px-6 md:flex-row md:gap-6 md:px-10">
                    <Link
                        href="/auction/buy"
                        className="flex h-32 items-center justify-center rounded-lg bg-gradient-to-r from-[#00447C] to-[#00284a] text-sm font-semibold text-white shadow-md hover:opacity-90 md:h-36"
                    >
                        Buy
                    </Link>
                    <Link
                        href="/auction/sell"
                        className="flex h-32 items-center justify-center rounded-lg border border-[#00447C] text-sm font-semibold text-[#00447C] shadow-md hover:bg-[#00447C] hover:text-white md:h-36"
                    >
                        Sell
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
}
