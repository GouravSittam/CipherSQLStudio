/**
 * SQL Editor component using Monaco Editor
 *
 * This wraps the Monaco editor with some nice defaults for SQL.
 * Monaco is the same editor VS Code uses so it's pretty solid.
 */

import React from "react";
import Editor from "@monaco-editor/react";

const SQLEditor = ({ value, onChange }) => {
  // Just pass the value up to parent, handle empty string edge case
  const handleEditorChange = (newValue) => {
    onChange(newValue || "");
  };

  // Editor options - tweaked these a bunch to get it looking right
  const editorOptions = {
    minimap: { enabled: false }, // minimap is overkill for small queries
    fontSize: 14,
    lineNumbers: "on",
    scrollBeyondLastLine: false,
    automaticLayout: true, // handles resize automatically
    tabSize: 2,
    wordWrap: "on",
  };

  return (
    <div className="sql-editor">
      <Editor
        height="300px"
        defaultLanguage="sql"
        theme="vs-dark"
        value={value}
        onChange={handleEditorChange}
        options={editorOptions}
      />
    </div>
  );
};

export default SQLEditor;
