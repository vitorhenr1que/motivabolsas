import { type NextRequest } from 'next/server'
import * as jose from 'jose'
import { cookies } from 'next/headers'

// middleware escuta e redireciona para a página desejada para usuários autenticados e desautenticados

export async function middleware(request: NextRequest) {
  const Authorization = request.cookies.get('Authorization')?.value
  
  if (Authorization && !request.nextUrl.pathname.startsWith('/dashboard')) {
    return Response.redirect(new URL('/dashboard', request.url))
  }
 
  if (!Authorization && !request.nextUrl.pathname.startsWith('/login')) {
    return Response.redirect(new URL('/login', request.url))
  }
  
  const cookie = cookies().get("Authorization");
  if(!cookie){
  return Response.redirect(new URL('/login', request.url))
  }
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET,
  )
  const jwt = cookie.value
  
  try{
    const { payload } = await jose.jwtVerify(jwt, secret, {})
    console.log(payload)
  }catch(err){
    return Response.redirect(new URL('/login', request.url))
  }
}





 
export const config = {
  //matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
  matcher: "/dashboard/:path*"
}