import { procedure, router } from './trpc';

const appRouter = router({
    hello: procedure.query(() => 'hello world'),
});

export default appRouter;
export type AppRouter = typeof appRouter;
