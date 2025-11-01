import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

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

      // Handle user.created and user.updated events
      if (eventType === "user.created" || eventType === "user.updated") {
        const { id, email_addresses, first_name, last_name, image_url } =
          payload.data;

        const email = email_addresses?.[0]?.email_address || "";
        const name = `${first_name || ""} ${last_name || ""}`.trim() || email;

        await ctx.runMutation(internal.users.upsertFromClerk, {
          clerkId: id,
          name,
          email,
          avatarUrl: image_url,
        });
      }

      // Handle user.deleted event
      if (eventType === "user.deleted") {
        const { id } = payload.data;
        await ctx.runMutation(internal.users.deleteFromClerk, {
          clerkId: id,
        });
      }

      return new Response(null, { status: 200 });
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response("Webhook processing failed", { status: 500 });
    }
  }),
});

export default http;
