import React, { useState, useMemo, useCallback, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  Button,
  Box,
  Tag,
  useDisclosure,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import Head from "next/head";
import styles from "../styles/travel_companion.module.css";
import axios from "axios";
import useAuth from "@/components/useAuth";

export default function TravelCompanion() {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const authToken = useAuth(baseURL);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [rowData, setRowData] = useState([]);
  const [newCompanion, setNewCompanion] = useState("");
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch data from the API
  const fetchCompanions = async () => {
    try {
      const response = await axios.get(
        `https://xplorionai-bryz7.ondigitalocean.app/app/masters/travel-companion-names/${authToken}`
      );
      setRowData(response.data); // Use the fetched API data directly
    } catch (error) {
      console.error("Error fetching companions:", error);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchCompanions();
    }
  }, [authToken]);

  // Function to toggle status
  const toggleStatus = useCallback(
    (rowIndex) => {
      setRowData((prevData) =>
        prevData.map((row, index) =>
          index === rowIndex
            ? { ...row, status: row.status === 1 ? 0 : 1 }
            : row
        )
      );
    },
    [setRowData]
  );

  // Handle form submission for adding or editing a companion
  const handleSubmit = async () => {
    try {
      if (isEditing && editingRowIndex !== null) {
        // Edit existing companion
        const updatedCompanion = {
          ...rowData[editingRowIndex],
          travel_companion_name: newCompanion,
        };
        await axios.put(
          `https://xplorionai-bryz7.ondigitalocean.app/app/masters/travel-companion-names/${updatedCompanion.id}`,
          updatedCompanion,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
      } else {
        // Add new companion
        const newCompanionData = {
          travel_companion_name: newCompanion,
          status: 1,
        };
        await axios.post(
          `https://xplorionai-bryz7.ondigitalocean.app/app/masters/travel-companion-names`,
          newCompanionData,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
      }
      // Refetch the data to update the table
      fetchCompanions();
      onClose(); // Close the modal after submission
      setNewCompanion(""); // Clear the input field
    } catch (error) {
      console.error("Error submitting companion data:", error);
    }
  };

  // Column Definitions
  const columnDefs = useMemo(
    () => [
      {
        headerName: "SL",
        valueGetter: "node.rowIndex + 1",
        cellClass: "serial-number-cell",
        width: 100,
        flex: false,
        filter: false,
        sortable: false,
        suppressHeaderMenuButton: true,
      },
      {
        headerName: "Travel Companion Name",
        field: "travel_companion_name",
        filter: true,
      },
      {
        headerName: "Edit",
        field: "edit",
        cellRenderer: (params) => (
          <Button
            colorScheme="blue"
            onClick={() => {
              setNewCompanion(params.data.travel_companion_name);
              setIsEditing(true);
              setEditingRowIndex(params.node.rowIndex);
              onOpen(); // Open the modal
            }}
          >
            Edit
          </Button>
        ),
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
        <title>Travel Companion</title>
      </Head>
      <main className={styles.main}>
        <Box mb={4}>
          <Button
            colorScheme="teal"
            onClick={() => {
              setIsEditing(false);
              setNewCompanion("");
              setEditingRowIndex(null); // Reset the editing index
              onOpen(); // Open the modal
            }}
          >
            Add Travel Companion
          </Button>
        </Box>

        <Box className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
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

        {/* Modal for adding or editing a travel companion */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {isEditing ? "Edit Travel Companion" : "Add New Travel Companion"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input
                placeholder="Enter Companion Name"
                value={newCompanion}
                onChange={(e) => setNewCompanion(e.target.value)}
              />
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
                {isEditing ? "Save Changes" : "Add"}
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </main>
    </>
  );
}
