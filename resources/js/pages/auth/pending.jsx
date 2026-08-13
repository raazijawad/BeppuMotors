import { Head } from '@inertiajs/react';
import { Clock3 } from 'lucide-react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { login } from '@/routes';

export default function Pending() {
    return (
        <>
            <Head title="Account pending approval" />

            <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                    <Clock3 className="size-7 text-muted-foreground" />
                </div>

                <p className="text-sm text-balance text-muted-foreground">
                    Your account has been created and is waiting for approval by
                    the administrator. Once your account is approved, you will
                    be able to log in.
                </p>

                <Button asChild variant="outline" className="mt-2 w-full">
                    <TextLink href={login()}>Back to log in</TextLink>
                </Button>
            </div>
        </>
    );
}

Pending.layout = {
    title: 'Account pending approval',
    description: 'Please check back once your account has been accepted.',
};
