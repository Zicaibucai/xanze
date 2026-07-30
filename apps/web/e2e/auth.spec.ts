import { expect, test, type Page } from '@playwright/test'

const adminUsername = process.env.XANZE_DEV_ADMIN_USERNAME ?? 'admin'
const adminPassword = process.env.XANZE_DEV_ADMIN_PASSWORD ?? 'Admin123!'
const employeeUsername = process.env.XANZE_DEV_EMPLOYEE_USERNAME ?? 'employee'
const employeePassword =
  process.env.XANZE_DEV_EMPLOYEE_PASSWORD ?? 'Employee123!'

async function login(page: Page, username: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('用户名').fill(username)
  await page.getByLabel('密码').fill(password)
  await page.getByRole('button', { name: '登录' }).click()
}

test('管理员登录后进入用户管理', async ({ page }) => {
  await login(page, adminUsername, adminPassword)

  await expect(page).toHaveURL(/\/admin\/users$/)
  await expect(page.getByRole('heading', { name: '用户管理' })).toBeVisible()
  await expect(page.getByText('系统管理员').first()).toBeVisible()
  await expect(page.getByRole('button', { name: '创建员工' })).toBeVisible()
})

test('普通员工登录后只能进入门户且管理 API 返回 403', async ({ page }) => {
  await login(page, employeeUsername, employeePassword)

  await expect(page).toHaveURL(/\/portal$/)
  await expect(page.getByText('员工工作台')).toBeVisible()
  await expect(page.getByRole('heading', { name: `你好，开发员工` })).toBeVisible()

  const result = await page.evaluate(async () => {
    const response = await fetch('/api/admin/users', { credentials: 'include' })
    return { status: response.status, body: await response.json() }
  })
  expect(result.status).toBe(403)
  expect(result.body.code).toBe('FORBIDDEN')
  expect(result.body.request_id).toBeTruthy()

  await page.goto('/admin/users')
  await expect(page).toHaveURL(/\/portal$/)
})
