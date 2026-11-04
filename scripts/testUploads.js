const http = require('http');
const fs = require('fs');
const path = require('path');
const upload = require('../src/middleware/upload');

async function testUploadEngineStructure() {
  console.log('Testing upload middleware structure...');

  if (!upload || typeof upload.single !== 'function') {
    throw new Error('Upload middleware is not a valid Multer instance');
  }

  // Test local disk storage or custom storage engine interface
  const storage = upload.storage;
  if (!storage) {
    throw new Error('Upload middleware storage is missing');
  }

  if (typeof storage._handleFile !== 'function') {
    throw new Error('Storage engine missing _handleFile function');
  }

  if (typeof storage._removeFile !== 'function') {
    throw new Error('Storage engine missing _removeFile function');
  }

  console.log('[PASS] Upload storage engine implements _handleFile and _removeFile correctly');
}

async function testMultipartUpload() {
  console.log('Testing multipart image upload in development mode...');

  // 1. Login to get session
  const loginData = 'username=ayush&password=admin123456';
  const loginRes = await makeRequest('/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(loginData),
    },
    body: loginData,
  });

  const cookie = loginRes.headers['set-cookie'];
  if (!cookie || !cookie[0].includes('ayush_session')) {
    throw new Error('Failed to obtain session cookie for upload test');
  }
  const sessionCookie = cookie[0].split(';')[0];

  // 2. Create a multipart form with an image file
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const dummyPng = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
    0x42, 0x60, 0x82,
  ]);

  function buildMultipart(bnd, fields, files) {
    const parts = [];
    for (const [key, val] of Object.entries(fields)) {
      parts.push(Buffer.from(`--${bnd}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${val}\r\n`));
    }
    for (const [key, file] of Object.entries(files)) {
      parts.push(Buffer.from(`--${bnd}\r\nContent-Disposition: form-data; name="${key}"; filename="${file.filename}"\r\nContent-Type: ${file.contentType}\r\n\r\n`));
      parts.push(file.data);
      parts.push(Buffer.from('\r\n'));
    }
    parts.push(Buffer.from(`--${bnd}--\r\n`));
    return Buffer.concat(parts);
  }

  const slug = 'upload-test-' + Date.now();
  const body = buildMultipart(
    boundary,
    {
      title: 'Upload Test Article',
      slug,
      category: 'Web Development',
      tags: 'Upload, Test',
      excerpt: 'Testing file upload functionality.',
      content: 'Body content for upload test.',
      status: 'draft',
    },
    {
      coverImage: {
        filename: 'test-cover.png',
        contentType: 'image/png',
        data: dummyPng,
      },
    }
  );

  const postRes = await makeRequest('/admin/blogs/new', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': body.length,
      Cookie: sessionCookie,
    },
    body,
  });

  if (postRes.status !== 302) {
    throw new Error(`Expected redirect 302 on blog creation, got ${postRes.status}: ${postRes.body}`);
  }
  console.log('[PASS] Blog creation with image upload succeeded (redirected to /admin/blogs)');

  // 3. Find the created blog via admin blogs page
  const adminBlogsRes = await makeRequest('/admin/blogs', {
    headers: { Cookie: sessionCookie },
  });
  if (!adminBlogsRes.body.includes('Upload Test Article')) {
    throw new Error('Created article title not found in admin blogs list');
  }
  console.log('[PASS] Uploaded blog appears in admin blogs list');

  // Verify the uploaded image file exists in public/uploads directory
  const uploadsDir = path.join(__dirname, '../public/uploads');
  const uploadedFiles = fs.readdirSync(uploadsDir);
  const testCoverFile = uploadedFiles.find((f) => f.startsWith('test-cover'));
  if (!testCoverFile) {
    throw new Error('Expected uploaded test-cover file in public/uploads');
  }
  console.log(`[PASS] Uploaded image verified on disk: ${testCoverFile}`);

  // 4. Test image replacement via edit form
  // Extract edit link from admin blogs page
  const editMatch = adminBlogsRes.body.match(/\/admin\/blogs\/edit\/([a-f0-9]{24})/);
  if (!editMatch) {
    throw new Error('Could not find blog ID in admin blogs list for replacement test');
  }
  const blogId = editMatch[1];

  const replacementBoundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const replacementBody = buildMultipart(
    replacementBoundary,
    {
      title: 'Upload Test Article (Updated)',
      category: 'Web Development',
      tags: 'Upload, Test',
      excerpt: 'Testing image replacement.',
      content: 'Updated content.',
      status: 'draft',
    },
    {
      coverImage: {
        filename: 'replacement-cover.png',
        contentType: 'image/png',
        data: dummyPng,
      },
    }
  );

  const updateRes = await makeRequest(`/admin/blogs/edit/${blogId}`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${replacementBoundary}`,
      'Content-Length': replacementBody.length,
      Cookie: sessionCookie,
    },
    body: replacementBody,
  });

  if (updateRes.status !== 302) {
    console.error('Update response status:', updateRes.status);
    console.error('Update response headers:', updateRes.headers);
    console.error('Update response body:', updateRes.body.substring(0, 500));
    throw new Error(`Expected redirect 302 on blog update, got ${updateRes.status}`);
  }

  const updatedFiles = fs.readdirSync(uploadsDir);
  const replacementFile = updatedFiles.find((f) => f.startsWith('replacement-cover'));
  if (!replacementFile) {
    throw new Error('Expected replacement-cover file in public/uploads after update');
  }
  console.log(`[PASS] Image replacement verified on disk: ${replacementFile}`);

  // Delete the test blog
  await makeRequest(`/admin/blogs/delete/${blogId}`, {
    headers: { Cookie: sessionCookie },
  });
  console.log('[PASS] Test cleanup completed');
}

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `http://localhost:3000${path}`,
      {
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      }
    );
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function run() {
  try {
    await testUploadEngineStructure();
    await testMultipartUpload();
    console.log('\nALL UPLOAD TESTS PASSED WITH 100% SUCCESS!');
    process.exit(0);
  } catch (err) {
    console.error('\nUpload test failed:', err);
    process.exit(1);
  }
}

run();
