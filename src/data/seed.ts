// ============================================================
// CogniOs Seed Data â€” Realistic Java Full Stack Developer Profile
// Aligned with PRD types
// ============================================================

import type {
  Skill, Project, Course, AcademicSubject,
  ResumeProfile, LibraryItem, ActivityItem, Notification,
  AppSettings, UserProfile,
} from '@/types';

const now = new Date().toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

export const seedProfile: UserProfile = {
  name: 'Shiv Dhakad',
  email: 'shiv.dhakad@example.com',
  title: 'Java Full Stack Developer',
  avatarInitials: 'SD',
  github: 'https://github.com/shivdhakad',
  linkedin: 'https://linkedin.com/in/shivdhakad',
  portfolio: '',
  phone: '',
};

export const seedSettings: AppSettings = {
  theme: 'light',
  defaultPage: '/dashboard',
  sidebarCollapsed: false,
};

export const seedSkills: Skill[] = [
  {
    id: 'sk-001', name: 'Java', category: 'Backend', proficiency: 'Mastered',
    playbook: {
      bestFor: 'Enterprise applications, microservices, Android development',
      tradeoffs: 'Verbose syntax, slower startup compared to Go/Rust, heavy memory footprint',
      alternatives: 'Kotlin, Scala, Go',
    },
    proofOfWorkUrl: 'https://github.com/shivdhakad',
    learningNotes: 'Core Java, Java 21 features, virtual threads, pattern matching',
    relatedProjectIds: ['pr-001', 'pr-002'], relatedCourseIds: ['cr-001', 'cr-002'],
    createdAt: daysAgo(90), updatedAt: daysAgo(2),
  },
  {
    id: 'sk-002', name: 'Data Structures & Algorithms', category: 'Backend', proficiency: 'Intermediate',
    playbook: {
      bestFor: 'Problem-solving, competitive programming, technical interviews',
      tradeoffs: 'Time investment to master, abstract concepts',
      alternatives: 'Pattern-based learning, LeetCode grinding',
    },
    learningNotes: 'Arrays, Linked Lists, Trees, Graphs, Dynamic Programming, Sorting',
    createdAt: daysAgo(85), updatedAt: daysAgo(5),
  },
  {
    id: 'sk-003', name: 'Spring Boot', category: 'Backend', proficiency: 'Mastered',
    playbook: {
      bestFor: 'Rapid development of production Java backend applications',
      tradeoffs: 'Higher abstraction and framework complexity',
      alternatives: 'Quarkus, Micronaut, Node.js',
    },
    proofOfWorkUrl: 'https://github.com/shivdhakad/smart-carpool',
    learningNotes: 'Auto-configuration, starters, actuator, profiles, Spring Boot 3.x',
    relatedProjectIds: ['pr-001'], relatedCourseIds: ['cr-001', 'cr-003'],
    createdAt: daysAgo(80), updatedAt: daysAgo(5),
  },
  {
    id: 'sk-004', name: 'Spring Security', category: 'Backend', proficiency: 'Beginner',
    playbook: {
      bestFor: 'Authentication, authorization, OAuth2, JWT security',
      tradeoffs: 'Complex configuration, steep learning curve, verbose filter chains',
      alternatives: 'Apache Shiro, Keycloak, custom JWT',
    },
    learningNotes: 'Security filter chain, JWT tokens, OAuth2 resource server, CORS config',
    createdAt: daysAgo(30), updatedAt: daysAgo(20),
  },
  {
    id: 'sk-005', name: 'Hibernate/JPA', category: 'Backend', proficiency: 'Intermediate',
    playbook: {
      bestFor: 'ORM, database-agnostic persistence, complex entity relationships',
      tradeoffs: 'Lazy loading issues, session management complexity, debugging SQL',
      alternatives: 'MyBatis, jOOQ, Spring Data JDBC',
    },
    learningNotes: 'Entity lifecycle, caching strategies, fetch types, cascade operations',
    relatedProjectIds: ['pr-001'], relatedCourseIds: ['cr-001'],
    createdAt: daysAgo(70), updatedAt: daysAgo(15),
  },
  {
    id: 'sk-006', name: 'REST APIs', category: 'Backend', proficiency: 'Mastered',
    playbook: {
      bestFor: 'Client-server communication, microservice interfaces, mobile backends',
      tradeoffs: 'Over-fetching/under-fetching, versioning challenges',
      alternatives: 'GraphQL, gRPC, WebSocket',
    },
    proofOfWorkUrl: 'https://github.com/shivdhakad',
    learningNotes: 'HTTP methods, status codes, HATEOAS, OpenAPI, rate limiting',
    relatedProjectIds: ['pr-001', 'pr-002'], relatedCourseIds: ['cr-001'],
    createdAt: daysAgo(85), updatedAt: daysAgo(3),
  },
  {
    id: 'sk-007', name: 'Microservices', category: 'Backend', proficiency: 'Beginner',
    playbook: {
      bestFor: 'Scalable distributed systems, independent deployability',
      tradeoffs: 'Operational complexity, eventual consistency, debugging difficulty',
      alternatives: 'Monolith-first, modular monolith, serverless',
    },
    learningNotes: 'Service discovery, API gateway, circuit breaker, event-driven',
    createdAt: daysAgo(25), updatedAt: daysAgo(10),
  },
  {
    id: 'sk-008', name: 'React', category: 'Frontend', proficiency: 'Intermediate',
    playbook: {
      bestFor: 'Single-page applications, component-based UIs, rich interactivity',
      tradeoffs: 'JSX learning curve, state management complexity, rapid ecosystem changes',
      alternatives: 'Vue.js, Angular, Svelte',
    },
    proofOfWorkUrl: 'https://github.com/shivdhakad/cognios',
    learningNotes: 'Hooks, Context API, React Router, useEffect lifecycle',
    relatedProjectIds: ['pr-002'], relatedCourseIds: ['cr-004'],
    createdAt: daysAgo(60), updatedAt: daysAgo(1),
  },
  {
    id: 'sk-009', name: 'TypeScript', category: 'Frontend', proficiency: 'Intermediate',
    playbook: {
      bestFor: 'Type-safe JavaScript, large-scale frontend apps, better DX',
      tradeoffs: 'Configuration overhead, compilation step, any-escape hatch temptation',
      alternatives: 'Flow, JSDoc annotations, vanilla JS',
    },
    learningNotes: 'Generics, utility types, discriminated unions, module augmentation',
    relatedProjectIds: ['pr-002'], relatedCourseIds: ['cr-004'],
    createdAt: daysAgo(55), updatedAt: daysAgo(1),
  },
  {
    id: 'sk-010', name: 'Tailwind CSS', category: 'Frontend', proficiency: 'Intermediate',
    playbook: {
      bestFor: 'Rapid UI development, utility-first styling, design system consistency',
      tradeoffs: 'Long class strings, learning utility names, HTML clutter',
      alternatives: 'Styled Components, CSS Modules, Sass',
    },
    learningNotes: 'Responsive design, dark mode, custom theme, @apply directive',
    relatedProjectIds: ['pr-002'],
    createdAt: daysAgo(50), updatedAt: daysAgo(1),
  },
  {
    id: 'sk-011', name: 'State Management', category: 'Frontend', proficiency: 'Beginner',
    playbook: {
      bestFor: 'Complex app state, cross-component data sharing',
      tradeoffs: 'Boilerplate, learning curve, potential over-engineering',
      alternatives: 'Context API, Zustand, Jotai, URL state',
    },
    learningNotes: 'React Context, useReducer, Zustand basics',
    createdAt: daysAgo(40), updatedAt: daysAgo(15),
  },
  {
    id: 'sk-012', name: 'Full-stack Architecture', category: 'Full Stack', proficiency: 'Beginner',
    playbook: {
      bestFor: 'End-to-end application design, system architecture decisions',
      tradeoffs: 'Breadth vs depth, decision fatigue',
      alternatives: 'Backend-focused, frontend-focused specialization',
    },
    learningNotes: 'Monolith vs microservices, API contracts, deployment strategies',
    createdAt: daysAgo(35), updatedAt: daysAgo(10),
  },
  {
    id: 'sk-013', name: 'PostgreSQL', category: 'Database/DevOps', proficiency: 'Intermediate',
    playbook: {
      bestFor: 'Relational data, complex queries, ACID compliance, JSON support',
      tradeoffs: 'Tuning complexity, horizontal scaling challenges',
      alternatives: 'MySQL, MariaDB, CockroachDB',
    },
    learningNotes: 'Indexing, query plans, JSONB, full-text search, partitioning',
    relatedProjectIds: ['pr-001'],
    createdAt: daysAgo(65), updatedAt: daysAgo(8),
  },
  {
    id: 'sk-014', name: 'MySQL', category: 'Database/DevOps', proficiency: 'Beginner',
    playbook: {
      bestFor: 'Web applications, simple relational storage, wide hosting support',
      tradeoffs: 'Fewer advanced features than PostgreSQL, InnoDB limitations',
      alternatives: 'PostgreSQL, MariaDB, SQLite',
    },
    learningNotes: 'Basic CRUD, joins, indexing, stored procedures',
    createdAt: daysAgo(60), updatedAt: daysAgo(30),
  },
  {
    id: 'sk-015', name: 'Docker', category: 'Database/DevOps', proficiency: 'Beginner',
    playbook: {
      bestFor: 'Containerization, consistent environments, microservice deployment',
      tradeoffs: 'Image size management, networking complexity, security surface',
      alternatives: 'Podman, containerd, bare metal deployment',
    },
    learningNotes: 'Dockerfile, docker-compose, multi-stage builds, volumes',
    createdAt: daysAgo(40), updatedAt: daysAgo(12),
  },
  {
    id: 'sk-016', name: 'Maven', category: 'Database/DevOps', proficiency: 'Intermediate',
    playbook: {
      bestFor: 'Java project build automation, dependency management',
      tradeoffs: 'Verbose XML, slow for large projects, convention-based',
      alternatives: 'Gradle, Ant, Bazel',
    },
    learningNotes: 'POM structure, lifecycle, plugins, multi-module projects',
    createdAt: daysAgo(75), updatedAt: daysAgo(20),
  },
  {
    id: 'sk-017', name: 'Git', category: 'Database/DevOps', proficiency: 'Mastered',
    playbook: {
      bestFor: 'Version control, collaboration, code history, branching strategies',
      tradeoffs: 'Steep learning curve for advanced features, merge conflicts',
      alternatives: 'SVN, Mercurial',
    },
    proofOfWorkUrl: 'https://github.com/shivdhakad',
    learningNotes: 'Branching, rebasing, cherry-pick, stashing, hooks, Git Flow',
    createdAt: daysAgo(100), updatedAt: daysAgo(1),
  },
  {
    id: 'sk-018', name: 'Spring AI', category: 'AI', proficiency: 'Beginner',
    playbook: {
      bestFor: 'Integrating AI/ML into Spring Boot applications',
      tradeoffs: 'Still evolving, limited documentation, vendor lock-in risk',
      alternatives: 'LangChain4j, direct OpenAI SDK, Hugging Face',
    },
    learningNotes: 'Chat models, embeddings, vector stores, prompt templates',
    createdAt: daysAgo(15), updatedAt: daysAgo(5),
  },
  {
    id: 'sk-019', name: 'LangChain4j', category: 'AI', proficiency: 'Beginner',
    playbook: {
      bestFor: 'Building AI-powered Java applications with LLMs',
      tradeoffs: 'Java-specific, less community vs Python LangChain',
      alternatives: 'Spring AI, direct API calls, Semantic Kernel',
    },
    learningNotes: 'AI services, memory, RAG, tools, agents',
    createdAt: daysAgo(10), updatedAt: daysAgo(3),
  },
];

