import { initializePaddle } from '@paddle/paddle-js';

export const paddleClient = initializePaddle({
    token: process.env.PADDLE_CLIENT_KEY as string,
})