export default function CustomSelect({
  label,
  options,
  value,
  onChange,
  disabled = false,
  required = false,
  name
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className="bg-transparent border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="" className="bg-white dark:bg-gray-800">
          Select {label?.toLowerCase() || 'option'}
        </option>
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-white dark:bg-gray-800"
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
