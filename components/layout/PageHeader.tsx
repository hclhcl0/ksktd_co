interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  note?: string; // optional yellow info box
  actions?: React.ReactNode;
}

export default function PageHeader({ icon, title, description, note, actions }: PageHeaderProps) {
  return (
    <div className="mb-5 sm:mb-7">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 shadow-md shadow-blue-600/25 flex-shrink-0 mt-0.5">
            {icon}
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">{title}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{description}</p>
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
      {note && (
        <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
          <span className="text-amber-500 text-base flex-shrink-0 mt-0.5">💡</span>
          <p className="text-xs text-amber-800 leading-relaxed">{note}</p>
        </div>
      )}
    </div>
  );
}
