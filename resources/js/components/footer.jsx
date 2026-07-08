import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { login, register } from '@/routes';

const footerLinks = [
    {
        title: 'Company',
        links: [
            { label: 'About', href: '#about' },
            { label: 'Blog', href: '#blog' },
            { label: 'Careers', href: '#careers' },
            { label: 'Press', href: '#press' },
        ],
    },
    {
        title: 'Product',
        links: [
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'FAQ', href: '#faq' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { label: 'Privacy', href: '#privacy' },
            { label: 'Terms', href: '#terms' },
            { label: 'Cookie Policy', href: '#cookies' },
        ],
    },
];

export default function Footer() {
    return (
        <footer className="border-t border-[#19140035] bg-[#FDFDFC] dark:border-[#3E3E3A] dark:bg-[#0a0a0a]">
            <div className="mx-auto max-w-7xl px-4 py-12">
                <div className="grid gap-8 md:grid-cols-4">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-black text-white dark:bg-white dark:text-black">
                                <AppLogoIcon className="size-5 fill-current" />
                            </div>
                            <span className="text-sm font-semibold">
                                BeppuMotors
                            </span>
                        </Link>
                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            Premium automotive solutions for enthusiasts and
                            professionals alike.
                        </p>
                        <div className="flex space-x-3">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#706f6c] transition-colors hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                                aria-label="GitHub"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z" />
                                </svg>
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#706f6c] transition-colors hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                                aria-label="Twitter"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {footerLinks.map((group) => (
                        <div key={group.title}>
                            <h3 className="mb-3 text-sm font-semibold">
                                {group.title}
                            </h3>
                            <ul className="space-y-2">
                                {group.links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-sm text-[#706f6c] transition-colors hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-10 border-t border-[#19140035] pt-6 dark:border-[#3E3E3A]">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            &copy; {new Date().getFullYear()} BeppuMotors. All
                            rights reserved.
                        </p>
                        <div className="flex space-x-4">
                            <Link
                                href={login()}
                                className="text-sm text-[#706f6c] transition-colors hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                            >
                                Log in
                            </Link>
                            <Link
                                href={register()}
                                className="text-sm text-[#706f6c] transition-colors hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                            >
                                Register
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
