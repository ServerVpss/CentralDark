import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-contingency-token, x-target-url, x-target-method",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const token = req.headers.get("x-contingency-token");
  const expectedToken = Deno.env.get("CONTINGENCY_INTERNAL_TOKEN");

  if (!expectedToken || token !== expectedToken) {
    return new Response(JSON.stringify({ error: "Unauthorized: Invalid or missing x-contingency-token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const targetUrl = req.headers.get("x-target-url");
  const targetMethod = req.headers.get("x-target-method") || req.method;

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: "Missing x-target-url header" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // The secret is expected to be in an env var named CONTINGENCY_TARGET_SECRET
  // The user should set this in Supabase Dashboard.
  const targetSecret = Deno.env.get("CONTINGENCY_TARGET_SECRET");

  try {
    const body = req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined;
    
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (targetSecret) {
      headers.set("Authorization", `Bearer ${targetSecret}`);
    }

    console.log(`Proxying ${targetMethod} request to ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: targetMethod,
      headers: headers,
      body: body,
    });

    const responseData = await response.text();

    return new Response(responseData, {
      status: response.status,
      headers: { 
        ...corsHeaders, 
        "Content-Type": response.headers.get("Content-Type") || "application/json" 
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Proxy error", message: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
