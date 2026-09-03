# Deploy Laravel (Inertia + React/Vite) to Vercel with Aiven MySQL — Step by Step

A complete, reusable playbook. Follow it yourself, or hand this file to any AI to deploy a
Laravel app to **Vercel** backed by a **managed MySQL** database (Aiven in this example).

Verified end-to-end on this repository (Laravel 13 + Inertia 3 + React + Vite 8, PHP 8.5,
Fortify auth) deployed to `https://beppumotors.vercel.app`.

---

# PART A — Prerequisites

## Step A1. Create a Vercel account (once)

1. Go to <https://vercel.com> and sign up (GitHub login is easiest).
2. If you plan to auto-deploy from git, connect your GitHub account to Vercel when prompted.

## Step A2. Create a database service (Aiven / external MySQL)

1. Go to <https://aiven.io> and create an account.
2. Create a **MySQL** service (Aiven Cloud MySQL) on any cloud/region you like.
3. Wait for it to reach **Running** status.
4. Open the service overview page and **copy/save** these values (you will need them):
   - **Host** (e.g. `beppumotors-mohdraazi105-7814.e.aivencloud.com`)
   - **Port** (e.g. `17893`)
   - **Database name** (default `defaultdb`)
   - **User** (default `avnadmin`)
   - **Service URI Password** (the DB password)

## Step A3. Install local prerequisites (once per machine)

You need these on your local computer before you can build and deploy:

- **Node.js** (v20+) — provides `npm`. Install from <https://nodejs.org>.
- **PHP** (8.3+) — the version your `composer.json` requires. Add to your `PATH`.
- **Composer** — from <https://getcomposer.org>.
- **Git** (optional but recommended) — from <https://git-scm.com>.

## Step A4. Get the source code

If the project is in a git repo, clone it locally, or open a terminal in your existing
project folder:

```powershell
git clone https://github.com/YOUR_USER/YOUR_REPO.git
cd YOUR_REPO
```

Verify the project is a standard Laravel app (has `composer.json`, `package.json`,
`bootstrap/app.php`, `public/`, `routes/`).

---

# PART B — Set up the local project

## Step B1. Install PHP & JS dependencies

```powershell
composer install
npm install
```

> In the `post-autoload-dump` script, Composer will run `php artisan package:discover`
> which needs an initial `.env`. If it errors, copy `.env.example` to `.env` first, then run
> `composer install` again.

## Step B2. Create a local `.env` and generate an app key

```powershell
Copy-Item .env.example .env
php artisan key:generate
```

> **Write down the generated `APP_KEY`** — you'll paste the exact same value into Vercel.

## Step B3. Build the frontend assets

Vercel will **not** run Vite for us in this setup (the build command is an echo). We must
pre-build locally so the final `public/build/` folder is deployed:

```powershell
npm run build
```

Confirm the output exists:

```powershell
Test-Path public\build
```

---

# PART C — Prepare the database for production

## Step C1. Download and commit the CA certificate

1. In the Aiven console, on your MySQL service, open the **Service Overview** tab and
   download the **CA Certificate** (file is named `ca.pem`).
2. Copy it into your project as `database/aiven-ca.pem`:

   ```powershell
   Copy-Item "C:\path\to\downloads\ca.pem" "database\aiven-ca.pem"
   ```

3. **Commit this file to git** and push. The deployed server must have this file to open a
   TLS connection to Aiven. If it isn't deployed, MySQL connection fails.

## Step C2. Run migrations and seeders against the production DB

Run these from your local machine — Vercel serverless is not the place to run migrations.

Set the production DB variables for this session, then migrate and seed:

```powershell
$env:APP_ENV='production'
$env:APP_DEBUG='false'
$env:APP_KEY='base64:YOUR_GENERATED_KEY'          # same as step B2
$env:DB_CONNECTION='mysql'
$env:DB_HOST='your-service.aivencloud.com'
$env:DB_PORT='17893'
$env:DB_DATABASE='defaultdb'
$env:DB_USERNAME='avnadmin'
$env:DB_PASSWORD='YOUR_AIVEN_DB_PASSWORD'
$env:MYSQL_ATTR_SSL_CA='C:\path\to\project\database\aiven-ca.pem'

php artisan migrate --force
php artisan db:seed --force
```

