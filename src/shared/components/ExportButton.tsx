import { useState, useRef, useEffect } from 'react'
import { Download, FileJson, FileSpreadsheet, ChevronDown } from 'lucide-react'

interface ExportOption {
  label: string
  format: 'json' | 'csv'
  onClick: () => void
}

interface ExportButtonProps {
  options: ExportOption[]
  label?: string
  disabled?: boolean
}

export function ExportButton({ options, label = 'Export', disabled = false }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOptionClick = (option: ExportOption) => {
    option.onClick()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
          ${disabled 
            ? 'bg-clinical-secondary/50 text-clinical-muted cursor-not-allowed'
            : 'bg-clinical-secondary border border-white/10 text-gray-300 hover:text-white hover:border-white/20'}
        `}
      >
        <Download className="w-4 h-4" />
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute right-0 mt-2 w-48 py-1 rounded-xl bg-clinical-dark border border-white/10 shadow-xl z-50 animate-fade-in">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(option)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-300 
                         hover:text-white hover:bg-white/5 transition-colors"
            >
              {option.format === 'json' ? (
                <FileJson className="w-4 h-4 text-blue-400" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              )}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


