import { Environment, Paddle } from "@paddle/paddle-node-sdk";


const globalForPaddle = globalThis as unknown as { paddle?: Paddle };

export const paddle =
  globalForPaddle.paddle ?? new Paddle(process.env.PADDLE_API_KEY as string,{
    environment: process.env.NODE_ENV === "production" ? Environment.production : Environment.sandbox,
  });

if (!globalForPaddle.paddle) {
  globalForPaddle.paddle = paddle;
}