export const seedProjects: Project[] = [
  {
    id: 'pr-001',
    title: 'Smart Carpool System',
    description: 'A full-stack ride-sharing platform connecting commuters for cost-effective and eco-friendly carpooling. Features real-time matching, route optimization, and secure payment integration.',
    techStack: ['Java', 'Spring Boot', 'Spring Security', 'PostgreSQL', 'React', 'Tailwind CSS', 'Docker'],
    githubUrl: 'https://github.com/shivdhakad/smart-carpool',
    liveUrl: '',
    problem: 'Urban commuters face expensive and inefficient solo driving, contributing to traffic congestion and carbon emissions.',
    solution: 'Built a platform matching riders with similar routes, featuring real-time notifications, driver verification, and automated fare splitting.',
    architecture: 'Spring Boot REST API backend with PostgreSQL, React SPA frontend, JWT authentication, WebSocket for real-time updates.',
    features: 'User registration, ride matching algorithm, route mapping, payment integration, rating system, admin dashboard',
    role: 'Full Stack Developer â€” designed architecture, built REST APIs, implemented frontend, deployed with Docker',
    featured: true,
    createdAt: daysAgo(60), updatedAt: daysAgo(3),
  },
  {
    id: 'pr-002',
    title: 'CogniOs',
    description: 'A personal learning and competency operating system for tracking skills, academics, projects, and building tailored resumes. Built as a developer portfolio + knowledge management tool.',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'localStorage'],
    githubUrl: 'https://github.com/shivdhakad/cognios',
    liveUrl: '',
    problem: 'Developers lack a centralized place to track their evolving skill set, manage learning progress, and generate role-specific resumes.',
    solution: 'Created a premium SaaS-style application that serves as a personal operating system for career development.',
    architecture: 'React SPA with TypeScript, Tailwind CSS design system, localStorage persistence, planned Spring Boot + PostgreSQL migration.',
    features: 'Skills tracking with playbook, academic GPA calculator, course progress tracker, project portfolio, resume builder, knowledge library',
    role: 'Solo Developer â€” designed, built, and deployed the entire application',
    featured: true,
    createdAt: daysAgo(30), updatedAt: daysAgo(1),
  },
];

