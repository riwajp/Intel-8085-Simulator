import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { memo, useRef, useState } from "react";
import codes_json from "../codes";

import Memory from "./Components/Memory";
import Controls from "./Components/Controls";
import Registers from "./Components/Registers";
import { inr } from "../utils";
export default function Home() {
  const input_ref = useRef();
  const [registers, setRegisters] = useState({
    A: "",
    B: "",
    C: "",
    D: "",
    E: "",
    H: "",
    L: "",
  });

  const [current_address, setCurrentAddress] = useState("6969");
  const [memory, setMemory] = useState({});

  const execute = () => {
    var program_counter = current_address;
    while (memory[program_counter] != undefined) {
      console.log(program_counter);
      var code = memory[program_counter];
      let code_text = codes_json.filter((c) => c.opCode == code)[0].label;

      let code_text_array = code_text.split(" ");

      //mvi==============================================================================================
      if (code_text_array[0] == "MVI") {
        program_counter = inr(program_counter);
        if (code_text_array[1] != "M") {
          setRegisters({
            ...registers,
            [code_text_array[1]]: memory[program_counter],
          });
        } else if (code_text_array[1] == "M") {
          setMemory({
            ...memory,
            [registers["H"] + registers["L"]]: memory[program_counter],
          });
        }
        program_counter = inr(program_counter);
      }
      //========================================================================================================

      //mov=====================================================================================================
      /*
      if (code_text_array[0] == "MOV") {
        program_counter = inr(program_counter);

        if(code_text_array[1]!="M" && code)
      }
      */
    }
  };

  console.log(memory, registers);
  return (
    <div className={styles.container}>
      <button onClick={() => execute()}>Execute</button>
      <Memory
        address={current_address}
        memory={memory}
        setMemory={setMemory}
        setCurrentAddress={setCurrentAddress}
      />
      <Controls setCurrentAddress={setCurrentAddress} />
      <Registers registers={registers} />
    </div>
  );
}
