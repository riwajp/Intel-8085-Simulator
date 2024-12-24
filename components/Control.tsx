export default function Control({
  className,
  onExecute,
  onDelayChange,
  onAddressChange,
}: {
  className?: String;
  onExecute: any;
  onDelayChange: any;
  onAddressChange: any;
}) {
  return (
    <div className={`card bg-base-200 p-4 ${className}`}>
      <div className="card-title">Control</div>

      <div className="mt-4 flex flex-col gap-3">
        <label className="form-control w-full max-w-full">
          <div className="label p-1 pt-0">
            <span className="label-text text-xs ">Start Address</span>
          </div>
          <input
            type="text"
            placeholder="Type here"
            className="input input-sm input-bordered w-full "
            onChange={(e) => onAddressChange(e.target.value)}
          />
        </label>

        {/* <label className="form-control w-full max-w-full">
          <div className="label p-1 pt-0">
            <span className="label-text text-xs ">Delay</span>
          </div>
          <input
            type="text"
            placeholder="Type here"
            className="input input-sm input-bordered w-full "
            onChange={(e) => onDelayChange(e.target.value)}
          />
        </label> */}

        <button className="btn btn-success" onClick={onExecute}>
          Execute
        </button>
      </div>
    </div>
  );
}
