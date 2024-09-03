import React, { useState, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from "axios";
import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  FormControl,
  FormLabel,
  Tag,
  TagLabel,
  TagCloseButton,
  Heading,
  Spacer,
} from "@chakra-ui/react";
import Head from "next/head";
import styles from "../styles/interests_masters.module.css";
import { RxDashboard } from "react-icons/rx";
import { BsFillPlusCircleFill } from "react-icons/bs";
import { FiEdit, FiTrash2 } from "react-icons/fi";

export default function InterestsMasters() {
  const [rowData, setRowData] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    interest_category: "",
    category_based_interests: [],
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [newInterest, setNewInterest] = useState(""); // For tracking new interest input
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  console.log("baseURL", baseURL);

  useEffect(() => {
    // Fetch data from API
    axios
      .get(`${baseURL}/data`)
      .then((response) => {
        setRowData(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the data!", error);
      });
  }, []);

  const handleSubmit = () => {
    if (isEditing) {
      // Edit existing data
      axios
        .put(`${baseURL}/data`, formData)
        .then((response) => {
          setRowData((prevData) =>
            prevData.map((item) =>
              item.id === response.data.id ? response.data : item
            )
          );
          onClose();
        })
        .catch((error) => {
          console.error("There was an error updating the item!", error);
        });
    } else {
      // Add new data
      const newId = rowData.length
        ? Math.max(...rowData.map((item) => item.id)) + 1
        : 1;
      const newData = { ...formData, id: newId };

      axios
        .post(`${baseURL}/data`, newData)
        .then((response) => {
          setRowData((prevData) => [...prevData, response.data]);
          onClose();
        })
        .catch((error) => {
          console.error("There was an error adding the item!", error);
        });
    }
  };

  const handleEdit = (data) => {
    setFormData(data);
    setIsEditing(true);
    onOpen();
  };

  const handleAdd = () => {
    setFormData({
      id: "",
      interest_category: "",
      category_based_interests: [],
    });
    setIsEditing(false);
    onOpen();
  };

  const handleDelete = (id) => {
    axios
      .delete(`${baseURL}/data`, {
        headers: {
          "Content-Type": "application/json",
        },
        data: { id }, // This is where the id should be sent in the request body
      })
      .then((response) => {
        if (response.status === 200) {
          setRowData((prevData) => prevData.filter((item) => item.id !== id));
        } else {
          console.error("Error deleting the item:", response.data.message);
        }
      })
      .catch((error) => {
        console.error("There was an error deleting the item!", error);
      });
  };

  // Add new interest to the category_based_interests array
  const handleAddInterest = () => {
    if (newInterest) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        category_based_interests: [
          ...prevFormData.category_based_interests,
          newInterest,
        ],
      }));
      setNewInterest(""); // Clear the input
    }
  };

  // Remove interest from the category_based_interests array
  const handleRemoveInterest = (interest) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      category_based_interests: prevFormData.category_based_interests.filter(
        (item) => item !== interest
      ),
    }));
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
          <HStack spacing={2} mt={3}>
            <Button
              borderRadius={"full"}
              size="sm"
              onClick={() => handleEdit(params.data)}
              w={"48px"}
              h={"48px"}
              bgColor={"transparent"}
              _hover={{ bgColor: "#f5f6f7" }}
              border={"1px solid #626C70"}
            >
              <FiEdit color={"#626C70"} size={"24px"} />
            </Button>
            <Button
              borderRadius={"full"}
              size="sm"
              onClick={() => handleDelete(params.data.id)}
              w={"48px"}
              h={"48px"}
              bgColor={"transparent"}
              _hover={{ bgColor: "#f5f6f7" }}
              border={"1px solid #626C70"}
            >
              <FiTrash2 color={"#626C70"} size={"24px"} />
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
        <Box>
          <Text fontWeight={600}>Interests Category</Text>
          <Text>
            View/manage interest categories and configure preferences.
          </Text>
        </Box>
        <Box w={"100%"} h={"auto"} className="gridContainer">
          <HStack bgColor={"white"} p={"24px"}>
            <HStack gap={"12px"} alignItems={"center"}>
              <RxDashboard color={"#888888"} size={24} />
              <Heading
                fontSize={"20px"}
                fontWeight={600}
                className="gridContainer"
              >
                Interests Category
              </Heading>
            </HStack>
            <Spacer />
            <Button
              bgGradient={"linear(to-r, #0099FF, #54AB6A)"}
              _hover={{ bgGradient: "linear(to-r, #0099FF, #54AB6A)" }}
              onClick={handleAdd}
              color={"white"}
              gap={"8px"}
            >
              <BsFillPlusCircleFill size={22} />
              Add New
            </Button>
          </HStack>
          <AgGridReact
            className="ag-theme-alpine"
            rowData={rowData}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={5}
            paginationPageSizeSelector={[5, 10, 15]}
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
            getRowHeight={(params) =>
              params.data.category_based_interests.length * 45
            }
          />
        </Box>

        {/* Modal for Add/Edit */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay zIndex={1000} />
          <ModalContent maxWidth={"512px"}>
            <ModalHeader borderBottom={"1px solid #E5E7EB"} p={"20px 34px"}>
              {isEditing ? "Edit Interest" : "Add New Interest"}
            </ModalHeader>
            <ModalCloseButton
              borderRadius={"full"}
              bgColor={"#F5F6F7"}
              _hover={{ bgColor: "#E5E7EB" }}
              w={"40px"}
              h={"40px"}
              m={"8px 24px 0 0"}
            />
            <ModalBody p={"20px 34px 100px"} bgColor={"#f5f6f7"}>
              <VStack spacing={6}>
                <FormControl>
                  <FormLabel>Interest Category</FormLabel>
                  <Input
                    placeholder="Enter interest category"
                    value={formData.interest_category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        interest_category: e.target.value,
                      })
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Category Based Interests</FormLabel>
                  <VStack spacing={2}>
                    {formData.category_based_interests.map(
                      (interest, index) => (
                        <HStack key={index} spacing={2}>
                          <Tag
                            size={"lg"}
                            variant="subtle"
                            colorScheme="blue"
                            borderRadius={"full"}
                          >
                            <TagLabel>{interest}</TagLabel>
                            <TagCloseButton
                              onClick={() => handleRemoveInterest(interest)}
                            />
                          </Tag>
                        </HStack>
                      )
                    )}
                    <HStack spacing={2}>
                      <Input
                        placeholder="Add new interest"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                      />
                      <Button onClick={handleAddInterest}>Add</Button>
                    </HStack>
                  </VStack>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter
              borderTop={"1px solid #E5E7EB"}
              p={"20px 34px"}
              display={"flex"}
              justifyContent={"space-between"}
            >
              <Button
                variant="outline"
                onClick={onClose}
                color={"#626C70"}
                _hover={{ bgColor: "#f5f6f7" }}
              >
                Cancel
              </Button>
              <Button colorScheme={"blue"} onClick={handleSubmit}>
                {isEditing ? "Save Changes" : "Add"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </main>
    </>
  );
}
