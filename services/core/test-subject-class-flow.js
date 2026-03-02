// Test subject -> class flow (standard behavior)
// Run from services/core:
//   $env:ASSISTANT_ID="<assistant-or-admin-id>"; node test-subject-class-flow.js
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
    throw new Error(`HTTP ${res.status}: ${res.statusText} | ${JSON.stringify(data)}`);
  }
  return data;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function getAnyLecturerId() {
  const users = await fetchJson(`${BASE_URL}/api/users?role=LECTURER`);
  const lecturer = Array.isArray(users) ? users.find((u) => u.role === 'LECTURER') : null;
  if (!lecturer) throw new Error('No lecturer found to create class');
  return lecturer.id;
}

async function main() {
  const ts = Date.now();
  const subjectId = `sub-test-${ts}`;
  const classId = `class-test-${ts}`;

  console.log('=== Test: Subject does not auto-create Class, manual create works ===');

  const subject = await fetchJson(`${BASE_URL}/api/subjects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': ASSISTANT_ID,
    },
    body: JSON.stringify({
      id: subjectId,
      name: `Subject Test ${ts}`,
      credits: 3,
      faculty: 'Science',
      description: 'test',
    }),
  });
  console.log('✅ Created subject:', subject.id);

  const classesAfterSubject = await fetchJson(`${BASE_URL}/api/classes`);
  const autoCreated = Array.isArray(classesAfterSubject)
    ? classesAfterSubject.some((c) => c.subjectId === subjectId)
    : false;
  assert(!autoCreated, 'Subject should NOT auto-create class (current standard behavior)');
  console.log('✅ Verified: creating subject does not auto-create class');

  const lecturerId = await getAnyLecturerId();

  const classItem = await fetchJson(`${BASE_URL}/api/classes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': ASSISTANT_ID,
    },
    body: JSON.stringify({
      id: classId,
      subjectId,
      lecturerId,
      name: `Class for ${subjectId}`,
      maxCapacity: 40,
      startDate: '2026-02-01T00:00:00.000Z',
      endDate: '2026-06-30T23:59:59.000Z',
      isActive: true,
    }),
  });
  console.log('✅ Created class manually:', classItem.id);

  const classesAfterManualCreate = await fetchJson(`${BASE_URL}/api/classes`);
  const found = Array.isArray(classesAfterManualCreate)
    ? classesAfterManualCreate.some((c) => c.id === classId && c.subjectId === subjectId)
    : false;
  assert(found, 'Manual class creation should be visible in class list');

  console.log('🎉 PASS: subject/class flow is correct.');
  console.log(`Created test data: subject=${subjectId}, class=${classId}`);
}

main().catch((err) => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
