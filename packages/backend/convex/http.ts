import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

// Clerk webhook handler
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payloadString = await request.text();
    const headerPayload = request.headers;

    try {
      const payload = JSON.parse(payloadString);
      const eventType = payload.type;

      // Clerk webhook events are acknowledged here. User upsert/delete mutations
      // are temporarily disabled until internal APIs are added.

      return new Response(null, { status: 200 });
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response("Webhook processing failed", { status: 500 });
    }
  }),
});

export default http;
