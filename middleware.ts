import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_EMAIL = (
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  'gestion.croquetonsud@gmail.com'
).toLowerCase()

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const pathname = request.nextUrl.pathname

  const isLogin = pathname === '/login'

  // Parcours voyageurs : accessibles sans connexion administrateur
  const isPublicTravelerRoute =
    pathname.startsWith('/g/') ||
    pathname.startsWith('/r/') ||
    pathname.startsWith('/api/traveler/')

  if (isPublicTravelerRoute) {
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) =>
          cookies.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          ),
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Le back-office est réservé à l'adresse administrateur Croque ton Sud
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL

  if (!isAdmin && !isLogin) {
    if (user) {
      await supabase.auth.signOut()
    }

    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAdmin && isLogin) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|brand/).*)'],
}
