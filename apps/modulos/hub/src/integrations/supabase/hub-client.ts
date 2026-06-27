// Hub Supabase Client — projeto lyoigsqluyktoclwdaft (separado do TelePanel)
// anon key é pública por design do Supabase
import { createClient } from "@supabase/supabase-js";

const HUB_URL = import.meta.env.VITE_HUB_SUPABASE_URL
  || "https://lyoigsqluyktoclwdaft.supabase.co";
const HUB_KEY = import.meta.env.VITE_HUB_SUPABASE_ANON_KEY
  || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5b2lnc3FsdXlrdG9jbHdkYWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMTk0MDAsImV4cCI6MjA5NTU5NTQwMH0.24eXsWvtmTd-sQmUIN1aCAdw85BE9c-ay-XYErNT62k";

// schema "api" — PostgREST deste projeto expõe 'api' como padrão; views espelham hub.*
export const hubClient = createClient(HUB_URL, HUB_KEY, {
  db: { schema: "api" },
  auth: { persistSession: false },
});
