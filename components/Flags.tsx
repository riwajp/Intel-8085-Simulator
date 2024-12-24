export default function Flags({ flags }: { flags: any }) {
  return (
    <div className="flex gap-4  ">
      {Object.keys(flags).map((f) => (
        <div
          key={f}
          className={`badge badge-neutral ${
            flags[f] && "badge-success"
          } text-xs `}
        >
          <div className="font-bold">{f}</div>
        </div>
      ))}
    </div>
  );
}
