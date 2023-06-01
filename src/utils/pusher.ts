import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

let pusherServer: PusherServer | undefined;

// Client-side
let pusherClient: PusherClient | undefined;
if (typeof window !== 'undefined') {
  pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  });
}

// Server-side
export function getPusherServer() {
  if (!pusherServer) {
    pusherServer = new PusherServer({
      appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.NEXT_PUBLIC_PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
  }
  return pusherServer;
}

export { pusherClient };