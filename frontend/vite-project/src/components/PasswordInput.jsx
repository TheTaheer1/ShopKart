function PasswordInput({ id, name, autoComplete, value, onChange, placeholder, visible, onToggle }) {
  return (
    <div className="password-field">
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <button
        className="password-toggle"
        type="button"
        onClick={onToggle}
        aria-label={visible ? 'Hide password' : 'Show password'}
        title={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? (
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.8 10.8 0 0 1 12 5c5.2 0 8.7 4.2 9.7 6.4a11.5 11.5 0 0 1-3.1 4.1M6.2 6.2A12.2 12.2 0 0 0 2.3 11.4C3.3 13.7 6.8 18 12 18c1 0 2-.2 2.8-.5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M2.3 12S5.7 5 12 5s9.7 7 9.7 7-3.4 7-9.7 7-9.7-7-9.7-7Z" />
            <circle cx="12" cy="12" r="2.7" />
          </svg>
        )}
      </button>
    </div>
  )
}

export default PasswordInput
