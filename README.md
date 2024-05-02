# Welcome to Fanaberia Blogging Engine

📖 Just another simple blogging engine.

## Basic Features

1. Written [Remix](https://remix.run) client-server framework with [React 18](https://react.dev).
2. Uses [NextUI](https://nextui.org) library under the hood. NextUi is built over [TailwindCSS](https://tailwindcss.com), [Framer Motion](https://www.framer.com/motion/) and [React Aria](https://react-spectrum.adobe.com/react-aria/index.html).

## Requirements

1. Nodejs 21.7.3 (recommended)
2. Postgresql 14.11 (recommended)
3. [PostMark](https://postmarkapp.com) account to send transactiona emails such as registration and so on (can be easily replaced with any other service).
4. [ReCaptcha](https://www.google.com/recaptcha/about/) key for localhost and production (can be easily turned off).
5. [Google oAuth2 ](https://console.cloud.google.com) keys for user authentication through Google (can be easily turned off).

## Development

1. First install all dependencies:

```shellscript
npm i
```

2. Set up environmental variables at .env file:

```sh
cp .env_example .env
```

3. Change _footer.tsx_ and _header.tsx_ at _app/components_ if needed.
4. Replace logo to your own at _app/assets/Logo.tsx_ component or directly at _header.tsx_ and _footer.tsx_ components.
5. Change basic favicons at **_public_** folder. Do not forget to make changes at _public/site.webmanifest_.
6. Review and make changes if needed at localisation files at _public/locales_ folder.
7. Run the Vite dev server:

```shellscript
npm run dev
```

## Manual Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

## Docker Deployment

There's a basic docker file inside this repository.

Then run the app in production mode:

```sh
asdas
```