export const seedCourses: Course[] = [
  {
    id: 'cr-001',
    title: 'Java Full Stack Development',
    platform: 'Udemy',
    instructor: 'in28Minutes',
    progressPercentage: 65,
    status: 'In Progress',
    totalDuration: '42 hours',
    completedDuration: '27 hours',
    certificateUrl: '',
    courseUrl: 'https://udemy.com',
    lastStudied: daysAgo(2),
    createdAt: daysAgo(60), updatedAt: daysAgo(2),
  },
  {
    id: 'cr-002',
    title: 'DSA in Java',
    platform: 'YouTube / Striver',
    progressPercentage: 40,
    status: 'In Progress',
    totalDuration: '100+ hours',
    completedDuration: '40 hours',
    certificateUrl: '',
    courseUrl: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2',
    lastStudied: daysAgo(1),
    createdAt: daysAgo(50), updatedAt: daysAgo(1),
  },
  {
    id: 'cr-003',
    title: 'Spring Boot Masterclass',
    platform: 'Udemy',
    instructor: 'Chad Darby',
    progressPercentage: 30,
    status: 'In Progress',
    totalDuration: '35 hours',
    completedDuration: '10.5 hours',
    certificateUrl: '',
    courseUrl: 'https://udemy.com',
    lastStudied: daysAgo(7),
    createdAt: daysAgo(40), updatedAt: daysAgo(7),
  },
  {
    id: 'cr-004',
    title: 'React â€” The Complete Guide',
    platform: 'Udemy',
    instructor: 'Maximilian SchwarzmÃ¼ller',
    progressPercentage: 50,
    status: 'In Progress',
    totalDuration: '48 hours',
    completedDuration: '24 hours',
    certificateUrl: '',
    courseUrl: 'https://udemy.com',
    lastStudied: daysAgo(3),
    createdAt: daysAgo(45), updatedAt: daysAgo(3),
  },
];

