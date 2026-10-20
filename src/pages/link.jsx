import { UrlState } from '@/context';
import { getClicksForUrl } from '@/db/apiClicks';
import { deleteUrl } from '@/db/apiUrls';
import useFetch from '@/hook/use-fetch';
import { Copy, Download, LinkIcon, Trash } from 'lucide-react';
import { useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BarLoader, BeatLoader } from 'react-spinners';
import { useEffect } from 'react';
import Button from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUrl } from './dashboard';
import LocationStats from '@/components/location-stats';
import DeviceStats from '@/components/device-stats';

const isSafeDestination = (value) => {
  try {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
};

const Link = () => {

  const downloadImage = () => {
    const imageUrl = url?.qr;
    const fileName = url?.title; // Desired file name for the downloaded image

    // Create an anchor element
    const anchor = document.createElement("a");
    anchor.href = imageUrl;
    anchor.download = fileName;

    // Append the anchor to the body
    document.body.appendChild(anchor);

    // Trigger the download by simulating a click event
    anchor.click();

    // Remove the anchor from the document
    document.body.removeChild(anchor);
  };

  const { id } = useParams();
  const { user } = UrlState();
  const navigate = useNavigate();
  const urlFetchedFor = useRef(null)
  const statsFetchedFor = useRef(null)

  const {
    loading,
    data: url,
    fn,
    error,
  } = useFetch(getUrl, useMemo(() => ({ id, user_id: user?.id }), [id, user?.id]));

  const {
    loading: loadingStats,
    data: stats,
    fn: fnStats,
  } = useFetch(getClicksForUrl, id);

  const { loading: loadingDelete, fn: fnDelete } = useFetch(deleteUrl, id)


  useEffect(() => {
    if (urlFetchedFor.current !== id) {
      urlFetchedFor.current = id
      fn()
    }
  }, [fn, id]);

  useEffect(() => {
    if (!error && !loading && url && statsFetchedFor.current !== id) {
      statsFetchedFor.current = id
      fnStats()
    }
  }, [loading, error, url, fnStats, id]);

  if (error) {
    navigate("/dashboard");
  }

  let link = ""

  if (url) {
    link = url?.custom_url ? url?.custom_url : url.short_url
  }

  return (
    <>
      {(loading || loadingStats) && (
        <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />
      )}
      <div className="flex min-w-0 flex-col gap-8 sm:flex-row justify-between">
        <div className="flex min-w-0 flex-col items-start gap-8 rounded-lg sm:w-2/5">
          <span className="break-words text-6xl font-extrabold hover:underline decoration-slate-400 underline-offset-4 cursor-pointer">
            {url?.title}
          </span>
          <a
            href={`${window.location.origin}/${link}`}
            target="_blank"
            className="break-all text-3xl sm:text-4xl text-crisp-link font-bold hover:underline decoration-slate-400 underline-offset-4 cursor-pointer"
          >
            {window.location.origin}/{link}
          </a>
          <a
            href={isSafeDestination(url?.original_url) ? url.original_url : undefined}
            target="_blank"
            className="flex min-w-0 items-center gap-1 break-all hover:underline decoration-slate-400 underline-offset-4 cursor-pointer"
          >
            <LinkIcon className="p-1" />
            {url?.original_url}
          </a>
          <div className="flex items-center gap-2 font-extralight text-sm flex-wrap">
            <span>{new Date(url?.created_at).toLocaleString()}</span>
            {url?.expires_at && (
              new Date(url.expires_at) < new Date() ? (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-crisp-danger/20 text-crisp-danger border border-crisp-danger/40">
                  Expired
                </span>
              ) : (
                <span className="text-xs text-slate-400">
                  Expires {new Date(url.expires_at).toLocaleString()}
                </span>
              )
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() =>
                navigator.clipboard.writeText(`${window.location.origin}/${link}`)
              }
            >
              <Copy />
            </Button>
            <Button variant="ghost" onClick={downloadImage}>
              <Download />
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                const result = await fnDelete();
                if (result !== null) navigate("/dashboard");
              }}
              disabled={loadingDelete}
            >
              {loadingDelete ? (
                <BeatLoader size={5} color="white" />
              ) : (
                <Trash />
              )}
            </Button>
          </div>
          <img
            src={url?.qr}
            className="w-full self-center sm:self-start ring ring-crisp-link p-1 object-contain"
            alt="qr code"
          />
        </div>

        <Card className='min-w-0 sm:w-3/5 border border-slate-800/90 bg-[#0f162a] rounded-2xl shadow-lg'>
          <CardHeader>
            <CardTitle className="text-3xl sm:text-4xl font-extrabold text-white">Stats</CardTitle>
          </CardHeader>
          {stats && stats?.length ? (
            <CardContent className="flex flex-col gap-6">
              <Card className="border border-slate-700/80 bg-[#172036] rounded-xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base sm:text-lg font-semibold text-slate-300">Total Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-extrabold text-white">{stats?.length}</p>
                </CardContent>
              </Card>

              <CardTitle className="text-xl sm:text-2xl font-bold text-white">Location Data</CardTitle>
              <LocationStats stats={stats} />
              <CardTitle className="text-xl sm:text-2xl font-bold text-white">Device Info</CardTitle>
              <DeviceStats stats={stats} />
            </CardContent>
          ) : (
            <CardContent>
              {loading === false
                ? "No Statistics yet" : "Loading Statistics..."}
            </CardContent>)}
        </Card>
      </div>
    </>
  )
}

export default Link
