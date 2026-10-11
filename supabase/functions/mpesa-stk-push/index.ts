// Supabase Edge Function: mpesa-stk-push
// This function handles the Daraja API STK Push request

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MPESA_CONSUMER_KEY = Deno.env.get("MPESA_CONSUMER_KEY");
const MPESA_CONSUMER_SECRET = Deno.env.get("MPESA_CONSUMER_SECRET");
const MPESA_SHORTCODE = Deno.env.get("MPESA_SHORTCODE");
const MPESA_PASSKEY = Deno.env.get("MPESA_PASSKEY");
const MPESA_CALLBACK_URL = Deno.env.get("MPESA_CALLBACK_URL");

serve(async (req) => {
  const { phone, amount, accountReference } = await req.json();

  // 1. Get Access Token
  // 2. Format Phone Number (254...)
  // 3. Generate Timestamp & Password
  // 4. Call STK Push API (https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest)

  // Placeholder logic for MVP
  console.log(`Initiating STK Push for ${phone} - KES ${amount}`);

  return new Response(
    JSON.stringify({ 
      CheckoutRequestID: "ws_CO_123456789", 
      ResponseCode: "0", 
      CustomerMessage: "Success. Request accepted for processing" 
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
