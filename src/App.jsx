import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import Papa from 'papaparse'
import { format } from 'sql-formatter'
import { dummyGroups } from './data/dummyGroups'
import QueryEditor from './components/QueryEditor'
import QueryResultTable from './components/QueryResultTable'
import { FiMoon, FiSun, FiPlus, FiX, FiCopy, FiTrash2, FiSave, FiPlay, FiCode, FiList } from 'react-icons/fi';

function App() {

  const [theme, setTheme] = useState('dark')
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) setTheme(savedTheme)
  }, [])
  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.body.className = theme
  }, [theme])
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const [customersData, setCustomersData] = useState([])
  const [productsData, setProductsData] = useState([])
  const [ordersData, setOrdersData] = useState([])

  useEffect(() => {
    Papa.parse('/customers.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => setCustomersData(results.data),
    })
    Papa.parse('/products.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => setProductsData(results.data),
    })
    Papa.parse('/orders.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => setOrdersData(results.data),
    })
  }, [])

  const defaultGroup = dummyGroups[0]
  const defaultQuery = defaultGroup.queries[0]
  const [tabs, setTabs] = useState([
    {
      id: 1,
      groupId: defaultGroup.id,
      queryId: defaultQuery.id,
      queryText: defaultQuery.sql,
      tableColumns: [],
      tableData: [],
    },
  ])
  const [activeTabId, setActiveTabId] = useState(1)
  const [tabCounter, setTabCounter] = useState(2)


  const [queryHistory, setQueryHistory] = useState([])
  const [querySnippets, setQuerySnippets] = useState([])

  useEffect(() => {
    const storedHistory = localStorage.getItem('queryHistory')
    if (storedHistory) {
      setQueryHistory(JSON.parse(storedHistory))
    }
  }, [])

  const [paginationEnabled, setPaginationEnabled] = useState(true)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [currentPage, setCurrentPage] = useState(1)

  const activeTab = tabs.find((t) => t.id === activeTabId)

  const findExactMatchQuery = (sqlText) => {
    for (const g of dummyGroups) {
      for (const q of g.queries) {
        if (q.sql.trim() === sqlText.trim()) {
          return { groupId: g.id, query: q }
        }
      }
    }
    return null
  }

  function applyFilter(groupId, queryId) {
    if (groupId === 'customers') {
      if (queryId === 'cust_all') {
        return {
          columns: customersData.length ? Object.keys(customersData[0]) : [],
          data: customersData,
        }
      } else if (queryId === 'cust_germany') {
        const filtered = customersData.filter((r) =>
          String(r.Country).trim().toLowerCase() === 'germany'
        )
        return {
          columns: filtered.length ? Object.keys(filtered[0]) : [],
          data: filtered,
        }
      }
    } else if (groupId === 'products') {
      if (queryId === 'prod_all') {
        return {
          columns: productsData.length ? Object.keys(productsData[0]) : [],
          data: productsData,
        }
      } else if (queryId === 'prod_filtered') {
        const filtered = productsData.filter((r) =>
          r.UnitPrice > 18 && r.UnitStock > 15
        )
        return {
          columns: filtered.length ? Object.keys(filtered[0]) : [],
          data: filtered,
        }
      }
    } else if (groupId === 'orders') {
      if (queryId === 'ord_all') {
        return {
          columns: ordersData.length ? Object.keys(ordersData[0]) : [],
          data: ordersData,
        }
      } else if (queryId === 'ord_ships') {
        const allowedCountries = ['france', 'germany', 'brazil', 'belgium']
        const filtered = ordersData.filter((r) => {
          const shipCountry = String(r.ShipCountry).trim().toLowerCase()
          return r.Freight > 10 && allowedCountries.includes(shipCountry)
        })
        return {
          columns: filtered.length ? Object.keys(filtered[0]) : [],
          data: filtered,
        }
      }
    }
    return { columns: [], data: [] }
  }

  function naiveParse(sqlText) {
    const lower = sqlText.toLowerCase()
    if (lower.includes('customers')) {
      return {
        columns: customersData.length ? Object.keys(customersData[0]) : [],
        data: customersData,
      }
    } else if (lower.includes('products')) {
      return {
        columns: productsData.length ? Object.keys(productsData[0]) : [],
        data: productsData,
      }
    } else if (lower.includes('orders')) {
      return {
        columns: ordersData.length ? Object.keys(ordersData[0]) : [],
        data: ordersData,
      }
    }
    return { columns: [], data: [] }
  }

  const handleGroupChange = (e) => {
    const newGroupId = e.target.value
    const foundGroup = dummyGroups.find((g) => g.id === newGroupId)
    if (!foundGroup) return

    const firstQuery = foundGroup.queries[0]
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== activeTabId) return tab
        return {
          ...tab,
          groupId: newGroupId,
          queryId: firstQuery.id,
          queryText: firstQuery.sql,
        }
      })
    )
  }

  const handleSubQueryChange = (e) => {
    const newQueryId = e.target.value
    const foundGroup = dummyGroups.find((g) => g.id === activeTab?.groupId)
    if (!foundGroup) return

    const foundQuery = foundGroup.queries.find((q) => q.id === newQueryId)
    if (!foundQuery) return

    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== activeTabId) return tab
        return {
          ...tab,
          queryId: newQueryId,
          queryText: foundQuery.sql,
        }
      })
    )
  }

  const handleQueryTextChange = (newText) => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== activeTabId) return tab
        return { ...tab, queryText: newText }
      })
    )
  }

  const tableAreaRef = useRef(null)

  const handleRunQuery = () => {
    if (!activeTab) return
    const { queryText } = activeTab
    const exactMatch = findExactMatchQuery(queryText)
    let result
    if (exactMatch) {
      const { groupId, query } = exactMatch
      result = applyFilter(groupId, query.id)
    } else {
      result = naiveParse(queryText)
    }
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== activeTabId) return tab
        return {
          ...tab,
          tableColumns: result.columns,
          tableData: result.data,
        }
      })
    )
    setCurrentPage(1)

    const historyEntry = {
      queryText,
      timestamp: new Date().toLocaleString(),
    }
    const newHistory = [historyEntry, ...queryHistory]
    setQueryHistory(newHistory)
    localStorage.setItem('queryHistory', JSON.stringify(newHistory))

    if (tableAreaRef.current) {
      tableAreaRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleClearQuery = () => {
    if (!activeTab) return
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== activeTabId) return tab
        return { ...tab, queryText: '' }
      })
    )
  }

  const handleSaveQuery = () => {
    if (!activeTab) return
    localStorage.setItem('savedQuery', activeTab.queryText)
    alert('Query saved!')
  }

  const handleFormatSQL = () => {
    if (!activeTab) return
    try {
      const formatted = format(activeTab.queryText, {
        language: 'sql',
        uppercase: true,
        indent: '    ',
      })
      handleQueryTextChange(formatted)
    } catch (error) {
      console.error('Error formatting SQL:', error)
    }
  }

  const handleLoadQuery = () => {
    const saved = localStorage.getItem('savedQuery')
    if (saved) {
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id !== activeTabId) return tab
          return { ...tab, queryText: saved }
        })
      )
      alert('Loaded saved query!')
    } else {
      alert('No saved query found.')
    }
  }

  const handleSaveSnippet = () => {
    if (!activeTab) return
    const snippetName = prompt('Enter snippet name:')
    if (snippetName) {
      const newSnippet = { name: snippetName, snippet: activeTab.queryText }
      setQuerySnippets((prev) => [...prev, newSnippet])
    }
  }

  const handleClearHistory = () => {
    const confirmClear = window.confirm(
      'Are you sure you want to clear the entire query history?'
    )
    if (confirmClear) {
      setQueryHistory([])
      localStorage.removeItem('queryHistory')
    }
  }

  const handleCopyHistory = (index) => {
    const text = queryHistory[index].queryText
    navigator.clipboard.writeText(text)
    alert('Query copied to clipboard!')
  }
  const handleDeleteHistory = (index) => {
    const newHistory = [...queryHistory]
    newHistory.splice(index, 1)
    setQueryHistory(newHistory)
    localStorage.setItem('queryHistory', JSON.stringify(newHistory))
  }
  const handleCopySnippet = (index) => {
    const text = querySnippets[index].snippet
    navigator.clipboard.writeText(text)
    alert('Snippet copied to clipboard!')
  }
  const handleDeleteSnippet = (index) => {
    const newSnippets = [...querySnippets]
    newSnippets.splice(index, 1)
    setQuerySnippets(newSnippets)
  }

  const handleVisualizeData = () => {
    if (!activeTab) return
    let dataset = []
    if (activeTab.groupId === 'customers') {
      dataset = customersData
    } else if (activeTab.groupId === 'products') {
      dataset = productsData
    } else if (activeTab.groupId === 'orders') {
      dataset = ordersData
    }
    const columns = dataset.length ? Object.keys(dataset[0]) : []

    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== activeTabId) return tab
        return {
          ...tab,
          tableColumns: columns,
          tableData: dataset,
        }
      })
    )
    setCurrentPage(1)
    if (tableAreaRef.current) {
      tableAreaRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault()
        handleRunQuery()
      }
      if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault()
        handleSaveQuery()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeTab, tabs])

  const handleTabClick = (tabId) => {
    setActiveTabId(tabId)
  }

  const handleCloseTab = (tabId) => {
    setTabs((prev) => {
      const newTabs = prev.filter((t) => t.id !== tabId)
      if (newTabs.length === 0) {
        const newTab = {
          id: tabCounter,
          groupId: defaultGroup.id,
          queryId: defaultQuery.id,
          queryText: defaultQuery.sql,
          tableColumns: [],
          tableData: [],
        }
        setTabCounter((c) => c + 1)
        setActiveTabId(newTab.id)
        return [newTab]
      }
      if (tabId === activeTabId) {
        setActiveTabId(newTabs[0].id)
      }
      return newTabs
    })
  }

  const handleNewTab = () => {
    const newTab = {
      id: tabCounter,
      groupId: defaultGroup.id,
      queryId: defaultQuery.id,
      queryText: defaultQuery.sql,
      tableColumns: [],
      tableData: [],
    }
    setTabCounter((prev) => prev + 1)
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newTab.id)
  }

  const totalPages =
    activeTab && activeTab.tableData
      ? Math.ceil(activeTab.tableData.length / rowsPerPage)
      : 1
  const paginatedData =
    activeTab && activeTab.tableData
      ? paginationEnabled
        ? activeTab.tableData.slice(
            (currentPage - 1) * rowsPerPage,
            currentPage * rowsPerPage
          )
        : activeTab.tableData
      : []

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <div className={`app-container ${theme}`}>
      <div className="header">
        <h1>Dummy SQL Query Interface</h1>
        <button onClick={toggleTheme} className="toggle-theme-btn">
          {theme === 'light' ? <FiMoon /> : <FiSun />}
        </button>
        <p>
          Select a group &amp; sub-query from the dropdown, or type your own SQL.
          Then click <strong>"Run Query"</strong> to see results. Press <FiPlus /> for a new tab.
        </p>
      </div>

      <div className="tabs-bar">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.id === activeTabId ? `*${tab.queryId}*` : tab.queryId}
            <button
              className="close-tab"
              onClick={(e) => {
                e.stopPropagation()
                handleCloseTab(tab.id)
              }}
            >
              <FiX />
            </button>
          </div>
        ))}
        <button className="new-tab" onClick={handleNewTab}>
          <FiPlus />
        </button>
      </div>

      {activeTab && (
        <>
          <div className="query-controls">
            <label htmlFor="groupSelect">Query Group:</label>
            <select
              id="groupSelect"
              value={activeTab.groupId}
              onChange={handleGroupChange}
            >
              {dummyGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.groupName}
                </option>
              ))}
            </select>

            <label htmlFor="subQuerySelect">Select Query:</label>
            <select
              id="subQuerySelect"
              value={activeTab.queryId}
              onChange={handleSubQueryChange}
            >
              {dummyGroups
                .find((g) => g.id === activeTab.groupId)
                ?.queries.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.name}
                  </option>
                ))}
            </select>

            <div className="run-buttons">
              <button onClick={handleRunQuery}>
                <FiPlay /> Run Query
              </button>
              <button onClick={handleClearQuery}>
                <FiTrash2 /> Clear Query
              </button>
              <button onClick={handleFormatSQL}>
                <FiCode /> Format SQL
              </button>
              <button onClick={handleSaveSnippet}>
                <FiSave /> Save as Snippet
              </button>
              <button onClick={handleSaveQuery}>
                <FiSave /> Save Query
              </button>
              <button onClick={handleLoadQuery}>
                <FiList /> Load Saved Query
              </button>
              {/* <button onClick={handleVisualizeData}><FiList /> Visualize Data</button> */}
            </div>

            <div className="pagination-settings">
              <label>
                <input
                  type="checkbox"
                  checked={paginationEnabled}
                  onChange={(e) => {
                    setPaginationEnabled(e.target.checked)
                    setCurrentPage(1)
                  }}
                />{' '}
                Enable Pagination
              </label>
              {paginationEnabled && (
                <span style={{ marginLeft: '1rem' }}>
                  Rows per page:{' '}
                  <input
                    type="number"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    min="1"
                    style={{ width: '60px' }}
                  />
                </span>
              )}
            </div>
          </div>

          <div className="editor-area">
            <QueryEditor
              queryText={activeTab.queryText}
              onChange={handleQueryTextChange}
            />
          </div>

          <div className="history-snippets-container">
  <div className="query-history">
    <h3>
      Query History
      <button onClick={handleClearHistory} className="action-btn delete-btn">
        <FiTrash2 />
      </button>
    </h3>
    <ul>
      {queryHistory.map((item, index) => (
        <li key={index}>
          <div 
            className="history-item-content" 
            onClick={() => handleQueryTextChange(item.queryText)}
          >
            <span className="history-text">{item.queryText}</span>
            <span className="history-timestamp">{item.timestamp}</span>
          </div>
          <div className="query-actions">
            <button 
              onClick={() => handleCopyHistory(index)} 
              className="action-btn copy-btn"
              title="Copy query"
            >
              <FiCopy />
            </button>
            <button 
              onClick={() => handleDeleteHistory(index)} 
              className="action-btn delete-btn"
              title="Delete query"
            >
              <FiTrash2 />
            </button>
          </div>
        </li>
      ))}
    </ul>
  </div>
  <div className="query-snippets">
    <h3>Query Snippets</h3>
    <ul>
      {querySnippets.map((item, index) => (
        <li key={index}>
          <div 
            className="snippet-item-content" 
            onClick={() => handleQueryTextChange(item.snippet)}
          >
            <span className="snippet-name">{item.name}</span>
          </div>
          <div className="query-actions">
            <button 
              onClick={() => handleCopySnippet(index)} 
              className="action-btn copy-btn"
              title="Copy snippet"
            >
              <FiCopy />
            </button>
            <button 
              onClick={() => handleDeleteSnippet(index)} 
              className="action-btn delete-btn"
              title="Delete snippet"
            >
              <FiTrash2 />
            </button>
          </div>
        </li>
      ))}
    </ul>
  </div>
</div>

          <div className="table-area" ref={tableAreaRef}>
            <QueryResultTable
              columns={activeTab.tableColumns}
              data={paginatedData}
            />
            {paginationEnabled &&
              activeTab.tableData &&
              activeTab.tableData.length > rowsPerPage && (
                <div className="pagination-controls">
                  <button onClick={handlePrevPage} disabled={currentPage === 1}>
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={pageNum === currentPage}
                      >
                        {pageNum}
                      </button>
                    )
                  )}
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
          </div>
        </>
      )}
    </div>
  )
}

export default App
