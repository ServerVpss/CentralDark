import { createFileRoute } from "@tanstack/react-router";
import { wuzapiWebhookServer } from "./wuzapi.webhook";

export const Route = createFileRoute("/api/public/wuzapi.webhook")({
  server: wuzapiWebhookServer,
});