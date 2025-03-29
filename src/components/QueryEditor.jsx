
import React, { useRef, useState, useEffect } from 'react'
import './QueryEditor.css'

const QueryEditor = ({ queryText, onChange }) => {
  const textAreaRef = useRef(null)
  const lineNumbersRef = useRef(null)
  const [lineCount, setLineCount] = useState(1)


  useEffect(() => {
    const lines = queryText.split('\n').length
    setLineCount(lines)
  }, [queryText])


  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop
    }
  }


  const lineNumbersArray = []
  for (let i = 1; i <= lineCount; i++) {
    lineNumbersArray.push(i)
  }

  return (
    <div className="query-editor-container">
      <label htmlFor="queryText" className="query-editor-label">
        SQL Query:
      </label>

      <div className="query-editor-wrapper">
        {/* Left panel for line numbers */}
        <div className="line-numbers" ref={lineNumbersRef}>
          {lineNumbersArray.map((num) => (
            <div key={num} className="line-number">
              {num}
            </div>
          ))}
        </div>

        {/* Actual text area for SQL */}
        <textarea
          id="queryText"
          ref={textAreaRef}
          className="query-editor-textarea code-textarea"
          value={queryText}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          rows={8}
          placeholder="Type or paste your SQL query here..."
        />
      </div>
    </div>
  )
}

export default QueryEditor
