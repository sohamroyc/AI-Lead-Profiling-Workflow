import { createFileRoute } from "@tanstack/react-router";

const N8N_WEBHOOK_URLS = [
  "https://sohamrc.app.n8n.cloud/webhook/lead-intake",
] as const;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export const Route = createFileRoute("/api/public/lead-intake")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: corsHeaders }),

      POST: async ({ request }) => {
        try {
          const body = await request.text();
          const { upstream, text } = await forwardToN8n(body);
          const inactiveMessage = getInactiveWebhookMessage(upstream, text);
          const success = upstream.ok && !inactiveMessage;

          return new Response(
            JSON.stringify({
              success,
              status: upstream.status,
              ...(success
                ? { data: parseJsonSafely(text) ?? text ?? null }
                : {
                    error:
                      inactiveMessage ??
                      parseJsonSafely(text)?.message ??
                      parseJsonSafely(text)?.error ??
                      (text || "Submission failed. Please try again."),
                  }),
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            },
          );
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Upstream request failed";
          return new Response(JSON.stringify({ success: false, error: message }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }
      },
    },
  },
});

async function forwardToN8n(body: string) {
  let lastResult: { upstream: Response; text: string } | null = null;

  for (const url of N8N_WEBHOOK_URLS) {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const text = await upstream.text();
    const result = { upstream, text };

    if (upstream.ok || !isInactiveProductionWebhook(upstream, text)) {
      return result;
    }

    lastResult = result;
  }

  return lastResult ?? {
    upstream: new Response(JSON.stringify({ error: "n8n webhook unavailable" }), {
      status: 502,
    }),
    text: JSON.stringify({ error: "n8n webhook unavailable" }),
  };
}

function isInactiveProductionWebhook(response: Response, text: string) {
  return (
    response.status === 404 &&
    text.toLowerCase().includes("not registered")
  );
}

function getInactiveWebhookMessage(response: Response, text: string) {
  if (!isInactiveProductionWebhook(response, text)) return null;

  return "n8n is not listening for this webhook yet. In n8n, click 'Listen for test event' and submit again, or activate the workflow to use the production webhook.";
}

function parseJsonSafely(text: string): Record<string, string> | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, string>)
      : null;
  } catch {
    return null;
  }
}
