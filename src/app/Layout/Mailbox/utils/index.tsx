// @ts-nocheck
import { Buffer } from "buffer";
import crypto from "crypto";
import pako from "pako";

const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET_KEY;
export function decryptText(
  textToDecrypt: any,
  secretKey = encryptionKey,
  mode = "CBC",
  keySize = 128,
  dataFormat: any = "base64"
) {
  const _0x3903e3 = _0x3c6c;
  function _0x4e28() {
    const _0x584ebe = [
      "final",
      "258774ooGHLm",
      "416112QIfRRt",
      "from",
      "update",
      "base64",
      "231flOmqa",
      "72tCTGmj",
      "3YmAuFU",
      "138230sctqym",
      "charCodeAt",
      "aes-",
      "parse",
      "1035890laPfGR",
      "450010RCShzM",
      "decode",
      "error",
      "27384LfMDEl",
      "Decryption\x20error:",
      "1196406sQXXpp",
    ];
    _0x4e28 = function () {
      return _0x584ebe;
    };
    return _0x4e28();
  }
  function _0x3c6c(_0x398f09, _0x4af7e4) {
    const _0x4e2851 = _0x4e28();
    return (
      (_0x3c6c = function (_0x3c6c5d, _0xd29e32) {
        _0x3c6c5d = _0x3c6c5d - 0x103;
        let _0x16d6af = _0x4e2851[_0x3c6c5d];
        return _0x16d6af;
      }),
      _0x3c6c(_0x398f09, _0x4af7e4)
    );
  }
  (function (_0x5a9be7, _0x7caa20) {
    const _0x31f718 = _0x3c6c,
      _0x20c04c = _0x5a9be7();
    while (!![]) {
      try {
        const _0x25d6d0 =
          parseInt(_0x31f718(0x104)) / 0x1 +
          -parseInt(_0x31f718(0x110)) / 0x2 +
          (parseInt(_0x31f718(0x103)) / 0x3) *
          (-parseInt(_0x31f718(0x111)) / 0x4) +
          parseInt(_0x31f718(0x108)) / 0x5 +
          -parseInt(_0x31f718(0x10e)) / 0x6 +
          (parseInt(_0x31f718(0x115)) / 0x7) *
          (-parseInt(_0x31f718(0x10c)) / 0x8) +
          (-parseInt(_0x31f718(0x116)) / 0x9) *
          (-parseInt(_0x31f718(0x109)) / 0xa);
        if (_0x25d6d0 === _0x7caa20) break;
        else _0x20c04c["push"](_0x20c04c["shift"]());
      } catch (_0x219a40) {
        _0x20c04c["push"](_0x20c04c["shift"]());
      }
    }
  })(_0x4e28, 0x26f99);
  try {
    const decipher = crypto["createDecipheriv"](
      _0x3903e3(0x106) + keySize + "-" + mode,
      secretKey,
      Buffer["alloc"](0x10, 0x0)
    );
    let decrypted = decipher[_0x3903e3(0x113)](
      textToDecrypt,
      dataFormat,
      _0x3903e3(0x114)
    );
    decrypted += decipher[_0x3903e3(0x10f)](_0x3903e3(0x114));
    const gezipedData = atob(decrypted),
      gzipedDataArray = Uint8Array[_0x3903e3(0x112)](gezipedData, (_0x6ad153) =>
        _0x6ad153[_0x3903e3(0x105)](0x0)
      ),
      ungzipedData = pako["ungzip"](gzipedDataArray);
    return JSON[_0x3903e3(0x107)](
      new TextDecoder()[_0x3903e3(0x10a)](ungzipedData)
    );
  } catch (_0x31b322) {
    return console[_0x3903e3(0x10b)](_0x3903e3(0x10d), _0x31b322), null;
  }
}

export const reIndexTabs = (tabs: any) => {
  return tabs.map((tab: any, index: number) => ({ ...tab, id: index }));
};


// export async function encryptText2(
//   dataToEncrypt: any,
//   secretKey: string = "PKGRPHOTEL#@2023", // Default key matching your SignalR example
//   keySize: number = 128
// ): Promise<string> {
//   try {
//     // 1. Convert data to JSON string
//     const jsonString = JSON.stringify(dataToEncrypt);

