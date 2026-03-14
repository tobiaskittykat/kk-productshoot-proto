

# Add "Download Crawler Config" Button to Settings

Add a card after the existing info card at the bottom of Settings page with a button that generates and downloads a JSON config file containing all the credentials needed for the external crawler.

## What it does
- Fetches the Service Role Key by calling the `get-upload-config` edge function (need to recreate it)
- Gets the Brand ID from current brand context
- Gets the User JWT from the current auth session
- Bundles everything into a JSON file and triggers a download

## Implementation

### 1. Recreate the `get-upload-config` edge function
Returns `serviceRoleKey` and `storageUrl` to authenticated users.

### 2. Add a "Crawler Config" card to Settings page (after the info card, ~line 555)
- Card with a "Download Crawler Config" button
- On click: fetches service role key from edge function, gets JWT from session, gets brand ID from `currentBrand`
- Downloads a `crawler-config.json` file containing:
  ```json
  {
    "SUPABASE_URL": "https://...",
    "STORAGE_URL": "https://.../storage/v1/object/product-images",
    "REGISTER_URL": "https://.../functions/v1/register-imported-products",
    "SERVICE_ROLE_KEY": "...",
    "USER_JWT": "...",
    "BRAND_ID": "...",
    "BRAND_NAME": "BIRKENSTOCK"
  }
  ```
- Shows loading state while fetching, toast on success/error

