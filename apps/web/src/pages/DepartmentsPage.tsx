import { useState } from 'react'
import { ApartmentOutlined, PlusOutlined } from '@ant-design/icons'
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
import type { Department } from '../types'

interface CreateDepartmentValues {
  code: string
  name: string
}

export function DepartmentsPage() {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm<CreateDepartmentValues>()
  const queryClient = useQueryClient()
  const { message } = App.useApp()

  const query = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => apiRequest<Department[]>('/api/admin/departments'),
  })
  const mutation = useMutation({
    mutationFn: (values: CreateDepartmentValues) =>
      apiRequest<Department>('/api/admin/departments', {
        method: 'POST',
        body: JSON.stringify(values),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-departments'] })
      message.success('部门已创建')
      setOpen(false)
      form.resetFields()
    },
    onError: (error: Error) => message.error(error.message),
  })

  const columns: TableColumnsType<Department> = [
    {
      title: '部门名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Typography.Text strong>{name}</Typography.Text>,
    },
    {
      title: '部门编码',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Tag>{code}</Tag>,
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
        eyebrow="ORGANIZATION"
        title="部门管理"
        description="维护员工所属组织，创建账号时必须分配一个有效部门。"
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            新建部门
          </Button>
        }
      />
      <Card className="data-card">
        <div className="data-card__meta">
          <Space>
            <ApartmentOutlined />
            <Typography.Text strong>{query.data?.length ?? 0} 个部门</Typography.Text>
          </Space>
          <Typography.Text type="secondary">组织数据 · OceanBase</Typography.Text>
        </div>
        <Table<Department>
          rowKey="id"
          columns={columns}
          dataSource={query.data}
          loading={query.isLoading}
          pagination={false}
        />
      </Card>
      <Modal
        title="新建部门"
        open={open}
        okText="创建部门"
        cancelText="取消"
        confirmLoading={mutation.isPending}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form<CreateDepartmentValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={(values) => mutation.mutate(values)}
        >
          <Form.Item
            name="code"
            label="部门编码"
            normalize={(value: string) => value.toUpperCase()}
            rules={[
              { required: true, message: '请输入部门编码' },
              {
                pattern: /^[A-Za-z][A-Za-z0-9_-]*$/,
                message: '以字母开头，可使用字母、数字、下划线和连字符',
              },
            ]}
          >
            <Input placeholder="例如 PRODUCT" />
          </Form.Item>
          <Form.Item
            name="name"
            label="部门名称"
            rules={[{ required: true, message: '请输入部门名称' }]}
          >
            <Input placeholder="例如 产品中心" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

