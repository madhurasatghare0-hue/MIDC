export default function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  emptyMessage = 'No records found',
}) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-cream-200/90 text-[13px] font-semibold text-ink-500 bg-cream-50/50">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`py-3 px-4 ${col.align === 'right' ? 'text-right' : ''} ${
                  col.className || ''
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-cream-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-8 text-center text-ink-400 text-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row[keyField]}
                className="hover:bg-cream-50/60 transition-colors"
              >
                {columns.map((col, idx) => (
                  <td
                    key={idx}
                    className={`py-3.5 px-4 text-ink-800 ${
                      col.align === 'right' ? 'text-right' : ''
                    } ${col.className || ''}`}
                  >
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
