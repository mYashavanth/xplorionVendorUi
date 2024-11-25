import React, { useState, useMemo, useCallback, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  Box,
  Tag,
  Button,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import axios from "axios";
import Head from "next/head";
import useAuth from "@/components/useAuth";
import styles from "../styles/city_details.module.css";

export default function CityList() {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const authToken = useAuth(baseURL);

  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityData, setCityData] = useState({
    city: "",
    state: "",
    country: "",
  });
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://xplorionai-bryz7.ondigitalocean.app/app/masters/city/all/${authToken}`
        );
        setRowData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    if (authToken) {
      fetchData();
    }
  }, [authToken]);

  // Function to toggle the status
  const toggleStatus = useCallback((rowIndex) => {
    setRowData((prevData) =>
      prevData.map((row, index) =>
        index === rowIndex ? { ...row, status: row.status === 1 ? 0 : 1 } : row
      )
    );
  }, []);

  // Handle adding or editing a city
  const handleSaveCity = async () => {
    const { city, state, country } = cityData;
    if (!city || !state || !country) return;

    const formData = new FormData();
    formData.append("token", authToken);
    formData.append("cityName", city);
    formData.append("stateName", state);
    formData.append("countryName", country);

    if (isEditing) {
      const cityToEdit = rowData[editingRowIndex];
      try {
        await axios.put(
          `https://xplorionai-bryz7.ondigitalocean.app/app/masters/city/${cityToEdit.id}`,
          {
            ...formData,
            status: cityToEdit.status,
          },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        setRowData((prevData) =>
          prevData.map((row, index) =>
            index === editingRowIndex ? { ...row, city, state, country } : row
          )
        );
      } catch (error) {
        console.error("Error updating city:", error);
      }
    } else {
      try {
        const response = await axios.post(
          `https://xplorionai-bryz7.ondigitalocean.app/app/masters/city/add`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        setRowData((prevData) => [
          ...prevData,
          {
            id: response.data._id, // Adjust based on your response structure
            city,
            state,
            country,
            status: 1,
          },
        ]);
      } catch (error) {
        console.error("Error adding city:", error);
      }
    }

    resetForm();
  };

  // Reset form and close modal
  const resetForm = () => {
    setCityData({ city: "", state: "", country: "" });
    setEditingRowIndex(null);
    setIsEditing(false);
    onClose();
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
      { headerName: "CITY / PLACE", field: "city" },
      { headerName: "STATE", field: "state" },
      { headerName: "COUNTRY", field: "country" },
      {
        headerName: "STATUS",
        field: "status",
        filter: false,
        sortable: false,
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
      {
        headerName: "ACTIONS",
        field: "actions",
        cellRenderer: (params) => (
          <Button
            colorScheme="blue"
            onClick={() => {
              setCityData({
                city: params.data.city,
                state: params.data.state,
                country: params.data.country,
              });
              setEditingRowIndex(params.node.rowIndex);
              setIsEditing(true);
              onOpen();
            }}
          >
            Edit
          </Button>
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
          <Button
            colorScheme="teal"
            onClick={() => {
              resetForm();
              onOpen();
            }}
          >
            Add City
          </Button>
        </Box>
        {/* Loading state */}
        {loading ? (
          <p>Loading data...</p>
        ) : (
          <Box className="ag-theme-quartz" w={"100%"} h={"auto"}>
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
              getRowHeight={() => 80}
            />
          </Box>
        )}

        {/* Modal for adding or editing a city */}
        <Modal isOpen={isOpen} onClose={resetForm}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {isEditing ? "Edit City" : "Add New City"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input
                placeholder="City"
                value={cityData.city}
                onChange={(e) =>
                  setCityData({ ...cityData, city: e.target.value })
                }
                mb={2}
              />
              <Input
                placeholder="State"
                value={cityData.state}
                onChange={(e) =>
                  setCityData({ ...cityData, state: e.target.value })
                }
                mb={2}
              />
              <Input
                placeholder="Country"
                value={cityData.country}
                onChange={(e) =>
                  setCityData({ ...cityData, country: e.target.value })
                }
              />
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleSaveCity}>
                {isEditing ? "Update" : "Add"}
              </Button>
              <Button variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </main>
    </>
  );
}
