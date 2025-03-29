import React, { useState, useEffect, useRef } from 'react'
import './QueryResultTable.css'
import { FixedSizeList as List } from 'react-window'

function RowModal({ row, columns, onClose }) {
    if (!row) return null;
    return (
      <div className="modal-overlay active">
        <div className="modal-content">
          <h3>Row Details</h3>
          <table className="modal-table">
            <tbody>
              {columns.map((col) => (
                <tr key={col}>
                  <th>{col}</th>
                  <td>{row[col]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }
  

const QueryResultTable = ({ columns, data }) => {
  const [selectedRow, setSelectedRow] = useState(null)

  
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setSelectedRow(null)
      }
    }
    if (selectedRow) {
      window.addEventListener('keydown', handleEsc)
    }
    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [selectedRow])


  const [columnsState, setColumnsState] = useState([])

  useEffect(() => {
    setColumnsState(
      columns.map((col) => ({
        key: col,
        width: 150,
        visible: true,
      }))
    )
  }, [columns])

  const visibleColumns = columnsState.filter((c) => c.visible)
  const dragKeyRef = useRef(null)

  const handleMouseDown = (e, colKey) => {
    e.preventDefault()
    const startX = e.clientX
    const colIndex = columnsState.findIndex((c) => c.key === colKey)
    const startWidth = columnsState[colIndex].width

    const onMouseMove = (moveEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX)
      setColumnsState((prev) =>
        prev.map((c) =>
          c.key === colKey ? { ...c, width: Math.max(newWidth, 50) } : c
        )
      )
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  if (!columns || !data || columns.length === 0 || data.length === 0) {
    return <div>No table data to display.</div>
  }

  const Row = ({ index, style, data: rowData }) => {
    const row = rowData.rows[index] || {}
    return (
      <div
        className={`table-row ${index % 2 === 0 ? 'even' : 'odd'}`}
        style={style}
        onClick={() => rowData.onRowClick(row)}
      >
        {visibleColumns.map((col) => (
          <div
            key={col.key}
            className="table-cell"
            style={{
              width: col.width,
              minWidth: col.width,
              maxWidth: col.width,
            }}
          >
            {row[col.key]}
          </div>
        ))}
      </div>
    )
  }

  const listData = {
    rows: data,
    onRowClick: (row) => setSelectedRow(row),
  }

  const rowHeight = 35
  const listHeight = 400
  const itemCount = data.length


  const totalTableWidth = visibleColumns.reduce(
    (acc, col) => acc + col.width,
    0
  )

  return (
    <div className="table-outer-container">
      <div className="column-toggle-container">
        {columnsState.map((col) => (
          <label key={col.key} className="column-toggle-label">
            <input
              type="checkbox"
              checked={col.visible}
              onChange={() =>
                setColumnsState((prev) =>
                  prev.map((c) =>
                    c.key === col.key ? { ...c, visible: !c.visible } : c
                  )
                )
              }
            />
            {col.key}
          </label>
        ))}
      </div>

      <div className="table-scroll-wrapper">
        <div
          className="table-header"
          style={{ width: totalTableWidth }}
        >
          {visibleColumns.map((col) => (
            <div
              key={col.key}
              className="table-header-cell"
              style={{
                width: col.width,
                minWidth: col.width,
                maxWidth: col.width,
              }}
              draggable
              onDragStart={() => {
                dragKeyRef.current = col.key
              }}
              onDragOver={(e) => {
                e.preventDefault()
              }}
              onDrop={() => {
                const draggedKey = dragKeyRef.current
                const targetKey = col.key
                if (draggedKey === targetKey) return

                setColumnsState((prev) => {
                  const newState = [...prev]
                  const draggedIndex = newState.findIndex((c) => c.key === draggedKey)
                  const targetIndex = newState.findIndex((c) => c.key === targetKey)
                  const [draggedColumn] = newState.splice(draggedIndex, 1)
                  newState.splice(targetIndex, 0, draggedColumn)
                  return newState
                })
              }}
            >
              <span className="header-title">{col.key}</span>
              <span
                className="resize-handle"
                onMouseDown={(e) => handleMouseDown(e, col.key)}
              />
            </div>
          ))}
        </div>

        <List
          height={listHeight}
          itemCount={itemCount}
          itemSize={rowHeight}
          width={totalTableWidth}
          itemData={listData}
        >
          {Row}
        </List>
      </div>

      {selectedRow && (
        <RowModal
          row={selectedRow}
          columns={visibleColumns.map((col) => col.key)}
          onClose={() => setSelectedRow(null)}
        />
      )}
    </div>
  )
}

export default QueryResultTable
