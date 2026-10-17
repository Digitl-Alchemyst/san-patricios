/**
 * Client-side-only AES-GCM wrapper around the browser's Web Crypto API.
 *
 * This is the whole point of the encryption design in docs/PLAN.md: the
 * shared "network key" never leaves the browser, and every call here MUST
 * run client-side, with the plaintext already in hand locally. Never import
 * this from a Server Action or a Convex function with real plaintext —
 * that would defeat the reason it exists (keeping Convex unable to read
 * message/operation content). It's fine for Server Components/Actions to
 * pass already-encrypted ciphertext through untouched.
 *
 * Key storage/distribution (out-of-band, during vetting) and the IndexedDB
 * persistence wrapper live in src/services/* — this file only does the raw
 * crypto.
 */

const ALGORITHM = "AES-GCM";
const IV_LENGTH_BYTES = 12;

function assertBrowser() {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    throw new Error(
      "network-key crypto must only run in the browser — see the file header comment.",
    );
  }
}

export async function generateNetworkKey(): Promise<CryptoKey> {
  assertBrowser();
  return window.crypto.subtle.generateKey({ name: ALGORITHM, length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
}

export async function exportNetworkKey(key: CryptoKey): Promise<string> {
  assertBrowser();
  const raw = await window.crypto.subtle.exportKey("raw", key);
  return bufferToBase64(raw);
}

export async function importNetworkKey(base64Key: string): Promise<CryptoKey> {
  assertBrowser();
  const raw = base64ToBuffer(base64Key);
  return window.crypto.subtle.importKey("raw", raw, ALGORITHM, true, ["encrypt", "decrypt"]);
}

/** Encrypts `plaintext`, returning a single base64 blob (IV + ciphertext packed together). */
export async function encryptField(key: CryptoKey, plaintext: string): Promise<string> {
  assertBrowser();
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await window.crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, encoded);

  const packed = new Uint8Array(iv.length + ciphertext.byteLength);
  packed.set(iv, 0);
  packed.set(new Uint8Array(ciphertext), iv.length);
  return bufferToBase64(packed.buffer);
}

/** Reverses encryptField — unpacks the IV, decrypts, returns the original string. */
export async function decryptField(key: CryptoKey, blob: string): Promise<string> {
  assertBrowser();
  const packed = new Uint8Array(base64ToBuffer(blob));
  const iv = packed.slice(0, IV_LENGTH_BYTES);
  const ciphertext = packed.slice(IV_LENGTH_BYTES);
  const decrypted = await window.crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, ciphertext);
  return new TextDecoder().decode(decrypted);
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return window.btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
