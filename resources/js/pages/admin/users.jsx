import { Head, Link, router } from '@inertiajs/react';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import Footer from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useFlashToast } from '@/hooks/use-flash-toast';

const statusLabels = {
    pending: 'Pending',
    active: 'Active',
    rejected: 'Rejected',
};

const statusVariants = {
    pending: 'outline',
    active: 'default',
    rejected: 'destructive',
};

export default function AdminUsers({ users = [], pendingCount = 0 }) {
    useFlashToast();

    const [processingId, setProcessingId] = useState(null);

    const handleApprove = (user) => {
        if (processingId) {
            return;
        }

        setProcessingId(user.id);
        router.post(
            `/admin/users/${user.id}/approve`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessingId(null),
            },
        );
    };

    const handleReject = (user) => {
        if (processingId) {
            return;
        }

        if (!confirm(`Reject the account for "${user.name}"?`)) {
            return;
        }

        setProcessingId(user.id);
        router.post(
            `/admin/users/${user.id}/reject`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessingId(null),
            },
        );
    };

    const pendingUsers = users.filter((user) => user.status === 'pending');
    const otherUsers = users.filter((user) => user.status !== 'pending');

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <Head title="Users" />
            <nav className="relative h-16 w-full border-b border-white/10 md:h-20">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a]"></div>
                <div className="relative flex h-full items-center pl-6 md:pl-10">
                    <Link
                        href="/vehicle-detail"
                        className="text-sm font-medium text-white/70 hover:text-white"
                    >
                        &larr; Back
                    </Link>
                    <span className="ml-4 text-sm font-semibold text-white">
                        Users
                    </span>
                </div>
            </nav>
            <main className="flex-1 overflow-y-auto bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <div className="flex flex-col gap-6 px-6 pt-4 pb-6 md:pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold">
                                User approvals
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Review account requests and approve or reject
                                them.
                            </p>
                        </div>
                        <Badge variant="outline">{pendingCount} pending</Badge>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pending requests</CardTitle>
                            <CardDescription>
                                These users cannot log in until their account is
                                approved.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pendingUsers.length === 0 ? (
                                <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                                    No pending account requests. New
                                    registrations will show up here.
                                </p>
                            ) : (
                                <div className="grid gap-3">
                                    {pendingUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">
                                                    {user.name}
                                                </p>
                                                <p className="truncate text-sm text-muted-foreground">
                                                    {user.email}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Requested{' '}
                                                    {new Date(
                                                        user.created_at,
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handleApprove(user)
                                                    }
                                                    disabled={
                                                        processingId !== null
                                                    }
                                                    data-test={`approve-user-${user.id}`}
                                                >
                                                    <Check />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        handleReject(user)
                                                    }
                                                    disabled={
                                                        processingId !== null
                                                    }
                                                >
                                                    <X />
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {otherUsers.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>All users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3">
                                    {otherUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">
                                                    {user.name}
                                                </p>
                                                <p className="truncate text-sm text-muted-foreground">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-2">
                                                <Badge
                                                    variant={
                                                        statusVariants[
                                                            user.status
                                                        ]
                                                    }
                                                >
                                                    {statusLabels[user.status]}
                                                </Badge>
                                                {user.status === 'rejected' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleApprove(user)
                                                        }
                                                        disabled={
                                                            processingId !==
                                                            null
                                                        }
                                                    >
                                                        <Check />
                                                        Approve
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
