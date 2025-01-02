import { NextApiResponse } from "next"
import { NextRequest } from "next/server"


export async function GET(req: NextRequest, res: NextApiResponse) {
  console.log('secret: ',req.nextUrl.searchParams.get('secret'))
      // Check for secret to confirm this is a valid request
      if (req.nextUrl.searchParams.get('secret') !== process.env.REVALIDATE_TOKEN) {
         return res.status(401).json({ message: 'Invalid token' })
       }

      try {
        // this should be the actual path not a rewritten path
        // e.g. for "/blog/[slug]" this should be "/blog/post-1"
        await res.revalidate('/')
        await res.revalidate('/fazag')
        await res.revalidate('/farvalle')
        return res.json({ revalidated: true })
      } catch (err) {
        // If there was an error, Next.js will continue
        // to show the last successfully generated page
        return Response.json({err}, {status: 500})
      }
    }