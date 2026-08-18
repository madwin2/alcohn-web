import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  countryIso2FromHeaders,
  getGeoRedirectTarget,
  isBotUserAgent,
  readMarketPrefCookie,
  shouldSkipGeoRedirect,
} from '@/lib/markets/geo';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (shouldSkipGeoRedirect(pathname)) {
    return NextResponse.next();
  }

  if (isBotUserAgent(request.headers.get('user-agent'))) {
    return NextResponse.next();
  }

  const redirectPath = getGeoRedirectTarget({
    pathname,
    countryIso2: countryIso2FromHeaders(request.headers),
    marketPref: readMarketPrefCookie(request.headers.get('cookie')),
  });

  if (!redirectPath || redirectPath === pathname) {
    return NextResponse.next();
  }

  const destination = request.nextUrl.clone();
  destination.pathname = redirectPath;
  destination.search = search;

  return NextResponse.redirect(destination, 307);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
