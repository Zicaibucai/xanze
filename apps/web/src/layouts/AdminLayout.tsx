import { useState } from 'react'
import {
  ApartmentOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Avatar, Button, Layout, Menu, Space, Tag, Typography } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { Brand } from '../components/Brand'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/admin/users', icon: <TeamOutlined />, label: '用户管理' },
  {
    key: '/admin/roles',
    icon: <SafetyCertificateOutlined />,
    label: '角色管理',
  },
  {
    key: '/admin/departments',
    icon: <ApartmentOutlined />,
    label: '部门管理',
  },
]

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <Layout className="admin-shell">
      <Sider
        width={252}
        collapsedWidth={80}
        collapsed={collapsed}
        className="admin-sider"
        breakpoint="lg"
        onBreakpoint={setCollapsed}
      >
        <div className="admin-sider__brand">
          <Brand compact={collapsed} />
        </div>
        <div className="admin-sider__caption">
          {!collapsed && <span>系统与权限</span>}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
        <div className="admin-sider__footer">
          {!collapsed && <span>阶段 1 · 基础闭环</span>}
        </div>
      </Sider>
      <Layout>
        <Header className="admin-header">
          <Button
            type="text"
            aria-label={collapsed ? '展开导航' : '收起导航'}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed((value) => !value)}
          />
          <Space size={12}>
            <Tag color="green">管理员</Tag>
            <Avatar>{user?.display_name.slice(0, 1)}</Avatar>
            <div className="admin-header__identity">
              <Typography.Text strong>{user?.display_name}</Typography.Text>
              <Typography.Text type="secondary">{user?.username}</Typography.Text>
            </div>
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
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