export const seedAcademics: AcademicSubject[] = [
  // Semester 1
  { id: 'ac-001', semester: 1, subject: 'Mathematics I', credits: 4, grade: 'A', score: 9, status: 'Completed', createdAt: daysAgo(300), updatedAt: daysAgo(300) },
  { id: 'ac-002', semester: 1, subject: 'Physics', credits: 4, grade: 'A', score: 8.5, status: 'Completed', createdAt: daysAgo(300), updatedAt: daysAgo(300) },
  { id: 'ac-003', semester: 1, subject: 'Programming Fundamentals', credits: 3, grade: 'A+', score: 9.5, status: 'Completed', createdAt: daysAgo(300), updatedAt: daysAgo(300) },
  { id: 'ac-004', semester: 1, subject: 'English Communication', credits: 2, grade: 'B+', score: 7.5, status: 'Completed', createdAt: daysAgo(300), updatedAt: daysAgo(300) },
  // Semester 2
  { id: 'ac-005', semester: 2, subject: 'Mathematics II', credits: 4, grade: 'A', score: 8.5, status: 'Completed', createdAt: daysAgo(250), updatedAt: daysAgo(250) },
  { id: 'ac-006', semester: 2, subject: 'Data Structures', credits: 4, grade: 'A+', score: 9.5, status: 'Completed', createdAt: daysAgo(250), updatedAt: daysAgo(250) },
  { id: 'ac-007', semester: 2, subject: 'Digital Electronics', credits: 3, grade: 'B+', score: 7, status: 'Completed', createdAt: daysAgo(250), updatedAt: daysAgo(250) },
  // Semester 3
  { id: 'ac-008', semester: 3, subject: 'Object-Oriented Programming', credits: 4, grade: 'A+', score: 9.5, status: 'Completed', createdAt: daysAgo(200), updatedAt: daysAgo(200) },
  { id: 'ac-009', semester: 3, subject: 'Database Management Systems', credits: 4, grade: 'A', score: 9, status: 'Completed', createdAt: daysAgo(200), updatedAt: daysAgo(200) },
  { id: 'ac-010', semester: 3, subject: 'Computer Networks', credits: 3, grade: 'B+', score: 7.5, status: 'Completed', createdAt: daysAgo(200), updatedAt: daysAgo(200) },
  // Semester 4
  { id: 'ac-011', semester: 4, subject: 'Operating Systems', credits: 4, grade: 'A', score: 8.5, status: 'Completed', createdAt: daysAgo(150), updatedAt: daysAgo(150) },
  { id: 'ac-012', semester: 4, subject: 'Algorithms', credits: 4, grade: 'A', score: 9, status: 'Completed', createdAt: daysAgo(150), updatedAt: daysAgo(150) },
  { id: 'ac-013', semester: 4, subject: 'Software Engineering', credits: 3, grade: 'A+', score: 9.5, status: 'Completed', createdAt: daysAgo(150), updatedAt: daysAgo(150) },
  // Semester 5
  { id: 'ac-014', semester: 5, subject: 'Web Technologies', credits: 4, grade: '', score: 0, status: 'In Progress', createdAt: daysAgo(30), updatedAt: daysAgo(5) },
  { id: 'ac-015', semester: 5, subject: 'Machine Learning', credits: 3, grade: '', score: 0, status: 'In Progress', createdAt: daysAgo(30), updatedAt: daysAgo(5) },
];

