"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  try {
    const { error, data: signInData } = await supabase.auth.signInWithPassword(data);

    if (error) {
      return { 
        success: false, 
        error: "Invalid email or password" 
      };
    }

    if (signInData?.user) {
      revalidatePath("/", "layout");
      return { 
        success: true, 
        message: "Successfully logged in!" 
      };
    }

    return { 
      success: false, 
      error: "Failed to log in" 
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || "An unexpected error occurred" 
    };
  }
}

export async function signup(formData: FormData) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const firstName = formData.get("first-name") as string;
  const lastName = formData.get("last-name") as string;
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        full_name: `${firstName} ${lastName}`,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  };

  try {
    const { error, data: signUpData } = await supabase.auth.signUp(data);

    if (error) {
      // Handle rate limit error specifically
      if (error.message.includes("rate limit")) {
        return { 
          success: false, 
          error: "Too many attempts. Please wait a few minutes before trying again." 
        };
      }
      return { 
        success: false, 
        error: error.message 
      };
    }

    if (signUpData?.user) {
      return { 
        success: true, 
        message: "Please check your email to verify your account." 
      };
    }

    return { 
      success: false, 
      error: "Failed to create account" 
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || "An unexpected error occurred" 
    };
  }
}

export async function signout() {
  redirect("/logout");
}

export async function signInWithGoogle() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.log(error);
    redirect("/error");
  }

  redirect(data.url);
}

// New function to handle Spotify authentication
export async function signInWithSpotify(access_token: string, refresh_token: string) {
  const supabase = createClient();

  // Update the user's metadata with Spotify tokens
  const { error } = await supabase.auth.updateUser({
    data: {
      spotify_access_token: access_token,
      spotify_refresh_token: refresh_token,
    },
  });

  if (error) {
    console.error("Error updating user with Spotify tokens:", error);
    throw new Error("Failed to store Spotify tokens");
  }

  revalidatePath("/", "layout");
  redirect("/liked-tracks");
}

export async function resetPassword(email: string) {
  const supabase = createClient();
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    });

    if (error) {
      console.error('Error resetting password:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error in resetPassword:', error);
    throw error;
  }
}