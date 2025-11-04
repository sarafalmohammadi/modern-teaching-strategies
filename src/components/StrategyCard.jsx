import { Link } from 'react-router-dom'

export default function StrategyCard({ id, name, excerpt }) {
  return (
    <Link to={`/strategies/${id}`} className="card card-hover p-4 block">
      <h3 className="text-lg font-bold text-qassimDark">{name}</h3>
      <p className="text-sm text-gray-600 mt-2 line-clamp-3">{excerpt}</p>
    </Link>
  )
}
