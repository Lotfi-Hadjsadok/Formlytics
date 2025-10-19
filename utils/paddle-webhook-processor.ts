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
        await prisma.subscriptions.create({
            data: {
            subscriptionId: eventData.data.id,
            subscriptionStatus: eventData.data.status,
            priceId: eventData.data.items[0].price?.id ?? '',
            productId: eventData.data.items[0].price?.productId ?? '',
            scheduledChange: eventData.data.scheduledChange?.effectiveAt ?? '',
            customer:{
              connect:{
                customerId: eventData.data.customerId,
              },
            },
            user:{
              connect:{
                id: eventData.data.customData?.userId as string,
              },
            },
          },
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
        }
      } finally {
        console.log('subscription created');
      }
    }
  
    private async updateSubscriptionData(eventData: SubscriptionUpdatedEvent) {
      try {
        await prisma.subscriptions.update({
          where: {
            subscriptionId: eventData.data.id,
          },
          data: {
            subscriptionStatus: eventData.data.status,
            priceId: eventData.data.items[0].price?.id ?? '',
            productId: eventData.data.items[0].price?.productId ?? '',
            scheduledChange: eventData.data.scheduledChange?.effectiveAt ?? '',
            customer:{
              connect:{
                customerId: eventData.data.customerId,
              },
            },
            user:{
              connect:{
                id: eventData.data.customData?.userId as string,
              },
            },
          },
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
        }
      } finally {
        console.log('subscription updated');
      }
    }
  
    private async updateCustomerData(eventData: CustomerCreatedEvent | CustomerUpdatedEvent) {
      try {
        await prisma.customers.update({
          where: {
            customerId: eventData.data.id,
          },
          data: {
            email: eventData.data.email,
            userId: eventData.data.customData?.userId as string,
          },
        });

      } catch (error:unknown) {
        if (error instanceof Error) {
          console.log(error.message)
        } 
      }
      finally {
        console.log(eventData)
        console.log('customer updated');
      }
     
    }
  }