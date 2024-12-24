import { useEffect, useState } from "react";
import Flags from "./Flags";

export default function Log({
  className,
  rollBack,
  logs,
  flags,
}: {
  className?: String;
  rollBack: any;
  logs: any;
  flags: any;
}) {
  const [activeIndex, setActiveIndex] = useState<Number>(logs.length - 1);

  useEffect(() => {
    setActiveIndex(logs.length - 1);
  }, [logs]);

  return (
    <div
      className={` card bg-base-200 p-4 overflow-hidden h-[300px] sm:h-full ${className} `}
    >
      <div className="card-title flex justify-between">
        Log
        <Flags flags={flags} />
      </div>

      <div className="mt-4 ">
        {logs?.map((l: any, i: Number) => (
          <div
            key={i as any}
            className={`cursor-pointer mt-2 hover:bg-base-300 transition-all duration-200 flex  w-full p-2 bg-base-100 rounded-md ${
              i == activeIndex && "bg-base-300"
            }`}
            onClick={() => {
              rollBack(i);
              setActiveIndex(i);
            }}
          >
            <div className="text-gray-500 ">
              {" "}
              {parseInt(isNaN(l.line) ? 0 : l.line) + 1}
            </div>
            <div className="divider  divider-horizontal divider-neutral w-1 px-1 mx-2 md:mx-3"></div>
            <div className={`${l.type == "error" && "text-red-400"}`}>
              {l.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
