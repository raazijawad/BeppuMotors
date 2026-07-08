import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { login, register, dashboard } from '@/routes';

const navLinks = [
    { title: 'Home', href: '/' },
    { title: 'Features', href: '#features' },
    { title: 'Pricing', href: '#pricing' },
    { title: 'Contact', href: '#contact' },
];

export default function Navbar() {
    const { auth } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-[#19140035] bg-[#FDFDFC] dark:border-[#3E3E3A] dark:bg-[#0a0a0a]">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                <Link href="/" className="flex items-center space-x-2">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-black text-white dark:bg-white dark:text-black">
                        <AppLogoIcon className="size-5 fill-current" />
                    </div>
                    <span className="text-sm font-semibold">BeppuMotors</span>
                </Link>

                <nav className="hidden items-center space-x-6 md:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.title}
                            href={link.href}
                            className="text-sm text-[#706f6c] transition-colors hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                        >
                            {link.title}
                        </Link>
                    ))}
                </nav>

                <div className="hidden items-center space-x-3 md:flex">
                    {auth.user ? (
                        <Link href={dashboard()}>
                            <Button>Dashboard</Button>
                        </Link>
                    ) : (
                        <>
                            <Link href={login()}>
                                <Button variant="ghost">Log in</Button>
                            </Link>
                            <Link href={register()}>
                                <Button>Register</Button>
                            </Link>
                        </>
                    )}
                </div>

                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="flex items-center md:hidden"
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
                <div className="border-t border-[#19140035] px-4 pb-4 pt-2 dark:border-[#3E3E3A] md:hidden">
                    <nav className="flex flex-col space-y-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.title}
                                href={link.href}
                                className="text-sm text-[#706f6c] transition-colors hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.title}
                            </Link>
                        ))}
                    </nav>
                    <div className="mt-4 flex flex-col space-y-2">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                onClick={() => setMobileOpen(false)}
                            >
                                <Button className="w-full">Dashboard</Button>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <Button
                                        variant="ghost"
                                        className="w-full"
                                    >
                                        Log in
                                    </Button>
                                </Link>
                                <Link
                                    href={register()}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <Button className="w-full">Register</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
