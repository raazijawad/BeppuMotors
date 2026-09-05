import { Head, Link } from '@inertiajs/react';
import Footer from '@/components/footer';

export default function Auction() {
    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <Head title="Auction" />
            <nav className="relative h-16 md:h-20 w-full border-b border-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a]"></div>
                <div className="relative flex h-full items-center pl-6 md:pl-10">
                    <Link href="/vehicle-detail" prefetch={['mount', 'hover']} cacheFor={300000} className="text-sm font-medium text-white/70 hover:text-white">
                        &larr; Back
                    </Link>
                    <span className="ml-4 text-sm font-semibold text-white">
                        Auction
                    </span>
                </div>
            </nav>
            <main className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-[#FDFDFC] pb-6 text-[#1b1b18] dark:bg-[#0a0a0a] md:pb-20">
                <div className="flex w-full max-w-md flex-col items-center gap-4 px-6 md:max-w-4xl md:flex-row md:gap-8 md:px-10 lg:max-w-6xl">
                    <Link
                        href="/auction/buy"
                        prefetch={['mount', 'hover']} cacheFor={300000}
                        className="flex h-32 w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#00447C] to-[#00284a] text-sm font-semibold text-white shadow-md hover:opacity-90 md:h-44 md:w-auto md:flex-1 md:rounded-xl md:text-lg md:shadow-lg lg:h-52 lg:text-xl"
                    >
                        Buy
                    </Link>
                    <Link
                        href="/auction/sell"
                        prefetch={['mount', 'hover']} cacheFor={300000}
                        className="flex h-32 w-full items-center justify-center rounded-lg border border-[#00447C] text-sm font-semibold text-[#00447C] shadow-md hover:bg-[#00447C] hover:text-white md:h-44 md:w-auto md:flex-1 md:rounded-xl md:text-lg md:shadow-lg lg:h-52 lg:text-xl"
                    >
                        Sell
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
}
