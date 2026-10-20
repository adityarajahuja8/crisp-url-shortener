import { Copy, Download, Trash } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from './ui/button'
import { deleteUrl } from '@/db/apiUrls'
import { BeatLoader } from 'react-spinners'
import useFetch from '@/hook/use-fetch'
import { LinkIcon } from 'lucide-react'

const LinkCard = ({ url, fetchUrls }) => {
  const downloadImage = () => {
    const imageUrl = url?.qr;
    const fileName = url?.title;

    const anchor = document.createElement("a");
    anchor.href = imageUrl;
    anchor.download = fileName;

    document.body.appendChild(anchor);

    anchor.click();

    document.body.removeChild(anchor);
  }

  const { loading: loadingDelete, fn: fnDelete } = useFetch(deleteUrl, url?.id);

  return (
    <div className="flex min-w-0 flex-col md:flex-row gap-5 border border-slate-800/90 hover:border-slate-800/90 p-5 bg-[#0f162a] rounded-2xl shadow-lg transition duration-200">
      <img
        src={url?.qr}
        className="h-32 object-contain ring-2 ring-crisp-link rounded-xl p-1 bg-white/5 self-start shrink-0"
        alt="qr code"
      />
      <Link to={`/link/${url?.id}`} className="flex min-w-0 flex-col flex-1">
        <span className="break-words text-3xl font-extrabold hover:underline decoration-slate-400 underline-offset-4 cursor-pointer">
          {url?.title}
        </span>
        <span className="break-all text-2xl text-crisp-link font-bold hover:underline decoration-slate-400 underline-offset-4 cursor-pointer">
          {window.location.origin}/{url?.custom_url ? url?.custom_url : url.short_url}
        </span>
        <span className="flex min-w-0 items-center gap-1 truncate hover:underline decoration-slate-400 underline-offset-4 cursor-pointer" title={url?.original_url}>
          <LinkIcon className="p-1" />
          {url?.original_url}
        </span>
        <div className="flex items-center gap-2 font-extralight text-sm flex-wrap mt-auto pt-2">
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
      </Link>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={() =>
            navigator.clipboard.writeText(`${window.location.origin}/${url?.custom_url || url?.short_url}`)
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
            if (result !== null) fetchUrls();
          }}
          disabled={loadingDelete}
        >
          {loadingDelete ? <BeatLoader size={5} color="white" /> : <Trash />}
        </Button>
      </div>
    </div>
  )
}

export default LinkCard
