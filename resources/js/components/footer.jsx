import { Home, ShoppingCart, Package, User } from 'lucide-react';

const navLinks = [
    { name: 'Home', icon: Home, href: '/' },
    { name: 'Orders', icon: ShoppingCart, href: '/my-orders' },
    { name: 'Inventory', icon: Package, href: '/stock' },
    { name: 'Profile', icon: User, href: '/user/profile' },
];

export default function Footer() {
    return (
        <footer className="fixed right-0 bottom-0 left-0 z-50">
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

            <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

            <div className="relative container px-4 py-3">
                <div className="flex items-center justify-center">
                    <div className="grid grid-cols-4 gap-2 md:gap-4">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="group relative flex flex-col items-center gap-1.5 p-2"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/40 to-cyan-400/40 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100"></div>
                                    <link.icon className="relative h-5 w-5 text-white/60 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:scale-110 group-hover:text-white" />
                                </div>

                                <span className="text-[10px] font-medium tracking-wider text-white/50 uppercase transition-colors duration-500 group-hover:text-white/80">
                                    {link.name}
                                </span>

                                <div className="absolute bottom-1 left-1/2 h-px w-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-400 to-transparent transition-all duration-500 group-hover:w-8"></div>
                            </a>
                        ))}
                    </div>
                </div>

                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="relative h-1.5 w-1.5">
                        <div className="absolute inset-0 h-1.5 w-1.5 animate-ping rounded-full bg-blue-400/40"></div>
                        <div className="relative h-1.5 w-1.5 rounded-full bg-blue-400/60"></div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
