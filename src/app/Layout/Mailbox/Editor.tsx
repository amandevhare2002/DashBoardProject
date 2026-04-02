import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css"; // Import Sun Editor's CSS File
import { buttonList } from "suneditor-react";

const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
});

interface EditorProps {
  onchange: (content: string) => void;
  newValue: string;
}

export const Editor: React.FC<EditorProps> = ({ onchange, newValue }: any) => {
  return (
    <SunEditor
      appendContents={newValue}
      onChange={(content: string) => {
        onchange(content);
      }}
      setOptions={{
        height: "200px",
        buttonList: buttonList.complex,
      }}
    />
  );
};

export default Editor;
