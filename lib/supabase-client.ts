import { createClient } from "@supabase/supabase-js";

// Using direct values (NOT recommended for production) per user request.
// MOVE these into environment variables in a real deployment.
const SUPABASE_URL = "https://upyblkiaivmpsadkexdj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVweWJsa2lhaXZtcHNhZGtleGRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTUyMzMsImV4cCI6MjA3NDk5MTIzM30.Lke4YMUHIzycHemzDFqydVINlBmOGgJKxkNkWybYr8w";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

// Existing table: review (id, name, email, rating, review_text, created_at)
export interface ReviewRow {
  id: string;
  name: string;
  email: string | null;
  rating: number | null; // rating is optional/nullable in DB per latest user request
  review_text: string;
  created_at: string;
}
export interface BugReportRow {
  id: string;
  name: string;
  email: string | null;
  report_text: string;
  created_at: string;
}
