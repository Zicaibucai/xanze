import type { ReactNode } from 'react'
import { Typography } from 'antd'

const { Title, Paragraph } = Typography

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <Title level={2}>{title}</Title>
        <Paragraph>{description}</Paragraph>
      </div>
      {action}
    </div>
  )
}

