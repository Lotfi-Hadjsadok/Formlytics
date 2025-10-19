import { NextRequest, NextResponse } from "next/server";
import { auth, getActiveSubscription } from "./lib/auth";

const ROUTES = {
    PROTECTED: ['/dashboard', '/plans', '/success'],
    AUTH: ['/login', '/signup'],
    SUBSCRIPTION_REQUIRED: ['/dashboard'],
    NOT_SUBSCRIBED_REQUIRED:['/plans']
} as const;

async function getSession(request: NextRequest) {
    return auth.api.getSession({ headers: request.headers });
}

function isRoute(pathname: string, routes: readonly string[]) {
    return routes.some(route => pathname.startsWith(route));
}

function redirectTo(url: string, request: NextRequest) {
    return NextResponse.redirect(new URL(url, request.url));
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = await getSession(request);
    const subscription = session ? await getActiveSubscription() : null;

    // Handle protected routes (require authentication)
    if (isRoute(pathname, ROUTES.PROTECTED)) {
        if (!session) {
            return redirectTo('/login', request);
        }

        // Required subscription for specific routes
        if (isRoute(pathname, ROUTES.SUBSCRIPTION_REQUIRED) && !subscription) {
            return redirectTo('/plans', request);
        }

        // Shouldn't be subscribed
        if(isRoute(pathname,ROUTES.NOT_SUBSCRIBED_REQUIRED) && subscription){
            return redirectTo('/dashboard',request)
        }
    }

    // Handle auth routes (redirect if already authenticated)
    if (isRoute(pathname, ROUTES.AUTH) && session) {
        const redirectUrl = subscription ? '/dashboard' : '/plans';
        return redirectTo(redirectUrl, request);
    }

    return NextResponse.next();
}

export const config = { 
    matcher: ['/dashboard/:path*', '/plans/:path*', '/success/:path*', '/login', '/signup'],
    runtime: 'nodejs',
};