export const seedResumes: ResumeProfile[] = [
  {
    id: 'res-001',
    roleTitle: 'Java Backend Engineer',
    targetSummary: 'Results-driven Java developer with strong foundations in Spring Boot, REST API design, and relational databases. Experienced in building scalable microservice architectures and secure backend systems.',
    selectedSkillIds: ['sk-001', 'sk-003', 'sk-004', 'sk-005', 'sk-006', 'sk-007', 'sk-013', 'sk-017'],
    selectedProjectIds: ['pr-001'],
    selectedSubjectIds: ['ac-006', 'ac-008', 'ac-009', 'ac-012'],
    selectedCourseIds: ['cr-001', 'cr-003'],
    createdAt: daysAgo(10), updatedAt: daysAgo(2),
  },
  {
    id: 'res-002',
    roleTitle: 'Full Stack Web Engineer',
    targetSummary: 'Versatile full stack developer proficient in Java Spring Boot and React, with a passion for building performant web applications from database to deployment.',
    selectedSkillIds: ['sk-001', 'sk-003', 'sk-006', 'sk-008', 'sk-009', 'sk-010', 'sk-013', 'sk-015', 'sk-017'],
    selectedProjectIds: ['pr-001', 'pr-002'],
    selectedSubjectIds: ['ac-006', 'ac-008', 'ac-009'],
    selectedCourseIds: ['cr-001', 'cr-004'],
    createdAt: daysAgo(5), updatedAt: daysAgo(1),
  },
];

