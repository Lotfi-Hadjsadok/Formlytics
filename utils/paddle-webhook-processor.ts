import {
    CustomerCreatedEvent,
    CustomerUpdatedEvent,
    EventEntity,
    EventName,
    SubscriptionCreatedEvent,
    SubscriptionUpdatedEvent,
  } from '@paddle/paddle-node-sdk';
import prisma from '@/lib/prisma';
import { Prisma } from '@/generated/prisma';
  
  export class ProcessWebhook {
    async processEvent(eventData: EventEntity) {
      switch (eventData.eventType) {
        case EventName.SubscriptionCreated:
          await this.createSubscription(eventData);
          break;
        case EventName.SubscriptionUpdated:
          await this.updateSubscriptionData(eventData);
          break;
        case EventName.CustomerUpdated:
          await this.updateCustomerData(eventData);
          break;
      }
    }

    private async createSubscription(eventData: SubscriptionCreatedEvent) {
      try {
        // Find the organization by Paddle customer ID
        const organization = await prisma.organization.findUnique({
          where: { paddleCustomerId: eventData.data.customerId },
        });

        if (!organization) {
          console.error('Organization not found for customerId:', eventData.data.customerId);
          return;
        }

        await prisma.subscriptions.create({
          data: {
            subscriptionId: eventData.data.id,
            subscriptionStatus: eventData.data.status,
            priceId: eventData.data.items[0].price?.id ?? '',
            productId: eventData.data.items[0].price?.productId ?? '',
            scheduledChange: eventData.data.scheduledChange?.effectiveAt ?? '',
            organization: {
              connect: {
                id: organization.id,
              },
            },
          },
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
        }
      }
    }
  
    private async updateSubscriptionData(eventData: SubscriptionUpdatedEvent) {
      try {
        // Find the organization by Paddle customer ID
        const organization = await prisma.organization.findUnique({
          where: { paddleCustomerId: eventData.data.customerId },
        });

        if (!organization) {
          console.error('Organization not found for customerId:', eventData.data.customerId);
          return;
        }

        await prisma.subscriptions.update({
          where: {
            subscriptionId: eventData.data.id,
          },
          data: {
            subscriptionStatus: eventData.data.status,
            priceId: eventData.data.items[0].price?.id ?? '',
            productId: eventData.data.items[0].price?.productId ?? '',
            scheduledChange: eventData.data.scheduledChange?.effectiveAt ?? '',
            organization: {
              connect: {
                id: organization.id,
              },
            },
          },
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
        }
      }
    }
  
    private async updateCustomerData(eventData: CustomerCreatedEvent | CustomerUpdatedEvent) {
      try {
        await prisma.organization.update({
          where: {
            paddleCustomerId: eventData.data.id,
          },
          data: {
            name: eventData.data.name ?? 'Organization',
          },
        });

      } catch (error:unknown) {
        if (error instanceof Error) {
          console.log(error.message)
        } 
      }
     
    }
  }