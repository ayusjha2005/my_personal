const initialBlogs = [
  {
    title: 'Understanding REST APIs with Node.js and Express',
    slug: 'understanding-rest-apis-with-nodejs-and-express',
    excerpt: 'A practical, engineering-first guide to designing clean RESTful interfaces, structuring route handlers, error propagation, and HTTP semantics.',
    category: 'Backend Engineering',
    tags: ['Node.js', 'Express', 'REST APIs', 'Backend Architecture'],
    author: 'Ayush Jha',
    status: 'published',
    featured: true,
    publishedAt: new Date('2026-10-15'),
    content: `
REST APIs form the backbone of modern web communication. In this article, we look at how to build robust, maintainable RESTful services using Node.js and Express with a focus on resource modeling, HTTP status codes, and clean error handling.

## 1. The Core Philosophy of REST

Representational State Transfer (REST) treats everything as a resource identified by a uniform URI. The actions performed on these resources are mapped directly to standard HTTP methods:

- **GET**: Retrieve resource representation without side effects (Idempotent and safe).
- **POST**: Create a new subordinate resource.
- **PUT**: Replace a resource entirely or create if missing.
- **PATCH**: Partially update an existing resource.
- **DELETE**: Remove a resource.

## 2. Setting Up a Clean Express Controller

When structuring an Express application, separating routing declarations from business controllers prevents route files from becoming bloated.

\`\`\`javascript
// src/controllers/userController.js
const User = require('../models/User');

exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({}).skip(skip).limit(limit).select('-passwordHash'),
      User.countDocuments({})
    ]);

    res.status(200).json({
      success: true,
      data: users,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
};
\`\`\`

## 3. Graceful Error Handling

Centralized error handling is critical for preventing unhandled promise rejections and ensuring predictable JSON error envelopes for clients.

\`\`\`javascript
// src/middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error('[API Error]', {
    status,
    message,
    path: req.originalUrl,
    method: req.method
  });

  res.status(status).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};
\`\`\`

## 4. Key Takeaways

1. Always use plural nouns for endpoints (\`/api/v1/articles\`, not \`/api/v1/getArticles\`).
2. Utilize HTTP status codes faithfully (\`201 Created\`, \`400 Bad Request\`, \`404 Not Found\`, \`422 Unprocessable Entity\`).
3. Never trust client payload without validation and sanitization.
    `,
  },
  {
    title: 'SQL Joins Explained with Practical Examples',
    slug: 'sql-joins-explained-with-practical-examples',
    excerpt: 'Visualizing and executing INNER, LEFT, RIGHT, and FULL joins with relational algebra principles and real-world database queries.',
    category: 'Database Management Systems',
    tags: ['SQL', 'Databases', 'PostgreSQL', 'DBMS'],
    author: 'Ayush Jha',
    status: 'published',
    featured: true,
    publishedAt: new Date('2026-09-28'),
    content: `
Joining tables is one of the most fundamental operations in relational database management systems. Understanding how relational algebra translates to query execution plans ensures your database queries stay fast under load.

## 1. Relational Foundations: Cartesian Product and Predicates

At its theoretical core, an SQL join starts with the Cartesian product (cross join) of two relations, followed by the evaluation of an join condition predicate.

\`\`\`sql
-- Inner Join: Matches rows with matching keys in both relations
SELECT
    u.id AS user_id,
    u.username,
    b.title AS blog_title,
    b.created_at
FROM users u
INNER JOIN blogs b ON u.id = b.author_id
WHERE b.status = 'published';
\`\`\`

## 2. Left Outer Join: Retaining Left Side Unmatched Rows

A LEFT JOIN returns all rows from the left table, along with matched rows from the right table. When no match exists, null values are populated for the right relation attributes.

\`\`\`sql
-- Find all users and their total published articles, even if zero
SELECT
    u.id,
    u.username,
    COUNT(b.id) AS total_blogs
FROM users u
LEFT JOIN blogs b ON u.id = b.author_id AND b.status = 'published'
GROUP BY u.id, u.username
ORDER BY total_blogs DESC;
\`\`\`

## 3. Query Execution and Indexing Strategies

Without proper indexes on foreign keys, joins devolve into full table scans (Nested Loop or Hash Join without hash index acceleration).

\`\`\`sql
-- Always index the foreign key joining column
CREATE INDEX idx_blogs_author_id ON blogs(author_id);
\`\`\`

By ensuring the join column on the inner table is indexed, the optimizer can utilize an index lookup rather than scanning the entire table.
    `,
  },
  {
    title: 'Building a Terminal-Based File Manager Using C++',
    slug: 'building-a-terminal-based-file-manager-using-cpp',
    excerpt: 'Systems programming with C++: directory traversals, POSIX syscalls, terminal manipulation, and memory management for a fast CLI tool.',
    category: 'Computer Science Fundamentals',
    tags: ['C++', 'Linux', 'Systems Programming', 'CLI'],
    author: 'Ayush Jha',
    status: 'published',
    featured: true,
    publishedAt: new Date('2026-08-12'),
    content: `
Building tools for the terminal is one of the best ways to understand how operating systems organize file trees, handle I/O streams, and manage process memory.

## Motivation and Architecture

Most developers use graphical file browsers or simple \`cd\` and \`ls\` commands. Building a lightweight interactive terminal file manager requires tackling:
1. Low-level filesystem navigation with \`<filesystem>\` (C++17) or POSIX \`dirent.h\`.
2. Terminal control with ANSI escape codes or curses for raw input mode without buffering.
3. Fast directory caching and safe path resolution.

## 1. Navigating Directories with Modern C++

\`\`\`cpp
#include <iostream>
#include <filesystem>
#include <vector>

namespace fs = std::filesystem;

struct FileItem {
    std::string name;
    bool isDirectory;
    uintmax_t size;
};

std::vector<FileItem> listDirectory(const fs::path& targetPath) {
    std::vector<FileItem> items;
    try {
        for (const auto& entry : fs::directory_iterator(targetPath)) {
            items.push_back({
                entry.path().filename().string(),
                entry.is_directory(),
                entry.is_regular_file() ? entry.file_size() : 0
            });
        }
    } catch (const fs::filesystem_error& e) {
        std::cerr << "Filesystem Error: " << e.what() << '\\n';
    }
    return items;
}
\`\`\`

## 2. Handling Raw Terminal Input

By placing the terminal in raw mode, keypresses can be captured instantaneously without requiring the user to press Enter. This allows responsive arrow key navigation, rapid filtering, and vim-style hotkeys.
    `,
  },
  {
    title: 'My Journey into Computer Science and Software Development',
    slug: 'my-journey-into-computer-science-and-software-development',
    excerpt: 'How curiosity about how systems function beneath the surface sparked my passion for algorithms, databases, and software engineering.',
    category: 'Developer Journey',
    tags: ['Journey', 'Computer Science', 'Learning', 'Reflections'],
    author: 'Ayush Jha',
    status: 'draft',
    featured: false,
    content: `
From the very first time I opened a terminal and compiled code, I was fascinated by the idea of logic turning into interactive software.

## The Curiosity for What Happens Behind the Screen

In computer science, abstraction is everywhere. When you click a button or type a URL, dozens of layers—from transport protocols and web servers to kernel context switches and hardware caches—collaborate in milliseconds. 

This post documents:
- Starting with foundational languages like C and C++ to grasp memory and pointers.
- Transitioning into full-stack web applications with Node.js and modern databases.
- The philosophy of learning by building real, working projects rather than passive tutorial consumption.
    `,
  },
  {
    title: 'My Experience Learning Linux',
    slug: 'my-experience-learning-linux',
    excerpt: 'Embracing the terminal, understanding the UNIX philosophy, mastering shell scripting, and configuring development environments.',
    category: 'Linux and Open Source',
    tags: ['Linux', 'Bash', 'Open Source', 'OS'],
    author: 'Ayush Jha',
    status: 'draft',
    featured: false,
    content: `
Switching to Linux as a daily development driver changes how you conceptualize computing. Everything is a file, processes communicate cleanly through pipes, and the terminal becomes a superpower.

## The Power of the Unix Philosophy

"Write programs that do one thing and do it well. Write programs to work together." 

In this article, I cover:
- Core shell navigation and pipeline composition (\`grep\`, \`awk\`, \`sed\`, \`find\`).
- Process management with \`htop\`, \`ps\`, and signals.
- File permissions, user groups, and SSH key management.
    `,
  },
  {
    title: 'Understanding Database Normalization',
    slug: 'understanding-database-normalization',
    excerpt: 'Deconstructing 1NF, 2NF, 3NF, and BCNF to design anomaly-free relational databases that scale reliably.',
    category: 'Database Management Systems',
    tags: ['Databases', 'Normalization', 'Relational Models', 'SQL'],
    author: 'Ayush Jha',
    status: 'draft',
    featured: false,
    content: `
Database normalization is the formal technique of organizing relations to minimize data redundancy and avoid update, insertion, and deletion anomalies.

## First Normal Form (1NF) to Third Normal Form (3NF)

- **1NF**: Atomic values in each column; no repeating groups.
- **2NF**: In 1NF and every non-prime attribute is fully functionally dependent on the entire primary key (no partial dependencies).
- **3NF**: In 2NF and no non-prime attribute is transitively dependent on the primary key.
    `,
  },
  {
    title: 'How I Approach Learning Data Structures and Algorithms',
    slug: 'how-i-approach-learning-data-structures-and-algorithms',
    excerpt: 'A structured mental model for breaking down complex algorithmic problems into patterns, invariants, and time-space tradeoffs.',
    category: 'Data Structures and Algorithms',
    tags: ['DSA', 'Algorithms', 'Problem Solving', 'Data Structures'],
    author: 'Ayush Jha',
    status: 'draft',
    featured: false,
    content: `
Mastering Data Structures and Algorithms is not about memorizing hundreds of solutions; it is about recognizing patterns in problem constraints and understanding the invariant properties of trees, graphs, and dynamic programming states.
    `,
  },
  {
    title: 'Getting Started with Backend Development',
    slug: 'getting-started-with-backend-development',
    excerpt: 'An architecturally sound roadmap for aspiring backend engineers covering client-server protocol, concurrency, persistence, and caching.',
    category: 'Backend Engineering',
    tags: ['Backend', 'Architecture', 'Web Development', 'Databases'],
    author: 'Ayush Jha',
    status: 'draft',
    featured: false,
    content: `
Backend engineering is where the real complexity of software lives—data consistency, security, network latency, and horizontal scaling. Here is how to build a strong foundation.
    `,
  },
];

