'use server'
import { paddle } from "@/lib/paddle";
import prisma from "@/lib/prisma";
import { Organization, User } from "@/generated/prisma";


export const createPaddleCustomer = async (user: User & { organization: Organization | null }) => {
    // Organization should always exist now since it's auto-created on signup
    if (!user.organization) {
        throw new Error('User organization not found');
    }

    // If organization already has a paddle customer, return it
    if (user.organization.paddleCustomerId) {
        return user.organization.paddleCustomerId;
    }

    // Check if customer already exists in Paddle
    const customers = await paddle.customers.list(
        {
            email: [user.email],
            status: ['active', 'archived'],
        },
    ).next();

    // Create a new customer or use existing one
    const paddleCustomer = customers.length == 0 ? await paddle.customers.create({
        email: user.email,
        name: user.organization.name,
        customData: {
            userId: user.id,
            organizationId: user.organization.id,
        },
    }) : customers[0];

    // Reactivate archived customers
    if (paddleCustomer.status == 'archived') {
        await paddle.customers.update(paddleCustomer.id, {
            status: 'active',
        });
    }

    // Link the paddle customer ID to the organization
    await prisma.organization.update({
        where: { id: user.organization.id },
        data: { paddleCustomerId: paddleCustomer.id },
    });

    return paddleCustomer.id;
}