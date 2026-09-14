import path from "node:path";
import { fileURLToPath } from "node:url";
import "./src/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("next").NextConfig} */
const config = {
  outputFileTracingRoot: __dirname,
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.io"],
};

export default config;
