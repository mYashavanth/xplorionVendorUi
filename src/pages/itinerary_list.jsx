import React, { useState, useCallback, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  Button,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import styles from "../styles/itinerary_list.module.css";
import Head from "next/head";

export default function ItineraryList() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [interests, setInterests] = useState([]);

  // Sample data for the ag-Grid
  const rowData = [
    {
      itenaryId: "IT20240918-01",
      username: "JohnDoe (johndoe@gmail.com)",
      createdDate: "2024-09-18 10:35 AM",
      city: "New York",
      interests: ["Museums", "Photography", "Food"],
    },
    {
      itenaryId: "IT20240918-02",
      username: "JaneSmith (janesmith@yahoo.com)",
      createdDate: "2024-09-17 09:00 AM",
      city: "Tokyo",
      interests: ["Tech", "Anime", "Nightlife"],
    },
    {
      itenaryId: "IT20240918-03",
      username: "AlexBrown (alex.brown@outlook.com)",
      createdDate: "2024-09-16 03:45 PM",
      city: "London",
      interests: ["History", "Walking Tours", "Theatre"],
    },
    {
      itenaryId: "IT20240918-04",
      username: "MariaGarcia (maria.garcia@hotmail.com)",
      createdDate: "2024-09-15 01:10 PM",
      city: "Paris",
      interests: ["Art", "Fashion", "Wine Tasting"],
    },
    {
      itenaryId: "IT20240918-05",
      username: "MichaelLee (mikelee@gmail.com)",
      createdDate: "2024-09-14 08:25 AM",
      city: "Sydney",
      interests: ["Surfing", "Hiking", "Wildlife"],
    },
  ];

  const handleViewInterests = useCallback(
    (interests) => {
      setInterests(interests);
      onOpen(); // Open the modal
    },
    [onOpen]
  );
  // Columns definition for ag-Grid
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
      { headerName: "Itenary Id", field: "itenaryId" },
      { headerName: "Username & Email", field: "username" },
      {
        headerName: "Created Date & Time",
        field: "createdDate",
        filter: "agDateColumnFilter",
        filterParams: {
          comparator: (filterDate, cellValue) => {
            const [year, month, day] = cellValue.split(" ")[0].split("-");
            const cellDate = new Date(year, month - 1, day);

            if (filterDate.getTime() === cellDate.getTime()) {
              return 0;
            }
            return filterDate.getTime() > cellDate.getTime() ? -1 : 1;
          },
          browserDatePicker: true,
        },
        valueFormatter: (params) => {
          const date = new Date(params.value.split(" ")[0]);
          return date.toISOString().split("T")[0];
        },
      },
      { headerName: "City", field: "city" },
      {
        headerName: "Interests",
        field: "interests",
        filter: false,
        sortable: false,
        cellRenderer: (params) => (
          <Button
            border={"1px solid #0099FF"}
            color="#0099FF"
            bg={"white"}
            size="sm"
            _hover={{
              boxShadow: "xl",
            }}
            onClick={() => handleViewInterests(params.data.interests)}
          >
            View Interests
          </Button>
        ),
      },
      {
        headerName: "ACTION",
        field: "action",
        filter: false,
        sortable: false,
        cellRenderer: (params) => (
          <Button
            bgGradient={"linear(to-r, #0099FF, #54AB6A)"}
            color="white"
            size="sm"
            onClick={() => console.log({ params })}
            _hover={{
              bgGradient: "linear(to-r, #0099FF, #54AB6A)",
              boxShadow: "xl",
            }}
          >
            View
          </Button>
        ),
      },
    ],
    [handleViewInterests]
  );

  // Function to handle the "View Interests" button click
  // const handleViewInterests = (interests) => {
  //   setInterests(interests);
  //   onOpen(); // Open the modal
  // };

  return (
    <>
      <Head>
        <title>Itinerary List</title>
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
              paginationPageSizeSelector={[5, 10, 15]}
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
              getRowHeight={(params) => {
                return 60;
              }}
            />
          </Box>

          {/* Chakra UI Modal */}
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Interests</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {interests.length > 0 ? (
                  interests.map((interest, index) => (
                    <Box key={index} mb={2}>
                      {interest}
                    </Box>
                  ))
                ) : (
                  <Box>No interests available</Box>
                )}
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" onClick={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Box>
      </main>
    </>
  );
}
