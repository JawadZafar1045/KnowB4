const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/database');
const Company = require('../models/Company');
const User = require('../models/User');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
const Campaign = require('../models/Campaign');
const Enrollment = require('../models/Enrollment');

/**
 * seed_training_demo.js
 * 
 * Seeds a complete end-to-end training scenario:
 * 1. Company: "Apex Broadcasting Media Network" (Category: "TV Channels / Media & Broadcasting")
 * 2. Company Admin: admin@apexmedia.test / Password123!
 * 3. Employee Learner: employee@apexmedia.test / Password123!
 * 4. Course: "Broadcast & Media Phishing Defense & Cyber Asset Protection"
 *    - Module 1: Social Engineering & Spear-Phishing
 *      - Lesson 1 (VIDEO via URL): "Video Case Study: Identifying Spear-Phishing & Fake Breaking News Alerts"
 *      - Lesson 2 (TEXT): "Deepfakes, Executive Impersonation & On-Air Spoofing"
 *    - Module 2: Credential Security & MFA Protection
 *      - Lesson 3 (TEXT): "Defending Against MFA Fatigue & Session Hijacking"
 *      - Lesson 4 (EXTERNAL / PDF): "Station Incident Runbook & Emergency Reporting"
 *    - Quiz: 4 questions with explanations, passing score 75%
 * 5. Campaign: "Q4 Station Cyber Defense & Phishing Awareness Campaign" (Status: ACTIVE)
 * 6. Enrollment: Enrolls the test employee so the training is immediately ready to take!
 */
