import { useEffect, useState } from 'react'
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Alert, Button, Form, Input, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../api'
import { isAdmin, useAuth } from '../auth'
import { Brand } from '../components/Brand'

interface LoginValues {
  username: string
  password: string
}

const { Title, Paragraph, Text } = Typography

export function LoginPage() {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      navigate(isAdmin(user) ? '/admin/users' : '/portal', { replace: true })
    }
  }, [loading, navigate, user])

  const handleSubmit = async (values: LoginValues) => {
    setSubmitting(true)
    setErrorMessage(undefined)
    try {
      const loggedInUser = await login(values.username, values.password)
      navigate(isAdmin(loggedInUser) ? '/admin/users' : '/portal', {
        replace: true,
      })
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? `${error.message}${error.requestId ? `（请求 ${error.requestId}）` : ''}`
          : '暂时无法登录，请稍后重试',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-story">
        <Brand />
        <div className="login-story__copy">
          <span className="eyebrow eyebrow--light">XANZE WORKSPACE</span>
          <Title>让组织、身份与权限，从第一天就可信。</Title>
          <Paragraph>
            一套面向企业的统一工作入口。阶段 1 已接通真实数据、持久化与服务端权限边界。
          </Paragraph>
        </div>
        <div className="login-story__proof">
          <span>
            <CheckCircleOutlined />
            OceanBase 持久化
          </span>
          <span>
            <CheckCircleOutlined />
            服务端 RBAC
          </span>
          <span>
            <CheckCircleOutlined />
            全链路 request_id
          </span>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <div className="login-card__heading">
            <span className="eyebrow">欢迎回来</span>
            <Title level={2}>登录 Xanze</Title>
            <Text type="secondary">使用开发环境 Seed 账号，或管理员创建的员工账号。</Text>
          </div>

          {errorMessage && (
            <Alert
              type="error"
              showIcon
              message={errorMessage}
              className="login-alert"
            />
          )}

          <Form<LoginValues>
            layout="vertical"
            requiredMark={false}
            onFinish={(values) => void handleSubmit(values)}
          >
            <Form.Item
              label="用户名"
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                autoComplete="username"
                prefix={<UserOutlined />}
                placeholder="请输入用户名"
                autoFocus
              />
            </Form.Item>
            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                autoComplete="current-password"
                prefix={<LockOutlined />}
                placeholder="请输入密码"
              />
            </Form.Item>
            <Button
              block
              type="primary"
              htmlType="submit"
              loading={submitting}
              iconPosition="end"
              icon={<ArrowRightOutlined />}
              className="login-submit"
            >
              登录
            </Button>
          </Form>
          <div className="login-card__footnote">
            开发账号由根目录 <code>.env</code> 注入
          </div>
        </div>
      </section>
    </main>
  )
}

