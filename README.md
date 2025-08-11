# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Environment Variables

### FIREBASE_ADMIN_CONFIG

Pages that interact with the Firebase Admin SDK load configuration from the `FIREBASE_ADMIN_CONFIG` environment variable. Without this variable, any page that imports [`src/lib/firebase/admin.ts`](src/lib/firebase/admin.ts) will fail at build time.

1. In the Firebase console, go to **Project settings > Service accounts** and click **Generate new private key** to download the service account JSON file.
2. Encode the JSON as a single line string. For example:

   ```bash
   base64 -w0 path/to/service-account.json
   ```

3. Add the resulting base64 string as the `FIREBASE_ADMIN_CONFIG` environment variable in Netlify (or your deployment platform).

At runtime this variable is decoded and used to initialize the Firebase Admin SDK.
