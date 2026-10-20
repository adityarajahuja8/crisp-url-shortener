import { UAParser } from "ua-parser-js";
import { supabase } from "./supabase";

export async function getClicksForUrls(urlIds) {
  const {data, error} = await supabase
    .from("clicks")
    .select("url_id")
    .in("url_id", urlIds)
    .limit(1000);

  if (error) {
    console.error("Error fetching clicks:", error);
    throw new Error("Unable to load Stats");
  }

  return data;
}

export async function getClicksForUrl(url_id) {
  const {data, error} = await supabase
    .from("clicks")
    .select("city,device")
    .eq("url_id", url_id)
    .limit(1000);

  if (error) {
    console.error(error);
    throw new Error("Unable to load Stats");
  }

  return data;
}


const uaparser=new UAParser();

export const storeClicks=async ({id, originalUrl})=>{
    try {
        const res=uaparser.getResult();
        const device=res.type || "desktop";

        let location = null;
        const cachedLocation = sessionStorage.getItem("crisp-click-location");
        if (cachedLocation) {
            location = JSON.parse(cachedLocation);
        } else {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 1500);
            try {
                const response=await fetch("https://ipapi.co/json", {
                    signal: controller.signal,
                });
                if (!response.ok) throw new Error("Unable to load click location");
                location = await response.json();
                sessionStorage.setItem("crisp-click-location", JSON.stringify(location));
            } finally {
                clearTimeout(timeout);
            }
        }

        await supabase.from("clicks").insert({
            url_id:id,
            city:location?.city,
            country:location?.country_name,
            device:device
        })
    }
    catch(error){
        console.log("Error recording click:",error);
    }
    finally {
        if (originalUrl) {
            try {
                const destination = new URL(originalUrl);
                if (destination.protocol === "http:" || destination.protocol === "https:") {
                    window.location.href = originalUrl
                }
            } catch {
                console.error("Unable to redirect to an invalid URL");
            }
        }
    }
}
