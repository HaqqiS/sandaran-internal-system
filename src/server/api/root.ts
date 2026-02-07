import { commentRouter } from "~/server/api/routers/comment.router"
import { documentRouter } from "~/server/api/routers/document.router"
import { emergencyRouter } from "~/server/api/routers/emergency.router"
import { logisticRouter } from "~/server/api/routers/logistic.router"
import { projectRouter } from "~/server/api/routers/project.router"
import { reportRouter } from "~/server/api/routers/report.router"
import { uploadRouter } from "~/server/api/routers/upload.router"
import { userRouter } from "~/server/api/routers/user"
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  project: projectRouter,
  user: userRouter,
  report: reportRouter,
  comment: commentRouter,
  document: documentRouter,
  emergency: emergencyRouter,
  logistic: logisticRouter,
  upload: uploadRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)