//     // 2. Gzip compress the data (as in your SignalR example)
//     const compressed = pako.gzip(jsonString);

//     // 3. Prepare encryption key and IV
//     const key = await crypto.subtle.importKey(
//       "raw",
//       new TextEncoder().encode(secretKey),
//       { name: "AES-CBC", length: keySize },
//       false,
//       ["encrypt"]
//     );

//     // Zero-filled IV (as in your SignalR example)
//     const iv = new Uint8Array(16); 

//     // 4. Encrypt the compressed data
//     const encrypted = await crypto.subtle.encrypt(
//       { name: "AES-CBC", iv },
//       key,
//       compressed
//     );

//     // 5. Convert to base64
//     return btoa(String.fromCharCode(...new Uint8Array(encrypted)));

//   } catch (error) {
//     console.error("Encryption error:", error);
//     throw error;
//   }
// }
export function encryptText(
  dataToEncrypt: any,
  secretKey: string = encryptionKey,
  mode: string = "cbc",
  keySize: number = 128,
  dataFormat: string = "base64"
): string {
  try {
    // 1. Validate key length
    const keyByteLength = keySize / 8;
    if (Buffer.from(secretKey, 'utf8').length !== keyByteLength) {
      throw new Error(`Key must be exactly ${keyByteLength} bytes for AES-${keySize}`);
    }

    // 2. Convert to JSON
    const jsonString = JSON.stringify(dataToEncrypt);

    // 3. Generate IV
    const iv = crypto.randomBytes(16);

    // 4. Create cipher
    const cipher = crypto.createCipheriv(
      `aes-${keySize}-${mode}`,
      Buffer.from(secretKey, 'utf8'),
      iv
    );

    // 5. Encrypt
    let encrypted = Buffer.concat([
      iv, // Prepend IV
      cipher.update(jsonString, 'utf8'),
      cipher.final()
    ]);

    // 6. Convert to Base64
    const base64String = encrypted.toString('base64');

    // DECRYPTION CHECK - Added to verify the encryption
    // 7. Convert back from Base64 to verify
    const encryptedBuffer = Buffer.from(base64String, 'base64');
    const verifyIv = encryptedBuffer.subarray(0, 16);
    const ciphertext = encryptedBuffer.subarray(16);

    const decipher = crypto.createDecipheriv(
      `aes-${keySize}-${mode}`,
      Buffer.from(secretKey, 'utf8'),
      verifyIv
    );

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]);

    const decryptedString = decrypted.toString('utf8');
    console.log("Original data:", jsonString);
    console.log("Decrypted verification:", decryptedString);
    console.log("Verification passed:", jsonString === decryptedString);

    return base64String;

  } catch (error) {
    console.error("Encryption error:", error);
    throw error;
  }
}

export const customSort = (rows, selector, direction) => {
  return rows.sort((a, b) => {
    // use the selector to resolve your field names by passing the sort comparators
    const aField = a[selector].toLowerCase();
    const bField = b[selector].toLowerCase();

    const aNum = parseFloat(aField);
    const bNum = parseFloat(bField);
    if ((!isNaN(aNum) && !isNaN(bNum)) && selector != "DueDate") {
      // Numeric comparison
      return direction === 'desc' ? bNum - aNum : aNum - bNum;
    }

    let comparison = 0;

    if (aField > bField) {
      comparison = 1;
    } else if (aField < bField) {
      comparison = -1;
    }

    return direction === 'desc' ? comparison * -1 : comparison;
  });
};

export function decryptMailRes(
  encryptedText: string,
  secretKey: string,
  iv: Buffer = Buffer.alloc(16, 0)
): any {
  try {
    //1 decode input 
    const encryptedBuffer = Buffer.from(encryptedText, "base64");

    //2 Create AES cipher
    const key = Buffer.from(secretKey, "utf8");
    const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);

    //3 Decrypt binary data
    let decrypted = Buffer.concat([
      decipher.update(encryptedBuffer),
      decipher.final(),
    ]);

    //4 Gzip decompress
    const uncompressed = pako.ungzip(decrypted);

    //5 Convert buffer to string then to JSON
    const jsonText = new TextDecoder().decode(uncompressed);
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("❌ Decryption failed:", error);
    return null;
  }
}
// Helper to format ISO date string
export const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};