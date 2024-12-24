"use client";

import { useRef, useEffect } from "react";

export default function Editor({
  className,
  onChange,
  code,
}: {
  className?: String;
  onChange: (code: String) => void;
  code: String;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  function updateLineNumbers() {
    const editor = editorRef.current;
    const lineNumbers = document.getElementById("line-numbers") as HTMLElement;

    if (editor && lineNumbers) {
      const lines = editor.innerText.split("\n").filter((line, idx, arr) => {
        return idx < arr.length - 1 || line.trim() !== "";
      });

      const totalLines = lines.length > 0 ? lines.length : 1;

      lineNumbers.innerHTML = Array.from(
        { length: totalLines },
        (_, i) => i + 1
      ).join("<br>");
    }
  }

  function syncScroll() {
    const editor = editorRef.current;
    const lineNumbers = document.getElementById("line-numbers") as HTMLElement;

    if (editor && lineNumbers) {
      lineNumbers.scrollTop = editor.scrollTop;
    }
  }

  useEffect(() => {
    updateLineNumbers();
  }, []);

  return (
    <div className={`mockup-code  h-[350px] sm:h-full ${className}`}>
      <div className="relative w-full  h-full rounded-md overflow-auto leading-8">
        <div
          id="line-numbers"
          className="absolute top-0 left-0 w-12  text-right text-gray-500 font-mono pt-2 px-2 select-none "
        >
          1<br /> 2<br /> 3
        </div>

        {/* Content Editable Area */}
        <div
          id="editor"
          ref={editorRef}
          contentEditable={true}
          className="relative left-12 w-[calc(100%-3rem)] h-full  font-bold font-spaceMono p-2 outline-none uppercase tracking-widest  "
          style={{ wordSpacing: "0.8em" }}
          onInput={(e) => {
            updateLineNumbers();
            onChange((e.target as HTMLInputElement).innerText);
          }}
          onScroll={syncScroll}
          spellCheck={false}
          suppressContentEditableWarning={true}
        >
          MVI A 90
          <br />
          INR A<br />
          HLT
        </div>
      </div>
    </div>
  );
}
