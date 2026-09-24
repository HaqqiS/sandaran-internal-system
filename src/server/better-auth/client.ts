import {
  inferAdditionalFields,
  phoneNumberClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./config";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), phoneNumberClient()],
});

export type Session = typeof authClient.$Infer.Session;
