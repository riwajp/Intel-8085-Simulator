export default function Registers({ registers }: { registers: any }) {
  return (
    <div className="flex gap-4 flex-wrap p-4 ">
      {Object.keys(registers ?? {})
        ?.filter((k) => k != "M")
        ?.map((r) => (
          <div
            key={r}
            className={`badge ${
              r.toUpperCase() == "A"
                ? "badge-primary"
                : r.toUpperCase() == "H" || r.toUpperCase() == "L"
                ? "badge-secondary"
                : "badge-neutral"
            } flex gap-2`}
          >
            <div className="font-bold">{r.toUpperCase()}</div>
            <div className="">
              {" "}
              {registers[r].length >= 3
                ? registers[r].slice(1)
                : registers[r].padStart(2, "0")}
            </div>
          </div>
        ))}
    </div>
  );
}
