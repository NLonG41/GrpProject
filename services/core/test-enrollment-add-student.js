// Regression test: add student to class enrollment
// Run:
//   ASSISTANT_ID=<admin_or_assistant_id> node test-enrollment-add-student.js
// Optional:
//   CORE_API_URL=http://localhost:4000

const BASE_URL = process.env.CORE_API_URL || 'http://localhost:4000';
const ASSISTANT_ID = process.env.ASSISTANT_ID;

if (!ASSISTANT_ID) {
  console.error('❌ Missing ASSISTANT_ID env var');
  process.exit(1);
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} | ${JSON.stringify(data)}`);
  }
  return data;
}

async function pickStudentAndClass() {
  const [users, classes] = await Promise.all([
    fetchJson(`${BASE_URL}/api/users`),
    fetchJson(`${BASE_URL}/api/classes`),
  ]);

  const student = users.find((u) => u.role === 'STUDENT');
  if (!student) throw new Error('No STUDENT user found');

  const classItem = classes.find((c) => c.isActive !== false);
  if (!classItem) throw new Error('No class found');

  return { student, classItem };
}

async function main() {
  console.log('=== Enrollment add-student regression test ===');
  console.log('Base URL:', BASE_URL);

  // 1) List endpoint should not crash (regression for Prisma P2022)
  const baseline = await fetchJson(`${BASE_URL}/api/enrollments`);
  if (!Array.isArray(baseline)) {
    throw new Error('GET /api/enrollments did not return an array');
  }
  console.log('✅ Baseline enrollments list is healthy:', baseline.length);

  const { student, classItem } = await pickStudentAndClass();
  console.log('Using student:', student.id, student.fullName);
  console.log('Using class:', classItem.id, classItem.name);

  let createdEnrollmentId = null;

  // 2) Create enrollment
  try {
    const created = await fetchJson(`${BASE_URL}/api/enrollments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': ASSISTANT_ID,
      },
      body: JSON.stringify({ studentId: student.id, classId: classItem.id }),
    });

    createdEnrollmentId = created?.id;
    if (!createdEnrollmentId) {
      throw new Error('Enrollment created but missing id in response');
    }

    console.log('✅ Created enrollment:', createdEnrollmentId);
  } catch (err) {
    const msg = String(err?.message || err);
    if (msg.includes('already enrolled') || msg.includes('409')) {
      console.log('ℹ️ Student already enrolled (acceptable for idempotent regression test).');
    } else {
      throw err;
    }
  }

  // 3) Filtered list endpoint should still work and contain enrollment
  const all = await fetchJson(`${BASE_URL}/api/enrollments?classId=${classItem.id}`);
  if (!Array.isArray(all)) {
    throw new Error('GET /api/enrollments?classId=... did not return an array');
  }

  const exists = all.some((e) => e.studentId === student.id && e.classId === classItem.id);
  if (!exists) {
    throw new Error('Enrollment record not found after create/list flow');
  }

  // 4) Detail endpoint should be healthy if we just created a row
  if (createdEnrollmentId) {
    const detail = await fetchJson(`${BASE_URL}/api/enrollments/${createdEnrollmentId}`);
    if (!detail?.id || detail.id !== createdEnrollmentId) {
      throw new Error('GET /api/enrollments/:id returned invalid payload');
    }
  }

  console.log('🎉 PASS: enrollment list/create/detail flow works and no Prisma P2022 in this path.');

  // Keep data by default so user can verify in UI.
  // Uncomment for cleanup if needed:
  // if (createdEnrollmentId) {
  //   await fetchJson(`${BASE_URL}/api/enrollments/${createdEnrollmentId}`, {
  //     method: 'DELETE',
  //     headers: { 'x-user-id': ASSISTANT_ID },
  //   });
  // }
}

main().catch((err) => {
  console.error('❌ Test failed:', err.message || err);
  process.exit(1);
});
