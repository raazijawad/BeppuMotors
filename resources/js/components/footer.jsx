export default function Footer() {
    return (
        <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#19140035] bg-[#FDFDFC] dark:border-[#3E3E3A] dark:bg-[#0a0a0a]">
            <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-4 py-8">
                <button className="rounded-none bg-black size-12 text-sm text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80">
                    Button 1
                </button>
                <button className="rounded-none bg-black size-12 text-sm text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80">
                    Button 2
                </button>
                <button className="rounded-none bg-black size-12 text-sm text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80">
                    Button 3
                </button>
                <button className="rounded-none bg-black size-12 text-sm text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80">
                    Button 4
                </button>
            </div>
        </footer>
    );
}
