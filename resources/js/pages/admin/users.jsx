import { Head, Link, router } from '@inertiajs/react';
import { Check, Key, X } from 'lucide-react';
import { useState } from 'react';
import Footer from '@/components/footer';
import PasswordInput from '@/components/password-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    const [selectedUser, setSelectedUser] = useState(null);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [passwordErrors, setPasswordErrors] = useState({});

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

    const handlePasswordChange = () => {
        if (!selectedUser || !password) {
            return;
        }

        setPasswordErrors({});
        router.put(
            `/admin/users/${selectedUser.id}/password`,
            {
                password,
                password_confirmation: passwordConfirmation,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedUser(null);
                    setPassword('');
                    setPasswordConfirmation('');
                },
                onError: (errors) => {
                    setPasswordErrors(errors);
                },
            },
        );
    };

    const openPasswordDialog = (user) => {
        setSelectedUser(user);
        setPassword('');
        setPasswordConfirmation('');
        setPasswordErrors({});
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
                <div className="flex flex-col gap-6 px-6 pt-4 pb-24 md:pt-6">
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
                                                    className="h-7 px-2.5 text-xs"
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
                                                    className="h-7 px-2.5 text-xs"
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
                            <CardContent className="px-3 sm:px-6">
                                <div className="grid gap-2 sm:gap-3">
                                    {otherUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border p-2.5 transition-colors hover:bg-muted sm:gap-3 sm:p-4"
                                            onClick={() =>
                                                openPasswordDialog(user)
                                            }
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-medium sm:text-base">
                                                    {user.name}
                                                </p>
                                                <p className="truncate text-[11px] text-muted-foreground sm:text-sm">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
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
                                                        className="h-6 px-2 text-[11px]"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleApprove(user);
                                                        }}
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

            <Dialog
                open={!!selectedUser}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedUser(null);
                        setPassword('');
                        setPasswordConfirmation('');
                        setPasswordErrors({});
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                            Set a new password for{' '}
                            <span className="font-medium text-foreground">
                                {selectedUser?.name}
                            </span>
                            .
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="new-password">
                                New password
                            </Label>
                            <PasswordInput
                                id="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                            {passwordErrors.password && (
                                <p className="text-sm text-destructive">
                                    {passwordErrors.password}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirm-password">
                                Confirm password
                            </Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={passwordConfirmation}
                                onChange={(e) =>
                                    setPasswordConfirmation(e.target.value)
                                }
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setSelectedUser(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handlePasswordChange}
                            disabled={!password || !passwordConfirmation}
                        >
                            <Key className="mr-1 h-4 w-4" />
                            Update Password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
