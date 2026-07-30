import { useState } from 'react'
import { PlusOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  App,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  type TableColumnsType,
} from 'antd'
import { apiRequest } from '../api'
import { PageHeading } from '../components/PageHeading'
import type { Role } from '../types'

interface CreateRoleValues {
  code: string
  name: string
  description?: string
}

export function RolesPage() {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm<CreateRoleValues>()
  const queryClient = useQueryClient()
  const { message } = App.useApp()

  const query = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => apiRequest<Role[]>('/api/admin/roles'),
  })
  const mutation = useMutation({
    mutationFn: (values: CreateRoleValues) =>
      apiRequest<Role>('/api/admin/roles', {
        method: 'POST',
        body: JSON.stringify(values),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
      message.success('角色已创建')
      setOpen(false)
      form.resetFields()
    },
    onError: (error: Error) => message.error(error.message),
  })

  const columns: TableColumnsType<Role> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Typography.Text strong>{name}</Typography.Text>,
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Tag>{code}</Tag>,
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
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
        eyebrow="RBAC"
        title="角色管理"
        description="角色编码会进入 JWT，并由 Spring Security 在每次管理请求上校验。"
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            新建角色
          </Button>
        }
      />
      <Card className="data-card">
        <div className="data-card__meta">
          <Space>
            <SafetyCertificateOutlined />
            <Typography.Text strong>{query.data?.length ?? 0} 个角色</Typography.Text>
          </Space>
          <Typography.Text type="secondary">权限边界 · 后端强制执行</Typography.Text>
        </div>
        <Table<Role>
          rowKey="id"
          columns={columns}
          dataSource={query.data}
          loading={query.isLoading}
          pagination={false}
          scroll={{ x: 640 }}
        />
      </Card>
      <Modal
        title="新建角色"
        open={open}
        okText="创建角色"
        cancelText="取消"
        confirmLoading={mutation.isPending}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form<CreateRoleValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={(values) => mutation.mutate(values)}
        >
          <Form.Item
            name="code"
            label="角色编码"
            normalize={(value: string) => value.toUpperCase()}
            rules={[
              { required: true, message: '请输入角色编码' },
              {
                pattern: /^[A-Za-z][A-Za-z0-9_]*$/,
                message: '以字母开头，只能使用字母、数字和下划线',
              },
            ]}
          >
            <Input placeholder="例如 PROJECT_MANAGER" />
          </Form.Item>
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="例如 项目经理" />
          </Form.Item>
          <Form.Item name="description" label="说明">
            <Input.TextArea rows={3} maxLength={255} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

