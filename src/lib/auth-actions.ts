import { authClient } from "@/lib/auth-client";

export async function getSession() {
  const { data: session, error } = await authClient.getSession();
  if (error) {
    console.error("Error fetching session:", error);
    return null;
  }
  return session;
}

export async function signIn(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Email and password are required for sign-in.");
  }
  const { data, error } = await authClient.signIn.email({
    email,
    password,
    callbackURL: "/",
  });

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function signUp(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
) {
  if (!email || !password) {
    throw new Error("Email and password are required for sign-up.");
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  const { data, error } = await authClient.signUp.email({
    email,
    password,
    name,
    callbackURL: "/",
  });

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function signOut() {
  await authClient.signOut();
}
