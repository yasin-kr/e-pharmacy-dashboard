export default function Icon({ name, className = "", ...props }) {
  return (
    <svg
      className={`icon ${className}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <use href={`/icons.svg#${name}`} />
    </svg>
  );
}
