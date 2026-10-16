import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <p>
      Page not found. <Link to="/" className="underline">Go to the home page</Link>.
    </p>
  )
}
