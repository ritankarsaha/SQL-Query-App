# SQL Query App

### Overview

The SQL Query App is a web-based interface for running and visualizing SQL queries on Datasets. It supports multiple query sessions via a tabbed interface, provides features like query history, query snippets, SQL formatting, and data visualization and much more. Users can run pre-defined dummy queries on sample datasets (Customers, Products, and Orders taken in this case) or write and run their own SQL queries on the datasets.

### Technology Stack

- JavaScript Framework: React
The application is built using React for its component-based architecture and ease of managing state.

- Build Tool & Bundler: Vite
Vite is used for its fast build times and hot module replacement during development.

- Major Packages & Plugins:

   - papaparse: Used to load and parse CSV data files.
   - react-icons: Provides a collection of icons used throughout the UI.
   - react-window: Implements virtualization for efficiently rendering large datasets.
   - sql-formatter: Formats SQL queries to improve readability.
   - eslint: Ensures code quality and consistency.


### Page Load Time

Measured Load Time:
- The application demonstrates efficient loading performance, with the following measurements recorded (from the moment the HTML is requested until the React app is fully rendered):

- Deployed on Netlify:

   - Load Time: 941 milliseconds
   - Total Render Time (all requests completed): 1.12 seconds

- Local Environment:

   - Load Time: 602 milliseconds
   - Total Render Time (all requests completed): 607 milliseconds

- Measurement Tools:
We measured the load time using Chrome DevTools' Network panel and Lighthouse audits. These tools helped us identify the time taken to load assets and the overall performance score of the app.

### Performance Optimizations
- Virtualized Rendering:
By using react-window for the results table, the application only renders the rows that are visible in the viewport. This significantly reduces the rendering cost when dealing with thousands of rows.

- Lazy Data Loading:
Data is loaded asynchronously using Papa Parse, ensuring that the UI remains responsive during data fetch.

- Efficient Bundling with Vite:
Vite’s fast bundling and development server contribute to a faster initial load and hot module replacement during development.

- Local Storage Caching:
Query history and saved queries are cached in local storage to prevent unnecessary recalculations or data fetches, contributing to an overall better experience.

- Server-Side Pagination or Data Processing:
For extrremely large datasets, data is being processed or paginated on the server side before sending only the relevant chunks to the client.

- Currently, this website does not use Web Workers. CSV parsing is handled asynchronously by Papa Parse and filtering is done on the main thread. However, if you work with significantly larger datasets or perform more complex filtering, offloading these tasks to a Web Worker would be a beneficial optimization to keep the UI responsive.

- The application is capable of rendering a large number of rows seamlessly without causing browser crashes or performance degradation. Users can choose to either:
     - View all data at once, or
     - Navigate through custom pagination, allowing for a smoother and more controlled browsing experience.

- Optimized SQL Formatting:
The use of sql-formatter helps improve the readability of queries without impacting performance since it only processes user input when requested.


### Installation

- Clone the Github Repository

```bash
git clone https://github.com/ritankarsaha/SQL-Query-App.git
```

- Install all the dependencies.

```bash
npm install
```

- Run the Development Server

```bash
npm run dev
```

- Build for Production

```bash
npm run build
```

- Preview Production Build

```bash
npm run preview
```

### Deployed URL
https://sqlqueryappritankar.netlify.app/

### Document URL

### Code Walkthrough and Website Walkthrough Video URL
