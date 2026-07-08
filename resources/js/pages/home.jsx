import { Head } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function Home() {
    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <Head title="Home" />
            <Navbar />
            <main className="flex flex-1 items-start justify-center overflow-y-auto bg-[#FDFDFC] px-6 pt-14 max-md:pt-10 text-[#1b1b18] dark:bg-[#0a0a0a]">
                <div className="flex w-full max-w-7xl flex-col items-center gap-8">
                    <div className="grid w-full max-w-md grid-cols-2 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex h-28 items-center justify-center rounded-lg border border-[#19140035] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]"
                            >
                                <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    Box {i + 1}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