export const seedLibrary: LibraryItem[] = [
  {
    id: 'lib-001',
    title: 'Spring Boot Documentation',
    author: 'Pivotal / VMware',
    status: 'Reading',
    resourceUrl: 'https://docs.spring.io/spring-boot/docs/current/reference/html/',
    takeawaysMarkdown: `## Key Concepts\n\n- **Auto-Configuration**: Spring Boot automatically configures beans based on classpath dependencies\n- **Starters**: Curated dependency sets for common use cases\n- **Actuator**: Production-ready monitoring and management endpoints\n- **Profiles**: Environment-specific configuration management\n\n## Important Commands\n\n\`\`\`bash\nmvn spring-boot:run\njava -jar app.jar --spring.profiles.active=prod\n\`\`\``,
    category: 'Documentation',
    tags: ['Spring Boot', 'Java', 'Backend'],
    createdAt: daysAgo(30), updatedAt: daysAgo(3),
  },
  {
    id: 'lib-002',
    title: 'Java Documentation',
    author: 'Oracle',
    status: 'Reading',
    resourceUrl: 'https://docs.oracle.com/en/java/',
    takeawaysMarkdown: `## Java 21 Features\n\n- **Virtual Threads**: Lightweight concurrency with Project Loom\n- **Pattern Matching**: Enhanced switch and instanceof\n- **Records**: Compact data carriers\n- **Sealed Classes**: Restricted class hierarchies\n\n## Best Practices\n\n- Use var for local variables when type is obvious\n- Prefer immutable data structures\n- Use Optional instead of null`,
    category: 'Documentation',
    tags: ['Java', 'Core Java'],
    createdAt: daysAgo(45), updatedAt: daysAgo(5),
  },
  {
    id: 'lib-003',
    title: 'System Design Notes',
    author: 'Personal Notes',
    status: 'Reading',
    resourceUrl: '',
    takeawaysMarkdown: `## System Design Fundamentals\n\n### Load Balancing\n- Round Robin, Least Connections, IP Hash\n- Layer 4 vs Layer 7\n\n### Caching\n- Redis, Memcached\n- Cache-aside, Write-through, Write-behind\n\n### Database Scaling\n- Vertical vs Horizontal\n- Read replicas, Sharding\n- CAP theorem`,
    category: 'Technical Notes',
    tags: ['System Design', 'Architecture', 'Interview'],
    createdAt: daysAgo(20), updatedAt: daysAgo(2),
  },
  {
    id: 'lib-004',
    title: 'DSA Interview Notes',
    author: 'Personal Notes',
    status: 'Reading',
    resourceUrl: 'https://takeuforward.org',
    takeawaysMarkdown: `## Must-Know Patterns\n\n1. **Two Pointers**: Array/String problems\n2. **Sliding Window**: Subarray/Substring problems\n3. **Binary Search**: Sorted data, search space reduction\n4. **BFS/DFS**: Tree/Graph traversal\n5. **Dynamic Programming**: Overlapping subproblems\n\n## Time Complexity Cheat Sheet\n\n| Algorithm | Best | Worst |\n|-----------|------|-------|\n| Binary Search | O(log n) | O(log n) |\n| Merge Sort | O(n log n) | O(n log n) |\n| Quick Sort | O(n log n) | O(nÂ²) |`,
    category: 'Technical Notes',
    tags: ['DSA', 'Interview', 'Algorithms'],
    createdAt: daysAgo(15), updatedAt: daysAgo(1),
  },
  {
    id: 'lib-005',
    title: 'AI Tooling Notes',
    author: 'Personal Notes',
    status: 'Queued',
    resourceUrl: '',
    takeawaysMarkdown: `## Spring AI Overview\n\n- Chat completions, embeddings, vector stores\n- Prompt templates and output parsers\n- Integration with OpenAI, Ollama, etc.\n\n## LangChain4j\n\n- AI Services pattern\n- Memory management for conversations\n- RAG (Retrieval Augmented Generation)\n- Tool/Function calling`,
    category: 'Technical Notes',
    tags: ['AI', 'Spring AI', 'LangChain4j'],
    createdAt: daysAgo(10), updatedAt: daysAgo(5),
  },
];

