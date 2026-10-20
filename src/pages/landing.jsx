// import { Button } from '@base-ui/react'
import Input from '@/components/ui/input'
import Button from '@/components/ui/button'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"



const LandingPage = () => {

  const [longurl, setlongurl] = useState("");
  const navigate = useNavigate();

  const handleShorten = (e) => {
    e.preventDefault();
    if (longurl) navigate(`/auth?createNew=${encodeURIComponent(longurl)}`)
  }
  return (
    <div className="flex flex-col items-center">
      <h2 className='font-heading my-10 sm:my-16 text-3xl sm:text-6xl lg:text-7xl text-white text-center font-extrabold'>Short links. Sharp insights.</h2>
      <p className="mb-6 text-center text-base text-crisp-text sm:text-lg">Shorten a URL, share it with a QR code, and see who clicks.</p>
      <form onSubmit={handleShorten} className="sm:h-14 flex flex-col sm:flex-row w-full sm:flex-row w-full md-w-2-4 gap-2">
        <Input type="url"
          value={longurl}
          placeholder="Paste your long URL here"
          onChange={(e) => setlongurl(e.target.value)}
          className="h-full flex-1 py-4 px-4 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-crisp-link focus-visible:border-crisp-link" />
        <Button className="h-full bg-crisp-danger text-white hover:bg-[#B91C1C]" type="submit" variant="destructive">Shorten!</Button>
      </form>
      <Accordion id="faq" multiple className="w-full my-11 md:px-11 scroll-mt-20" defaultValue={["item-1"]}>
        <AccordionItem value="item-1">
          <AccordionTrigger>
            How does the Crisp URL shortener work?
          </AccordionTrigger>
          <AccordionContent>
            When you enter a long URL, our system generates a shorter version of
            that URL. This shortened URL redirects to the original long URL when
            accessed.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>
            Do I need an account to use the app?
          </AccordionTrigger>
          <AccordionContent>
            Yes. Creating an account allows you to manage your URLs, view
            analytics, and customize your short URLs.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>
            What analytics are available for my shortened URLs?
          </AccordionTrigger>
          <AccordionContent>
            You can view the number of clicks, geolocation data of the clicks
            and device types (mobile/desktop) for each of your shortened URLs.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default LandingPage
