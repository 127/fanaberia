import invariant from "tiny-invariant";
import { createCookieSessionStorage } from "@remix-run/node";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

// export the whole sessionStorage object
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session", // use any name you want here
    sameSite: "lax", // this helps with CSRF
    path: "/", // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production", // enable this in prod only
    // maxAge: 365 * 24 * 60 * 60, // 365 days
  },
});

// you can also export the methods individually for your own usage
export const { getSession, commitSession, destroySession } = sessionStorage;
