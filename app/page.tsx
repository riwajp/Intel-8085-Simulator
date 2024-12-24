"use client";

import About from "@/components/About";
import Container from "@/components/Container";
import Control from "@/components/Control";
import Editor from "@/components/Editor";
import Log from "@/components/Log";
import Memory from "@/components/Memory";
import Registers from "@/components/Registers";
import { useContext, useEffect, useState } from "react";
import { appContext } from "./contexts";
import { execute, load } from "@/app/utils";

export default function IDE() {
  const { Provider } = appContext;
  const appState = useContext(appContext);

  let initialRegisters = {
    A: "00",
    B: "00",
    C: "00",
    D: "00",
    E: "00",
    H: "00",
    L: "00",
  };
  const [code, setCode] = useState<String>("mvi a 90\ninr a\nhlt");
  const [startAddress, setStartAddress] = useState("6969");
  const [labels, setLabels] = useState({});
  const [linesMap, setLinesMap] = useState({});
  const [memory, setMemory] = useState({});
  const [compilationMemory, setCompilationMemory] = useState({});
  const [errors, setErrors] = useState({});
  const [registers, setRegisters] = useState(initialRegisters);
  const [logs, setLogs] = useState<any[]>([]);
  const [flags, setFlags] = useState({});

  const [memoryStates, setMemoryStates] = useState<any>([]);
  const [registerStates, setRegisterStates] = useState<any>([]);
  const [flagStates, setFlagStates] = useState<any>([]);

  const [delay, setDelay] = useState(10);

  console.log(code);

  useEffect(() => {
    dispatchLoad();
  }, []);
  const dispatchLoad = async () => {
    const res: any = load(code, initialRegisters, startAddress);
    if (!res.error) {
      setMemory(res.memory);
      setLabels(res.labels);
      setLinesMap(res.lines_map);
      setCompilationMemory(res.compilationMemory);
    }

    const finalRes = await execute(code, initialRegisters, startAddress);
    setMemory(finalRes?.memory ?? {});
    setRegisters(finalRes?.registers);
    setLogs(finalRes?.logs ?? []);
    setFlags(finalRes?.flags ?? {});
    setMemoryStates(finalRes?.memoryStates ?? []);
    setRegisterStates(finalRes?.registerStates ?? []);
    setFlagStates(finalRes?.flagStates ?? []);
  };

  const rollBack = (i: Number) => {
    setMemory(memoryStates[i as any]);
    setRegisters(registerStates[i as any]);
    setFlags(flagStates[i as any]);
  };
  return (
    <Provider value={appState}>
      <Container>
        <Editor
          className="col-span-2 row-span-3"
          onChange={(code) => setCode(code)}
          code={code}
        />
        <div className="flex flex-col col-span-2 md:col-span-1 gap-1 sm:gap-4 row-span-3">
          <Memory className="grow-1" memory={memory} />
          <Registers registers={registers} />
        </div>
        <About className="md:row-span-3 max-md:order-first   max-md:row-start-1  max-md:col-span-4 " />

        <Log
          className="row-span-2 col-span-3"
          rollBack={rollBack}
          logs={logs}
          flags={flags}
        />
        <Control
          className="row-span-2"
          onExecute={dispatchLoad}
          onDelayChange={(delay: any) => setDelay(delay)}
          onAddressChange={(address: any) => setStartAddress(address)}
        />
      </Container>
    </Provider>
  );
}
