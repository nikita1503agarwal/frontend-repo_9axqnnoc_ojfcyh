import React from 'react'

export default function PackageCard({ pkg, selected, onSelect }) {
  const total = (pkg.price ?? 0).toFixed(2)
  return (
    <button
      onClick={() => onSelect(pkg)}
      className={`group relative w-full text-left rounded-xl border p-4 transition-all ${
        selected ? 'border-blue-600 ring-4 ring-blue-100' : 'border-gray-200 hover:border-blue-300'
      } bg-white shadow-sm hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-semibold text-gray-800">{pkg.name}</p>
          <p className="text-sm text-gray-500">{pkg.diamonds} diamonds{pkg.bonus ? ` + ${pkg.bonus} bonus` : ''}</p>
        </div>
        {pkg.popular && (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
            Popular
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-xl font-bold text-blue-600">${total}</p>
        <span className={`text-xs ${selected ? 'text-blue-600' : 'text-gray-400'}`}>
          {selected ? 'Selected' : 'Select'}
        </span>
      </div>
    </button>
  )
}
