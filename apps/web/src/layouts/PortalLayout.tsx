import {
  CheckCircleFilled,
  ClockCircleOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Avatar, Button, Card, Col, Layout, Row, Skeleton, Space, Tag, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../api'
import { useAuth } from '../auth'
import { Brand } from '../components/Brand'
import type { User } from '../types'

interface PortalContext {
  user: User
  server_time: string
}

const { Header, Content } = Layout
const { Title, Paragraph, Text } = Typography

export function PortalLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const contextQuery = useQuery({
    queryKey: ['portal-context'],
    queryFn: () => apiRequest<PortalContext>('/api/portal/context'),
  })

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <Layout className="portal-shell">
      <Header className="portal-header">
        <Brand />
        <Space size={12}>
          <Avatar icon={<UserOutlined />} />
          <Text strong>{user?.display_name}</Text>
          <Button
            data-testid="logout"
            type="text"
            icon={<LogoutOutlined />}
            onClick={() => void handleLogout()}
          >
            退出
          </Button>
        </Space>
      </Header>
      <Content className="portal-content">
        <section className="portal-hero">
          <div>
            <span className="eyebrow">员工工作台</span>
            <Title level={1}>你好，{user?.display_name}</Title>
            <Paragraph>
              这是你在 Xanze 的统一入口。当前阶段仅开放身份与组织基础能力。
            </Paragraph>
          </div>
          <div className="portal-hero__status">
            <CheckCircleFilled />
            <span>
              <strong>账户已启用</strong>
              <small>权限由 Core 服务实时校验</small>
            </span>
          </div>
        </section>

        <section className="portal-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">当前身份</span>
              <Title level={3}>我的组织信息</Title>
            </div>
            <Tag color="green">OceanBase 实时数据</Tag>
          </div>
          {contextQuery.isLoading ? (
            <Card>
              <Skeleton active paragraph={{ rows: 3 }} />
            </Card>
          ) : (
            <Row gutter={[18, 18]}>
              <Col xs={24} md={8}>
                <Card className="identity-card">
                  <UserOutlined />
                  <Text type="secondary">账号</Text>
                  <Title level={4}>{contextQuery.data?.user.username}</Title>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="identity-card">
                  <SafetyCertificateOutlined />
                  <Text type="secondary">角色</Text>
                  <Space wrap>
                    {contextQuery.data?.user.roles.map((role) => (
                      <Tag key={role.id}>{role.name}</Tag>
                    ))}
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="identity-card">
                  <ClockCircleOutlined />
                  <Text type="secondary">部门</Text>
                  <Title level={4}>
                    {contextQuery.data?.user.department?.name ?? '未分配'}
                  </Title>
                </Card>
              </Col>
            </Row>
          )}
        </section>
      </Content>
    </Layout>
  )
}

