import { createClient } from "@supabase/supabase-js";
import { notify } from "./notifications";

// Using direct values (NOT recommended for production) per user request.
// MOVE these into environment variables in a real deployment.
const SUPABASE_URL = "https://upyblkiaivmpsadkexdj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVweWJsa2lhaXZtcHNhZGtleGRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTUyMzMsImV4cCI6MjA3NDk5MTIzM30.Lke4YMUHIzycHemzDFqydVINlBmOGgJKxkNkWybYr8w";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

// What the Contact and Feedback forms do on submit: save the row, then
// confirm with a notification. Throws the database error, if any.
export async function submitForm(
  table: "review" | "bugs_and_suggestions",
  row: Record<string, unknown>,
  sent: { appId: string; title: string; body: string },
) {
  const { error } = await supabase.from(table).insert(row);
  if (error) throw error;
  notify(sent);
}
