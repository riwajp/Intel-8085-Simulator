import { dec } from "@/app/utils";

export default function Memory({
  className,
  memory,
}: {
  className?: String;
  memory: any;
}) {
  return (
    <div
      className={`card bg-base-200 p-4 overflow-hidden h-[300px] sm:h-full ${className} `}
    >
      <div className="card-title">Memory</div>

      <div className="mt-4 flex flex-col gap-2 overflow-auto">
        {Object.keys(memory)
          ?.sort((m, n) => dec(m) - dec(n))
          ?.map((m) => (
            <div
              key={m}
              className="flex justify-between w-full p-2 bg-base-100 rounded-md"
            >
              <div className="">{m.toUpperCase().padStart(4, "0")}</div>
              <div className="">{memory[m].padStart(2, "0")}</div>
            </div>
          ))}
      </div>
    </div>
  );
}
