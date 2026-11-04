const http = require('http');

const BASE_URL = 'http://localhost:3000';

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(url, reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body,
        });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Comprehensive Full-Stack Verification ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Home Page
    const home = await request('/');
    assert(home.status === 200, 'Home page returns 200 OK');
    assert(home.body.includes('Ayush Jha'), 'Home page displays Ayush Jha');
    assert(home.body.includes('Exploring Technology.'), 'Home page contains hero title');
    assert(home.body.includes('id="scene"'), 'Home page includes night canvas scene');
    assert(home.body.includes('term-cat'), 'Home page includes animated terminal cat');
    assert(!home.body.includes('data-social="instagram"'), 'Footer cleanly omits unverified Instagram');
    assert(home.body.includes('https://github.com/ayusjha2005'), 'Footer includes verified GitHub profile');
    assert(home.body.includes('https://www.linkedin.com/in/kumar-ayush-322294385/'), 'Footer includes verified LinkedIn profile');

    // 2. Blogs List Page
    const blogs = await request('/blogs');
    assert(blogs.status === 200, 'Blogs list returns 200 OK');
    assert(blogs.body.toLowerCase().includes('technical publications'), 'Blogs page contains heading');
    assert(blogs.body.includes('Backend Engineering'), 'Blogs page includes category chips');

    // 3. Blog Category Filter
    const filteredBlogs = await request('/blogs?category=Backend%20Engineering');
    assert(filteredBlogs.status === 200, 'Filtered blogs page returns 200 OK');
    assert(filteredBlogs.body.includes('Understanding REST APIs'), 'Filtered list contains Backend Engineering blog');

    // 4. Individual Blog Page
    const blogDetail = await request('/blog/understanding-rest-apis-with-nodejs-and-express');
    assert(blogDetail.status === 200, 'Blog detail returns 200 OK');
    assert(blogDetail.body.includes('id="toc"'), 'Blog detail has table of contents');
    assert(blogDetail.body.includes('class="codeblock"'), 'Blog detail has syntax-highlighted codeblocks');
    assert(blogDetail.body.includes('id="likeBtn"'), 'Blog detail has interactive like button');
    assert(blogDetail.body.includes('keep reading'), 'Blog detail has related articles');

    // 4b. Health Check Endpoint
    const health = await request('/health');
    assert(health.status === 200, 'Health endpoint returns 200 OK');
    const healthJson = JSON.parse(health.body);
    assert(healthJson.status === 'ok' && healthJson.database === 'connected', 'Health check reports healthy database');

    // 5. Projects Page
    const projects = await request('/projects');
    assert(projects.status === 200, 'Projects page returns 200 OK');
    assert(projects.body.includes('Personal Tech Blog'), 'Projects page contains Personal Tech Blog');
    assert(projects.body.includes('Aarogyam'), 'Projects page contains Aarogyam');
    assert(projects.body.includes('Road Doctor'), 'Projects page contains Road Doctor');
    assert(projects.body.includes('Terminal-Based File Manager'), 'Projects page contains Terminal-Based File Manager');
    assert(!projects.body.includes('FindIt AI'), 'Projects page does not contain sample FindIt AI');
    assert(!projects.body.includes('React'), 'Projects page does not mention React');

    // 6. Skills Page
    const skills = await request('/skills');
    assert(skills.status === 200, 'Skills page returns 200 OK');
    assert(skills.body.includes('Programming Languages') && skills.body.includes('Python'), 'Skills page includes programming languages');
    assert(skills.body.includes('Backend Development') && skills.body.includes('Node.js'), 'Skills page includes backend skills');
    assert(skills.body.includes('PostgreSQL') && skills.body.includes('Supabase'), 'Skills page includes databases');
    assert(skills.body.includes('Data Structures and Algorithms'), 'Skills page includes CS fundamentals');
    assert(!skills.body.includes('React'), 'Skills page strictly omits React');
    assert(!skills.body.includes('>Java<'), 'Skills page strictly omits Java');

    // 7. About Page
    const about = await request('/about');
    assert(about.status === 200, 'About page returns 200 OK');
    assert(about.body.includes('VIT') && !about.body.includes('VIT-AP'), 'About page displays VIT without VIT-AP');
    assert(about.body.includes('Computer Science and Engineering'), 'About page includes Computer Science and Engineering');
    assert(!about.body.includes('CSBS') && !about.body.includes('Business Systems'), 'About page strictly avoids CSBS');
    assert(about.body.includes('2025–2029'), 'About page includes academic duration 2025–2029');
    assert(about.body.includes('https://github.com/ayusjha2005'), 'About page contains verified GitHub link');
    assert(about.body.includes('https://www.linkedin.com/in/kumar-ayush-322294385/'), 'About page contains verified LinkedIn link');
    assert(about.body.includes('reach2kr.ayush@gmail.com'), 'About page contains verified email');
    assert(about.body.includes('Cricket') && about.body.includes('Marvel'), 'About page includes personal interests');

    // 8. Writing Corner Page
    const corner = await request('/corner');
    assert(corner.status === 200, 'Writing corner returns 200 OK');
    assert(corner.body.includes('class="desk"'), 'Corner contains 3D tilting desk');
    assert(corner.body.includes('class="lamp"'), 'Corner contains lamp');
    assert(corner.body.includes('reading list'), 'Corner contains reading list');

    // 9. Contact Page
    const contact = await request('/contact');
    assert(contact.status === 200, 'Contact page returns 200 OK');
    assert(contact.body.includes("Let's Connect"), 'Contact page contains heading');
    assert(contact.body.includes('id="contactForm"'), 'Contact page contains contact form');

    // 10. Contact Form Submission (API)
    const postContact = await request('/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name: 'Sarah Connor',
        email: 'sarah@example.com',
        subject: 'Distributed Systems Collaboration',
        message: 'Hi Ayush, really impressed with your technical blog and project concepts. Would love to discuss a project!',
      }),
    });
    assert(postContact.status === 200, 'Contact submission returns 200 OK');
    const contactJson = JSON.parse(postContact.body);
    assert(contactJson.success === true, 'Contact submission succeeded and saved');

    // 11. Honeypot Spam Protection Check
    const botContact = await request('/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name: 'Bot Spammer',
        email: 'bot@spam.com',
        message: 'Buy cheap watches here',
        website: 'http://spam-link.com', // Honeypot trap filled
      }),
    });
    assert(botContact.status === 200, 'Honeypot intercepts bot submission cleanly');

    // 12. REST APIs
    const apiPosts = await request('/api/posts');
    assert(apiPosts.status === 200, '/api/posts returns 200 OK');
    const postsData = JSON.parse(apiPosts.body);
    assert(Array.isArray(postsData) && postsData.length > 0, '/api/posts returns array of published articles');

    const apiLike = await request('/api/posts/understanding-rest-apis-with-nodejs-and-express/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liked: true }),
    });
    assert(apiLike.status === 200, 'Like API increments likes');
    const likeJson = JSON.parse(apiLike.body);
    assert(likeJson.success && likeJson.likes >= 1, 'Like API returns updated count');

    // 13. SEO Sitemap & Robots.txt
    const sitemap = await request('/sitemap.xml');
    assert(sitemap.status === 200 && sitemap.body.includes('<urlset'), 'Sitemap.xml returns valid XML');
    const robots = await request('/robots.txt');
    assert(robots.status === 200 && robots.body.includes('Disallow: /admin/'), 'Robots.txt blocks /admin/ crawl');

    // 14. 404 Page
    const notFound = await request('/some-nonexistent-slug-xyz');
    assert(notFound.status === 404, 'Non-existent route returns 404');
    assert(notFound.body.includes('404'), 'Custom 404 template rendered');

    // 15. Admin Authentication & Protection
    const adminUnauth = await request('/admin');
    assert(adminUnauth.status === 302 && adminUnauth.headers.location === '/admin/login', 'Unauthenticated /admin redirects to login');

    // 16. Admin Login
    const loginRes = await request('/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'username=ayush&password=admin123456',
    });
    assert(loginRes.status === 302, 'Admin login redirects on success');
    const cookie = loginRes.headers['set-cookie'];
    assert(cookie && cookie[0].includes('ayush_session'), 'Session cookie issued');

    const sessionCookieHeader = cookie[0].split(';')[0];

    // 17. Authenticated Admin Dashboard
    const adminDash = await request('/admin', {
      headers: { Cookie: sessionCookieHeader },
    });
    assert(adminDash.status === 200, 'Authenticated admin dashboard returns 200 OK');
    assert(adminDash.body.includes('Engineering Dashboard'), 'Dashboard contains main title');
    assert(adminDash.body.includes('Published Writings') || adminDash.body.includes('Published Articles'), 'Dashboard shows published stats');
    assert(adminDash.body.includes('Recent Inquiries'), 'Dashboard shows contact messages');

    // 18. Admin Articles Management
    const adminBlogs = await request('/admin/blogs', {
      headers: { Cookie: sessionCookieHeader },
    });
    assert(adminBlogs.status === 200, 'Admin blogs list returns 200 OK');
    assert(adminBlogs.body.includes('Writings & Articles Management') || adminBlogs.body.includes('Articles & Drafts'), 'Admin blogs list loaded');
    assert(adminBlogs.body.includes('Create New Writing') || adminBlogs.body.includes('Create New Article'), 'Admin has create article/writing button');

    // 19. Admin Projects Management
    const adminProjects = await request('/admin/projects', {
      headers: { Cookie: sessionCookieHeader },
    });
    assert(adminProjects.status === 200, 'Admin projects list returns 200 OK');
    assert(adminProjects.body.includes('Projects Portfolio'), 'Admin projects page loaded');

    // 20. Admin Contacts Management
    const adminContacts = await request('/admin/contacts', {
      headers: { Cookie: sessionCookieHeader },
    });
    assert(adminContacts.status === 200, 'Admin contacts inbox returns 200 OK');
    assert(adminContacts.body.includes('Sarah Connor'), 'Admin inbox shows submitted visitor message');

    // 21. Admin Analytics
    const adminAnalytics = await request('/admin/analytics', {
      headers: { Cookie: sessionCookieHeader },
    });
    assert(adminAnalytics.status === 200, 'Admin analytics page returns 200 OK');
    assert(adminAnalytics.body.includes('Traffic & Reader Analytics'), 'Admin analytics loaded');

    // 22. Admin Blog Creation (CRUD)
    const createBlogRes = await request('/admin/blogs/new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: sessionCookieHeader,
      },
      body: 'title=Test+Automated+Article&category=Web+Development&tags=Test%2C+Dev&excerpt=A+quick+test+excerpt&content=This+is+a+test+post+content.&status=draft',
    });
    assert(createBlogRes.status === 302, 'New blog creation redirects to blog list');

    console.log(`\n=======================================================`);
    console.log(`  Tests Passed: ${passed}`);
    console.log(`  Tests Failed: ${failed}`);
    console.log(`=======================================================`);

    if (failed > 0) {
      process.exit(1);
    } else {
      console.log('ALL VERIFICATION TESTS COMPLETED WITH 100% SUCCESS!');
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
