import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from '@/lib/prisma'
import { nextCookies } from 'better-auth/next-js'
import { headers } from 'next/headers'
import { Customers, Prisma,   Subscriptions,   User } from '@/generated/prisma'
import { PricingTier, Tier } from '@/constatnts/paddle-prices'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  trustedOrigins:[
      "https://3f4e8d398cb6.ngrok-free.app",
      "http://localhost:3000"
  ],
  plugins:[nextCookies()]
})

export const getUser = async (include?: Prisma.UserInclude) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    
    if (!session?.user) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id,
        },
        include: include || undefined,
    });

    return user;
}

export const getActiveSubscription = async (): Promise<Tier | undefined> => {
    const user = await getUser({
        customer: {
            include: {
                subscriptions: true
            }
        }
    }) as User & { customer: Customers & { subscriptions: Subscriptions[] } };
    if (!user || !user.customer) {
        return undefined;
    }
    
    const subscription = user.customer.subscriptions.find(sub => 
        sub.subscriptionStatus === 'active' || sub.subscriptionStatus === 'trialing'
    );
    
    if (!subscription) {
        return undefined;
    }
    
    const tier = PricingTier.find(tier => 
        tier.priceId.month === subscription.priceId || 
        tier.priceId.year === subscription.priceId
    );
    
    return tier;
}