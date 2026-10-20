import { BarLoader } from 'react-spinners'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import Button from '@/components/ui/button'
import { useMemo, useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter } from 'lucide-react'
import Error from '@/components/error'
import { UrlState } from '@/context'
import useFetch from '@/hook/use-fetch'
import { getUrls } from '@/db/apiUrls'
import { getClicksForUrls } from '@/db/apiClicks'
import LinkCard from '@/components/linkcard'
import CreateLink from '@/components/create-link'
import { supabase } from '@/db/supabase'


const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [linksPerPage, setLinksPerPage] = useState(5)
  const linksTopRef = useRef(null)
  const urlsFetchedFor = useRef(null)
  const clicksFetchedFor = useRef("")

  const { user } = UrlState();
  const { loading, error, data: urls, fn: fnUrls } = useFetch(getUrls, user?.id)
  const urlIds = useMemo(() => urls?.map((url) => url.id) ?? [], [urls])
  const urlIdsKey = urlIds.join(",")
  const { loading: loadingClicks,
    data: clicks,
    fn: fnClicks
  } = useFetch(
    getClicksForUrls,
    urlIds
  )

  useEffect(() => {
    if (user?.id && urlsFetchedFor.current !== user.id) {
      urlsFetchedFor.current = user.id
      fnUrls()
    }
  }, [fnUrls, user?.id])

  useEffect(() => {
    if (urlIdsKey && clicksFetchedFor.current !== urlIdsKey) {
      clicksFetchedFor.current = urlIdsKey
      fnClicks()
    }
  }, [urlIdsKey, fnClicks])

  // Reset to first page when filtering
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const filteredUrls = urls?.filter((url) =>
    (url.title ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalLinks = filteredUrls?.length || 0
  const totalPages = Math.max(1, Math.ceil(totalLinks / linksPerPage))

  // Clamp current page if total pages decreases
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const startIndex = (currentPage - 1) * linksPerPage
  const endIndex = Math.min(startIndex + linksPerPage, totalLinks)
  const paginatedUrls = filteredUrls?.slice(startIndex, endIndex) || []

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage)
      linksTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages]
    }

    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
  }

  return (
    <div className="flex flex-col gap-8">
      {(loading || loadingClicks) && <BarLoader width="100%" color="#36d7b7" />}
      <div className='grid grid-cols-2 gap-4'>
        <Card className="border border-slate-800/90 bg-[#0f162a] rounded-2xl shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg font-semibold text-slate-300">Links Created</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-white">{urls?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-800/90 bg-[#0f162a] rounded-2xl shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg font-semibold text-slate-300">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-white">{clicks?.length ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h1 className='font-heading text-3xl sm:text-4xl font-extrabold text-foreground'>My Links</h1>
        <CreateLink />
      </div>

      <div ref={linksTopRef} className="relative">
        <Input
          type="text"
          placeholder="Filter Links..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 border border-slate-700/80 bg-[#0F172A] rounded-xl pr-10 text-slate-100 placeholder:text-slate-400 focus-visible:border-slate-300 focus-visible:ring-1 focus-visible:ring-slate-300"
        />
        <Filter className="absolute top-3 right-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
      </div>

      {error && <Error message={error?.message} />}

      {/* Pagination Info & Per-Page Controls */}
      {filteredUrls && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-slate-400 -mt-2">
          <div>
            {totalLinks === 0 ? (
              <span>No links to display</span>
            ) : (
              <span>
                Showing <strong className="text-white font-semibold">{startIndex + 1}</strong>–
                <strong className="text-white font-semibold">{endIndex}</strong> of{" "}
                <strong className="text-white font-semibold">{totalLinks}</strong> link{totalLinks !== 1 ? 's' : ''}
                {searchQuery && (
                  <span className="text-slate-500 ml-1.5">(filtered from {urls?.length || 0})</span>
                )}
              </span>
            )}
          </div>

          {totalLinks > 5 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Links per page:</span>
              <div className="flex items-center bg-[#0f162a] border border-slate-800/90 rounded-lg p-0.5">
                {[5, 10, 20].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setLinksPerPage(size);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-md transition font-medium ${
                      linksPerPage === size
                        ? "bg-slate-700 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !loadingClicks && totalLinks === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-[#0f162a]/40">
          <p className="text-lg font-medium text-slate-300">
            {searchQuery ? "No links match your filter." : "No links created yet."}
          </p>
          <p className="text-sm text-slate-400 mt-1 max-w-sm">
            {searchQuery
              ? "Try adjusting your search query or clear the filter to view all links."
              : "Create your first shortened link to track analytics, QR codes, and clicks."}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
              onClick={() => setSearchQuery("")}
            >
              Clear Filter
            </Button>
          )}
        </div>
      )}

      {/* Paginated Links */}
      {paginatedUrls.map((url) => (
        <LinkCard key={url.id} url={url} fetchUrls={fnUrls} />
      ))}

      {/* Pagination Navigation Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
          <p className="text-xs text-slate-400 order-2 sm:order-1">
            Page <span className="font-semibold text-slate-200">{currentPage}</span> of{" "}
            <span className="font-semibold text-slate-200">{totalPages}</span>
          </p>

          <nav aria-label="Pagination" className="flex items-center gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
            {/* First Page Button */}
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              aria-label="Go to first page"
              className="border-slate-800 bg-[#0f162a] text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded-xl"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous Page Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Go to previous page"
              className="border-slate-800 bg-[#0f162a] text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none px-3 rounded-xl gap-1 text-xs"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Prev</span>
            </Button>

            {/* Page Number Buttons */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((pageNum, idx) => {
                if (pageNum === '...') {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-slate-500 text-xs select-none"
                    >
                      …
                    </span>
                  );
                }

                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    aria-label={`Go to page ${pageNum}`}
                    aria-current={isActive ? "page" : undefined}
                    className={`h-7 min-w-7 px-2 text-xs rounded-xl font-medium transition duration-150 flex items-center justify-center ${
                      isActive
                        ? "bg-crisp-link text-slate-950 font-bold shadow-md shadow-crisp-link/25"
                        : "border border-slate-800 bg-[#0f162a] text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Page Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Go to next page"
              className="border-slate-800 bg-[#0f162a] text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none px-3 rounded-xl gap-1 text-xs"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last Page Button */}
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Go to last page"
              className="border-slate-800 bg-[#0f162a] text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded-xl"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      )}
    </div>
  )
}
export async function getUrl({ id, user_id }) {
  const { data, error } = await supabase.from("urls")
    .select("*")
    .eq("id", id)
    .eq("user_id", user_id)
    .single()

  if (error) {
    console.error(error.message);
    throw new Error("Short Url not found")
  }
  return data;
}

export default Dashboard
