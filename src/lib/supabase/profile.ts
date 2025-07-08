import { supabase } from "./client";
import { Profile } from "@/interfaces/profile";

export async function createProfile(profile: Profile) {
  return await supabase.from("profiles").insert({
    id: profile.userId,
    full_name: profile.full_name || "",
    avatar_url: profile.avatar_url || "",
  });
} 