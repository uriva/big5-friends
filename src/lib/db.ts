import { init, id } from "@instantdb/react";
import schema from "../../instant.schema";

const APP_ID =
  process.env.NEXT_PUBLIC_INSTANT_APP_ID ||
  "fa1e83e0-aefe-4b75-8e07-741dcb678712";

export const db = init({
  appId: APP_ID,
  schema,
});

export { id };