const initialProjects = [
  {
    title: 'Personal Tech Blog',
    slug: 'personal-tech-blog',
    description:
      'A personal technology blogging platform where I can publish technical articles, share development experiences, document programming knowledge, and showcase my learning journey.',
    technologies: ['Node.js', 'Express.js', 'EJS', 'MongoDB', 'HTML', 'CSS', 'JavaScript', 'Multer'],
    image: '',
    githubUrl: 'https://github.com/ayusjha2005/personal_blog',
    liveUrl: 'https://personal-blog-86td.onrender.com/',
    featured: true,
    order: 1,
  },
  {
    title: 'Aarogyam',
    slug: 'aarogyam',
    description:
      'A healthcare-focused patient case-taking platform designed to simplify patient history collection and improve healthcare accessibility. Focuses on AI-powered patient history collection, multilingual voice assistance, and digital healthcare data management. My contribution: Database design and management.',
    technologies: ['PostgreSQL', 'Supabase', 'Rust backend', 'AI-assisted features'],
    image: '',
    githubUrl: '',
    liveUrl: '',
    featured: true,
    order: 2,
  },
  {
    title: 'Road Doctor',
    slug: 'road-doctor',
    description:
      'An IoT-based road monitoring concept designed to identify potholes, monitor road conditions, and report their GPS locations.',
    technologies: ['ESP32', 'MPU6050', 'GPS Module', 'Embedded Systems'],
    image: '',
    githubUrl: '',
    liveUrl: '',
    featured: true,
    order: 3,
  },
  {
    title: 'Terminal-Based File Manager',
    slug: 'terminal-based-file-manager',
    description:
      'A command-line file management utility developed using C++ and Linux concepts for directory navigation, file operations, and terminal interaction.',
    technologies: ['C++', 'Linux', 'Shell Commands'],
    image: '',
    githubUrl: '',
    liveUrl: '',
    featured: true,
    order: 4,
  },
];

module.exports = {
  initialBlogs,
  initialProjects,
};
