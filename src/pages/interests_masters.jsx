import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from "axios";
import { Box, Button, HStack, Text } from "@chakra-ui/react";
import Head from "next/head";
import styles from "../styles/interests_masters.module.css";

export default function InterestsMasters() {
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    // Fetch data from API
    axios
      .get("http://localhost:3000/api/data")
      .then((response) => {
        setRowData(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the data!", error);
      });
  }, []);

  const handleEdit = (data) => {
    // Add your edit logic here
    const updatedItem = {
      ...data,
      interest_category: "Updated Category", // Example update
    };

    axios
      .put("http://localhost:3000/api/data", updatedItem)
      .then((response) => {
        console.log("Item updated:", response.data);
        // Optionally, update state or refetch data
        setRowData((prevData) =>
          prevData.map((item) =>
            item.id === response.data.id ? response.data : item
          )
        );
      })
      .catch((error) => {
        console.error("There was an error updating the item!", error);
      });
  };

  const handleDelete = (id) => {
    axios
      .delete("http://localhost:3000/api/data", { data: { id } })
      .then((response) => {
        console.log("Item deleted:", response.data);
        // Optionally, update state or refetch data
        setRowData((prevData) => prevData.filter((item) => item.id !== id));
      })
      .catch((error) => {
        console.error("There was an error deleting the item!", error);
      });
  };

  // Column definitions with floating filters and date filtering
  const columnDefs = useMemo(
    () => [
      { headerName: "ID", field: "id", flex: 1 },
      { headerName: "Interest Category", field: "interest_category", flex: 3 },
      {
        headerName: "Category Based Interests",
        field: "category_based_interests",
        // valueFormatter: (params) =>{
        //     // display the data in column as comma separated string
        //     return params.value.join(",");
        // } ,

        // I want to display the data in separate colums

        cellRenderer: (params) => (
          <Box
            style={{
              minHeight: "100px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {params.value.map((item) => (
              <Text key={item}>{item}</Text>
            ))}
          </Box>
        ),
        flex: 3,
      },
      {
        headerName: "Action",
        field: "action",
        filter: false,
        flex: 2,
        cellRenderer: (params) => (
          <HStack spacing={2}>
            <Button
              colorScheme="blue"
              size="sm"
              onClick={() => handleEdit(params.data)}
            >
              Edit
            </Button>
            <Button
              colorScheme="red"
              size="sm"
              onClick={() => handleDelete(params.data.id)}
            >
              Delete
            </Button>
          </HStack>
        ),
      },
    ],
    []
  );

  return (
    <>
      <Head>
        <title>Interests Masters</title>
      </Head>
      <main className={styles.main}>
        <Box className="ag-theme-alpine" w={"100%"} h={"auto"}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={5}
            paginationPageSizeSelector={[5, 10, 20]}
            enableCellTextSelection={true}
            defaultColDef={{
              filter: true,
              floatingFilter: true,
              sortable: true,
              resizable: true,
              filterParams: {
                debounceMs: 0,
                buttons: ["reset"],
              },
            }}
            domLayout="autoHeight"
            getRowHeight={(params) => {
                console.log({params});
                
              return params.data.category_based_interests.length * 45;
            }}
          />
        </Box>
      </main>
    </>
  );
}
