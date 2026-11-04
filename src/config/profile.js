/**
 * Centralized Profile Configuration for Ayush Jha
 * All personal details, education, technical skills, projects,
 * social channels, and interests are declared here to ensure
 * consistency across all templates, controllers, and services.
 */

const profile = {
  name: 'Ayush Jha',
  siteTitle: 'Ayush Jha · tech blog',
  tagline: 'exploring technology · building things · sharing what I learn',
  role: 'Computer Science Student | Aspiring Software Engineer',
  primaryInterest: 'Software Engineering and Backend Development',
  location: 'India',

  shortBio:
    'B.Tech in Computer Science and Engineering at VIT. Building scalable systems, exploring backend architecture, and sharing engineering insights.',

  biography: [
    'I am Ayush Jha, a Computer Science and Engineering student at VIT with a strong interest in software development, problem-solving, and emerging technologies.',
    'I enjoy understanding how software systems work behind the scenes, building practical applications, solving programming problems, and exploring new technologies.',
    'My technical interests include backend development, full-stack web development, database systems, Data Structures and Algorithms, cloud computing, and artificial intelligence.',
    'I believe in learning by building. I enjoy developing real-world projects, experimenting with different technologies, and continuously improving my engineering skills.',
    'Beyond technology, I enjoy cricket, football, photography, science fiction, Marvel, automobiles, and exploring new gadgets.',
    'My long-term goal is to become a skilled software engineer capable of designing, developing, and scaling meaningful software products.',
  ],

  education: {
    name: 'Ayush Jha',
    degree: 'Bachelor of Technology (B.Tech)',
    branch: 'Computer Science and Engineering (CSE)',
    institution: 'VIT',
    duration: '2025–2029',
    location: 'India',
    display: 'B.Tech in Computer Science and Engineering at VIT',
    academicInterests: [
      'Data Structures and Algorithms',
      'Database Management Systems',
      'Object-Oriented Programming',
      'Software Engineering',
      'Operating Systems',
      'Computer Networks',
    ],
  },

  skills: {
    languages: ['C', 'C++', 'JavaScript', 'Python', 'SQL'],
    frontend: ['HTML', 'CSS', 'JavaScript'],
    backend: ['Node.js', 'Express.js', 'REST API Development', 'EJS'],
    databases: ['MongoDB', 'PostgreSQL', 'Oracle SQL', 'Supabase', 'Prisma'],
    fundamentals: [
      'Data Structures and Algorithms',
      'Object-Oriented Programming',
      'Database Management Systems',
      'Operating Systems',
      'Computer Networks',
      'Software Engineering',
    ],
    tools: ['Git', 'GitHub', 'VS Code', 'Linux', 'Postman'],
  },

  projects: [
    {
      title: 'Personal Tech Blog',
      slug: 'personal-tech-blog',
      description:
        'A personal technology blogging platform where I can publish technical articles, share development experiences, document programming knowledge, and showcase my learning journey.',
      technologies: ['Node.js', 'Express.js', 'EJS', 'MongoDB', 'HTML', 'CSS', 'JavaScript', 'Multer'],
      features: [
        'Blog publishing and management',
        'Admin dashboard',
        'Image uploads',
        'Blog categorization',
        'Blog view tracking',
        'Responsive design',
        'Content management',
      ],
      githubUrl: 'https://github.com/ayusjha2005/personal_blog',
      liveUrl: 'https://personal-blog-86td.onrender.com/',
      featured: true,
      order: 1,
    },
    {
      title: 'Aarogyam',
      slug: 'aarogyam',
      description:
        'A healthcare-focused patient case-taking platform designed to simplify patient history collection and improve healthcare accessibility. The project focuses on AI-powered patient history collection, multilingual voice assistance, and digital healthcare data management.',
      contribution: 'Database design and management.',
      technologies: ['PostgreSQL', 'Supabase', 'Rust backend', 'AI-assisted features'],
      features: [
        'Digital patient history collection',
        'Multilingual voice assistant',
        'ABDM integration concept',
        'Healthcare data management',
        'Accessibility for patients',
      ],
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
      category: 'IoT Project / Concept',
      technologies: ['ESP32', 'MPU6050', 'GPS Module', 'Embedded Systems'],
      features: [
        'Pothole detection',
        'Road condition monitoring',
        'GPS-based location tracking',
        'Sensor-based monitoring',
        'Road safety improvement',
      ],
      githubUrl: '',
      liveUrl: '',
      featured: true,
      order: 3,
    },
    {
      title: 'Terminal-Based File Manager',
      slug: 'terminal-based-file-manager',
      description:
        'A command-line file management utility developed using C++ and Linux concepts.',
      technologies: ['C++', 'Linux', 'Shell Commands'],
      features: [
        'File navigation',
        'Directory management',
        'File operations',
        'Terminal interaction',
        'Linux command-line integration',
      ],
      githubUrl: '',
      liveUrl: '',
      featured: true,
      order: 4,
    },
  ],

  contact: {
    email: 'reach2kr.ayush@gmail.com',
    emailUrl: 'mailto:reach2kr.ayush@gmail.com',
    linkedin: 'https://www.linkedin.com/in/kumar-ayush-322294385/',
    github: 'https://github.com/ayusjha2005',
    githubRepo: 'https://github.com/ayusjha2005/personal_blog',
    twitter: 'https://x.com/ayushjha2005',
  },

  interests: [
    'Cricket',
    'Football',
    'Photography',
    'Science Fiction',
    'Marvel',
    'Automobiles',
    'Technology and Gadgets',
  ],
};

module.exports = profile;
