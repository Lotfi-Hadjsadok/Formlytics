import { NextRequest } from "next/server";
import { Paddle } from "@paddle/paddle-node-sdk";
import { paddle } from "@/lib/paddle";
import { ProcessWebhook } from "@/utils/paddle-webhook-processor";

export async function POST(request:NextRequest){
    const body = await request.text();
    const signature = request.headers.get('paddle-signature');
    const privateKey= process.env.PADDLE_NOTIFICATION_SECRET_KEY as string;
    try {
        if (!signature || !body) {
          return Response.json({ error: 'Missing signature from header' }, { status: 400 });
        }
    
        const eventData = await paddle.webhooks.unmarshal(body, privateKey, signature);
        const eventName = eventData?.eventType ?? 'Unknown event';
    
        if (eventData) {
          await new ProcessWebhook().processEvent(eventData);
        }
    
        return Response.json({ status: 200, eventName });
      } catch (e) {
        return Response.json({ error: 'Internal server error' }, { status: 500 });
      }
}