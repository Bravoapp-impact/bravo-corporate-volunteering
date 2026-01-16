import { supabase } from "@/integrations/supabase/client";

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  accessCode: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export async function validateAccessCode(accessCode: string) {
  const { data, error } = await supabase
    .from("companies")
    .select("id, name")
    .eq("access_code", accessCode)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function signUp({ email, password, firstName, lastName, accessCode }: SignUpData) {
  // First validate the access code
  const company = await validateAccessCode(accessCode);
  
  if (!company) {
    throw new Error("Codice azienda non valido");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: {
        first_name: firstName,
        last_name: lastName,
        company_id: company.id,
        role: "employee",
      },
    },
  });

  if (error) throw error;
  return { ...data, company };
}

export async function signIn({ email, password }: SignInData) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*, companies(*)")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data;
}
