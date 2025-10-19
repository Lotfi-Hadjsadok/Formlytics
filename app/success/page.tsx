import { getUser } from '@/lib/auth';
import { CheckCircle } from 'lucide-react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function SuccessPage() {
    const user = await getUser();

    if (!user) {
       redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
            <div className="max-w-md mx-auto text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Thank you for your payment! 🎉
                </h1>
                
                <p className="text-lg text-gray-600 mb-8">
                    Your subscription is now active and you're all set to get started. 
                    We're excited to have you on board!
                </p>
                
                <Button asChild size="lg">
                    <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
            </div>
        </div>
    );
}
