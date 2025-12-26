import React from "react";
import Editor from "@monaco-editor/react";

const SQLEditor = ({ value, onChange }) => {
  const handleEditorChange = (newValue) => {
    onChange(newValue || "");
  };

  return (
    <div className="sql-editor">
      <Editor
        height="300px"
        defaultLanguage="sql"
        theme="vs-dark"
        value={value}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
        }}
      />
    </div>
  );
};

export default SQLEditor;
