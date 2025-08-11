import assert from 'assert';

delete process.env.FIREBASE_ADMIN_CONFIG;

(async () => {
  const mod = await import('../src/lib/firebase/admin');

  assert.strictEqual(
    mod.adminDb,
    undefined,
    'adminDb should be undefined when FIREBASE_ADMIN_CONFIG is not set'
  );

  console.log('Firebase admin module loads without configuration.');
})();
