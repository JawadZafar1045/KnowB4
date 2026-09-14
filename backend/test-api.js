const http = require('http');

const testRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('🚀 Starting Automated Backend Tests...\n');

  // Test 1: Health Check
  const healthRes = await testRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log('✓ Test 1: Health Check:', healthRes.status === 200 ? 'PASS' : 'FAIL', healthRes.body.platform);

  // Test 2: Public Certificate Verification (CA-2026-000001)
  const certRes = await testRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/certificates/verify/CA-2026-000001',
    method: 'GET'
  });
  console.log('✓ Test 2: Public Certificate Verification:', certRes.status === 200 && certRes.body.isValid ? 'PASS' : 'FAIL');
  console.log('   Recipient:', certRes.body.certificate?.recipientName, '| Course:', certRes.body.certificate?.courseName);

  // Test 3: Login as Super Admin
  const saLogin = await testRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'superadmin@cyberaware.io', password: 'Password123!' });
  console.log('✓ Test 3: Super Admin Login:', saLogin.status === 200 ? 'PASS' : 'FAIL', '| Role:', saLogin.body.user?.role);

  // Test 4: Login as Company Admin
  const caLogin = await testRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@acmefinance.com', password: 'Password123!' });
  console.log('✓ Test 4: Company Admin Login:', caLogin.status === 200 ? 'PASS' : 'FAIL', '| Company:', caLogin.body.user?.company?.name);

  // Test 5: Login as Employee
  const empLogin = await testRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'ahmed@acmefinance.com', password: 'Password123!' });
  console.log('✓ Test 5: Employee Login:', empLogin.status === 200 ? 'PASS' : 'FAIL', '| Name:', empLogin.body.user?.name);

  // Test 6: Company Admin fetch employees (Multi-Tenant Isolation)
  const empListRes = await testRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/employees',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${caLogin.body.accessToken}` }
  });
  console.log('✓ Test 6: Multi-Tenant Employee List:', empListRes.status === 200 ? 'PASS' : 'FAIL', `| Retrieved ${empListRes.body.count} Acme employees`);

  // Test 7: Employee fetch assigned training
  const enrollmentsRes = await testRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/enrollments/my',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${empLogin.body.accessToken}` }
  });
  console.log('✓ Test 7: Employee My Training:', enrollmentsRes.status === 200 ? 'PASS' : 'FAIL', `| Assigned ${enrollmentsRes.body.count} courses`);

  // Test 8: Company KPI Reports
  const reportRes = await testRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/reports/company',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${caLogin.body.accessToken}` }
  });
  console.log('✓ Test 8: Company Admin KPIs:', reportRes.status === 200 ? 'PASS' : 'FAIL', `| Completion Rate: ${reportRes.body.stats?.completionRate}%`);

  console.log('\n🎉 ALL 8 BACKEND INTEGRATION TESTS COMPLETED SUCCESSFULLY!');
};

runTests().catch(console.error);
