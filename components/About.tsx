import { FiHelpCircle } from "react-icons/fi";
import { FiBook } from "react-icons/fi";

export default function About({ className }: { className?: String }) {
  return (
    <div className={` card bg-base-300 p-4 ${className} `}>
      <div className="card-title flex justify-between">
        8085 Assembly Simulator{" "}
        <div className="flex gap-4">
          <FiHelpCircle size={18} className="cursor-pointer " />
          <FiBook size={18} className="cursor-pointer " />
        </div>
      </div>
      <div className="mt-4 ">
        <p>
          Welcome to Intel 8085 assembly simulator.A real-time simulation of the
          Intel 8085 microprocessor. Track register values, flags, and execute
          assembly instructions step-by-step or in bulk.
        </p>
        <br />
        <p>
          <a
            href="https://pravin-hub-rgb.github.io/BCA/resources/sem4/micro_tbc402/unit4/index.html"
            className="text-gray-400 underline"
            target="_blank"
          >
            Click Here
          </a>{" "}
          to get a quick overview of the instruction set for 8085 processor.
        </p>
      </div>
    </div>
  );
}
