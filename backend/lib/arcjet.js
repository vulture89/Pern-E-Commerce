import arcjet, { tokenBucket, shield, detectBot } from "@arcjet/node";
import "dotenv/config";

export const aj = arcjet({
  key: process.env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  characteristics: ["ip.src"], // Track requests by IP
  rules: [
    shield({ mode: "LIVE" }), // Block all requests that are not from a browser
    detectBot({
      mode: "LIVE", // Block all requests that are not from a browser
      allow: ["CATEGORY: SEARCH_ENGINE"],
    }),
    // rate limit all requests to 100 per minute
    tokenBucket({
      mode: "LIVE", // Block all requests that are not from a browser
      refillRate: 30,
      interval: 5,
      capacity: 20,
    }),
  ],
});