> **Why run `db:seed`?** A fresh database has zero users. If you skip seeding, logging in
> gives "These credentials do not match our records" — the seeder is what creates the admin
> account your app expects.

> **Detour — if seeding fails with `Class "...ServiceProvider" not found`:** the local
> `bootstrap/cache/packages.php` (or `services.php`) was generated earlier and references a
> package that isn't a real dependency (e.g. `laravel/socialite` that was manually installed
> but removed from `composer.json`). Fix by:
> 1. Removing the stale cache: `Remove-Item bootstrap\cache\packages.php,
>    bootstrap\cache\services.php`.
> 2. Removing the orphaned package from `vendor/composer/installed.php` and
>    `vendor/composer/installed.json` (Laravel reads `installed.json` to build the manifest),
>    then re-run `php artisan package:discover`.

---

# PART D — Create the Vercel runtime files (in the project)

## Step D1. Create `api/lambda.php`

This is Vercel's PHP serverless entrypoint. Vercel's serverless filesystem is
**read-only except `/tmp`**, so this file redirects every Laravel cache path to writable
`/tmp` *before* booting the app.

Create `api/lambda.php` with EXACTLY this content:

```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

if (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https') {
    $_SERVER['HTTPS'] = 'on';
    $_SERVER['SERVER_PORT'] = '443';
}

$runtimePath = '/tmp/laravel';
foreach (['cache', 'sessions', 'views'] as $directory) {
    $path = $runtimePath.'/'.$directory;
    if (! is_dir($path)) {
        mkdir($path, 0755, true);
    }
}

$runtimeEnvironment = [
    'APP_CONFIG_CACHE' => $runtimePath.'/config.php',
    'APP_ROUTES_CACHE' => $runtimePath.'/routes-v7.php',
    'APP_PACKAGES_CACHE' => $runtimePath.'/packages.php',
    'APP_SERVICES_CACHE' => $runtimePath.'/services.php',
    'APP_EVENTS_CACHE' => $runtimePath.'/events.php',
    'VIEW_COMPILED_PATH' => $runtimePath.'/views',
    'LOG_CHANNEL' => 'stderr',
    'SESSION_DRIVER' => getenv('SESSION_DRIVER') ?: 'cookie',
    'CACHE_STORE' => getenv('CACHE_STORE') ?: 'array',
    'QUEUE_CONNECTION' => getenv('QUEUE_CONNECTION') ?: 'sync',
];

foreach ($runtimeEnvironment as $key => $value) {
    if (getenv($key) === false || getenv($key) === '') {
        putenv($key.'='.$value);
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}

define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../vendor/autoload.php';

try {
    /** @var Application $app */
    $app = require_once __DIR__.'/../bootstrap/app.php';

    $app->handleRequest(Request::capture());
} catch (\Throwable $e) {
    error_log('LAMBDA_FATAL: '.get_class($e).': '.$e->getMessage().' @ '.$e->getFile().':'.$e->getLine());
    throw $e;
}
```

**Why this matters:** normally Laravel writes cached package/service manifests to
`bootstrap/cache/`. On Vercel `/var/task` (the app files) is read-only, so if Laravel tries
to build them there the whole app fails to boot with errors like
`Target class [view] does not exist` or `Class "...PailServiceProvider" not found`. The
`APP_*_CACHE` + `VIEW_COMPILED_PATH` values push all of that to writable `/tmp`. These are
read *before* `bootstrap/app.php`, so they must be set at the top of this file (not in
`.env`).

