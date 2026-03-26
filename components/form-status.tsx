type FormStatusProps = {
  type: 'success' | 'error' | 'info'
  message: string
}

export default function FormStatus({ type, message }: FormStatusProps) {
  if (!message) return null

  const className =
    type === 'success'
      ? 'rounded-lg border border-green-400/30 bg-green-400/10 px-4 py-3 text-sm text-green-200'
      : type === 'error'
      ? 'rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200'
      : 'rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-200'

  return (
    <p role="status" className={className}>
      {message}
    </p>
  )
}