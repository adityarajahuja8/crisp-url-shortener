import { supabase, supabaseUrl } from "./supabase";


export async function getUrls(user_id){
    const {data:session,error}=await supabase
    .from("urls")
    .select("id,title,original_url,custom_url,short_url,user_id,qr,created_at,expires_at")
    .eq("user_id",user_id)
    .limit(1000)

    
    if(error){
        console.log(error.message)
        throw new Error("Unable to load URLs");
    } 
        

    return session;
} 

export async function deleteUrl(id){
    const {error}=await supabase
    .from("urls")
    .delete()
    .eq("id",id)

    
    if(error){
        console.log(error.message)
        throw new Error("Unable to load URLs");
    } 
        

    return true;
} 

export async function createUrls({ title, longUrl, customUrl, user_id, expires_at }, qrcode){
    if (!/^https?:$/i.test(new URL(longUrl).protocol)) {
        throw new Error("URL must use http or https")
    }
    if (customUrl && (!/^[a-zA-Z0-9_-]{1,30}$/.test(customUrl) ||
        ["auth", "dashboard", "link"].includes(customUrl.toLowerCase()))) {
        throw new Error("Invalid custom link")
    }

    const fileName = `qr-${Math.random().toString(36).substring(2, 8)}`;
    let uploadedQr = false;

    if (qrcode) {
        const { error: storageError } = await supabase.storage
            .from("qrs")
            .upload(fileName, qrcode)

        if (storageError) throw new Error(storageError.message)
        uploadedQr = true;
    }

    const qr = `${supabaseUrl}/storage/v1/object/public/qrs/${fileName}`;
    const shortCode = customUrl || Math.random().toString(36).substring(2, 8);
    const formattedExpiresAt = expires_at ? new Date(expires_at).toISOString() : null;

    const { data, error } = await supabase
        .from("urls")
        .insert([{
            title,
            original_url: longUrl,
            custom_url: customUrl || null,
            short_url: shortCode,
            user_id,
            qr,
            expires_at: formattedExpiresAt,
        }])
        .select()

    if (error) {
        if (uploadedQr) {
            const { error: removeError } = await supabase.storage
                .from("qrs")
                .remove([fileName]);
            if (removeError) console.error("Unable to remove orphaned QR:", removeError);
        }
        console.log(error.message)
        throw new Error("Error creating short URL")
    }

    if (!data) {
        return [];
    }

    return data;
} 

export async function getLongUrl(id) {
  const { data, error } = await supabase.rpc("get_long_url", {
    lookup_code: id,
  });

  if (error) {
    console.error("Error fetching short link:", error);
    throw new Error("Unable to load short link");
  }

  // The RPC returns an array of rows, so take the first one
  return data && data.length > 0 ? data[0] : null;
}