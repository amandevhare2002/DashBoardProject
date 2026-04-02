const {
    scryptSync,
    createDecipheriv,
  } = require('node:crypto');
  const { Buffer } = require('node:buffer');
  
  const algorithm = 'aes-128-cbc'; // Updated algorithm
  const password = 'PKGRPHOTEL#@2023'; // Updated password
  // Key length is dependent on the algorithm. In this case for aes-128-cbc, it is
  // 16 bytes (128 bits).
  // Use the async `crypto.scrypt()` instead.
  const key = scryptSync(password, 'salt', 16); // Updated key length
  
  // The IV is usually passed along with the ciphertext.
  const iv = Buffer.alloc(16, 0); // Initialization vector.
  
  const decipher = createDecipheriv(algorithm, key);
  
  let decrypted = '';
  decipher.on('readable', () => {
    let chunk;
    while (null !== (chunk = decipher.read())) {
      decrypted += chunk.toString('utf8');
    }
  });
  decipher.on('end', () => {
    console.log(decrypted);
    // Prints the decrypted data in base64 format
  });
  
  // Encrypted with the same algorithm, key, and iv in base64 format.
  const encrypted =
    'SVbw1xUlJmRpzyjJJkI6yRg3QLxZHfXi8HA3wbYfXTa4SUqVC1YNnVNRsuCFhfFK';
  
  const encryptedBuffer = Buffer.from(encrypted, 'base64'); // Decode base64
  decipher.write(encryptedBuffer);
  decipher.end();