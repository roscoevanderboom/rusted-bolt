const ActionButton = ({
  onClick,
  title,
  icon: Icon,
  color,
  disabled = false,
}: {
  onClick: () => void;
  title: string;
  icon: any;
  color: string;
  disabled?: boolean;
}) => (
  <button
    className={`
          p-2 rounded-lg transition-all duration-200 
          hover:bg-stone-800/70 hover:scale-105 
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          focus:outline-none focus:ring-2 focus:ring-${color}-400/50
        `}
    title={title}
    onClick={onClick}
    disabled={disabled}
  >
    <Icon className={`w-5 h-5 text-${color}-400`} />
  </button>
);

export default ActionButton;
