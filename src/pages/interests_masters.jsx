import React, { useState, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from "axios";
import {
  Box,
  Button,
  HStack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  useDisclosure,
} from "@chakra-ui/react";
import Head from "next/head";
import styles from "../styles/interests_masters.module.css";

export default function InterestsMasters() {
  const [rowData, setRowData] = useState([]);
  const [currentData, setCurrentData] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState({
    interest_category: "",
    category_based_interests: "",
  });

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/data")
      .then((response) => setRowData(response.data))
      .catch((error) =>
        console.error("There was an error fetching the data!", error)
      );
  }, []);

  const handleEdit = (data) => {
    setCurrentData(data);
    setFormData({
      interest_category: data.interest_category,
      category_based_interests: data.category_based_interests.join(", "),
    });
    onOpen();
  };

  const handleSubmit = () => {
    const updatedData = {
      ...currentData,
      interest_category: formData.interest_category,
      category_based_interests: formData.category_based_interests
        .split(", ")
        .map((item) => item.trim()),
    };

    axios
      .put(`http://localhost:3000/api/data`, updatedData)
      .then((response) => {
        setRowData((prevData) =>
          prevData.map((item) =>
            item.id === response.data.id ? response.data : item
          )
        );
        onClose();
      })
      .catch((error) =>
        console.error("There was an error updating the item!", error)
      );
  };

  const handleDelete = (id) => {
    axios
      .delete("http://localhost:3000/api/data", { data: { id } })
      .then((response) => {
        setRowData((prevData) => prevData.filter((item) => item.id !== id));
      })
      .catch((error) =>
        console.error("There was an error deleting the item!", error)
      );
  };

  const columnDefs = useMemo(
    () => [
      { headerName: "ID", field: "id", flex: 1 },
      { headerName: "Interest Category", field: "interest_category", flex: 3 },
      {
        headerName: "Category Based Interests",
        field: "category_based_interests",
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
            enableCellTextSelection={true}
            defaultColDef={{
              filter: true,
              floatingFilter: true,
              sortable: true,
              resizable: true,
            }}
            domLayout="autoHeight"
            getRowHeight={(params) =>
              params.data.category_based_interests.length * 45
            }
          />
        </Box>

        {/* Chakra Modal for Editing */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Interest</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input
                placeholder="Interest Category"
                value={formData.interest_category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    interest_category: e.target.value,
                  })
                }
                mb={4}
              />
              <Input
                placeholder="Category Based Interests (comma separated)"
                value={formData.category_based_interests}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category_based_interests: e.target.value,
                  })
                }
              />
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
                Submit
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
