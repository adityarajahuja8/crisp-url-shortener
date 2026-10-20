import { getLongUrl } from '@/db/apiUrls';
import useFetch from '@/hook/use-fetch';
import { useParams } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import { storeClicks } from '@/db/apiClicks';
import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';

const RedirectLink = () => {
  const {id}=useParams();
  const {loading,data,error,fn}=useFetch(getLongUrl,id);
  const clickLogged = useRef(false);
  const clickOptions = useMemo(() => ({
    id:data?.id,
    originalUrl:data?.original_url,
  }), [data]);

  const {loading:loadingStats,fn:fnStats}=useFetch(storeClicks, clickOptions)

  useEffect(()=>{
    fn()
  },[fn])

  useEffect(()=>{
    if(!loading && data && !data.is_expired && !clickLogged.current){
      clickLogged.current = true;
      fnStats()
    }
  },[loading, data, fnStats])
  
  if (!loading && (error || !data)) {
    return (
      <div className="py-10 text-center">
        <p className="text-4xl font-bold">Link not found.</p>
        <p className="mt-2">This link doesn't exist or was removed.</p>
        <Link to="/" className="text-crisp-link hover:underline decoration-slate-400 underline-offset-4">Go home</Link>
      </div>
    )
  }

  if (!loading && data?.is_expired) {
    return (
      <div className="py-10 text-center">
        <p className="text-4xl font-bold">This link has expired.</p>
        <p className="mt-2">This link is no longer accessible.</p>
        <Link to="/" className="text-crisp-link hover:underline decoration-slate-400 underline-offset-4">Go home</Link>
      </div>
    )
  }

  if(loading || loadingStats){
    return (
      <>
          <BarLoader width={"100%"} color='#36d7b7'/>
          <br/>
          Redirecting...
      </>
    )

  }
}

export default RedirectLink
