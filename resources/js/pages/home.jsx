import { Head, Link } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function Home() {
    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <Head title="Home" />
            <Navbar />
            <main className="flex flex-1 items-start justify-center overflow-y-auto bg-[#FDFDFC] px-6 pt-14 max-md:pt-10 text-[#1b1b18] dark:bg-[#0a0a0a]">
                <div className="flex w-full max-w-7xl flex-col items-center gap-8">
                    <div className="flex w-full max-w-md flex-col gap-4 md:max-w-2xl md:gap-6">
                        <Link
                            href="/vehicle-detail"
                            className="flex h-28 items-center justify-center rounded-lg border border-[#19140035] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615] md:h-52"
                        >
                            <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                Muhammedh
                            </span>
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
