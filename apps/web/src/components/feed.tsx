import { UserButton, useUser } from "@clerk/nextjs";
import { api } from "@social-media-app/backend/convex/_generated/api";
import { useQuery } from "convex/react";

export default function Feed() {
  const user = useUser();
  const privateData = useQuery(api.privateData.get);

  return (
    <div>
     
    </div>
  );
}
