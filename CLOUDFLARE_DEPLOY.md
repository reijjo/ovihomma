# How to deploy to Cloudflare Pages

## Basics
- Create Account and log in

## Start deploying
 On the sidebar open *compute* -dropdown menu
 - Choose *Workers & Pages*
 - Then *Create application* button on the top of the page

### From GitHub
*Continue with GitHub* -> Choose the repository you want to deploy -> Next

<details>
<summary>Astro</summary>

**Prerequirements**

<https://docs.astro.build/en/guides/deploy/cloudflare/>

1. Install Wrangler CLI -> `bun add -d wrangler@latest`
2. Install Cloudflare adapter -> `bunx astro add cloudflare`
3. Preview your project locally with Wrangler -> `bunx astro build && bunx wrangler dev`
4. For custom not-found pages (*src/pages/404.html*) update the `wrangler.jsonc` file:
```jsonc
{
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page"
  }
}
```

**Deploy settings**

- Build command: `bun run build`
- Deploy command: `bunx wrangler deploy`
- Click `Deploy` button



</details>

 ### From Static files
