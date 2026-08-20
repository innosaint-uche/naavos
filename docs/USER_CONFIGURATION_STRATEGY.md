# NAAvOS: User Configuration & Self-Hosting Strategy

**Version:** 1.0
**Author:** Gemini Code Assist, Acting CTO
**Date:** August 11, 2026

## 1. Guiding Principle: You Own Your Stack

NAAvOS is an open-source tool, not a managed service that locks you in. A core, non-negotiable principle is that **users must be able to install, run, and connect NAAvOS to their own instances of its dependencies.**

This means a user can bring their own:
- **Supabase Project** (for database and auth)
- **Cloudflare Account** (for edge functions and storage)
- **Cognee Instance** (for the cognitive engine)
- **Doppler Project** (for secrets management)
- API keys for any integrated AI model or service.

This approach ensures user privacy, data ownership, cost control, and ultimate portability.

## 2. Configuration Mechanism

To facilitate this, NAAvOS will use a layered configuration system that prioritizes user control and security.

1.  **Global Config File (`~/.naavos/config.toml`):** A central TOML file in the user's home directory will store pointers to their service configurations. This file is human-readable and easy to manage.
2.  **Environment Variables:** For sensitive credentials (API keys, database URLs), NAAvOS will read from environment variables. This is a standard, secure practice that avoids storing secrets in plaintext files. The `naavos` CLI will provide helpers for loading these from a `.env` file for local development.
3.  **The `naavos configure` Command:** The CLI will include a guided setup wizard to help users configure their connections.

## 3. The Onboarding & Configuration Flow

When a user first runs `naavos init` or `naavos configure`, they will be guided through the following steps:

```
Welcome to NAAvOS! Let's connect your infrastructure.

You can use your own accounts for all services.
If you don't have one, we'll point you to the setup guide.

? Which database are you using? (Use arrow keys)
> Supabase (Recommended)
  PostgreSQL (Advanced)
  None (Local file storage only)

Enter your Supabase Project URL (e.g., https://xyz.supabase.co):
Enter your Supabase Anon Key (found in your Supabase dashboard):

We need to store these securely. How would you like to proceed?
> Set environment variables (Recommended)
  Add to a local .env file

... and so on for Cloudflare, Cognee, etc.
```

This flow makes it clear that the user is in control and demystifies the setup process.

## 4. Example Configuration (`~/.naavos/config.toml`)

This is what a user's configuration file might look like. Note that it contains references and settings, but **no secrets**.

```toml
# NAAvOS Global Configuration
# This file points to your personal infrastructure.
# Secrets are loaded from environment variables (e.g., $SUPABASE_SERVICE_ROLE_KEY).

version = 1

[database]
  provider = "supabase"
  # Loaded from $SUPABASE_URL
  project_url = "https://xyz.supabase.co"
  # Loaded from $SUPABASE_ANON_KEY
  anon_key_env_var = "SUPABASE_ANON_KEY"
  # Loaded from $SUPABASE_SERVICE_ROLE_KEY
  service_role_key_env_var = "SUPABASE_SERVICE_ROLE_KEY"

[storage]
  provider = "cloudflare_r2"
  # Loaded from $CLOUDFLARE_ACCOUNT_ID
  account_id_env_var = "CLOUDFLARE_ACCOUNT_ID"
  bucket_name = "naavos-user-data"

[cognitive_engine]
  provider = "cognee"
  # For a self-hosted Cognee instance
  endpoint = "http://localhost:8000/cognee-api"

[secrets]
  provider = "doppler"
  # The CLI will use the logged-in Doppler user by default.
```

By adopting this strategy from day one, we ensure NAAvOS is built as a truly open, flexible, and user-centric platform.