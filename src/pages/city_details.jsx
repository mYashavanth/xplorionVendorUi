import React, { useState, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { Button, Box, Tag, useDisclosure } from "@chakra-ui/react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import styles from "../styles/city_details.module.css";
import Head from "next/head";

export default function CityList() {
  const [rowData, setRowData] = useState([
    {
      city: "New York",
      state: "New York",
      country: "USA",
      createdDate: "2024-09-18 10:35 AM",
      status: 1,
    },
    {
      city: "Tokyo",
      state: "Tokyo Prefecture",
      country: "Japan",
      createdDate: "2024-09-17 09:00 AM",
      status: 0,
    },
    {
      city: "London",
      state: "England",
      country: "UK",
      createdDate: "2024-09-16 03:45 PM",
      status: 1,
    },
    {
      city: "Paris",
      state: "Île-de-France",
      country: "France",
      createdDate: "2024-09-15 01:10 PM",
      status: 0,
    },
    {
      city: "Sydney",
      state: "New South Wales",
      country: "Australia",
      createdDate: "2024-09-14 08:25 AM",
      status: 1,
    },
  ]);

  // Function to toggle the status
  const toggleStatus = useCallback((rowIndex) => {
    setRowData((prevData) =>
      prevData.map((row, index) =>
        index === rowIndex ? { ...row, status: row.status === 1 ? 0 : 1 } : row
      )
    );
  }, []);

  // Column Definitions
  const columnDefs = useMemo(
    () => [
      {
        headerName: "S.No",
        valueGetter: "node.rowIndex + 1",
        cellClass: "serial-number-cell",
        width: 150,
        flex: false,
        filter: false,
        sortable: false,
        suppressHeaderMenuButton: true,
      },
      { headerName: "City / Place", field: "city", filter: true },
      { headerName: "State", field: "state", filter: true },
      { headerName: "Country", field: "country", filter: true },
      {
        headerName: "Created Date",
        field: "createdDate",
        filter: "agDateColumnFilter",
        valueFormatter: (params) => {
          const date = new Date(params.value.split(" ")[0]);
          return date.toISOString().split("T")[0]; // Format as yyyy-mm-dd
        },
        filterParams: {
          comparator: (filterDate, cellValue) => {
            const [year, month, day] = cellValue.split(" ")[0].split("-");
            const cellDate = new Date(year, month - 1, day);
            if (filterDate.getTime() === cellDate.getTime()) {
              return 0;
            }
            return filterDate.getTime() > cellDate.getTime() ? -1 : 1;
          },
        },
      },
      {
        headerName: "Status",
        field: "status",
        cellRenderer: (params) => (
          <Tag
            colorScheme={params.value === 1 ? "green" : "red"}
            onClick={() => toggleStatus(params.node.rowIndex)}
            cursor="pointer"
            mt={2}
          >
            {params.value === 1 ? "Active" : "Inactive"}
          </Tag>
        ),
      },
    ],
    [toggleStatus]
  );

  return (
    <>
      <Head>
        <title>City List</title>
      </Head>
      <main className={styles.main}>
        <Box>
          {/* Ag-Grid Section */}
          <Box
            className="ag-theme-alpine"
            style={{ height: 400, width: "100%" }}
          >
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={5}
              enableCellTextSelection={true}
              defaultColDef={{
                sortable: true,
                filter: true,
                floatingFilter: true,
                resizable: true,
                flex: 1,
                filterParams: {
                  debounceMs: 0,
                  buttons: ["reset"],
                },
              }}
              domLayout="autoHeight"
              getRowHeight={() => 60}
            />
          </Box>
        </Box>
      </main>
    </>
  );
}
