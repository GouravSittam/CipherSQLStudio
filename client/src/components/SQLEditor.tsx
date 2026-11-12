/**
 * SQL Editor component using Monaco Editor
 *
 * Wraps the Monaco editor (the editor VS Code uses) with SQL-friendly defaults.
 * Ctrl/Cmd + Enter runs the query.
 */

import Editor, { type OnMount } from "@monaco-editor/react";
import { useEffect, useRef } from "react";

type EditorOptions = NonNullable<Parameters<typeof Editor>[0]["options"]>;

const EDITOR_OPTIONS: EditorOptions = {
  minimap: { enabled: false }, // overkill for small queries
  fontSize: 14,
  lineNumbers: "on",
  scrollBeyondLastLine: false,
  automaticLayout: true, // handles resize automatically
  tabSize: 2,
  wordWrap: "on",
};

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
}

export default function SQLEditor({ value, onChange, onRun }: SQLEditorProps) {
  // Keep the latest callback so the keybinding registered on mount never goes stale
  const onRunRef = useRef(onRun);
  useEffect(() => {
    onRunRef.current = onRun;
  }, [onRun]);

  const handleMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => onRunRef.current?.());
  };

  return (
    <div className="sql-editor">
      <Editor
        height="300px"
        defaultLanguage="sql"
        theme="vs-dark"
        value={value}
        onChange={(newValue) => onChange(newValue ?? "")}
        onMount={handleMount}
        options={EDITOR_OPTIONS}
      />
    </div>
  );
}
