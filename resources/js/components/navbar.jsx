import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { login, register, dashboard } from '@/routes';

export default function Navbar() {
    const { auth } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a]"></div>
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            ></div>
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 h-32 w-32 rounded-full bg-blue-400/10 blur-2xl"></div>
                <div className="absolute right-1/4 bottom-0 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl"></div>
            </div>
            <div className="absolute bottom-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

            <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                <Link href="/" className="flex items-center space-x-2">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-white/10 text-white">
                        <AppLogoIcon className="size-5 fill-current" />
                    </div>
                    <span className="text-sm font-semibold text-white">BeppuMotors</span>
                </Link>

                <div className="hidden items-center space-x-3 md:flex">
                    {auth.user ? (
                        <Link href={dashboard()}>
                            <Button className="bg-white/10 text-white hover:bg-white/20">Dashboard</Button>
                        </Link>
                    ) : (
                        <>
                            <Link href={login()}>
                                <Button variant="ghost" className="text-white/70 hover:bg-white/10 hover:text-white">Log in</Button>
                            </Link>
                            <Link href={register()}>
                                <Button className="bg-white/10 text-white hover:bg-white/20">Register</Button>
                            </Link>
                        </>
                    )}
                </div>

                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="flex items-center text-white md:hidden"
                    aria-label="Toggle navigation"
                >
                    {mobileOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                </button>
            </div>

            {mobileOpen && (
                <div className="relative border-t border-white/10 px-4 pb-4 pt-2 md:hidden">
                    <div className="mt-4 flex flex-col space-y-2">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                onClick={() => setMobileOpen(false)}
                            >
                                <Button className="w-full bg-white/10 text-white hover:bg-white/20">Dashboard</Button>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <Button
                                        variant="ghost"
                                        className="w-full text-white/70 hover:bg-white/10 hover:text-white"
                                    >
                                        Log in
                                    </Button>
                                </Link>
                                <Link
                                    href={register()}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <Button className="w-full bg-white/10 text-white hover:bg-white/20">Register</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
