const mongoose = require('mongoose');
const User = require('../models/User');
const Company = require('../models/Company');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
const Campaign = require('../models/Campaign');
const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');
const Certificate = require('../models/Certificate');
const AuditLog = require('../models/AuditLog');
const { issueCertificate } = require('../services/certificate.service');

const seedData = async () => {
  try {
    console.log('[Seed] Checking existing database state...');
    const superAdminExists = await User.findOne({ role: 'SUPER_ADMIN' });
    if (superAdminExists) {
      console.log('[Seed] Database already seeded with Super Admin. Skipping.');
      return;
    }

    console.log('[Seed] Seeding fresh CyberAware platform dataset...');

    // 1. Create Super Admin
    const defaultPasswordHash = await User.hashPassword('Password123!');
    const superAdmin = await User.create({
      name: 'Global Platform Administrator',
      email: 'superadmin@cyberaware.io',
      passwordHash: defaultPasswordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      jobTitle: 'Chief Security Officer'
    });
    console.log(`[Seed] Created Super Admin: ${superAdmin.email}`);

    // 2. Create Organizations
    const acmeCompany = await Company.create({
      name: 'Acme Financial Group',
      slug: 'acme-financial',
      email: 'contact@acmefinance.com',
      phone: '+1 (555) 234-5678',
      industry: 'Financial Services & Banking',
      address: '100 Wall Street, New York, NY 10005',
      website: 'https://acmefinance.example.com',
      status: 'ACTIVE',
      subscriptionPlan: 'ENTERPRISE',
      subscriptionStatus: 'ACTIVE',
      branding: { primaryColor: '#06b6d4', secondaryColor: '#3b82f6' }
    });

    const apexCompany = await Company.create({
      name: 'Apex Health Network',
      slug: 'apex-health',
      email: 'security@apexhealth.com',
      phone: '+1 (555) 876-5432',
      industry: 'Healthcare & Hospital Systems',
      address: '450 Health Sciences Blvd, Boston, MA 02115',
      website: 'https://apexhealth.example.com',
      status: 'ACTIVE',
      subscriptionPlan: 'PROFESSIONAL',
      subscriptionStatus: 'ACTIVE',
      branding: { primaryColor: '#10b981', secondaryColor: '#06b6d4' }
    });

    // 3. Create Departments for Acme
    const acmeDepts = await Department.insertMany([
      { companyId: acmeCompany._id, name: 'Information Security & IT', description: 'Core IT and cyber infrastructure' },
      { companyId: acmeCompany._id, name: 'Financial Trading & Analysis', description: 'Equities and assets trading desks' },
      { companyId: acmeCompany._id, name: 'Compliance, Legal & Audit', description: 'Regulatory and SOC2 compliance' },
      { companyId: acmeCompany._id, name: 'Human Resources & People', description: 'HR and talent management' }
    ]);

    // Departments for Apex
    const apexDepts = await Department.insertMany([
      { companyId: apexCompany._id, name: 'Healthcare IT & Clinical Systems', description: 'EHR and medical devices security' },
      { companyId: apexCompany._id, name: 'Clinical Operations & Nursing', description: 'Hospital floor and patient care' },
      { companyId: apexCompany._id, name: 'HIPAA & Patient Privacy', description: 'Regulatory privacy and records' }
    ]);

    // 4. Create Company Admins
    const acmeAdmin = await User.create({
      name: 'Victoria Vance',
      email: 'admin@acmefinance.com',
      passwordHash: defaultPasswordHash,
      role: 'COMPANY_ADMIN',
      companyId: acmeCompany._id,
      departmentId: acmeDepts[0]._id,
      status: 'ACTIVE',
      jobTitle: 'VP of Information Security'
    });

    const apexAdmin = await User.create({
      name: 'Marcus Sterling',
      email: 'admin@apexhealth.com',
      passwordHash: defaultPasswordHash,
      role: 'COMPANY_ADMIN',
      companyId: apexCompany._id,
      departmentId: apexDepts[0]._id,
      status: 'ACTIVE',
      jobTitle: 'Chief Information Security Officer'
    });

    // 5. Create Employees for Acme
    const ahmed = await User.create({
      name: 'Ahmed Khan',
      email: 'ahmed@acmefinance.com',
      passwordHash: defaultPasswordHash,
      role: 'EMPLOYEE',
      companyId: acmeCompany._id,
      departmentId: acmeDepts[1]._id,
      status: 'ACTIVE',
      jobTitle: 'Senior Financial Analyst'
    });

    const sara = await User.create({
      name: 'Sara Ali',
      email: 'sara@acmefinance.com',
      passwordHash: defaultPasswordHash,
      role: 'EMPLOYEE',
      companyId: acmeCompany._id,
      departmentId: acmeDepts[2]._id,
      status: 'ACTIVE',
      jobTitle: 'Compliance Officer'
    });

    const usman = await User.create({
      name: 'Usman Raza',
      email: 'usman@acmefinance.com',
      passwordHash: defaultPasswordHash,
      role: 'EMPLOYEE',
      companyId: acmeCompany._id,
      departmentId: acmeDepts[0]._id,
      status: 'ACTIVE',
      jobTitle: 'IT Systems Specialist'
    });

    const fatima = await User.create({
      name: 'Fatima Noor',
      email: 'fatima@acmefinance.com',
      passwordHash: defaultPasswordHash,
      role: 'EMPLOYEE',
      companyId: acmeCompany._id,
      departmentId: acmeDepts[1]._id,
      status: 'ACTIVE',
      jobTitle: 'Portfolio Risk Manager'
    });

    const bilal = await User.create({
      name: 'Bilal Tariq',
      email: 'bilal@acmefinance.com',
      passwordHash: defaultPasswordHash,
      role: 'EMPLOYEE',
      companyId: acmeCompany._id,
      departmentId: acmeDepts[3]._id,
      status: 'ACTIVE',
      jobTitle: 'People Operations Coordinator'
    });

    // Employees for Apex
    await User.create({
      name: 'Dr. Zain Malik',
      email: 'dr.zain@apexhealth.com',
      passwordHash: defaultPasswordHash,
      role: 'EMPLOYEE',
      companyId: apexCompany._id,
      departmentId: apexDepts[1]._id,
      status: 'ACTIVE',
      jobTitle: 'Lead Critical Care Physician'
    });

    await User.create({
      name: 'Maryam Qureshi',
      email: 'maryam@apexhealth.com',
      passwordHash: defaultPasswordHash,
      role: 'EMPLOYEE',
      companyId: apexCompany._id,
      departmentId: apexDepts[2]._id,
      status: 'ACTIVE',
      jobTitle: 'HIPAA Compliance Auditor'
    });

    // 6. Create Comprehensive Security Courses
    // COURSE 1: Phishing Awareness & Social Engineering
    const course1 = await Course.create({
      title: 'Phishing Defense & Social Engineering Detection',
      slug: 'phishing-defense-social-engineering',
      description: 'Master practical techniques to detect spear-phishing emails, urgent wire fraud lures, spoofed domains, and voice impersonation (vishing).',
      category: 'Email Security',
      difficulty: 'BEGINNER',
      estimatedDuration: 20,
      passingScore: 80,
      certificateEligible: true,
      status: 'PUBLISHED',
      createdBy: superAdmin._id
    });

    const mod1 = await Module.create({
      courseId: course1._id,
      title: 'Module 1: The Modern Phishing Landscape',
      order: 1,
      description: 'Understanding deceptive email vectors and psychological triggers used by attackers.'
    });

    const lesson1_1 = await Lesson.create({
      courseId: course1._id,
      moduleId: mod1._id,
      title: 'Anatomy of a Targeted Spear-Phishing Attack',
      description: 'Learn how cybercriminals craft convincing emails by researching targets on LinkedIn and corporate websites.',
      contentType: 'TEXT',
      textContent: `### Recognizing Spear Phishing\n\nUnlike spray-and-pray spam, **spear phishing** is meticulously personalized.\n\n#### Key Characteristics:\n- **Spoofed Sender Display Names:** Display name appears as your CEO or HR Director, while the actual header reveals a rogue domain (e.g., \`ceo@company-secure-portal.xyz\`).\n- **Urgency Triggers:** Demands rapid action regarding unpaid invoices, emergency wire transfers, or immediate password resets.\n- **Concealed Hyperlinks:** Hyperlinks that mask malicious redirects behind deceptive text anchor words.\n\n#### Rule of Thumb:\n*Always hover over links without clicking to inspect the authentic destination URL.*`,
      duration: 5,
      order: 1,
      isRequired: true
    });

    const lesson1_2 = await Lesson.create({
      courseId: course1._id,
      moduleId: mod1._id,
      title: 'Spotting Deceptive Domain Names & Typosquatting',
      description: 'Techniques to identify subtle character substitutions in sender emails and landing pages.',
      contentType: 'TEXT',
      textContent: `### Deceptive Domains & Typosquatting\n\nAttackers register domain names that look nearly identical to trusted services:\n\n- \`micros0ft.com\` (replacing the letter 'o' with the digit zero)\n- \`acmefinance-verify.com\` (adding suffixes to legitimate brand names)\n- \`rnicrosoft.com\` (using 'r' and 'n' together to visually mimic 'm')\n\n#### Verification Protocol:\n1. Check the true envelope sender address.\n2. Never enter corporate credentials on non-company domains.\n3. Report suspicious emails via the **Report Phish** button in your mail client.`,
      duration: 6,
      order: 2,
      isRequired: true
    });

    const lesson1_3 = await Lesson.create({
      courseId: course1._id,
      moduleId: mod1._id,
      title: 'Business Email Compromise (BEC) & Wire Fraud Protocol',
      description: 'How to handle emergency fund transfer or vendor bank detail modification requests.',
      contentType: 'TEXT',
      textContent: `### Business Email Compromise (BEC)\n\nBEC attacks cause billions in corporate losses annually.\n\n#### Mandatory Verification Checklist:\n- **Out-of-Band Confirmation:** If an executive or vendor requests a change in banking details or urgent funds transfer via email, **YOU MUST verify via a secondary known channel** (e.g., in-person or direct phone call using established corporate numbers).\n- Never use the phone number provided inside the suspicious email.`,
      duration: 7,
      order: 3,
      isRequired: true
    });

    // Questions for Course 1
    const q1 = await Question.create({
      questionText: 'An email from your CEO requests an urgent $45,000 gift card or wire transfer for a confidential vendor. What should you do first?',
      type: 'MCQ_SINGLE',
      options: [
        { text: 'Comply immediately since it is from senior management', isCorrect: false },
        { text: 'Verify the request through an out-of-band communication channel (e.g., calling the CEO on their verified number)', isCorrect: true },
        { text: 'Reply to the email asking for confirmation', isCorrect: false },
        { text: 'Forward the email to your personal account to inspect it', isCorrect: false }
      ],
      correctAnswer: 1,
      explanation: 'Always verify unusual financial requests out-of-band using an established, trusted phone number or in-person check. Never rely on email replies as the mailbox may be compromised.',
      difficulty: 'MEDIUM',
      category: 'Email Security',
      points: 20,
      createdBy: superAdmin._id
    });

    const q2 = await Question.create({
      questionText: 'Which of the following email sender addresses is an example of typosquatting for "paypal.com"?',
      type: 'MCQ_SINGLE',
      options: [
        { text: 'support@paypal.com', isCorrect: false },
        { text: 'service@paypaI.com (using uppercase "I" instead of "l")', isCorrect: true },
        { text: 'billing@paypal.com', isCorrect: false },
        { text: 'alerts@paypal.com', isCorrect: false }
      ],
      correctAnswer: 1,
      explanation: 'Typosquatting replaces visually similar characters (like capital I for lowercase l) to deceive busy recipients.',
      difficulty: 'EASY',
      category: 'Email Security',
      points: 20,
      createdBy: superAdmin._id
    });

    const q3 = await Question.create({
      questionText: 'What is the safest way to verify the true URL of a hyperlink in an email without clicking it?',
      type: 'MCQ_SINGLE',
      options: [
        { text: 'Click it in incognito browser mode', isCorrect: false },
        { text: 'Hover your cursor over the link to preview the destination URL', isCorrect: true },
        { text: 'Copy the link and post it into Slack to ask a colleague', isCorrect: false },
        { text: 'Inspect the email date header', isCorrect: false }
      ],
      correctAnswer: 1,
      explanation: 'Hovering over the hyperlink displays the underlying target URL in your mail client status bar before any network request occurs.',
      difficulty: 'EASY',
      category: 'Email Security',
      points: 20,
      createdBy: superAdmin._id
    });

    const q4 = await Question.create({
      questionText: 'You receive an unsolicited email with an attached zip file named "Overdue_Invoice_9823.zip". How should you handle it?',
      type: 'MCQ_SINGLE',
      options: [
        { text: 'Open it to see if it belongs to your department', isCorrect: false },
        { text: 'Do not open the attachment and report the email immediately to the Information Security team', isCorrect: true },
        { text: 'Send it to the billing team directly', isCorrect: false },
        { text: 'Rename the file extension to .txt', isCorrect: false }
      ],
      correctAnswer: 1,
      explanation: 'Unsolicited compressed attachments (ZIP, ISO, RAR) frequently deliver malware loaders. Do not open or decompress them.',
      difficulty: 'MEDIUM',
      category: 'Email Security',
      points: 20,
      createdBy: superAdmin._id
    });

    const q5 = await Question.create({
      questionText: 'What is "Smishing"?',
      type: 'MCQ_SINGLE',
      options: [
        { text: 'A phishing attack conducted over SMS text messaging', isCorrect: true },
        { text: 'A denial of service attack on corporate firewalls', isCorrect: false },
        { text: 'A password decryption tool', isCorrect: false },
        { text: 'Phishing conducted via video conference avatars', isCorrect: false }
      ],
      correctAnswer: 0,
      explanation: 'Smishing is SMS-based phishing, where fraudulent text messages attempt to trick recipients into clicking malicious links or sharing MFA codes.',
      difficulty: 'EASY',
      category: 'Email Security',
      points: 20,
      createdBy: superAdmin._id
    });

    const quiz1 = await Quiz.create({
      title: 'Phishing Defense & Threat Recognition Assessment',
      courseId: course1._id,
      questions: [q1._id, q2._id, q3._id, q4._id, q5._id],
      passingScore: 80,
      timeLimit: 15,
      attemptsAllowed: 3,
      status: 'ACTIVE'
    });

    // COURSE 2: Password Hygiene & Multi-Factor Authentication
    const course2 = await Course.create({
      title: 'Password Hygiene, Credential Security & MFA',
      slug: 'password-hygiene-mfa-security',
      description: 'Learn modern passphrase generation, password manager deployment, FIDO2/hardware tokens, and defense against credential stuffing.',
      category: 'Identity & Access',
      difficulty: 'BEGINNER',
      estimatedDuration: 15,
      passingScore: 80,
      certificateEligible: true,
      status: 'PUBLISHED',
      createdBy: superAdmin._id
    });

    const mod2 = await Module.create({
      courseId: course2._id,
      title: 'Module 1: Strong Authentication Protocols',
      order: 1,
      description: 'Best practices for securing organizational logins.'
    });

    const lesson2_1 = await Lesson.create({
      courseId: course2._id,
      moduleId: mod2._id,
      title: 'Creating Uncrackable Passphrases',
      description: 'Why length outperforms complexity and how to construct easy-to-remember, hard-to-crack passphrases.',
      contentType: 'TEXT',
      textContent: `### Why Passphrase Length Matters\n\nA 16-character passphrase composed of random words (e.g., \`velvet-orbit-lantern-compass\`) takes quadrillions of years to brute-force, while an 8-character complex password like \`P@ss12#$\` can be cracked in hours with modern GPU clusters.\n\n#### Core Principles:\n1. Minimum 14–16 characters.\n2. Never reuse passwords across corporate and personal accounts.\n3. Utilize an approved corporate Password Manager.`,
      duration: 5,
      order: 1,
      isRequired: true
    });

    const lesson2_2 = await Lesson.create({
      courseId: course2._id,
      moduleId: mod2._id,
      title: 'Understanding Multi-Factor Authentication (MFA)',
      description: 'Hardware tokens vs. Authenticator Apps vs. SMS verification.',
      contentType: 'TEXT',
      textContent: `### MFA Tiers of Security\n\n- **Phishing-Resistant MFA (Highest):** FIDO2 hardware security keys (e.g., YubiKey) and Passkeys.\n- **App-Based Push & TOTP (High):** Microsoft Authenticator, Google Authenticator, Duo.\n- **SMS / Voice (Basic):** Vulnerable to SIM swapping; avoid if stronger options exist.\n\n#### Never Approve Unexpected Push Prompts:\nIf your phone prompts for MFA approval when you did not attempt to log in, **Deny the request and report MFA Fatigue attack immediately.**`,
      duration: 6,
      order: 2,
      isRequired: true
    });

    const q2_1 = await Question.create({
      questionText: 'Your phone receives multiple consecutive MFA approval prompts while you are sleeping. What should you do?',
      type: 'MCQ_SINGLE',
      options: [
        { text: 'Approve one so the notifications stop', isCorrect: false },
        { text: 'Deny the prompts and immediately change your password and report the incident', isCorrect: true },
        { text: 'Ignore them and go back to sleep without doing anything', isCorrect: false },
        { text: 'Uninstall your authenticator app', isCorrect: false }
      ],
      correctAnswer: 1,
      explanation: 'Repeated unauthorized MFA prompts indicate an "MFA Bombing / Fatigue" attack where an adversary has your password and is trying to annoy you into approving.',
      difficulty: 'MEDIUM',
      category: 'Access Control',
      points: 25,
      createdBy: superAdmin._id
    });

    const q2_2 = await Question.create({
      questionText: 'Which of the following creates the most resilient credential against automated brute-force attacks?',
      type: 'MCQ_SINGLE',
      options: [
        { text: '8-character password with symbols like "T#9!k$"', isCorrect: false },
        { text: '16+ character passphrase using 4+ random words like "meadow-copper-guitar-fable"', isCorrect: true },
        { text: 'Your company name followed by the current year "Acme2026!"', isCorrect: false },
        { text: 'Your family pet name and birthday', isCorrect: false }
      ],
      correctAnswer: 1,
      explanation: 'Mathematical entropy scales exponentially with length. A 16+ character multi-word passphrase is overwhelmingly harder to brute force.',
      difficulty: 'EASY',
      category: 'Access Control',
      points: 25,
      createdBy: superAdmin._id
    });

    const q2_3 = await Question.create({
      questionText: 'Why is reusing passwords across different websites dangerous?',
      type: 'MCQ_SINGLE',
      options: [
        { text: 'It slows down web browser rendering', isCorrect: false },
        { text: 'If one site experiences a data breach, attackers use those credentials in credential-stuffing attacks across other sites', isCorrect: true },
        { text: 'It causes SSL certificate expiration', isCorrect: false },
        { text: 'It triggers automatic browser updates', isCorrect: false }
      ],
      correctAnswer: 1,
      explanation: 'Credential stuffing is the automated injection of breached username/password pairs into corporate portals.',
      difficulty: 'EASY',
      category: 'Access Control',
      points: 25,
      createdBy: superAdmin._id
    });

    const q2_4 = await Question.create({
      questionText: 'What is the most secure form of Multi-Factor Authentication?',
      type: 'MCQ_SINGLE',
      options: [
        { text: 'SMS Text Message Codes', isCorrect: false },
        { text: 'FIDO2 Hardware Security Keys (e.g., YubiKey / WebAuthn)', isCorrect: true },
        { text: 'Email Verification Link', isCorrect: false },
        { text: 'Security Questions like "Mother\'s Maiden Name"', isCorrect: false }
      ],
      correctAnswer: 1,
      explanation: 'FIDO2 / WebAuthn hardware keys cryptographically bind the authentication handshake to the true browser origin, making phishing impossible.',
      difficulty: 'MEDIUM',
      category: 'Access Control',
      points: 25,
      createdBy: superAdmin._id
    });

    const quiz2 = await Quiz.create({
      title: 'Credential Hygiene & Access Control Exam',
      courseId: course2._id,
      questions: [q2_1._id, q2_2._id, q2_3._id, q2_4._id],
      passingScore: 75,
      timeLimit: 15,
      attemptsAllowed: 3,
      status: 'ACTIVE'
    });

    // COURSE 3: Ransomware Defense
    const course3 = await Course.create({
      title: 'Ransomware Defense & Rapid Incident Response',
      slug: 'ransomware-defense-incident-response',
      description: 'Understand how modern double-extortion ransomware infiltrates corporate endpoints and the critical 15-minute response protocol.',
      category: 'Threat Defense',
      difficulty: 'INTERMEDIATE',
      estimatedDuration: 25,
      passingScore: 80,
      certificateEligible: true,
      status: 'PUBLISHED',
      createdBy: superAdmin._id
    });

    const mod3 = await Module.create({
      courseId: course3._id,
      title: 'Module 1: Ransomware Containment Protocols',
      order: 1,
      description: 'Emergency actions when suspicious system activity is detected.'
    });

    await Lesson.create({
      courseId: course3._id,
      moduleId: mod3._id,
      title: 'Immediate Containment Steps for Suspected Infection',
      description: 'Actionable steps in the first 5 minutes of a ransomware execution.',
      contentType: 'TEXT',
      textContent: `### Emergency Response: First 5 Minutes\n\nIf files start gaining strange extensions (e.g. \`.locked\`, \`.crypt\`) or a ransom demand wallpaper appears:\n\n1. **Disconnect Network Instantly:** Unplug ethernet cables and disconnect Wi-Fi. Do not wait.\n2. **Do Not Power Off:** Powering off can wipe ephemeral RAM evidence. Put machine to sleep or isolate from network.\n3. **Call Incident Response Immediately:** Alert the internal Security Operations Center (SOC) using your emergency contact.`,
      duration: 8,
      order: 1,
      isRequired: true
    });

    // 7. Create Training Campaigns for Acme
    const campaign1 = await Campaign.create({
      companyId: acmeCompany._id,
      name: '2026 Annual Cybersecurity Awareness Program',
      description: 'Mandatory organizational awareness training for all employees covering phishing defenses, credential security, and threat response.',
      courses: [course1._id, course2._id],
      targetType: 'ALL_EMPLOYEES',
      targetDepartments: [],
      targetUsers: [],
      startDate: new Date('2026-09-01'),
      dueDate: new Date('2026-10-31'),
      passingRequirement: 80,
      status: 'ACTIVE',
      createdBy: acmeAdmin._id
    });

    const campaign2 = await Campaign.create({
      companyId: acmeCompany._id,
      name: 'Q3 Spear-Phishing & Wire Fraud Defense',
      description: 'Targeted refresher campaign for financial traders, analysts, and accounting executives handling monetary transactions.',
      courses: [course1._id],
      targetType: 'DEPARTMENT',
      targetDepartments: [acmeDepts[1]._id],
      startDate: new Date('2026-09-10'),
      dueDate: new Date('2026-09-30'),
      passingRequirement: 80,
      status: 'ACTIVE',
      createdBy: acmeAdmin._id
    });

    // 8. Enrollments & Progress for Ahmed
    // Ahmed: In Progress on Course 1 (Phishing), Completed Course 2 (Password Hygiene)
    const ahmedEnrollment1 = await Enrollment.create({
      companyId: acmeCompany._id,
      userId: ahmed._id,
      campaignId: campaign1._id,
      courseId: course1._id,
      status: 'IN_PROGRESS',
      progressPercentage: 66,
      assignedAt: new Date('2026-09-01'),
      startedAt: new Date('2026-09-05'),
      dueDate: new Date('2026-10-31')
    });

    // Mark 2 lessons as completed for Ahmed in Course 1
    await Progress.create({
      userId: ahmed._id,
      companyId: acmeCompany._id,
      enrollmentId: ahmedEnrollment1._id,
      courseId: course1._id,
      lessonId: lesson1_1._id,
      completed: true,
      completedAt: new Date('2026-09-05'),
      watchProgress: 100
    });

    await Progress.create({
      userId: ahmed._id,
      companyId: acmeCompany._id,
      enrollmentId: ahmedEnrollment1._id,
      courseId: course1._id,
      lessonId: lesson1_2._id,
      completed: true,
      completedAt: new Date('2026-09-06'),
      watchProgress: 100
    });

    // Ahmed completed Course 2 with a 100% score and an issued certificate!
    const ahmedEnrollment2 = await Enrollment.create({
      companyId: acmeCompany._id,
      userId: ahmed._id,
      campaignId: campaign1._id,
      courseId: course2._id,
      status: 'COMPLETED',
      progressPercentage: 100,
      assignedAt: new Date('2026-09-01'),
      startedAt: new Date('2026-09-02'),
      completedAt: new Date('2026-09-03'),
      dueDate: new Date('2026-10-31')
    });

    await Progress.create({
      userId: ahmed._id,
      companyId: acmeCompany._id,
      enrollmentId: ahmedEnrollment2._id,
      courseId: course2._id,
      lessonId: lesson2_1._id,
      completed: true,
      completedAt: new Date('2026-09-03')
    });

    await Progress.create({
      userId: ahmed._id,
      companyId: acmeCompany._id,
      enrollmentId: ahmedEnrollment2._id,
      courseId: course2._id,
      lessonId: lesson2_2._id,
      completed: true,
      completedAt: new Date('2026-09-03')
    });

    // Issue Ahmed's verified certificate
    console.log('[Seed] Generating verified certificate for Ahmed Khan...');
    const ahmedCert = await issueCertificate({
      user: ahmed,
      company: acmeCompany,
      course: course2,
      campaignId: campaign1._id,
      score: 100
    });
    console.log(`[Seed] Issued Certificate: ${ahmedCert.certificateId}`);

    // Create enrollments for other employees
    await Enrollment.create([
      {
        companyId: acmeCompany._id,
        userId: sara._id,
        campaignId: campaign1._id,
        courseId: course1._id,
        status: 'ASSIGNED',
        progressPercentage: 0,
        dueDate: new Date('2026-10-31')
      },
      {
        companyId: acmeCompany._id,
        userId: usman._id,
        campaignId: campaign1._id,
        courseId: course1._id,
        status: 'COMPLETED',
        progressPercentage: 100,
        completedAt: new Date('2026-09-08'),
        dueDate: new Date('2026-10-31')
      },
      {
        companyId: acmeCompany._id,
        userId: fatima._id,
        campaignId: campaign1._id,
        courseId: course1._id,
        status: 'IN_PROGRESS',
        progressPercentage: 33,
        dueDate: new Date('2026-10-31')
      },
      {
        companyId: acmeCompany._id,
        userId: bilal._id,
        campaignId: campaign1._id,
        courseId: course1._id,
        status: 'ASSIGNED',
        progressPercentage: 0,
        dueDate: new Date('2026-10-31')
      }
    ]);

    // Issue certificate for Usman as well
    await issueCertificate({
      user: usman,
      company: acmeCompany,
      course: course1,
      campaignId: campaign1._id,
      score: 95
    });

    console.log('======================================================');
    console.log('✅ CYBERAWARE DATABASE SEEDED SUCCESSFULLY');
    console.log('------------------------------------------------------');
    console.log('👥 Demo Credentials:');
    console.log('1. Super Admin:   superadmin@cyberaware.io / Password123!');
    console.log('2. Company Admin: admin@acmefinance.com   / Password123!');
    console.log('3. Employee:      ahmed@acmefinance.com   / Password123!');
    console.log('4. Certificate:   ' + ahmedCert.certificateId);
    console.log('======================================================');
  } catch (err) {
    console.error('[Seed Error]:', err);
  }
};

if (require.main === module) {
  const { connectDB, disconnectDB } = require('../config/database');
  (async () => {
    await connectDB();
    await seedData();
    await disconnectDB();
    process.exit(0);
  })();
}

module.exports = { seedData };