export const seedActivity: ActivityItem[] = [
  { id: 'act-001', type: 'skill', action: 'Added', entityName: 'LangChain4j', timestamp: daysAgo(0.1) },
  { id: 'act-002', type: 'skill', action: 'Updated proficiency for', entityName: 'React', timestamp: daysAgo(0.5) },
  { id: 'act-003', type: 'project', action: 'Updated', entityName: 'CogniOs', timestamp: daysAgo(1) },
  { id: 'act-004', type: 'course', action: 'Updated progress to 65%', entityName: 'Java Full Stack Development', timestamp: daysAgo(2) },
  { id: 'act-005', type: 'resume', action: 'Created', entityName: 'Full Stack Web Engineer', timestamp: daysAgo(5) },
  { id: 'act-006', type: 'library', action: 'Added', entityName: 'AI Tooling Notes', timestamp: daysAgo(10) },
  { id: 'act-007', type: 'resume', action: 'Created', entityName: 'Java Backend Engineer', timestamp: daysAgo(10) },
  { id: 'act-008', type: 'skill', action: 'Added', entityName: 'Spring AI', timestamp: daysAgo(15) },
  { id: 'act-009', type: 'academic', action: 'Added', entityName: 'Web Technologies', timestamp: daysAgo(30) },
  { id: 'act-010', type: 'course', action: 'Added', entityName: 'Spring Boot Masterclass', timestamp: daysAgo(40) },
];

export const seedNotifications: Notification[] = [
  { id: 'not-001', title: 'Welcome to CogniOs', message: 'Your personal developer OS is ready. Start tracking your skills!', read: false, timestamp: daysAgo(0), type: 'info' },
  { id: 'not-002', title: 'Course Milestone', message: 'Java Full Stack Development is 65% complete â€” keep going!', read: false, timestamp: daysAgo(2), type: 'success' },
  { id: 'not-003', title: 'New Skill Added', message: 'LangChain4j has been added to your AI toolkit.', read: true, timestamp: daysAgo(10), type: 'info' },
];

