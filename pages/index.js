import { memo, useEffect, useState } from "react";
import codes_json from "../codes";

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
    M: "00",
  };
  let initial_memory = {};
  const [registers, setRegisters] = useState(initial_registers);

  const [current_address, setCurrentAddress] = useState("6969");
  const [memory, setMemory] = useState({});
  const [logs, setLogs] = useState([]);
  const [memory_states, setMemoryStates] = useState([]);
  const [register_states, setRegisterStates] = useState([]);
  const [compilation_memory, setCompilationMemory] = useState({});
  const [flags, setFlags] = useState({ C: 0, AC: 0, P: 0, Z: 0, S: 0 });
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
  }, [memory]);
  const load = (code) => {
    setRegisters(initial_registers);
    setMemory({});
    let code_lines_separated = code.split("\n").filter((c) => c != "");

    var address = current_address;
    let memory_temp = {};

    for (let i in code_lines_separated) {
      var line = checkSyntax(code_lines_separated[i]);

      if (!Array.isArray(line)) {
        return `Error on line ${parseInt(i) + 1}: ${line}`;
      }
      let hex_code = hexCode(line);

      memory_temp[address] = hex_code.opCode;
      address = inr(address);
      if (hex_code.opCode == "EF") {
        setCompilationMemory(memory_temp);

        return memory_temp;
      }

      if (hex_code.data != "") {
        memory_temp[address] = hex_code.data.substring(0, 2);

        address = inr(address);
        if (hex_code.data.length == 4) {
          memory_temp[address] = hex_code.data.substring(2, 5);
          address = inr(address);
        }
      }
    }
    setMemory(memory_temp);

    return `You missed HLT!`;
  };

  //Execute the code ============================================================
  const execute = (code) => {
    let logs_temp = [];
    let memory = load(code.toUpperCase().trim());

    if (typeof memory != "object") {
      setLogs([{ type: "error", message: memory }]);
      return;
    }
    let registers_temp = initial_registers;

    var program_counter = current_address;
    let register_states_temp = [];
    let memory_states_temp = [];
    let flags_temp = { C: 0, AC: 0, P: 0, Z: 0, S: 0 };
    while (memory[program_counter] != "EF") {
      try {
        var code = memory[program_counter].toUpperCase();
      } catch {
        return;
      }
      let code_text = codes_json.filter((c) => c.opCode == code)[0].label;

      let code_text_array = code_text.split(" ");

      //mvi==============================================================================================
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
      }
      //========================================================================================================

      //mov=====================================================================================================
      else if (code_text_array[0] == "MOV") {
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
              [code_text_array[1]]:
                memory[[registers_temp["H"] + registers_temp["L"]]],
            };

            logs_temp.push({
              type: "success",
              code: code_text_array.join(" "),
              message: `Moved the data (${
                memory[[registers_temp["H"] + registers_temp["L"]]]
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
      }

      //XCHG============================================================
      else if (code_text_array[0] == "XCHG") {
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
      }

      //LXI==================================================================
      else if (code_text_array[0] == "LXI") {
        program_counter = inr(program_counter);
        if (code_text_array[1] == "B") {
          registers_temp = {
            ...registers_temp,
            B: memory[program_counter],
            C: memory[inr(program_counter)],
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Loaded the given data ${memory[program_counter]}${
              memory[inr(program_counter)]
            } into BC register pair.`,
          });
        }
        if (code_text_array[1] == "D") {
          registers_temp = {
            ...registers_temp,
            D: memory[program_counter],
            E: memory[inr(program_counter)],
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Loaded the given data ${memory[program_counter]}${
              memory[inr(program_counter)]
            } into DE register pair.`,
          });
        }
        if (code_text_array[1] == "H") {
          registers_temp = {
            ...registers_temp,
            H: memory[program_counter],
            L: memory[inr(program_counter)],
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Loaded the given data ${memory[program_counter]}${
              memory[inr(program_counter)]
            } into HL register pair.`,
          });
        }

        program_counter = inr(inr(program_counter));
      }
      //LDAX==============================================================
      else if (code_text_array[0] == "LDAX") {
        program_counter = inr(program_counter);
        let data = memory[registers_temp["B"] + registers_temp["C"]]
          ? memory[registers_temp["B"] + registers_temp["C"]]
          : "00";

        if (code_text_array[1] == "B") {
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
      } else if (code_text_array[0] == "LHLD") {
        program_counter = inr(program_counter);
        let data_L = memory[
          memory[program_counter] + memory[inr(program_counter)]
        ]
          ? memory[memory[program_counter] + memory[inr(program_counter)]]
          : "00";
        let data_H = memory[
          inr(memory[program_counter] + memory[inr(program_counter)])
        ]
          ? memory[inr(memory[program_counter] + memory[inr(program_counter)])]
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
            memory[program_counter] + memory[inr(program_counter)]
          }) i.e ${data_L} in L and data stored in given memory location (${inr(
            memory[program_counter] + memory[inr(program_counter)]
          )}) i.e ${data_H} in H.`,
        });

        program_counter = inr(inr(program_counter));
      } else if (code_text_array[0] == "LDA") {
        let data = memory[
          memory[program_counter] + memory[inr(program_counter)]
        ]
          ? memory[memory[program_counter] + memory[inr(program_counter)]]
          : "00";

        program_counter = inr(program_counter);
        registers_temp = {
          ...registers_temp,
          A: data,
        };
        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `Loaded the data stored in given memory location ${
            memory[program_counter] + memory[inr(program_counter)]
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
        }
      } else if (code_text_array[0] == "SHLD") {
        program_counter = inr(program_counter);
        memory = {
          ...memory,
          [memory[program_counter] + memory[inr(program_counter)]]:
            registers_temp["L"],
          [inr(memory[program_counter] + memory[inr(program_counter)])]:
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
          } in memory location ${inr(
            memory[program_counter] + memory[inr(program_counter)]
          )}).`,
        });
        program_counter = inr(inr(program_counter));
      } else if (code_text_array[0] == "STA") {
        program_counter = inr(program_counter);
        memory = {
          ...memory,
          [memory[program_counter] + memory[inr(program_counter)]]:
            registers_temp["A"],
        };
        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `Stored the content of register A i.e ${
            registers_temp["A"]
          } into given memory location ${[
            memory[program_counter] + memory[inr(program_counter)],
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
          let to_add = memory[registers_temp.H + registers_temp.L];
          if (dec(to_add.slice(1)) + dec(registers_temp["A"].slice(1)) > 15) {
            flags_temp.AC = 1;
          } else {
            flags_temp.AC = 0;
          }
          (registers_temp["A"] = hex(dec(to_add) + dec(registers_temp["A"]))),
            padStart(2, "0").toUpperCase();
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
          let to_add = memory[registers_temp.H + registers_temp.L];

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
      } else if (code_text_array[0] == "SUB") {
        program_counter = inr(program_counter);

        if (code_text_array[1] != "M") {
          let to_sub = registers_temp[code_text_array[1]];
          if (dec(to_sub.slice(1)) > dec(registers_temp.A.slice(1))) {
            flags_temp.AC = 1;
          } else {
            flags_temp.AC = 0;
          }
          let acc_temp = registers_temp.A;
          registers_temp.A = hex(Math.abs(dec(registers_temp.A) - dec(to_sub)))
            .padStart(2, "0")
            .toUpperCase();

          if (dec(to_sub) > dec(acc_temp)) {
            registers_temp.A = "1" + registers_temp.A.toString();
          }

          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Subtracted the content of ${code_text_array[1]} i.e ${to_sub} from Accmulator.`,
          });
        } else {
          let to_sub = memory[registers_temp.H + registers_temp.L];
          if (dec(to_sub.slice(1)) > dec(registers_temp.A.slice(1))) {
            flags_temp.AC = 1;
          } else {
            flags_temp.AC = 0;
          }
          let acc_temp = registers_temp.A;
          registers_temp.A = hex(Math.abs(dec(registers_temp.A) - dec(to_sub)))
            .padStart(2, "0")
            .toUpperCase();

          if (dec(to_sub) > dec(acc_temp)) {
            registers_temp.A = "1" + registers_temp.A.toString();
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
          flags_temp.AC = 1;
        } else {
          flags_temp.AC = 0;
        }
        let acc_temp = registers_temp.A;
        registers_temp.A = hex(Math.abs(dec(registers_temp.A) - dec(to_sub)))
          .padStart(2, "0")
          .toUpperCase();

        if (dec(to_sub) > dec(acc_temp)) {
          registers_temp.A = "1" + registers_temp.A.toString();
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
          let carry = flags.C;
          if (
            dec(to_sub.slice(1)) >
            dec(registers_temp.A.slice(1)) - dec(flags_temp.C)
          ) {
            flags_temp.AC = 1;
          } else {
            flags_temp.AC = 0;
          }
          let acc_temp = registers_temp.A;
          registers_temp.A = hex(
            Math.abs(dec(registers_temp.A) - dec(to_sub) - dec(flags_temp.C))
          )
            .padStart(2, "0")
            .toUpperCase();

          if (dec(to_sub) > dec(acc_temp) - dec(flags_temp.C)) {
            registers_temp.A = "1" + registers_temp.A.toString();
          }

          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Subtracted the content of ${code_text_array[1]} i.e ${to_sub} and carry i.e. ${flags_temp.C}from Accmulator.`,
          });
        } else {
          let to_sub = memory[registers_temp.H + registers_temp.L];
          let carry = flags.C;
          if (
            dec(to_sub.slice(1)) >
            dec(registers_temp.A.slice(1)) - dec(flags_temp.C)
          ) {
            flags_temp.AC = 1;
          } else {
            flags_temp.AC = 0;
          }
          let acc_temp = registers_temp.A;
          registers_temp.A = hex(
            Math.abs(dec(registers_temp.A) - dec(to_sub) - dec(flags_temp.C))
          )
            .padStart(2, "0")
            .toUpperCase();

          if (dec(to_sub) > dec(acc_temp) - dec(flags_temp.C)) {
            registers_temp.A = "1" + registers_temp.A.toString();
          }

          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Subtracted the content of memory pointed by HL (${
              registers_temp.H + registers_temp.L
            })i.e ${to_sub} and carry i.e. ${flags_temp.C}from Accmulator.`,
          });
        }
      } else if (code_text_array[0] == "INR") {
        program_counter = inr(program_counter);
        if (code_text_array[1] !== "M") {
          registers_temp[code_text_array[1]] = inr(
            registers_temp[code_text_array[1]]
          );
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Incremented the value of register ${
              code_text_array[1]
            }  by 1 i.e. now it is ${registers_temp[code_text_array[1]]}.`,
          });
        } else {
          memory[registers_temp.H + registers_temp.L] = inr(
            memory[registers_temp.H + registers_temp.L]
              ? memory[registers_temp.H + registers_temp.L]
              : "00"
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
          let ac_flag = flagsStatus(
            flags_temp,
            registers_temp[code_text_array[1]]
          );
          flags_temp = ac_flag.flags;
          registers_temp[code_text_array[1]] = ac_flag.acc;
        }
      } else if (code_text_array[0] == "DCR") {
        program_counter = inr(program_counter);
        if (code_text_array[1] !== "M") {
          registers_temp[code_text_array[1]] = dcr(
            registers_temp[code_text_array[1]]
          );
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Decremented the value of register ${
              code_text_array[1]
            }  by 1 i.e. now it is i.e. ${registers_temp[code_text_array[1]]}`,
          });
        } else {
          memory[registers_temp.H + registers_temp.L] = dcr(
            memory[registers_temp.H + registers_temp.L]
              ? memory[registers_temp.H + registers_temp.L]
              : "00"
          );
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Decremented the content of memory pointed by HL(${
              registers_temp.H + registers_temp.L
            })  by 1 i.e now it is i.e. ${
              memory[registers_temp.H + registers_temp.L]
            }`,
          });
          let ac_flag = flagsStatus(
            flags_temp,
            registers_temp[code_text_array[1]]
          );
          flags_temp = ac_flag.flags;
          registers_temp[code_text_array[1]] = ac_flag.acc;
        }
      } else if (code_text_array[0] == "INX") {
        program_counter = inr(program_counter);
        if (code_text_array[1] == "B") {
          let content = hex(
            inr(dec(registers_temp.B + registers_temp.C)) % 65535
          );
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
          let content = hex(
            inr(dec(registers_temp.D + registers_temp.E)) % 65535
          );
          registers_temp = {
            ...registers_temp,
            D: content.slice(0, 2),
            E: content.slice(2),
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Incremented the data of regester pair BC by 1. Now it stores ${
              registers_temp["D"] + registers_temp["E"]
            }`,
          });
        }
        if (code_text_array[1] == "H") {
          let content = hex(
            inr(dec(registers_temp.H + registers_temp.L)) % 65535
          );
          registers_temp = {
            ...registers_temp,
            H: content.slice(0, 2),
            L: content.slice(2),
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Incremented the data of regester pair BC by 1. Now it stores ${
              registers_temp["H"] + registers_temp["L"]
            }`,
          });
        }
      } else if (code_text_array[0] == "DCX") {
        program_counter = inr(program_counter);
        if (code_text_array[1] == "B") {
          let content = hex(
            dcr(dec(registers_temp.B + registers_temp.C)) % 65535
          );
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
          let content = hex(
            dcr(dec(registers_temp.D + registers_temp.E)) % 65535
          );
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
          let content = hex(
            dcr(dec(registers_temp.H + registers_temp.L)) % 65535
          );
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
        }

        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `Added the data stored by register pair ${rp} i.e. ${to_add} to data in HL pair.`,
        });
      } else if (code_text_array[0] == "ANA") {
        program_counter = inr(program_counter);
        registers_temp.A = hex(
          dec(registers_temp.A) & dec(registers_temp[code_text_array[1]])
        );

        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `ANDed the data stored by register ${
            code_text_array[1]
          } i.e. ${registers_temp[code_text_array[1]]} to data in Accumulator.`,
        });
      } else if (code_text_array[0] == "ORA") {
        program_counter = inr(program_counter);
        registers_temp.A = hex(
          dec(registers_temp.A) | dec(registers_temp[code_text_array[1]])
        );
        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `ORed the data stored by register ${
            code_text_array[1]
          } i.e. ${registers_temp[code_text_array[1]]} to data in Accumulator.`,
        });
      } else if (code_text_array[0] == "XRA") {
        program_counter = inr(program_counter);
        registers_temp.A = hex(
          dec(registers_temp.A) ^ dec(registers_temp[code_text_array[1]])
        );
        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `XORed the data stored by register ${
            code_text_array[1]
          } i.e. ${registers_temp[code_text_array[1]]} to data in Accumulator.`,
        });
      } else if (code_text_array[0] == "CMP") {
        program_counter = inr(program_counter);
        if (code_text_array[1] != "M") {
          registers_temp[code_text_array[1]] = hex(
            ~dec(registers_temp[code_text_array[1]]) >>> 0
          ).slice(-2);

          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Complemented the data stored by register ${code_text_array[1]} .`,
          });
        } else {
          memory[registers_temp.H + registers_temp.L] = hex(
            ~dec(memory[registers_temp.H + registers_temp.L]) >>> 0
          ).slice(-2);

          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Complemented the data stored by memory pointed by HL ${
              registers_temp.H + registers_temp.L
            } `,
          });
        }
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
      } else {
        let ac_flag = flagsStatus(flags_temp, registers_temp["A"]);
        flags_temp = ac_flag.flags;
        registers_temp["A"] = ac_flag.acc;
      }
      console.log("Executing");

      memory_states_temp.push(JSON.parse(JSON.stringify(memory)));
      register_states_temp.push(JSON.parse(JSON.stringify(registers_temp)));
      let ac_flag = flagsStatus(flags_temp, registers_temp["A"]);
      flags_temp = ac_flag.flags;
      registers_temp["A"] = ac_flag.acc;
      registers_temp["M"] = memory[registers_temp.H + registers_temp.L]
        ? memory[registers_temp.H + registers_temp.L]
        : "00";
    }
    memory = format(memory);
    setMemory(memory);
    setLogs(logs_temp);
    for (let i in memory_states_temp) {
      memory_states_temp[i] = format(memory_states_temp[i]);
    }
    setMemoryStates(memory_states_temp);
    setRegisterStates(register_states_temp);

    setFlags(flags_temp);
    setRegisters(format(registers_temp));
  };

  return (
    <div className="body-container">
      <div className="main-container">
        <CodeEditor
          execute={(code) => execute(code)}
          current_address={current_address}
          setCurrentAddress={setCurrentAddress}
        />
        <Memory memory={memory} compilation_memory={compilation_memory} />

        <Registers registers={registers} />

        <Tools />
      </div>
      <div className="bottom-container">
        <Log
          logs={logs}
          setMemory={setMemory}
          setRegisters={setRegisters}
          register_states={register_states}
          memory_states={memory_states}
        />
        <Flag flags={flags} />
      </div>
    </div>
  );
}
