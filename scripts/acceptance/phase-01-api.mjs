const baseUrl = process.env.API_BASE_URL ?? 'http://web'
const adminUsername = process.env.XANZE_DEV_ADMIN_USERNAME ?? 'admin'
const adminPassword = process.env.XANZE_DEV_ADMIN_PASSWORD ?? 'Admin123!'
const persistentUsername = 'phase01.employee'
const persistentPassword =
  process.env.PHASE01_EMPLOYEE_PASSWORD ?? 'Phase01Persistent123!'

async function request(path, { cookie, ...init } = {}) {
  const headers = new Headers(init.headers)
  headers.set('X-Request-ID', `phase01-${Date.now()}`)
  if (init.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (cookie) {
    headers.set('Cookie', cookie)
  }
  return fetch(`${baseUrl}${path}`, { ...init, headers })
}

async function json(response) {
  const body = await response.json()
  if (!response.ok) {
    throw new Error(
      `${response.status} ${body.code ?? 'ERROR'}: ${body.message ?? JSON.stringify(body)}`,
    )
  }
  return body
}

async function login(username, password) {
  const response = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  const body = await json(response)
  const setCookie = response.headers.get('set-cookie')
  if (!setCookie) {
    throw new Error('Login response did not set an authentication cookie')
  }
  if ('access_token' in body || 'token' in body) {
    throw new Error('Authentication token must not be exposed in the response body')
  }
  return { cookie: setCookie.split(';', 1)[0], user: body.user }
}

async function prepare() {
  const admin = await login(adminUsername, adminPassword)
  if (!admin.user.roles.some((role) => role.code === 'ADMIN')) {
    throw new Error('Configured administrator does not have ADMIN role')
  }

  const [users, roles, departments] = await Promise.all([
    json(await request('/api/admin/users', { cookie: admin.cookie })),
    json(await request('/api/admin/roles', { cookie: admin.cookie })),
    json(await request('/api/admin/departments', { cookie: admin.cookie })),
  ])

  const employeeRole = roles.find((role) => role.code === 'EMPLOYEE')
  const department = departments.find((item) => item.enabled)
  if (!employeeRole || !department) {
    throw new Error('Seed must provide an enabled EMPLOYEE role and department')
  }

  if (!users.some((user) => user.username === persistentUsername)) {
    await json(
      await request('/api/admin/users', {
        cookie: admin.cookie,
        method: 'POST',
        body: JSON.stringify({
          username: persistentUsername,
          password: persistentPassword,
          display_name: '阶段一持久化员工',
          email: 'phase01.employee@example.test',
          department_id: department.id,
          role_ids: [employeeRole.id],
        }),
      }),
    )
  }
  process.stdout.write('Persistent acceptance employee is ready.\n')
}

async function verify() {
  const employee = await login(persistentUsername, persistentPassword)
  const me = await json(
    await request('/api/auth/me', {
      cookie: employee.cookie,
    }),
  )
  if (
    me.username !== persistentUsername ||
    !me.department ||
    !me.roles.some((role) => role.code === 'EMPLOYEE')
  ) {
    throw new Error('Persisted employee lost its department or role assignment')
  }

  const forbidden = await request('/api/admin/users', {
    cookie: employee.cookie,
  })
  const error = await forbidden.json()
  if (
    forbidden.status !== 403 ||
    error.code !== 'FORBIDDEN' ||
    typeof error.request_id !== 'string' ||
    !error.request_id
  ) {
    throw new Error(
      `Expected unified 403 error, got ${forbidden.status} ${JSON.stringify(error)}`,
    )
  }
  process.stdout.write('Persistence and backend authorization checks passed.\n')
}

const mode = process.argv[2]
if (mode === 'prepare') {
  await prepare()
} else if (mode === 'verify') {
  await verify()
} else {
  throw new Error('Usage: phase-01-api.mjs <prepare|verify>')
}

