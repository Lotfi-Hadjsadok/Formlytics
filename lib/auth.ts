import { APIError, betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from '@/lib/prisma'
import { nextCookies } from 'better-auth/next-js'
import { headers } from 'next/headers'
import { Organization, Prisma, Subscriptions, User } from '@/generated/prisma'
import { PricingTier, Tier } from '@/constatnts/paddle-prices'
import { createAuthMiddleware } from 'better-auth/api'

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
  plugins:[nextCookies()],
  hooks:{
    after:createAuthMiddleware(async (ctx) => {
      if(ctx.path === '/sign-up/email' || ctx.path?.startsWith('/sign-in/social')){
        if(ctx.context.returned instanceof APIError){
          return;
        }
        const user = (ctx.context.returned as {user:User}).user as User;
        if(user){
          const organization = await prisma.organization.create({
            data: {
              name: `${user.name}'s Organization`,
            },
          });
          await prisma.user.update({
            where: { id: user.id },
            data: { organizationId: organization.id },
          });
        }
      }
    })
  }
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

export const getActiveSubscription = async (): Promise<(Tier & { isYearly: boolean }) | undefined> => {
    const user = await getUser({
        organization: {
            include: {
                subscriptions: {
                  where:{
                    subscriptionStatus:{
                      in:['active','trialing'],
                    }
                  },
                  take:1
                  
                },
            }
        }
    }) as User & { organization: Organization & { subscriptions: Subscriptions[] } };


    if (!user || !user.organization) {
        return undefined;
    }
    
    const subscription = user.organization.subscriptions[0];
    
    if (!subscription) {
        return undefined;
    }
    
    const tier = PricingTier.find(tier => 
        tier.priceId.month === subscription.priceId || 
        tier.priceId.year === subscription.priceId
    );
    
    if (!tier) {
        return undefined;
    }
    
    const isYearly = tier.priceId.year === subscription.priceId;
    
    return { ...tier, isYearly };
}