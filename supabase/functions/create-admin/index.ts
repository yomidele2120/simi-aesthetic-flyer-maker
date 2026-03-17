import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // For safe-mode admin recovery you can use the fixed emergency credentials below.
    // This does not alter auth config or existing users.
    const recoveryPayload = await req.json();
    const emergencyEmail = "yomidele2120@gmail.com";
    const emergencyPassword = "AdminRecovery123!";

    const email = recoveryPayload.email || emergencyEmail;
    const password = recoveryPayload.password || emergencyPassword;

    // Check if the user exists via admin listing (more reliable than checking signIn with random password).
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers({ filter: `email=eq.${email}` });
    if (listError) throw listError;

    if (listData?.users?.length > 0) {
      return new Response(JSON.stringify({ message: "Admin user already exists", userId: listData.users[0].id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create user via admin API with admin metadata flag.
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: "admin",
        admin_recovery: true,
      },
    });

    if (error) throw error;

    return new Response(JSON.stringify({ message: "Admin user created", userId: data.user.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