async function seedTrainingDemo() {
  console.log('\n======================================================');
  console.log('🚀 SEEDING TRAINING DEMO: COMPLETE COURSE & CAMPAIGN');
  console.log('======================================================\n');

  // 1. Company
  let company = await Company.findOne({ slug: 'apex-broadcasting-media' });
  if (!company) {
    company = await Company.create({
      name: 'Apex Broadcasting Media Network',
      slug: 'apex-broadcasting-media',
      email: 'security@apexmedia.test',
      phone: '+1-555-0199',
      industry: 'TV Channels / Media & Broadcasting',
      category: 'TV Channels / Media & Broadcasting',
      address: 'Studio Row 4, Media District, New York, NY',
      status: 'ACTIVE',
      subscriptionPlan: 'ENTERPRISE',
      subscriptionStatus: 'ACTIVE',
      branding: {
        primaryColor: '#ea580c',
        secondaryColor: '#0f172a'
      }
    });
    console.log(`[+] Created Company: ${company.name} (Category: ${company.category})`);
  } else {
    company.category = 'TV Channels / Media & Broadcasting';
    company.industry = 'TV Channels / Media & Broadcasting';
    company.status = 'ACTIVE';
    await company.save();
    console.log(`[*] Using existing Company: ${company.name} (Tenant: ${company.tenantId})`);
  }

  // 2. Company Admin User
  const defaultPasswordHash = await User.hashPassword('Password123!');

  let companyAdmin = await User.findOne({ email: 'admin@apexmedia.test' });
  if (!companyAdmin) {
    companyAdmin = await User.create({
      name: 'Sarah Connor (Station Security Director)',
      email: 'admin@apexmedia.test',
      passwordHash: defaultPasswordHash,
      role: 'COMPANY_ADMIN',
      companyId: company._id,
      jobTitle: 'Director of Information Security',
      status: 'ACTIVE'
    });
    console.log(`[+] Created Company Admin: ${companyAdmin.email}`);
  } else {
    companyAdmin.companyId = company._id;
    companyAdmin.role = 'COMPANY_ADMIN';
    companyAdmin.status = 'ACTIVE';
    await companyAdmin.save();
    console.log(`[*] Updated Company Admin: ${companyAdmin.email}`);
  }

  // 3. Employee User
  let employee = await User.findOne({ email: 'employee@apexmedia.test' });
  if (!employee) {
    employee = await User.create({
      name: 'Alex Rivera (Broadcast Production Lead)',
      email: 'employee@apexmedia.test',
      passwordHash: defaultPasswordHash,
      role: 'EMPLOYEE',
      companyId: company._id,
      jobTitle: 'Senior Broadcast Producer',
      status: 'ACTIVE'
    });
    console.log(`[+] Created Test Employee: ${employee.email}`);
  } else {
    employee.companyId = company._id;
    employee.role = 'EMPLOYEE';
    employee.status = 'ACTIVE';
    await employee.save();
    console.log(`[*] Updated Test Employee: ${employee.email}`);
  }

  // 4. Course (Master Course authored by platform, tailored for Media & TV)
  const courseSlug = 'broadcast-media-phishing-defense';
  let course = await Course.findOne({ slug: courseSlug });

  if (course) {
    console.log(`[*] Cleaning up previous course data for slug: ${courseSlug}...`);
    const oldModules = await Module.find({ courseId: course._id });
    const oldModuleIds = oldModules.map(m => m._id);
    await Lesson.deleteMany({ moduleId: { $in: oldModuleIds } });
    await Module.deleteMany({ courseId: course._id });
    const oldQuiz = await Quiz.findOne({ courseId: course._id });
    if (oldQuiz) {
      await Question.deleteMany({ _id: { $in: oldQuiz.questions } });
      await Quiz.deleteOne({ _id: oldQuiz._id });
    }
    await Course.deleteOne({ _id: course._id });
  }

  course = await Course.create({
    title: 'Broadcast & Media Phishing Defense: Studio & Production Security',
    slug: courseSlug,
    description: 'Comprehensive, high-impact cybersecurity training tailored for newsrooms, TV studios, and media broadcasting organizations. Covers spear-phishing, deepfake audio/video impersonations, MFA fatigue attacks, and broadcast playout security.',
    category: 'Social Engineering & Phishing',
    targetCategory: 'TV Channels / Media & Broadcasting',
    difficulty: 'BEGINNER',
    estimatedDuration: 22,
    passingScore: 75,
    certificateEligible: true,
    status: 'PUBLISHED',
    createdBy: companyAdmin._id
  });
  console.log(`[+] Created Course: "${course.title}"`);

  // --- MODULE 1 ---
  const module1 = await Module.create({
    courseId: course._id,
    title: 'Module 1: The Modern Spear-Phishing Playbook in Media',
    description: 'Understanding targeted email deception, spoofed wire alerts, and social engineering in high-speed newsroom environments.',
    order: 1
  });

  // Lesson 1: VIDEO (Using URL embed)
  const lesson1 = await Lesson.create({
    courseId: course._id,
    moduleId: module1._id,
    title: 'Video Guide: Anatomy of Spear-Phishing & Fake Breaking News Alerts',
    description: 'Watch this 5-minute training video demonstrating how attackers craft deceptive emails targeting broadcast teams.',
    contentType: 'VIDEO',
    contentUrl: 'https://www.youtube.com/watch?v=XBkzBrXllBo',
    textContent: `### Key Video Training Takeaways:

1. **The Sender Verification Rule**:
   - Attackers frequently register lookalike domains such as \`@cbs-newsdesk.com\` or \`@bbc-breakingalerts.org\`.
   - Never rely on the display name alone; hover over or tap the sender header to inspect the actual SMTP address.

2. **Common Media Attack Vectors**:
   - Fake press releases claiming urgent exclusive footage.
   - Bogus legal takedown notices demanding immediate attachment review.
   - Spoofed internal emails from Station Managers requesting credential re-authentication.

3. **Required Action**:
   - If an attachment asks you to "Enable Macros" or requires a secondary login to view, STOP and forward to IT Security immediately.`,
    duration: 6,
    order: 1,
    isRequired: true
  });

  // Lesson 2: TEXT
  const lesson2 = await Lesson.create({
    courseId: course._id,
    moduleId: module1._id,
    title: 'Deepfakes, Executive Voice Cloning & On-Air Social Engineering',
    description: 'Techniques used by adversaries to impersonate station leadership using cloned audio and deepfake video.',
    contentType: 'TEXT',
    textContent: `### AI-Powered Social Engineering in Live Broadcasting

#### 1. Real-World Threat Scenario
Cybercriminals can now synthesize an executive producer's or news director's voice using as little as 3 seconds of archived broadcast audio. During live breaking news or late shifts, attackers call control rooms demanding urgent actions:
- Emergency credential overrides to playout servers.
- Immediate wire transfers for "unbudgeted breaking satellite feeds".
- Pushing unverified files directly to on-air graphics machines.

#### 2. The 3-Step Verification Protocol
- **Step 1**: Never accept verbal authorization alone for security overrides or unscheduled wire transfers.
- **Step 2**: Always call the executive back on their verified internal phone extension or company cell phone.
- **Step 3**: Require dual-party confirmation before installing software or connecting external storage devices to control room suites.

*Golden Rule: Speed is vital in broadcasting, but a cyber incident will knock your station off the air for weeks.*`,
    duration: 6,
    order: 2,
    isRequired: true
  });

  // --- MODULE 2 ---
  const module2 = await Module.create({
    courseId: course._id,
    title: 'Module 2: Credential Defense, MFA & Playout Server Protection',
    description: 'Securing broadcast production networks, newsroom computer systems (NRCS), and preventing credential harvesting.',
    order: 2
  });

  // Lesson 3: TEXT
  const lesson3 = await Lesson.create({
    courseId: course._id,
    moduleId: module2._id,
    title: 'Defending Against MFA Fatigue & Credential Stuffing',
    description: 'How push notifications are weaponized by attackers and how to spot session hijacking.',
    contentType: 'TEXT',
    textContent: `### Multi-Factor Authentication (MFA) Hygiene

#### What is MFA Fatigue?
When attackers compromise your password, they bombard your phone with repeated MFA push notifications at 2:00 AM, betting that fatigue or confusion will cause you to tap "Approve".

#### Mandatory Safety Rules:
- **Rule 1**: NEVER tap "Approve" unless you actively initiated the login at that exact moment.
- **Rule 2**: If you receive a push request you didn't initiate, tap **"Deny"** and click **"Report Fraud"**.
- **Rule 3**: Change your domain password immediately after denying an unauthorized push.

#### Workstation & Newsroom Playout Best Practices:
- Lock your workstation (\`Win + L\` or \`Ctrl + Cmd + Q\`) whenever leaving your editing suite or production desk.
- Never use shared "control room generic" passwords on privileged production networks.`,
    duration: 5,
    order: 1,
    isRequired: true
  });

  // Lesson 4: EXTERNAL RESOURCE / POLICY
  const lesson4 = await Lesson.create({
    courseId: course._id,
    moduleId: module2._id,
    title: 'Emergency Response Checklist & CISA Cybersecurity Guide',
    description: 'Official cybersecurity guidelines for critical broadcast and communications infrastructure.',
    contentType: 'EXTERNAL',
    contentUrl: 'https://www.cisa.gov/cybersecurity-best-practices',
    textContent: `### Station Cybersecurity Escalation Runbook

Please review the external CISA Cybersecurity Best Practices resource link above.

#### Station Emergency Hotline:
- **Internal Extension**: \`x4499\` (24/7 Security Operations Center)
- **Incident Email**: \`soc@apexmedia.test\`
- **Out-of-Band Hotline**: \`+1 (555) 019-9110\`

*If you suspect an on-air machine or playout server is compromised, disconnect network cables immediately and alert the Technical Director.*`,
    duration: 5,
    order: 2,
    isRequired: true
  });

  console.log(`[+] Created 2 Modules and 4 Lessons (including Video URL Embed)`);

  // --- QUIZ & QUESTIONS ---
  const question1 = await Question.create({
    questionText: 'What should you do if you receive an urgent late-night email appearing to come from your Station Director asking for master control playout credentials?',
    type: 'MCQ_SINGLE',
    options: [
      { text: 'Reply immediately with the credentials because breaking news demands rapid action.', isCorrect: false },
      { text: 'Forward the email to a colleague to ask what they think.', isCorrect: false },
      { text: 'Stop, do not reply with credentials, and verify the request directly using a verified internal phone number.', isCorrect: true },
      { text: 'Post a screenshot on social media to ask if anyone else got it.', isCorrect: false }
    ],
    correctAnswer: 2,
    explanation: 'High-value production credentials should never be sent over email. Always verify unexpected urgent requests out-of-band.',
    difficulty: 'MEDIUM',
    category: 'Phishing',
    points: 25,
    createdBy: companyAdmin._id
  });

  const question2 = await Question.create({
    questionText: 'What is an "MFA Fatigue" (or MFA Bombing) attack?',
    type: 'MCQ_SINGLE',
    options: [
      { text: 'When your authentication smartphone runs out of battery.', isCorrect: false },
      { text: 'When an attacker bombards your phone with repeated approval pushes hoping you approve one out of distraction or annoyance.', isCorrect: true },
      { text: 'When an IT department changes passwords every 24 hours.', isCorrect: false },
      { text: 'When two-factor codes fail to send due to cell tower maintenance.', isCorrect: false }
    ],
    correctAnswer: 1,
    explanation: 'MFA fatigue relies on user distraction or frustration. Always reject and report unauthorized push notifications.',
    difficulty: 'MEDIUM',
    category: 'Identity & Access',
    points: 25,
    createdBy: companyAdmin._id
  });

  const question3 = await Question.create({
    questionText: 'An unsolicited email from an unknown freelance reporter arrives with an attachment named "exclusive_breaking_footage.zip.exe". What is the proper procedure?',
    type: 'MCQ_SINGLE',
    options: [
      { text: 'Extract and double-click the file to preview the video before rival stations do.', isCorrect: false },
      { text: 'Do not open or execute the file, and report it immediately via the Phishing Report button or IT Security.', isCorrect: true },
      { text: 'Rename the file extension from .exe to .mp4 so the media player can open it safely.', isCorrect: false },
      { text: 'Upload the executable directly to the station live broadcast graphics server.', isCorrect: false }
    ],
    correctAnswer: 1,
    explanation: 'Double extensions like ".zip.exe" are signature malware delivery vehicles. Renaming or executing them risks ransomware.',
    difficulty: 'EASY',
    category: 'Malware & Phishing',
    points: 25,
    createdBy: companyAdmin._id
  });

  const question4 = await Question.create({
    questionText: 'Why are broadcast media networks and TV channels high-priority targets for cyber adversaries?',
    type: 'MCQ_SINGLE',
    options: [
      { text: 'Adversaries seek on-air disruption, reputational extortion, and access to live public communications channels.', isCorrect: true },
      { text: 'Television studios use special computers that cannot be infected with malware.', isCorrect: false },
      { text: 'Broadcasting equipment does not use IP addresses.', isCorrect: false },
      { text: 'Attackers only target companies that sell physical goods.', isCorrect: false }
    ],
    correctAnswer: 0,
    explanation: 'Media networks possess tremendous public trust, reach, and real-time infrastructure, making them prime targets for extortion and defacement.',
    difficulty: 'EASY',
    category: 'Security Awareness',
    points: 25,
    createdBy: companyAdmin._id
  });

  const quiz = await Quiz.create({
    title: 'Broadcast & Media Phishing Defense: Final Assessment',
    courseId: course._id,
    questions: [question1._id, question2._id, question3._id, question4._id],
    passingScore: 75,
    timeLimit: 15,
    attemptsAllowed: 3,
    status: 'ACTIVE'
  });
  console.log(`[+] Created Quiz with 4 Questions (Passing Score: ${quiz.passingScore}%)`);

  // --- CAMPAIGN ---
  const campaignName = 'Broadcast Security Awareness Campaign - Q4';
  let campaign = await Campaign.findOne({ companyId: company._id, name: campaignName });

  if (campaign) {
    await Campaign.deleteOne({ _id: campaign._id });
    await Enrollment.deleteMany({ campaignId: campaign._id });
  }

  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  campaign = await Campaign.create({
    companyId: company._id,
    name: campaignName,
    description: 'Mandatory annual cybersecurity and phishing defense certification for all broadcast, production, and editorial team members.',
    courses: [course._id],
    targetType: 'ALL_EMPLOYEES',
    targetUsers: [employee._id],
    startDate: new Date(),
    dueDate,
    passingRequirement: 75,
    status: 'ACTIVE',
    createdBy: companyAdmin._id
  });
  console.log(`[+] Created Active Campaign: "${campaign.name}"`);

  // --- ENROLLMENT FOR TEST EMPLOYEE ---
  let enrollment = await Enrollment.findOne({
    companyId: company._id,
    userId: employee._id,
    courseId: course._id
  });

  if (enrollment) {
    await Enrollment.deleteOne({ _id: enrollment._id });
  }

  enrollment = await Enrollment.create({
    companyId: company._id,
    userId: employee._id,
    campaignId: campaign._id,
    courseId: course._id,
    status: 'ASSIGNED',
    progressPercentage: 0,
    assignedAt: new Date(),
    dueDate
  });
  console.log(`[+] Enrolled Employee "${employee.name}" into Course & Campaign`);

  console.log('\n======================================================');
  console.log('🎉 DEMO ENVIRONMENT READY FOR END-TO-END TESTING');
  console.log('======================================================');
  console.log('1. COMPANY:');
  console.log(`   Name:     ${company.name}`);
  console.log(`   Category: ${company.category}`);
  console.log('------------------------------------------------------');
  console.log('2. COMPANY ADMIN (To test Course Library & Campaign Launch):');
  console.log(`   Email:    admin@apexmedia.test`);
  console.log(`   Password: Password123!`);
  console.log('   Note:     Notice NO "Add Module" or edit buttons in curriculum preview.');
  console.log('             Can launch new campaigns from the tailored catalog!');
  console.log('------------------------------------------------------');
  console.log('3. EMPLOYEE / LEARNER (To test Training & Video completion):');
  console.log(`   Email:    employee@apexmedia.test`);
  console.log(`   Password: Password123!`);
  console.log('   Course:   Broadcast & Media Phishing Defense');
  console.log('   Video:    Includes embedded YouTube video in Lesson 1');
  console.log('   Test:     1. Complete Lesson 1 (Video) -> Click Mark Complete');
  console.log('             2. Complete Lesson 2 & 3 (Readings)');
  console.log('             3. Review Lesson 4 (External runbook)');
  console.log('             4. Take Final Quiz (Pass with >= 75%)');
  console.log('             5. Verify 100% progress & verified Certificate!');
  console.log('======================================================\n');
}

if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedTrainingDemo();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('[Seed Error]:', err);
      process.exit(1);
    }
  })();
}

module.exports = { seedTrainingDemo };
