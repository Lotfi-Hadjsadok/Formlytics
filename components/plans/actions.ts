'use server'
import { paddle } from "@/lib/paddle";
import prisma from "@/lib/prisma";
import { Customers, User } from "@/generated/prisma";


export const createPaddleCustomer = async (user:User & { customer: Customers })=>{
    const customers = await paddle.customers.list(
        {
            email: [user.email],
            status: ['active', 'archived'],
        },
    ).next();

    // if no customer, create a new one
    const paddleCustomer = customers.length == 0 ? await paddle.customers.create({
        email: user.email,
        name: user.name,
        customData: {
            userId: user.id,
        },
    }) : customers[0];

    if(paddleCustomer.status == 'archived'){
        await paddle.customers.update(paddleCustomer.id, {
            status: 'active',
        });
    }

   
    // if no customer in database, create a new one
    if(!user.customer){
        await prisma.customers.create({
            data: {
                customerId: paddleCustomer.id,
                userId: user.id,
                email: user.email,
            },
        });
    }
    return paddleCustomer.id;
}