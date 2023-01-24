import { useRef, useEffect, useState } from "react";
import codes_json from "../codes";
import Test from "./Components/Test";

import Memory from "./Components/Memory";
import Registers from "./Components/Registers";
import {
  inr,
  hexCode,
  hex,
  checkSyntax,
  dec,
  flagsStatus,
  dcr,
  format,
} from "../utils";
import CodeEditor from "./Components/CodeEditor";
import Log from "./Components/Log";
import Flag from "./Components/Flag";
import Tools from "./Components/Tools";
export default function Home() {
  let initial_registers = {
    A: "00",
    B: "00",
    C: "00",
    D: "00",
    E: "00",
    H: "00",
    L: "00",
  };
  let initial_memory = {};
  const [registers, setRegisters] = useState(initial_registers);

  const [current_address, setCurrentAddress] = useState("6969");
  const [memory, setMemory] = useState({});

  const [user_memory, setUserMemory] = useState({});
  const [logs, setLogs] = useState([]);
  const [memory_states, setMemoryStates] = useState([]);
  const [register_states, setRegisterStates] = useState([]);
  const [compilation_memory, setCompilationMemory] = useState({});
  const [flags, setFlags] = useState({ C: 0, AC: 0, P: 0, Z: 0, S: 0 });
  const [flags_states, setFlagsStates] = useState([]);
  const [speed, setSpeed] = useState(1);

  const memory_ref = useRef(memory);
  const code_div_ref = useRef();
  //load the program into the memory============================================================

  /*
  useEffect(() => {
    let flags_temp = { C: 0, AC: 0, P: 0, Z: 0, S: 0 };
    if (registers["A"].length == 3) {
      flags_temp.C = 1;
    }
    setFlags(flags_temp);
  }, [registers]);
  */

  useEffect(() => {
    if (Object.keys(memory).filter((m) => memory[m].length >= 3).length) {
      let memory_temp = memory;
      for (let i of Object.keys(memory_temp)) {
        if (memory_temp[i].length >= 3) {
          memory_temp[i] = memory_temp[i].slice(1);
        }
      }
      setMemory(memory_temp);
    }
    memory_ref.current = memory;
  }, [memory]);
  useEffect(() => {
    setMemory({ ...memory_ref.current, ...user_memory });
  }, [user_memory]);

  const load = (code) => {
    let labels = {};
    let lines_map = {};
    setRegisters(initial_registers);
    setMemory({});
    let code_lines_separated = code.split("\n").map((e) => e.trim());

    let memory_temp = { ...memory };

    var iteration_number = 1;
    var missed_halt = 1;
    while (iteration_number <= 2) {
      var address = current_address;

      for (let i in code_lines_separated) {
        if (code_lines_separated[i] == "") {
          continue;
        }
        lines_map[address] = i;
        var line = code_lines_separated[i];
        if (line.includes(":")) {
          labels[line.split(":")[0]] = address;

          line = line.split(":")[1];
        }

        line = checkSyntax(line, labels, iteration_number);

        if (!Array.isArray(line)) {
          return { memory: `Error on line ${parseInt(i) + 1}: ${line}` };
        }

        let hex_code = hexCode(line);

        memory_temp[address] = hex_code.opCode;

        address = inr(address);
        if (hex_code.opCode == "EF") {
          setCompilationMemory(memory_temp);

          missed_halt = 0;
        }

        if (hex_code.data != "") {
          if (
            ["C3", "C2", "CA", "D2", "DA", "E2", "EA", "F2", "FA"].includes(
              hex_code.opCode
            )
          ) {
            memory_temp[address] = labels[hex_code.data]?.slice(2) || "00";
            memory_temp[inr(address)] =
              labels[hex_code.data]?.slice(0, 2) || "00";

            address = inr(inr(address));
          } else {
            memory_temp[address] = hex_code.data.substring(0, 2);
            if (hex_code.data.length == 4) {
              memory_temp[address] = hex_code.data.substring(2, 5);
              address = inr(address);
              memory_temp[address] = hex_code.data.substring(0, 2);
            }
            address = inr(address);
          }
        }
      }
      iteration_number++;
    }
    setMemory(memory_temp);
    if (!missed_halt) {
      return { memory: memory_temp, labels: labels, lines_map };
    }
    return { memory: `You missed HLT!` };
  };

  //Execute the code ============================================================
  const execute = async (code) => {
    let code_details = load(code.toUpperCase().trim());
    let memory = code_details.memory;
    let lines_map = code_details.lines_map;

    if (typeof memory != "object") {
      setLogs([{ type: "error", message: memory }]);
      return;
    }
    let registers_temp = initial_registers;

    var program_counter = current_address;
    let register_states_temp = [];
    let memory_states_temp = [];
    let flags_states_temp = [];
    let flags_temp = { C: 0, AC: 0, P: 0, Z: 0, S: 0 };
    let logs_temp = [];
    const timer = (ms) => new Promise((res) => setTimeout(res, ms));

    while (memory[program_counter] != "EF") {
      /*
      if (!memory[registers_temp.H + registers_temp.L]) {
        memory[registers_temp.H + registers_temp.L] = "00";
      }*/
      let line_start_address = program_counter;
      try {
        var code = memory[program_counter].toUpperCase();
      } catch {
        return;
      }
      let code_text = codes_json.filter((c) => c.opCode == code)[0].label;

      let code_text_array = code_text.split(" ");

      if (code_text_array[0] == "MVI") {
        program_counter = inr(program_counter);
        if (code_text_array[1] != "M") {
          registers_temp = {
            ...registers_temp,
            [code_text_array[1]]: memory[program_counter],
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Stored given data ${memory[program_counter]} in register ${code_text_array[1]}.`,
          });
        } else if (code_text_array[1] == "M") {
          memory = {
            ...memory,
            [registers_temp["H"] + registers_temp["L"]]:
              memory[program_counter],
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Stored given data ${
              memory[program_counter]
            } in memory address pointed by HL i.e. ${
              registers_temp["H"] + registers_temp["L"]
            }.`,
          });
        }
        program_counter = inr(program_counter);
      } else if (code_text_array[0] == "MOV") {
        program_counter = inr(program_counter);

        if (code_text_array[1] != "M") {
          if (code_text_array[2] != "M") {
            registers_temp = {
              ...registers_temp,
              [code_text_array[1]]: registers_temp[code_text_array[2]],
            };
            logs_temp.push({
              type: "success",
              code: code_text_array.join(" "),
              message: `Moved the data of register ${code_text_array[2]} i.e ${
                registers_temp[code_text_array[2]]
              } into register ${code_text_array[1]}`,
            });
          } else {
            registers_temp = {
              ...registers_temp,
              [code_text_array[1]]: memory[
                [registers_temp["H"] + registers_temp["L"]]
              ]
                ? memory[[registers_temp["H"] + registers_temp["L"]]]
                : "00",
            };

            logs_temp.push({
              type: "success",
              code: code_text_array.join(" "),
              message: `Moved the data (${
                memory[[registers_temp["H"] + registers_temp["L"]]]
                  ? memory[[registers_temp["H"] + registers_temp["L"]]]
                  : "00"
              }) of memory location pointed by HL(${
                registers_temp["H"] + registers_temp["L"]
              }) into register ${code_text_array[1]}`,
            });
          }
        } else {
          memory = {
            ...memory,
            [registers_temp["H"] + registers_temp["L"]]:
              registers_temp[code_text_array[2]],
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Moved the data stored by register ${
              code_text_array[2]
            } i.e ${
              registers_temp[code_text_array[2]]
            } into memory location pointed by HL i.e. ${
              registers_temp["H"] + registers_temp["L"]
            }`,
          });
        }
      } else if (code_text_array[0] == "XCHG") {
        program_counter = inr(program_counter);
        registers_temp = {
          ...registers_temp,
          H: registers_temp["D"],
          L: registers_temp["E"],
          D: registers_temp["H"],
          E: registers_temp["L"],
        };

        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `Exchanged the data between DE and HL register.`,
        });
      } else if (code_text_array[0] == "LXI") {
        program_counter = inr(program_counter);
        if (code_text_array[1] == "B") {
          registers_temp = {
            ...registers_temp,
            B: memory[inr(program_counter)],
            C: memory[program_counter],
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Loaded the given data ${memory[inr(program_counter)]}${
              memory[program_counter]
            } into BC register pair.`,
          });
        }
        if (code_text_array[1] == "D") {
          registers_temp = {
            ...registers_temp,
            D: memory[inr(program_counter)],
            E: memory[program_counter],
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Loaded the given data ${memory[inr(program_counter)]}${
              memory[program_counter]
            } into DE register pair.`,
          });
        }
        if (code_text_array[1] == "H") {
          registers_temp = {
            ...registers_temp,
            H: memory[inr(program_counter)],
            L: memory[program_counter],
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Loaded the given data ${memory[inr(program_counter)]}${
              memory[program_counter]
            } into HL register pair.`,
          });
        }

        program_counter = inr(inr(program_counter));
      } else if (code_text_array[0] == "LDAX") {
        program_counter = inr(program_counter);

        if (code_text_array[1] == "B") {
          let data = memory[registers_temp["B"] + registers_temp["C"]]
            ? memory[registers_temp["B"] + registers_temp["C"]]
            : "00";
          registers_temp = {
            ...registers_temp,
            A: data,
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Loaded the data stored in memory location pointed by register BC(${
              registers_temp["B"] + registers_temp["C"]
            }) i.e. ${data} into register 
            A`,
          });
        }

        if (code_text_array[1] == "D") {
          let data = memory[registers_temp["D"] + registers_temp["E"]]
            ? memory[registers_temp["D"] + registers_temp["E"]]
            : "00";
          registers_temp = {
            ...registers_temp,
            A: data,
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Loaded the data stored in memory location pointed by register DE(${
              registers_temp["D"] + registers_temp["E"]
            }) i.e. ${data} into register 
            A`,
          });
        }

        if (code_text_array[1] == "H") {
          let data = memory[registers_temp["H"] + registers_temp["L"]]
            ? memory[registers_temp["H"] + registers_temp["L"]]
            : "00";
          registers_temp = {
            ...registers_temp,
            A: data,
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Loaded the data stored in memory location pointed by register HL(${
              registers_temp["H"] + registers_temp["L"]
            }) i.e. ${data} into register 
            A`,
          });
        }
      } else if (code_text_array[0] == "LHLD") {
        program_counter = inr(program_counter);
        let data_L = memory[
          memory[inr(program_counter)] + memory[program_counter]
        ]
          ? memory[memory[inr(program_counter)] + memory[program_counter]]
          : "00";
        let data_H = memory[
          inr(memory[inr(program_counter)] + memory[program_counter])
        ]
          ? memory[inr(memory[inr(program_counter)] + memory[program_counter])]
          : "00";
        registers_temp = {
          ...registers_temp,
          L: data_L,
          H: data_H,
        };
        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `Loaded the data stored in given memory location (${
            memory[inr(program_counter)] + memory[program_counter]
          }) i.e ${data_L} in L and data stored in given memory location (${inr(
            memory[inr(program_counter)] + memory[program_counter]
          )}) i.e ${data_H} in H.`,
        });

        program_counter = inr(inr(program_counter));
      } else if (code_text_array[0] == "LDA") {
        program_counter = inr(program_counter);

        let data = memory[
          memory[inr(program_counter)] + memory[program_counter]
        ]
          ? memory[memory[inr(program_counter)] + memory[program_counter]]
          : "00";

        registers_temp = {
          ...registers_temp,
          A: data,
        };
        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `Loaded the data stored in given memory location ${
            memory[inr(program_counter)] + memory[program_counter]
          } i.e ${data} into register A.`,
        });
        program_counter = inr(inr(program_counter));
      } else if (code_text_array[0] == "STAX") {
        program_counter = inr(program_counter);
        if (code_text_array[1] == "B") {
          memory = {
            ...memory,
            [registers_temp["B"] + registers_temp["C"]]: registers_temp["A"],
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Stored th data in register A(${
              registers_temp["A"]
            } into memory location pointed by BC register pair i.e ${
              registers_temp["B"] + registers_temp["C"]
            }.)`,
          });
        } else if (code_text_array[1] == "D") {
          memory = {
            ...memory,
            [registers_temp["D"] + registers_temp["E"]]: registers_temp["A"],
          };

          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Stored th data in register A(${
              registers_temp["A"]
            } into memory location pointed by DE register pair i.e ${
              registers_temp["D"] + registers_temp["E"]
            }.)`,
          });
        } else if (code_text_array[1] == "H") {
          memory = {
            ...memory,
            [registers_temp["H"] + registers_temp["L"]]: registers_temp["A"],
          };

          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Stored th data in register A(${
              registers_temp["A"]
            } into memory location pointed by HL register pair i.e ${
              registers_temp["H"] + registers_temp["L"]
            }.)`,
          });
        }
      } else if (code_text_array[0] == "SHLD") {
        program_counter = inr(program_counter);
        memory = {
          ...memory,
          [memory[inr(program_counter)] + memory[program_counter]]:
            registers_temp["L"],
          [inr(memory[inr(program_counter)] + memory[program_counter])]:
            registers_temp["H"],
        };
        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `Stored the content of register L(${
            registers_temp["L"]
          }) into given memory location ${
            memory[program_counter] + memory[inr(program_counter)]
          } and content of register H(${
            registers_temp["L"]
          } in memory location ${
            memory[inr(program_counter)] + memory[program_counter]
          }).`,
        });
        program_counter = inr(inr(program_counter));
      } else if (code_text_array[0] == "STA") {
        program_counter = inr(program_counter);
        memory = {
          ...memory,
          [memory[inr(program_counter)] + memory[program_counter]]:
            registers_temp["A"],
        };
        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `Stored the content of register A i.e ${
            registers_temp["A"]
          } into given memory location ${[
            memory[inr(program_counter)] + memory[program_counter],
          ]}`,
        });

        program_counter = inr(inr(program_counter));
      } else if (code_text_array[0] == "ADD") {
        program_counter = inr(program_counter);
        if (code_text_array[1] != "M") {
          let to_add = registers_temp[code_text_array[1]];
          if (dec(to_add.slice(1)) + dec(registers_temp["A"].slice(1)) > 15) {
            flags_temp.AC = 1;
          } else {
            flags_temp.AC = 0;
          }
          registers_temp["A"] = hex(dec(to_add) + dec(registers_temp["A"]))
            .padStart(2, "0")
            .toUpperCase();
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Added the content of register ${code_text_array[1]} i.e ${to_add} to Accumulator`,
          });
        } else {
          let to_add = memory[registers_temp.H + registers_temp.L]
            ? memory[registers_temp.H + registers_temp.L]
            : "00";
          if (dec(to_add.slice(1)) + dec(registers_temp["A"].slice(1)) > 15) {
            flags_temp.AC = 1;
          } else {
            flags_temp.AC = 0;
          }
          registers_temp["A"] = hex(dec(to_add) + dec(registers_temp["A"]))
            .padStart(2, "0")
            .toUpperCase();
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Added the content of memory location pointed by HL register (${
              registers_temp.H + registers_temp.L
            }) i.e ${to_add} to Accumulator`,
          });
        }
      } else if (code_text_array[0] == "ADI") {
        program_counter = inr(program_counter);
        let to_add = memory[program_counter];
        if (dec(to_add.slice(1)) + dec(registers_temp["A"].slice(1)) > 15) {
          flags_temp.AC = 1;
        } else {
          flags_temp.AC = 0;
        }
        registers_temp["A"] = hex(dec(to_add) + dec(registers_temp["A"]))
          .padStart(2, "0")
          .toUpperCase();
        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `Added the given  value  ${to_add} to Accumulator`,
        });
        program_counter = inr(program_counter);
      } else if (code_text_array[0] == "ADC") {
        program_counter = inr(program_counter);
        if (code_text_array[1] != "M") {
          let to_add = registers_temp[code_text_array[1]];

          if (
            dec(to_add.slice(1)) +
              dec(registers_temp["A"].slice(1)) +
              dec(flags_temp.C) >
            15
          ) {
            flags_temp.AC = 1;
          } else {
            flags_temp.AC = 0;
          }
          registers_temp["A"] = hex(
            dec(to_add) + dec(registers_temp["A"]) + dec(flags_temp.C)
          )
            .padStart(2, "0")
            .toUpperCase();
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Added the content of register ${code_text_array[1]} i.e ${to_add} and carry flag i.e ${flags_temp.C} to Accumulator`,
          });
        } else {
          let to_add = memory[registers_temp.H + registers_temp.L]
            ? memory[registers_temp.H + registers_temp.L]
            : "00";

          if (
            dec(to_add.slice(1)) +
              dec(registers_temp["A"].slice(1)) +
              dec(flags_temp.C) >
            15
          ) {
            flags_temp.AC = 1;
          } else {
            flags_temp.AC = 0;
          }
          registers_temp["A"] = hex(
            dec(to_add) + dec(registers_temp["A"]) + dec(flags_temp.C)
          )
            .padStart(2, "0")
            .toUpperCase();
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Added the content of memory location pointed by HL register (${
              registers_temp.H + registers_temp.L
            }) i.e ${to_add} and carry flag i.e ${flags_temp.C} to Accumulator`,
          });
        }
      } else if (code_text_array[0] == "ACI") {
        program_counter = inr(program_counter);

        let to_add = memory[program_counter];

        if (
          dec(to_add.slice(1)) +
            dec(registers_temp["A"].slice(1)) +
            dec(flags_temp.C) >
          15
        ) {
          flags_temp.AC = 1;
        } else {
          flags_temp.AC = 0;
        }
        registers_temp["A"] = hex(
          dec(to_add) + dec(registers_temp["A"]) + dec(flags_temp.C)
        )
          .padStart(2, "0")
          .toUpperCase();
        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `Added the given data ${memory[program_counter]} and carry flag i.e ${flags_temp.C} to Accumulator`,
        });
        program_counter = inr(program_counter);
      } else if (code_text_array[0] == "SUB") {
        program_counter = inr(program_counter);

        if (code_text_array[1] != "M") {
          let to_sub = registers_temp[code_text_array[1]];
          if (dec(to_sub.slice(1)) > dec(registers_temp.A.slice(1))) {
            flags_temp.AC = 0;
          } else {
            flags_temp.AC = 1;
          }

          let acc_temp = registers_temp.A;
          registers_temp.A = hex(dec(registers_temp.A) - dec(to_sub))
            .padStart(2, "0")
            .toUpperCase();
          if (dec(to_sub) > dec(acc_temp)) {
            flags_temp.S = 1;
            registers_temp.A =
              "1" +
              hex(
                256 - parseInt("0x" + registers_temp.A.slice(1), 16)
              ).padStart(2, "0");
          } else {
            flags_temp.S = 0;
          }
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Subtracted the content of ${code_text_array[1]} i.e ${to_sub} from Accmulator.`,
          });
        } else {
          let to_sub = memory[registers_temp.H + registers_temp.L]
            ? memory[registers_temp.H + registers_temp.L]
            : "00";
          if (dec(to_sub.slice(1)) > dec(registers_temp.A.slice(1))) {
            flags_temp.AC = 0;
          } else {
            flags_temp.AC = 1;
          }

          let acc_temp = registers_temp.A;
          registers_temp.A = hex(dec(registers_temp.A) - dec(to_sub))
            .padStart(2, "0")
            .toUpperCase();
          if (dec(to_sub) > dec(registers_temp.A)) {
            flags_temp.S = 1;
            registers_temp.A =
              "1" +
              hex(
                256 - parseInt("0x" + registers_temp.A.slice(1), 16)
              ).padStart(2, "0");
          } else {
            flags_temp.S = 0;
          }
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Subtracted the content of memory pointed by HL(${
              registers_temp.H + registers_temp.L
            }) i.e ${to_sub} from Accmulator.`,
          });
        }
      } else if (code_text_array[0] == "SUI") {
        program_counter = inr(program_counter);

        let to_sub = memory[program_counter];

        if (dec(to_sub.slice(1)) > dec(registers_temp.A.slice(1))) {
          flags_temp.AC = 0;
        } else {
          flags_temp.AC = 1;
        }

        let acc_temp = registers_temp.A;
        registers_temp.A = hex(dec(registers_temp.A) - dec(to_sub))
          .padStart(2, "0")
          .toUpperCase();
        if (dec(to_sub) > dec(acc_temp)) {
          flags_temp.S = 1;
          registers_temp.A =
            "1" +
            hex(256 - parseInt("0x" + registers_temp.A.slice(1), 16)).padStart(
              2,
              "0"
            );
        } else {
          flags_temp.S = 0;
        }

        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `Subtracted the given value ${to_sub} from Accmulator.`,
        });
        program_counter = inr(program_counter);
      } else if (code_text_array[0] == "SBB") {
        program_counter = inr(program_counter);
        if (code_text_array[1] != "M") {
          let to_sub = registers_temp[code_text_array[1]];
          if (
            dec(to_sub.slice(1)) >
            dec(registers_temp.A.slice(1)) - dec(flags_temp.C)
          ) {
            flags_temp.AC = 0;
          } else {
            flags_temp.AC = 1;
          }

          let acc_temp = registers_temp.A;
          registers_temp.A = hex(
            dec(registers_temp.A) - dec(to_sub) - dec(flags_temp.C)
          )
            .padStart(2, "0")
            .toUpperCase();
          if (dec(to_sub) > dec(acc_temp)) {
            flags_temp.S = 1;
            registers_temp.A =
              "1" +
              hex(
                256 - parseInt("0x" + registers_temp.A.slice(1), 16)
              ).padStart(2, "0");
          } else {
            flags_temp.S = 0;
          }

          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Subtracted the content of ${code_text_array[1]} i.e ${to_sub} and carry i.e. ${flags_temp.C}from Accmulator.`,
          });
        } else {
          let to_sub = memory[registers_temp.H + registers_temp.L]
            ? memory[registers_temp.H + registers_temp.L]
            : "00";
          if (
            dec(to_sub.slice(1)) >
            dec(registers_temp.A.slice(1)) - dec(flags_temp.C)
          ) {
            flags_temp.AC = 0;
          } else {
            flags_temp.AC = 1;
          }

          let acc_temp = registers_temp.A;
          registers_temp.A = hex(
            dec(registers_temp.A) - dec(to_sub) - dec(flags_temp.C)
          )
            .padStart(2, "0")
            .toUpperCase();
          if (dec(to_sub) > dec(registers_temp.A)) {
            flags_temp.S = 1;
            registers_temp.A =
              "1" +
              hex(
                256 - parseInt("0x" + registers_temp.A.slice(1), 16)
              ).padStart(2, "0");
          } else {
            flags_temp.S = 0;
          }

          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Subtracted the content of memory pointed by HL (${
              registers_temp.H + registers_temp.L
            })i.e ${to_sub} and carry i.e. ${flags_temp.C}from Accmulator.`,
          });
        }
      } else if (code_text_array[0] == "SBI") {
        program_counter = inr(program_counter);

        let to_sub = memory[program_counter];
        if (
          dec(to_sub.slice(1)) >
          dec(registers_temp.A.slice(1)) - dec(flags_temp.C)
        ) {
          flags_temp.AC = 0;
        } else {
          flags_temp.AC = 1;
        }

        let acc_temp = registers_temp.A;
        registers_temp.A = hex(
          dec(registers_temp.A) - dec(to_sub) - dec(flags_temp.C)
        )
          .padStart(2, "0")
          .toUpperCase();
        if (dec(to_sub) > dec(registers_temp.A)) {
          flags_temp.S = 1;
          registers_temp.A =
            "1" +
            hex(256 - parseInt("0x" + registers_temp.A.slice(1), 16)).padStart(
              2,
              "0"
            );
        } else {
          flags_temp.S = 0;
        }

        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `Subtracted the given data ${to_sub} and carry i.e. ${flags_temp.C}from Accmulator.`,
        });
        program_counter = inr(program_counter);
      } else if (code_text_array[0] == "INR") {
        program_counter = inr(program_counter);
        if (code_text_array[1] !== "M") {
          let to_add = "01";
          if (
            dec(to_add.slice(1)) +
              dec(registers_temp[code_text_array[1]].slice(1)) >
            15
          ) {
            flags_temp.AC = 1;
          } else {
            flags_temp.AC = 0;
          }
          registers_temp[code_text_array[1]] = hex(
            dec(to_add) + dec(registers_temp[code_text_array[1]])
          )
            .padStart(2, "0")
            .toUpperCase();
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Incremented the value of register ${
              code_text_array[1]
            }  by 1 i.e. now it is ${registers_temp[code_text_array[1]]}.`,
          });
        } else {
          let to_add = "01";
          if (
            dec(to_add.slice(1)) +
              dec(
                (memory[registers_temp.H + registers_temp.L]
                  ? memory[registers_temp.H + registers_temp.L]
                  : "00"
                ).slice(1)
              ) >
            15
          ) {
            flags_temp.AC = 1;
          } else {
            flags_temp.AC = 0;
          }

          memory[registers_temp.H + registers_temp.L] = hex(
            dec(
              memory[registers_temp.H + registers_temp.L]
                ? memory[registers_temp.H + registers_temp.L]
                : "00"
            ) + dec(to_add)
          );
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Incremented the content of memory pointed by HL(${
              registers_temp.H + registers_temp.L
            })  by 1 i.e. now it is${
              memory[registers_temp.H + registers_temp.L]
            }`,
          });
          /*
          let ac_flag = flagsStatus(
            flags_temp,
            memory[registers_temp.H + registers_temp.L]
          );
          flags_temp = ac_flag.flags;
          flags_temp.AC =
            dec(inr(memory[registers_temp.H + registers_temp.L].slice(1))) > 15;

          memory[registers_temp.H + registers_temp.L] = ac_flag.acc;
          */
        }
      } else if (code_text_array[0] == "DCR") {
        program_counter = inr(program_counter);
        if (code_text_array[1] !== "M") {
          let to_sub = "01";
          if (dec(to_sub.slice(1)) > dec(registers_temp.A.slice(1))) {
            flags_temp.AC = 0;
          } else {
            flags_temp.AC = 1;
          }

          let acc_temp = registers_temp.A;
          registers_temp.A = hex(dec(registers_temp.A) - dec(to_sub))
            .padStart(2, "0")
            .toUpperCase();
          if (dec(to_sub) > dec(acc_temp)) {
            flags_temp.S = 1;
            registers_temp.A =
              "1" +
              hex(
                256 - parseInt("0x" + registers_temp.A.slice(1), 16)
              ).padStart(2, "0");
          } else {
            flags_temp.S = 0;
          }
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Decremented the value of register ${
              code_text_array[1]
            }  by 1 i.e. now it is i.e. ${registers_temp[code_text_array[1]]}`,
          });
        } else {
          let to_sub = "01";
          if (
            dec(to_sub.slice(1)) >
            dec(
              (memory[registers_temp.H + registers_temp.L]
                ? memory[registers_temp.H + registers_temp.L]
                : "00"
              ).slice(1)
            )
          ) {
            flags_temp.AC = 0;
          } else {
            flags_temp.AC = 1;
          }

          memory[registers_temp.H + registers_temp.L] = hex(
            dec(memory[registers_temp.H + registers_temp.L]) - dec(to_sub)
          )
            .padStart(2, "0")
            .toUpperCase();
          if (dec(to_sub) > dec(memory[registers_temp.H + registers_temp.L])) {
            flags_temp.S = 1;
            memory[registers_temp.H + registers_temp.L] =
              "1" +
              hex(
                256 -
                  parseInt(
                    "0x" + memory[registers_temp.H + registers_temp.L].slice(1),
                    16
                  )
              ).padStart(2, "0");
          } else {
            flags_temp.S = 0;
          }
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Decremented the content of memory pointed by HL(${
              registers_temp.H + registers_temp.L
            })  by 1 i.e now it is i.e. ${
              memory[registers_temp.H + registers_temp.L]
            }`,
          });
        }
      } else if (code_text_array[0] == "INX") {
        program_counter = inr(program_counter);
        if (code_text_array[1] == "B") {
          let content = hex(inr(registers_temp.B + registers_temp.C));
          registers_temp = {
            ...registers_temp,
            B: content.slice(0, 2),
            C: content.slice(2),
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Incremented the data of regester pair BC by 1. Now it stores ${
              registers_temp["B"] + registers_temp["C"]
            }`,
          });
        }
        if (code_text_array[1] == "D") {
          let content = hex(inr(registers_temp.D + registers_temp.E));
          registers_temp = {
            ...registers_temp,
            D: content.slice(0, 2),
            E: content.slice(2),
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Incremented the data of regester pair DE by 1. Now it stores ${
              registers_temp["D"] + registers_temp["E"]
            }`,
          });
        }
        if (code_text_array[1] == "H") {
          let content = hex(inr(registers_temp.H + registers_temp.L));
          registers_temp = {
            ...registers_temp,
            H: content.slice(0, 2),
            L: content.slice(2),
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Incremented the data of regester pair HL by 1. Now it stores ${
              registers_temp["H"] + registers_temp["L"]
            }`,
          });
        }
      } else if (code_text_array[0] == "DCX") {
        program_counter = inr(program_counter);
        if (code_text_array[1] == "B") {
          let content = hex(dcr(dec(registers_temp.B + registers_temp.C), 1));
          registers_temp = {
            ...registers_temp,
            B: content.slice(0, 2),
            C: content.slice(2),
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Decremented the data of regester pair BC by 1. Now it stores ${
              registers_temp["B"] + registers_temp["C"]
            }`,
          });
        }
        if (code_text_array[1] == "D") {
          let content = hex(dcr(dec(registers_temp.D + registers_temp.E), 1));
          registers_temp = {
            ...registers_temp,
            D: content.slice(0, 2),
            E: content.slice(2),
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Decremented the data of regester pair BC by 1. Now it stores ${
              registers_temp["D"] + registers_temp["E"]
            }`,
          });
        }
        if (code_text_array[1] == "H") {
          let content = hex(dcr(dec(registers_temp.H + registers_temp.L), 1));
          registers_temp = {
            ...registers_temp,
            H: content.slice(0, 2),
            L: content.slice(2),
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Decremented the data of regester pair BC by 1. Now it stores ${
              registers_temp["H"] + registers_temp["L"]
            }`,
          });
        }
      } else if (code_text_array[0] == "DAD") {
        program_counter = inr(program_counter);
        var to_add;
        var rp;
        if (code_text_array[1] == "B") {
          to_add = registers_temp["B"] + registers_temp["C"];
          rp = "BC";
        }
        if (code_text_array[1] == "D") {
          to_add = registers_temp["D"] + registers_temp["E"];
          rp = "DE";
        }
        if (code_text_array[1] == "H") {
          to_add = registers_temp["H"] + registers_temp["L"];
          rp = "HL";
        }

        var carry = 0;
        if (dec(registers_temp["L"]) + dec(to_add.slice(2)) > 255) {
          carry = 1;
          registers_temp["L"] = hex(
            dec(registers_temp["L"]) + dec(to_add.slice(2))
          ).slice(1);
        } else {
          registers_temp["L"] = hex(
            dec(registers_temp["L"]) + dec(to_add)
          ).slice(2);
        }

        registers_temp["H"] = hex(
          dec(registers_temp["H"]) + dec(to_add.slice(0, 2)) + dec(carry)
        ).toString();
        if (registers_temp["H"].length > 2) {
          registers_temp["H"] = registers_temp["H"].slice(1);
          flags_temp.C = 1;
        }

        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `Added the data stored by register pair ${rp} i.e. ${to_add} to data in HL pair.`,
        });
      } else if (code_text_array[0] == "ANA") {
        program_counter = inr(program_counter);
        let operand;
        if (code_text_array[1] == "M") {
          operand = memory[registers_temp.H + registers_temp.L]
            ? memory[registers_temp.H + registers_temp.L]
            : "00";
        } else {
          operand = registers_temp[code_text_array[1]];
        }
        registers_temp.A = hex(dec(registers_temp.A) & dec(operand));

        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `ANDed the data ${operand} to data in Accumulator.`,
        });
      } else if (code_text_array[0] == "ORA") {
        program_counter = inr(program_counter);
        let operand;
        if (code_text_array[1] == "M") {
          operand = memory[registers_temp.H + registers_temp.L]
            ? memory[registers_temp.H + registers_temp.L]
            : "00";
        } else {
          operand = registers_temp[code_text_array[1]];
        }
        registers_temp.A = hex(dec(registers_temp.A) | dec(operand));

        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `ORed the data ${operand} to data in Accumulator.`,
        });
      } else if (code_text_array[0] == "XRA") {
        program_counter = inr(program_counter);
        let operand;
        if (code_text_array[1] == "M") {
          operand = memory[registers_temp.H + registers_temp.L]
            ? memory[registers_temp.H + registers_temp.L]
            : "00";
        } else {
          operand = registers_temp[code_text_array[1]];
        }
        registers_temp.A = hex(dec(registers_temp.A) ^ dec(operand));

        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `XORed the data ${operand} to data in Accumulator.`,
        });
      } else if (code_text_array[0] == "CMP") {
        program_counter = inr(program_counter);
        var difference;

        if (code_text_array[1] != "M") {
          let to_sub = registers_temp[code_text_array[1]];
          if (dec(to_sub.slice(1)) > dec(registers_temp.A.slice(1))) {
            flags_temp.AC = 0;
          } else {
            flags_temp.AC = 1;
          }

          difference = hex(dec(registers_temp.A) - dec(to_sub))
            .padStart(2, "0")
            .toUpperCase();

          if (dec(to_sub) > dec(registers_temp.A)) {
            difference =
              "1" +
              hex(256 - parseInt("0x" + difference.slice(1), 16)).padStart(
                2,
                "0"
              );
          }
          let ac_flag = flagsStatus(flags_temp, difference);
          flags_temp = ac_flag.flags;

          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Compared`,
          });
        } else {
          let to_sub = memory[registers_temp.H + registers_temp.L]
            ? memory[registers_temp.H + registers_temp.L]
            : "00";
          if (dec(to_sub.slice(1)) > dec(registers_temp.A.slice(1))) {
            flags_temp.AC = 0;
          } else {
            flags_temp.AC = 1;
          }

          difference = hex(dec(registers_temp.A) - dec(to_sub))
            .padStart(2, "0")
            .toUpperCase();

          if (dec(to_sub) > dec(registers_temp.A)) {
            difference =
              "1" +
              hex(256 - parseInt("0x" + difference.slice(1), 16)).padStart(
                2,
                "0"
              );
          }
          let ac_flag = flagsStatus(flags_temp, difference);
          flags_temp = ac_flag.flags;

          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Compared memory`,
          });
        }
      } else if (code_text_array[0] == "CPI") {
        program_counter = inr(program_counter);
        var difference;
        let to_sub = memory[program_counter];
        if (dec(to_sub.slice(1)) > dec(registers_temp.A.slice(1))) {
          flags_temp.AC = 0;
        } else {
          flags_temp.AC = 1;
        }

        difference = hex(dec(registers_temp.A) - dec(to_sub))
          .padStart(2, "0")
          .toUpperCase();

        if (dec(to_sub) > dec(registers_temp.A)) {
          difference =
            "1" +
            hex(256 - parseInt("0x" + difference.slice(1), 16)).padStart(
              2,
              "0"
            );
        }

        let ac_flag = flagsStatus(flags_temp, difference);
        flags_temp = ac_flag.flags;
        /*
        if (dec(to_sub) > dec(registers_temp.A)) {
          flags_temp.S = 1;
        }
        */
        program_counter = inr(program_counter);
        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `Compared immediate`,
        });
      } else if (code_text_array[0] == "CMA") {
        program_counter = inr(program_counter);

        registers_temp["A"] = hex(~dec(registers_temp["A"]) >>> 0).slice(-2);

        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `Complemented the data stored by Accumulator .`,
        });
      } else if (code_text_array[0] == "ANI") {
        program_counter = inr(program_counter);
        registers_temp.A = hex(
          dec(registers_temp.A) & dec(memory[program_counter])
        );

        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `ANDed the given data ${memory[program_counter]} to data in Accumulator.`,
        });
        program_counter = inr(program_counter);
      } else if (code_text_array[0] == "ORI") {
        program_counter = inr(program_counter);
        registers_temp.A = hex(
          dec(registers_temp.A) | dec(memory[program_counter])
        );

        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `ORed the given data ${memory[program_counter]} to data in Accumulator.`,
        });
        program_counter = inr(program_counter);
      } else if (code_text_array[0] == "XRI") {
        program_counter = inr(program_counter);
        registers_temp.A = hex(
          dec(registers_temp.A) ^ dec(memory[program_counter])
        );

        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `XORed the given data ${memory[program_counter]} to data in Accumulator.`,
        });
        program_counter = inr(program_counter);
      } else if (code_text_array[0] == "JMP") {
        program_counter = inr(program_counter);
        program_counter =
          memory[inr(program_counter)] + memory[program_counter];
        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `Jumped to ${program_counter}`,
        });
        //program_counter = inr(program_counter);
      } else if (code_text_array[0] == "JC") {
        program_counter = inr(program_counter);
        if (flags_temp.C == "1") {
          program_counter =
            memory[inr(program_counter)] + memory[program_counter];
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Jumped to ${program_counter} as carry is 1`,
          });
        } else {
          program_counter = inr(inr(program_counter));
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Didn't jump to ${program_counter} as carry is 0.`,
          });
        }
      } else if (code_text_array[0] == "JNC") {
        program_counter = inr(program_counter);
        if (flags_temp.C == "0") {
          program_counter =
            memory[inr(program_counter)] + memory[program_counter];
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Jumped to ${program_counter} as carry is 0`,
          });
        } else {
          program_counter = inr(inr(program_counter));
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Didn't jump to ${program_counter} as carry is 1.`,
          });
        }
      } else if (code_text_array[0] == "JZ") {
        program_counter = inr(program_counter);
        if (flags_temp.Z == "1") {
          program_counter =
            memory[inr(program_counter)] + memory[program_counter];
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Jumped to ${program_counter} as zerp flag is 1`,
          });
        } else {
          program_counter = inr(inr(program_counter));
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Didn't jump to ${program_counter} as zero flag is 0.`,
          });
        }
      } else if (code_text_array[0] == "JNZ") {
        program_counter = inr(program_counter);
        if (flags_temp.Z == "0") {
          program_counter =
            memory[inr(program_counter)] + memory[program_counter];
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Jumped to ${program_counter} as zero flag is 0`,
          });
        } else {
          program_counter = inr(inr(program_counter));
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Didn't jump to ${program_counter} as zero flag is 1.`,
          });
        }
      } else if (code_text_array[0] == "JP") {
        program_counter = inr(program_counter);
        if (flags_temp.S == "0") {
          program_counter =
            memory[inr(program_counter)] + memory[program_counter];
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Jumped to ${program_counter} as sign flag is 0`,
          });
        } else {
          program_counter = inr(inr(program_counter));
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Didn't jump to ${program_counter} as sign flag is 1.`,
          });
        }
      } else if (code_text_array[0] == "JM") {
        program_counter = inr(program_counter);
        if (flags_temp.S == "1") {
          program_counter =
            memory[inr(program_counter)] + memory[program_counter];
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Jumped to ${program_counter} as sign flag is 1`,
          });
        } else {
          program_counter = inr(inr(program_counter));
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Didn't jump to ${program_counter} as sign flag is 0.`,
          });
        }
      } else if (code_text_array[0] == "JPE") {
        program_counter = inr(program_counter);
        if (flags_temp.P == "1") {
          program_counter =
            memory[inr(program_counter)] + memory[program_counter];
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Jumped to ${program_counter} as parity flag is 1`,
          });
        } else {
          program_counter = inr(inr(program_counter));
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Didn't jump to ${program_counter} as parity flag is 0.`,
          });
        }
      } else if (code_text_array[0] == "JPO") {
        program_counter = inr(program_counter);
        if (flags_temp.P == "0") {
          program_counter =
            memory[inr(program_counter)] + memory[program_counter];
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Jumped to ${program_counter} as parity flag is 0`,
          });
        } else {
          program_counter = inr(inr(program_counter));
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Didn't jump to ${program_counter} as parity flag is 1.`,
          });
        }
      }
      let flag_affect_acc = [
        "ADD",
        "ADI",
        "ADC",
        "ACI",
        "SUB",
        "SUI",
        "SBB",
        "SBI",
        "ANA",

        "ORA",
        "XRA",
        "INR",
        "DCR",

        "CMA",
        "ANI",
        "ORI",
        "XRI",
      ];

      if (flag_affect_acc.includes(code_text_array[0])) {
        if (
          ["INR", "DCR"].includes(code_text_array[1]) &&
          code_text_array[1] == "M"
        ) {
          let ac_flag = flagsStatus(
            flags_temp,
            memory[registers_temp["H"] + registers_temp["L"]]
          );
          flags_temp = ac_flag.flags;
          memory[registers_temp["H"] + registers_temp["L"]] = ac_flag.acc;
        } else {
          let ac_flag = flagsStatus(flags_temp, registers_temp.A);
          flags_temp = ac_flag.flags;
          registers_temp["A"] = ac_flag.acc;
        }
      }

      memory_states_temp.push(JSON.parse(JSON.stringify(memory)));
      register_states_temp.push(JSON.parse(JSON.stringify(registers_temp)));
      flags_states_temp.push(JSON.parse(JSON.stringify(flags_temp)));

      /*
      registers_temp["M"] = memory[registers_temp.H + registers_temp.L]
        ? memory[registers_temp.H + registers_temp.L]
        : "00";
*/
      memory = format(memory);
      setMemory(memory);
      logs_temp[logs_temp.length - 1] = {
        ...logs_temp[logs_temp.length - 1],
        line: lines_map[line_start_address],
      };
      setLogs([...logs_temp]);
      for (let i in memory_states_temp) {
        memory_states_temp[i] = format(memory_states_temp[i]);
      }
      setMemoryStates(memory_states_temp);
      setRegisterStates(register_states_temp);

      setFlags(flags_temp);
      setRegisters(format(registers_temp));
      setFlagsStates(flags_states_temp);
      await timer(speed);
    }
  };

  return (
    <div className="body-container">
      <div className="main-container">
        <CodeEditor
          execute={(code) => execute(code)}
          current_address={current_address}
          setCurrentAddress={setCurrentAddress}
          speed={speed}
          setSpeed={setSpeed}
          code_div_ref={code_div_ref}
        />
        <Memory
          memory={memory}
          compilation_memory={compilation_memory}
          user_memory={user_memory}
        />

        <Registers registers={registers} />

        <Tools memory={user_memory} setMemory={setUserMemory} />
      </div>
      <div className="bottom-container">
        <Log
          logs={logs}
          setMemory={setMemory}
          setRegisters={setRegisters}
          register_states={register_states}
          memory_states={memory_states}
          flags_states={flags_states}
          setFlags={setFlags}
        />
        <Flag flags={flags} />
      </div>
      <Test execute={execute} registers={registers} flags={flags} />
    </div>
  );
}
