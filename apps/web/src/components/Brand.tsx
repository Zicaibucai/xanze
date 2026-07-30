import { ApartmentOutlined } from '@ant-design/icons'

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? 'brand--compact' : ''}`}>
      <span className="brand__mark" aria-hidden="true">
        <ApartmentOutlined />
      </span>
      {!compact && (
        <span>
          <strong>Xanze</strong>
          <small>企业工作平台</small>
        </span>
      )}
    </div>
  )
}

