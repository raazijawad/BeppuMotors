import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Footer from '@/components/footer';

export default function Profile() {
    const { auth } = usePage().props;
    const [passwordUpdated, setPasswordUpdated] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleUpdatePassword = (e) => {
        e.preventDefault();
        setPasswordUpdated(false);
        put('/settings/password', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setPasswordUpdated(true);
            },
        });
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    const inputClass =
        'w-full rounded-md border border-[#19140035] bg-white px-2.5 py-1.5 text-xs dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-white md:text-sm';

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <Head title="Profile" />
            <nav className="relative h-16 md:h-20 w-full border-b border-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a]"></div>
                <div className="relative flex h-full items-center pl-6 md:pl-10">
                    <Link href="/" className="text-sm font-medium text-white/70 hover:text-white">
                        &larr; Back
                    </Link>
                    <span className="ml-4 text-sm font-semibold text-white">Profile</span>
                </div>
            </nav>

            <main className="flex-1 overflow-y-auto bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <div className="mx-auto flex max-w-2xl flex-col gap-4 px-6 pt-6 pb-6 md:pt-8">
                    <div className="rounded-lg border border-[#19140035] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <div className="border-b border-[#19140035] px-4 py-3 dark:border-[#3E3E3A]">
                            <h2 className="text-sm font-semibold">Account Details</h2>
                        </div>
                        <div className="flex flex-col gap-3 px-4 py-4 text-sm">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Name</span>
                                <span className="font-medium">{auth.user?.name}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Email</span>
                                <span className="font-medium">{auth.user?.email}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Role</span>
                                <span className="rounded-full bg-[#00447C] px-2.5 py-0.5 text-xs font-medium capitalize text-white">
                                    {auth.user?.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-[#19140035] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <div className="border-b border-[#19140035] px-4 py-3 dark:border-[#3E3E3A]">
                            <h2 className="text-sm font-semibold">Change Password</h2>
                        </div>
                        <form onSubmit={handleUpdatePassword} className="flex flex-col gap-3 px-4 py-4">
                            {passwordUpdated && (
                                <p className="rounded-md bg-green-50 px-3 py-2 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                                    Password updated successfully.
                                </p>
                            )}

                            <div>
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                    className={inputClass}
                                    autoComplete="current-password"
                                    required
                                />
                                {errors.current_password && (
                                    <p className="mt-1 text-[10px] text-red-600">{errors.current_password}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={inputClass}
                                    autoComplete="new-password"
                                    required
                                />
                                {errors.password && (
                                    <p className="mt-1 text-[10px] text-red-600">{errors.password}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-[10px] font-medium text-[#706f6c] dark:text-[#A1A09A] md:text-xs">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className={inputClass}
                                    autoComplete="new-password"
                                    required
                                />
                                {errors.password_confirmation && (
                                    <p className="mt-1 text-[10px] text-red-600">{errors.password_confirmation}</p>
                                )}
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-md bg-[#00447C] px-4 py-2 text-xs font-medium text-white hover:bg-[#003d6f] disabled:opacity-50 md:text-sm"
                                >
                                    {processing ? 'Saving...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="rounded-md border border-red-300 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 md:text-sm"
                    >
                        Logout
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
}
