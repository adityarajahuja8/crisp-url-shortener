import { useCallback, useState } from 'react'

const DEFAULT_OPTIONS = {}

const useFetch = (cb,options=DEFAULT_OPTIONS) => {
    const[data,setData]=useState(null);
    const[loading,setLoading]=useState(false)
    const[error,setError]=useState(null)

    const fn=useCallback(async(...args)=>{
        setLoading(true);
        setError(null);

        try{
            const res=await cb(options,...args);
            setData(res);
            setError(null);
            return res;
        }catch(err){
            setError(err)
            return null;

        }finally{
            setLoading(false);
        }
    }, [cb, options])

    return { data, loading, error, fn }
}

export default useFetch
