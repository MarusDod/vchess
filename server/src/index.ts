import { createHTTPServer } from '@trpc/server/adapters/standalone';
import appRouter from './router';

const PORT = 6002;

const server = createHTTPServer({
    router: appRouter,
});

server.listen(PORT);
