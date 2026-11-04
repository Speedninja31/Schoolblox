/* ====== MULTIPLAYER SETUP ======
   Paste your Supabase project URL and publishable key below.
   (Leave both empty to play without online multiplayer/friends.) */
const SB_URL='https://dpnkfvyaclxrshqploar.supabase.co';   // e.g. https://abcdxyz.supabase.co
const SB_KEY='sb_publishable_qC2HUzMp7qCywyEcPgRmWQ_a4_oQS4P';   // publishable key (safe to be public)


/* Admin tools: after you generate your admin key in the /admin panel, paste the PUBLIC key here (it is safe to be public), e.g.
   const ADMIN_PUB={"kty":"EC",...};   Until then admin commands are ignored by everyone. */
const ADMIN_PUB={"kty":"EC","crv":"P-256","x":"HqSx7Yv1V-DGbp1f9_BYGbZYYf_Kuw4fyPdmqy0-K7I","y":"2AS7n0sg9E8q1TS19L6iDOrH4bp-gq4CXorCS4576OU","ext":true,"key_ops":["verify"]};


/* Accounts: the admin panel only works while logged in as this account name. (Only the NAME lives here - the password is never stored in the site.)
   Register this account yourself first, right after the site goes live, so nobody else can take the name. */
const ADMIN_ACCOUNT='RandomGoober';
