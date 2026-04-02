import pako from "pako";

const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET_KEY;
const key = new TextEncoder().encode(encryptionKey);
const iv = new Uint8Array(16);

const crypto = require("crypto");

export const encryptPayload = async (payload: any): Promise<string> => {
  try {
    // stringify + gzip
    const jsonString = JSON.stringify(payload);
    const gzipped = pako.gzip(jsonString);

    // Check if Web Crypto API is available
    if (
      typeof window !== "undefined" &&
      window.crypto &&
      window.crypto.subtle
    ) {
      // Use Web Crypto API
      const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        key,
        { name: "AES-CBC" },
        false,
        ["encrypt"],
      );

      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-CBC", iv },
        cryptoKey,
        gzipped,
      );

      const encryptedBytes = new Uint8Array(encryptedBuffer);
      return Buffer.from(encryptedBytes).toString("base64");
    } else {
      // Fallback to Node.js crypto
      const keyBytes = Buffer.from(encryptionKey?.slice(0, 16) || "", "utf8");
      const ivBuffer = Buffer.alloc(16, 0);
      const cipher = crypto.createCipheriv("aes-128-cbc", keyBytes, ivBuffer);
      const encrypted = Buffer.concat([cipher.update(gzipped), cipher.final()]);
      return encrypted.toString("base64");
    }
  } catch (error) {
    console.error("Encryption error:", error);
    throw error;
  }
};

export const decryptResponse = async (encryptedData: string): Promise<any> => {
  try {
    // Check if Web Crypto API is available
    if (
      typeof window !== "undefined" &&
      window.crypto &&
      window.crypto.subtle
    ) {
      // Use Web Crypto API
      const encryptedBuffer = Uint8Array.from(window.atob(encryptedData), (c) =>
        c.charCodeAt(0),
      ).buffer;

      const decryptionKey = await window.crypto.subtle.importKey(
        "raw",
        key,
        { name: "AES-CBC" },
        false,
        ["decrypt"],
      );

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: "AES-CBC", iv },
        decryptionKey,
        encryptedBuffer,
      );

      let finalData;
      try {
        const unzipped = pako.ungzip(new Uint8Array(decryptedBuffer));
        finalData = JSON.parse(new TextDecoder().decode(unzipped));
      } catch {
        finalData = JSON.parse(
          new TextDecoder().decode(new Uint8Array(decryptedBuffer)),
        );
      }
      return finalData;
    } else {
      // Fallback to Node.js crypto
      const keyBytes = Buffer.from(encryptionKey?.slice(0, 16) || "", "utf8");
      const ivBuffer = Buffer.alloc(16, 0);
      const encryptedBuffer = Buffer.from(encryptedData, "base64");
      const decipher = crypto.createDecipheriv(
        "aes-128-cbc",
        keyBytes,
        ivBuffer,
      );
      let decrypted = Buffer.concat([
        decipher.update(encryptedBuffer),
        decipher.final(),
      ]);

      let finalData;
      try {
        const unzipped = pako.ungzip(decrypted);
        finalData = JSON.parse(new TextDecoder().decode(unzipped));
      } catch {
        finalData = JSON.parse(decrypted.toString());
      }
      return finalData;
    }
  } catch (error) {
    console.error("Decryption error:", error);
    throw error;
  }
};

export const createEncryptedRequest = async (payload: any) => {
  const encryptedData = await encryptPayload(payload);
  return { EncryptedData: encryptedData };
};
