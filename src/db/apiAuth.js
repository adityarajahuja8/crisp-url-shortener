import { supabase, supabaseUrl } from "./supabase";

export async function login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) {
        throw new Error(error.message);
    }
    return data;
}

export async function getCurrentUser() {
    const { data: session, error } = await supabase.auth.getSession();
    if (error) {
        throw new Error(error.message);
    }
    if (!session.session) return null
    return session.session?.user;
}

export async function signup({ name, email, password, profile_pic }) {
    let profilePicUrl = null;

    if (profile_pic && profile_pic instanceof File) {
        if (!profile_pic?.type?.startsWith("image/") || profile_pic.size > 5 * 1024 * 1024) {
            throw new Error("Profile picture must be an image up to 5 MB")
        }

        const fileName = `dp-${name.split(" ").join("-")}-${Math.random()}`;
        const { error: storageError } = await supabase.storage
            .from("profile_pic")
            .upload(fileName, profile_pic)

        if (storageError) throw new Error(storageError.message)
        profilePicUrl = `${supabaseUrl}/storage/v1/object/public/profile_pic/${fileName}`;
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name,
                profile_pic: profilePicUrl,
            },
        }
    })

    if (error) {
        if (profilePicUrl) {
            const fileName = profilePicUrl.split("/").pop();
            const { error: removeError } = await supabase.storage
                .from("profile_pic")
                .remove([fileName]);
            if (removeError) console.error("Unable to remove orphaned profile picture:", removeError);
        }
        throw new Error(error.message)
    }
    return data
}

export async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message)
}

export async function requestPasswordReset(email) {
    const emailStr = typeof email === "object" ? email?.email : email;
    const { data, error } = await supabase.auth.resetPasswordForEmail(emailStr, {
        redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
        throw new Error(error.message);
    }
    return data;
}

export async function updatePassword(newPassword) {
    const passwordStr = typeof newPassword === "object" ? newPassword?.password : newPassword;
    const { data, error } = await supabase.auth.updateUser({
        password: passwordStr,
    });
    if (error) {
        throw new Error(error.message);
    }
    return data;
}