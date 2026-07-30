import { useState } from 'react'
import { PlusOutlined, TeamOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  App,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  type TableColumnsType,
} from 'antd'
import { apiRequest } from '../api'
import { PageHeading } from '../components/PageHeading'
import type { Department, Role, User } from '../types'

interface CreateUserValues {
  username: string
  password: string
  display_name: string
  email?: string
  department_id: number
  role_ids: number[]
}

export function UsersPage() {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm<CreateUserValues>()
  const queryClient = useQueryClient()
  const { message } = App.useApp()

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiRequest<User[]>('/api/admin/users'),
  })
  const rolesQuery = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => apiRequest<Role[]>('/api/admin/roles'),
  })
  const departmentsQuery = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => apiRequest<Department[]>('/api/admin/departments'),
  })

  const createMutation = useMutation({
    mutationFn: (values: CreateUserValues) =>
      apiRequest<User>('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(values),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      message.success('员工账号已创建')
      setOpen(false)
      form.resetFields()
    },
    onError: (error: Error) => message.error(error.message),
  })

  const columns: TableColumnsType<User> = [
    {
      title: '员工',
      dataIndex: 'display_name',
      key: 'display_name',
      render: (value: string, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{value}</Typography.Text>
          <Typography.Text type="secondary">@{record.username}</Typography.Text>
        </Space>
      ),
    },
    {
      title: '部门',
      key: 'department',
      render: (_, record) => record.department?.name ?? '未分配',
    },
    {
      title: '角色',
      key: 'roles',
      render: (_, record) => (
        <Space wrap>
          {record.roles.map((role) => (
            <Tag key={role.id} color={role.code === 'ADMIN' ? 'green' : undefined}>
              {role.name}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      render: (value?: string) => value || '—',
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'success' : 'default'}>
          {enabled ? '已启用' : '已停用'}
        </Tag>
      ),
    },
  ]

  return (
    <div>
      <PageHeading
        eyebrow="IDENTITY"
        title="用户管理"
        description="创建真实员工账号，并将部门与角色一次性写入 OceanBase。"
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            创建员工
          </Button>
        }
      />
      <Card className="data-card">
        <div className="data-card__meta">
          <Space>
            <TeamOutlined />
            <Typography.Text strong>
              {usersQuery.data?.length ?? 0} 个账号
            </Typography.Text>
          </Space>
          <Typography.Text type="secondary">数据源 · Core API</Typography.Text>
        </div>
        <Table<User>
          rowKey="id"
          columns={columns}
          dataSource={usersQuery.data}
          loading={usersQuery.isLoading}
          pagination={false}
          scroll={{ x: 760 }}
        />
      </Card>

      <Modal
        title="创建普通员工"
        open={open}
        okText="创建账号"
        cancelText="取消"
        confirmLoading={createMutation.isPending}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form<CreateUserValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={(values) => createMutation.mutate(values)}
          initialValues={{
            role_ids: rolesQuery.data
              ?.filter((role) => role.code === 'EMPLOYEE')
              .map((role) => role.id),
          }}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              {
                pattern: /^[A-Za-z][A-Za-z0-9._-]*$/,
                message: '以字母开头，可使用字母、数字、点、下划线和连字符',
              },
            ]}
          >
            <Input placeholder="例如 wang.xiaoming" autoComplete="off" />
          </Form.Item>
          <Form.Item
            label="姓名"
            name="display_name"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="员工姓名" />
          </Form.Item>
          <Form.Item
            label="初始密码"
            name="password"
            rules={[
              { required: true, message: '请输入初始密码' },
              { min: 8, message: '密码至少 8 位' },
            ]}
          >
            <Input.Password placeholder="至少 8 位" autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            label="邮箱（可选）"
            name="email"
            rules={[{ type: 'email', message: '邮箱格式不正确' }]}
          >
            <Input placeholder="name@example.com" />
          </Form.Item>
          <Form.Item
            label="部门"
            name="department_id"
            rules={[{ required: true, message: '请选择部门' }]}
          >
            <Select
              loading={departmentsQuery.isLoading}
              options={departmentsQuery.data?.map((department) => ({
                value: department.id,
                label: `${department.name} · ${department.code}`,
              }))}
              placeholder="选择部门"
            />
          </Form.Item>
          <Form.Item
            label="角色"
            name="role_ids"
            rules={[{ required: true, message: '至少选择一个角色' }]}
          >
            <Select
              mode="multiple"
              loading={rolesQuery.isLoading}
              options={rolesQuery.data?.map((role) => ({
                value: role.id,
                label: `${role.name} · ${role.code}`,
              }))}
              placeholder="选择角色"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