## Step D2. Create `vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "echo Using prebuilt Laravel Vite assets",
  "outputDirectory": "public",
  "functions": {
    "api/lambda.php": {
      "runtime": "vercel-php@0.9.0"
    }
  },
  "routes": [
    { "src": "/build/(.*)", "dest": "/public/build/$1" },
    { "src": "/(.*\\.(?:css|js|png|jpg|jpeg|webp|svg|ico|html|txt))", "dest": "/public/$1" },
    { "src": "/(.*)", "dest": "/api/lambda.php" }
  ]
}
```

- `outputDirectory: public` + the echo build command are correct because assets are
  pre-built locally (step B3).
- `functions` tells Vercel to run `api/lambda.php` with the official PHP runtime.
- `routes` serve static assets first (`/build`, and common file extensions), then send every
  other request to `api/lambda.php` so Laravel handles it.

## Step D3. Create `.vercelignore`

```
.vercel
public/hot
bootstrap/cache/*.php
storage/framework/cache/*
storage/framework/views/*
storage/framework/sessions/*
storage/logs/*
```

- `public/hot`: a leftover Vite dev file; if deployed it makes the browser request assets
  from a dead dev server.
- `bootstrap/cache/*.php`: not needed at runtime (we redirect to `/tmp`); a stale dev
  manifest listing dev-only providers (Pail/Sail/Tinker/Collision/Socialite) causes the
  "ServiceProvider not found" failures.

## Step D4. Commit the new files

```powershell
git add api/lambda.php vercel.json .vercelignore database/aiven-ca.pem
git commit -m "Add Vercel deployment setup"
git push
```

---

# PART E — Link Vercel CLI and set environment variables

## Step E1. Install and log in to the Vercel CLI

```powershell
npm i -g vercel
vercel login
```

`vercel login` returns a URL — open it in a browser and authorize. Success prints
something like `> Success! Logged in as ...`.

## Step E2. Link the project to Vercel

```powershell
vercel link
```

- Choose **yes** to set up a new project.
- Choose your team/scope.
- Give it a project name (e.g. `beppumotors`).
- It either creates a Vercel project or connects to an existing one, and writes a
  `.vercel/` folder locally. You can also connect it to your GitHub repo if you want
  auto-deploys.

> If you already have a `.vercel/` folder, this link is already done — skip.

## Step E3. Generate an APP_KEY if you don't have one from step B2

```powershell
php artisan key:generate --show
```

## Step E4. Add every environment variable to Vercel

> **WINDOWS GOTCHA:** do NOT pipe values with PowerShell (`$val | vercel env add`) — the
> pipe appends a trailing newline/CRLF to the value and corrupts it. Write the value to a
> temp file with exact bytes and redirect stdin via `cmd /c` instead.

Define a helper, then call it for each variable:

```powershell
function Add-VercelEnv($name, $value) {
  $tmp = Join-Path $env:TEMP "vercel-env-$name.txt"
  [System.IO.File]::WriteAllText($tmp, $value)          # exact bytes, NO trailing newline
  cmd /c "vercel env add $name production --yes < $tmp"
  Remove-Item $tmp
}
```

Add **every** variable below (replace values with yours):

```powershell
Add-VercelEnv "APP_ENV" "production"
Add-VercelEnv "APP_DEBUG" "false"
Add-VercelEnv "APP_KEY" "base64:YOUR_GENERATED_KEY"
Add-VercelEnv "APP_URL" "https://your-app.vercel.app"
Add-VercelEnv "ASSET_URL" "https://your-app.vercel.app"
Add-VercelEnv "LOG_CHANNEL" "stderr"
Add-VercelEnv "SESSION_DRIVER" "database"
Add-VercelEnv "CACHE_STORE" "database"
Add-VercelEnv "QUEUE_CONNECTION" "sync"
Add-VercelEnv "DB_CONNECTION" "mysql"
Add-VercelEnv "DB_HOST" "your-service.aivencloud.com"
Add-VercelEnv "DB_PORT" "17893"
Add-VercelEnv "DB_DATABASE" "defaultdb"
Add-VercelEnv "DB_USERNAME" "avnadmin"
Add-VercelEnv "DB_PASSWORD" "YOUR_AIVEN_DB_PASSWORD"
Add-VercelEnv "MYSQL_ATTR_SSL_CA" "/var/task/user/database/aiven-ca.pem"
```

> **Critical SSL path gotcha:** the Vercel PHP builder places your project under
> `/var/task/user/`, so the deployed cert lives at
> **`/var/task/user/database/aiven-ca.pem`** (NOT `/var/task/database/...`). If you get
> `failed loading cafile stream: /var/task/...`, this is why — use the `/user` path.

> `VIEW_COMPILED_PATH`, `APP_CONFIG_CACHE`, `APP_ROUTES_CACHE`, `APP_PACKAGES_CACHE`,
> `APP_SERVICES_CACHE`, `APP_EVENTS_CACHE` are set automatically by `api/lambda.php`, so you
> don't need to add them here (adding them is harmless).

---

# PART F — Deploy and verify

## Step F1. Deploy to production

```powershell
vercel --prod --yes
```

- This builds and pushes a **production** deployment.
- Output shows a URL, e.g. `https://your-app-xxxx.vercel.app` and, once aliased, your
  custom alias like `https://your-app.vercel.app`.

## Step F2. Verify the app responds

```powershell
# the login page should return 200
curl.exe -sS -o NUL -w "HTTP %{http_code}\n" https://your-app.vercel.app/login

# an unauthenticated request to / should 302 (redirect to /login)
curl.exe -sS -o NUL -w "HTTP %{http_code}\n" https://your-app.vercel.app/
```

Expected:
- `/login` → **200**
- `/` (unauthenticated) → **302** to `/login`

## Step F3. Verify login with the seeded admin account

Open `https://your-app.vercel.app/login` in a browser and log in with the credentials your
seeder created (e.g. `admin@gmail.com` / `admin123`). A successful login lands you on the
dashboard (no login error).

## Step F4. Rotate the DB password (security)

The password you typed into `Add-VercelEnv "DB_PASSWORD"` was shared in plaintext during
setup. After everything works, rotate it in Aiven and update only the `DB_PASSWORD` env var:

```powershell
Add-VercelEnv "DB_PASSWORD" "NEW_PASSWORD"
vercel --prod --yes
```

---

# PART G — Troubleshooting reference

| Symptom                                                    | Cause & fix                                                                                    |
|------------------------------------------------------------|------------------------------------------------------------------------------------------------|
| `500`, logs truncated                                      | `/var/task` read-only; Laravel can't write `bootstrap/cache`. → Apply the `/tmp` redirect in `api/lambda.php` (Step D1). |
| `Class "...PailServiceProvider" not found`                 | Stale/committed `bootstrap/cache/packages.php` lists a dev-only provider. → Delete the cache files and use `/tmp` caches (Step D3/D1). |
| `Target class [view] does not exist`                       | Core service providers never registered because the manifest couldn't be written. → `/tmp` cache fix (Step D1). |
| `Cannot connect to MySQL using SSL` / `failed loading cafile stream` | `MYSQL_ATTR_SSL_CA` path wrong or cert not deployed. → Use `/var/task/user/database/aiven-ca.pem` and ensure `database/aiven-ca.pem` is committed (Step C1/E4). |
| `DataBase [mysql] does not exist` (or similar config error)| Env value has a trailing newline from PowerShell piping. → Re-add via temp-file redirect (Step E4). |
| `These credentials do not match our records`               | Login works but the user isn't seeded. → Run `php artisan db:seed --force` (Step C2). |
| `HTTP 419` on form submit                                  | CSRF token missing (only affects raw `curl`, not browsers). → Use a browser to verify login. |
| Seeding fails: `Class "...ServiceProvider" not found`      | Local cache references an orphaned package (e.g. socialite). → See the "Detour" under Step C2. |

---

# Quick checklist before finalizing

- [ ] `composer install` and `npm install` succeeded
- [ ] `.env` exists and `php artisan key:generate` ran; APP_KEY recorded
- [ ] `npm run build` produced `public/build/`
- [ ] `database/aiven-ca.pem` exists, committed, and pushed
- [ ] Migrations AND seeders ran against the production DB (Step C2)
- [ ] `api/lambda.php` redirects all `APP_*_CACHE` + `VIEW_COMPILED_PATH` to `/tmp/laravel`
- [ ] `vercel.json` and `.vercelignore` created with the templates above
- [ ] Project linked via `vercel link`
- [ ] All env vars added with `Add-VercelEnv` (no PowerShell-pipe corruption)
- [ ] `MYSQL_ATTR_SSL_CA` = `/var/task/user/database/aiven-ca.pem`
- [ ] `vercel --prod --yes` deployed
- [ ] `/login` returns 200; `/` returns 302; login works in browser
- [ ] `APP_DEBUG=false` in production env
- [ ] DB password rotated after the first successful login
