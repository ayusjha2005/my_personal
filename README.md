# Ayush Jha — Personal Technology Blog & Engineering Portfolio

A full-stack, production-engineered personal technology blog and software engineering portfolio built for **Ayush Jha**, a Computer Science and Engineering student at **VIT** (2025–2029).

Built with **Node.js**, **Express.js**, **MongoDB / Mongoose**, **EJS**, and **Vanilla CSS**, preserving 100% of the rich aesthetic, responsive layout, dark/light theme persistence, interactive canvas/SVG animations, terminal command bar, and administrative controls.

---

## 👨‍💻 Profile Summary

- **Name**: Ayush Jha
- **Degree**: Bachelor of Technology (B.Tech)
- **Branch**: Computer Science and Engineering (CSE)
- **Institution**: VIT
- **Academic Duration**: 2025–2029
- **Location**: India
- **Professional Identity**: Computer Science Student | Aspiring Software Engineer
- **Primary Interest**: Software Engineering and Backend Development
- **Email**: [reach2kr.ayush@gmail.com](mailto:reach2kr.ayush@gmail.com)
- **GitHub**: [https://github.com/ayusjha2005](https://github.com/ayusjha2005)
- **GitHub Repository**: [https://github.com/ayusjha2005/personal_blog](https://github.com/ayusjha2005/personal_blog)
- **LinkedIn**: [https://www.linkedin.com/in/kumar-ayush-322294385/](https://www.linkedin.com/in/kumar-ayush-322294385/)
- **Twitter / X**: [https://x.com/ayushjha2005](https://x.com/ayushjha2005)
- **Live Website**: [https://personal-blog-86td.onrender.com/](https://personal-blog-86td.onrender.com/)

---

## 🛠️ Verified Technical Skills

Only technologies Ayush has actively learned and worked with:

| Category | Technologies |
|---|---|
| **Programming Languages** | C, C++, JavaScript, Python, SQL |
| **Frontend Development** | HTML, CSS, JavaScript |
| **Backend Development** | Node.js, Express.js, REST API Development, EJS |
| **Databases** | MongoDB, PostgreSQL, Oracle SQL, Supabase, Prisma |
| **Computer Science Fundamentals** | Data Structures and Algorithms, Object-Oriented Programming, Database Management Systems, Operating Systems, Computer Networks, Software Engineering |
| **Tools & Platforms** | Git, GitHub, VS Code, Linux, Postman |
| **Areas of Active Learning** | Cloud Computing, Artificial Intelligence, Distributed Systems, System Architecture |

*(Strict Note: Java and React are intentionally excluded per personal skill verification).*

---

## 🚀 Projects Showcase

### 1. Personal Tech Blog
- **Description**: A personal technology blogging platform where I can publish technical articles, share development experiences, document programming knowledge, and showcase my learning journey.
- **Tech Stack**: Node.js, Express.js, EJS, MongoDB, HTML, CSS, JavaScript, Multer
- **Key Features**: Blog publishing and management, Admin dashboard, Image uploads, Blog categorization, Blog view tracking, Responsive design, Content management
- **Repository**: [github.com/ayusjha2005/personal_blog](https://github.com/ayusjha2005/personal_blog)
- **Live Demo**: [personal-blog-86td.onrender.com](https://personal-blog-86td.onrender.com/)

### 2. Aarogyam
- **Description**: A healthcare-focused patient case-taking platform designed to simplify patient history collection and improve healthcare accessibility. Focuses on AI-powered patient history collection, multilingual voice assistance, and digital healthcare data management.
- **My Contribution**: Database design and management.
- **Tech Stack**: PostgreSQL, Supabase, Rust backend, AI-assisted features
- **Key Features**: Digital patient history collection, Multilingual voice assistant, ABDM integration concept, Healthcare data management, Accessibility for patients

### 3. Road Doctor
- **Description**: An IoT-based road monitoring concept designed to identify potholes, monitor road conditions, and report their GPS locations.
- **Tech Stack**: ESP32, MPU6050, GPS Module, Embedded Systems
- **Key Features**: Pothole detection, Road condition monitoring, GPS-based location tracking, Sensor-based monitoring, Road safety improvement

### 4. Terminal-Based File Manager
- **Description**: A command-line file management utility developed using C++ and Linux concepts.
- **Tech Stack**: C++, Linux, Shell Commands
- **Key Features**: File navigation, Directory management, File operations, Terminal interaction, Linux command-line integration

---

## 🏛️ Architecture & Project Structure

```
ayushjha/
├── config/
│   └── profile.js           # Centralized profile configuration root proxy
├── public/
│   ├── css/
│   │   ├── admin.css        # Administrative dashboard styles
│   │   └── main.css         # Complete responsive stylesheet & design system
│   ├── js/
│   │   ├── app.js           # Core UI, theme toggling, cmdk palette, smooth scroll
│   │   ├── buddy.js         # Interactive robot/cat buddy & mood state engine
│   │   └── terminal-effects.js # Terminal transitions, command bar, markdown viewer
│   └── uploads/             # Managed user uploads directory
├── src/
│   ├── app.js               # Express application setup & middleware assembly
│   ├── config/
│   │   ├── database.js      # MongoDB connection with in-memory dev fallback
│   │   └── profile.js       # Master single-source-of-truth profile data
│   ├── controllers/
│   │   ├── adminController.js   # Admin CRUD, settings, moderation, analytics
│   │   ├── authController.js    # Secure session authentication
│   │   ├── blogController.js    # Article rendering, view counting, likes, comments
│   │   ├── contactController.js # Inquiry management with honeypot & rate limiting
│   │   └── projectController.js # Dynamic projects endpoint
│   ├── middleware/
│   │   ├── auth.js          # Authentication guard for /admin
│   │   ├── rateLimiter.js   # Brute-force & submission rate limiting
│   │   ├── upload.js        # Multer image validation (MIME, size, sanitization)
│   │   └── viewGlobals.js   # Global EJS template context & profile binding
│   ├── models/
│   │   ├── Analytics.js     # Daily traffic telemetry
│   │   ├── Blog.js          # Technical articles schema with slugify & indexes
│   │   ├── Comment.js       # Reader comments with moderation flags
│   │   ├── Contact.js       # Contact inbox messages
│   │   ├── Project.js       # Portfolio projects schema
│   │   ├── Setting.js       # Site configuration & social overrides
│   │   └── User.js          # Admin account schema with bcryptjs
│   ├── routes/
│   │   ├── adminRoutes.js   # /admin dashboard & moderation routes
│   │   ├── apiRoutes.js     # /api telemetry, socials, posts, comments
│   │   ├── blogRoutes.js    # /writings public routes
│   │   ├── contactRoutes.js # /contact submission handler
│   │   ├── indexRoutes.js   # Public pages, /health, /sitemap.xml, /robots.txt
│   │   └── projectRoutes.js # /projects public route
│   ├── utils/
│   │   ├── helpers.js       # Date formatting, reading time calculation
│   │   └── seedData.js      # Authentic initial articles & verified projects
│   └── views/
│       ├── admin/           # Admin dashboard templates (EJS)
│       ├── blogs/           # Article list & detail with terminal wrapper
│       ├── pages/           # Home, About, Skills, Writing Corner, Contact, 404
│       ├── partials/        # Header, Footer, Head, Scripts
│       └── projects/        # Projects list page
├── scripts/
│   ├── initAdmin.js         # CLI tool to create/reset admin
│   ├── seedDatabase.js      # Content seeding script
│   └── verifyAll.js         # Automated end-to-end test suite
├── .env.example             # Safe template for environment variables
├── package.json             # Project metadata, scripts, and dependencies
└── server.js                # Server entry point with graceful shutdown
```

---

## ⚡ Prerequisites

- **Node.js**: `v18.x` or `v20.x` or later
- **npm**: `v9.x` or later
- **MongoDB**: MongoDB Atlas connection string (or run locally; in development, an in-memory database will run automatically if `MONGODB_URI` is omitted).

---

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/ayusjha2005/personal_blog.git
cd personal_blog
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```

Open `.env` and verify settings:
```ini
PORT=3000
NODE_ENV=development
SESSION_SECRET=your_local_session_secret
ADMIN_USERNAME=ayush
ADMIN_EMAIL=reach2kr.ayush@gmail.com
ADMIN_PASSWORD=admin123456
CONTACT_EMAIL=reach2kr.ayush@gmail.com
```

### 4. Start the application
```bash
npm run dev
```

Visit **http://localhost:3000** in your browser.

- **Public Site**: `http://localhost:3000`
- **Health Check**: `http://localhost:3000/health`
- **Admin Gateway**: Type `admin` in the terminal command bar (press `` ` ``), or search `admin` in `⌘K` / `Ctrl+K`. Default credentials: `ayush` / `admin123456`.

---

## 🧪 Automated Testing

Execute the end-to-end verification suite:
```bash
node scripts/verifyAll.js
```

Verifies:
- All HTTP endpoints (Home, Writings, Projects, Skills, About, Corner, Contact, 404).
- Production health check (`GET /health`).
- Verified profile information (VIT, CSE 2025–2029, authentic projects, social URLs).
- Strict exclusion of unverified skills (zero Java, zero React).
- Admin authentication, blog creation, comments moderation, and rate limiting.

---

## 🛡️ Security & Production Hardening

- **Security Headers**: `helmet` configured with protections against clickjacking and MIME sniffing.
- **Session Security**: HTTP-only, `sameSite: 'lax'`, secure cookies in production, 14-day expiry.
- **Rate Limiting**: `express-rate-limit` guards against brute-force attacks on login and spam submissions on contact forms.
- **Input Sanitization**: `sanitize-html` and `marked` strictly sanitize all Markdown and HTML content to prevent XSS.
- **Multer Upload Security**:
  - Validates MIME types (`image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`).
  - Enforces a 5MB maximum file size limit.
  - Sanitizes original filenames using alphanumeric characters and timestamps.
- **Honeypot Protection**: Silent `website` trap field intercepts automated spambots.
- **No Stack Traces**: Production error handler hides internal traces from visitors while logging detailed errors server-side.
- **Discreet Admin Access**: Admin button removed from public top header; accessible via terminal command bar (`admin` / `sudo`), ⌘K command palette, and subtle footer link.

---

## ☁️ Deployment Guide (Vercel + MongoDB Atlas + Cloudinary)

This project is configured for serverless deployment on **Vercel** with **MongoDB Atlas** for persistent document/session storage and **Cloudinary** for persistent media uploads.

### 1. MongoDB Atlas Setup
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free Shared Cluster (M0).
2. Under **Security** &rarr; **Database Access**, create a user (e.g. `ayush_admin`) with read/write privileges.
3. Under **Security** &rarr; **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere** (`0.0.0.0/0`) so Vercel's serverless lambdas can connect.
4. Under **Deployment** &rarr; **Database**, click **Connect** &rarr; **Drivers** (Node.js) and copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/ayush_tech_blog?retryWrites=true&w=majority
   ```

### 2. Cloudinary Setup (For Persistent Image Uploads)
1. Sign up for a free account at [Cloudinary](https://cloudinary.com/).
2. On your Cloudinary Dashboard, copy:
   - **Cloud Name** (`CLOUDINARY_CLOUD_NAME`)
   - **API Key** (`CLOUDINARY_API_KEY`)
   - **API Secret** (`CLOUDINARY_API_SECRET`)

### 3. Deploy to Vercel (Web Dashboard)
1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "chore: prepare for production vercel deployment"
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com/) and click **Add New** &rarr; **Project**.
3. Import your GitHub repository (`ayusjha2005/my_personal` or `ayusjha2005/personal_blog`).
4. In **Project Settings** &rarr; **Environment Variables**, add the following:

| Key | Example Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables production mode, secure cookies, and optimizations |
| `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster0...` | MongoDB Atlas connection string |
| `SESSION_SECRET` | *(Random 32+ character string)* | Encrypts session cookies |
| `ADMIN_USERNAME` | `ayush` | Initial admin username |
| `ADMIN_EMAIL` | `reach2kr.ayush@gmail.com` | Initial admin email address |
| `ADMIN_PASSWORD` | *(Your secure password)* | Initial admin password |
| `CONTACT_EMAIL` | `reach2kr.ayush@gmail.com` | Receives contact submissions |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | Cloudinary storage identifier |
| `CLOUDINARY_API_KEY` | `your_api_key` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `your_api_secret` | Cloudinary API secret |

5. Click **Deploy**. Vercel will build and deploy your application at `https://<your-project>.vercel.app`.

### 4. Admin Account Initialization on Vercel
After deployment, visit `https://<your-domain>/admin/setup` once. If no admin exists in your MongoDB Atlas database, it will automatically initialize the admin account with your configured `ADMIN_USERNAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. Then visit `/admin/login` to manage articles and projects.

---

## 📄 License

MIT License. Designed and maintained by **Ayush Jha**.
