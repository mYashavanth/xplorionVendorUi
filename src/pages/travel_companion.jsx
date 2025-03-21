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
  HStack,
  Heading,
  Spacer,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import Head from "next/head";
import styles from "../styles/travel_companion.module.css";
import axios from "axios";
import useAuth from "@/components/useAuth";
import { FiEdit } from "react-icons/fi";
import { BsFillPlusCircleFill } from "react-icons/bs";
import { GrGroup } from "react-icons/gr";


export default function TravelCompanion() {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const authToken = useAuth(baseURL);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [rowData, setRowData] = useState([]);
  const [newCompanion, setNewCompanion] = useState("");
  const [companionUrl, setCompanionUrl] = useState("");
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);


  // Fetch data from the API
  const fetchCompanions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://xplorionai-bryz7.ondigitalocean.app/app/masters/travel-companion-names/${authToken}`
      );
      console.log({ companions: response.data });

      setRowData(response.data); // Use the fetched API data directly
    } catch (error) {
      console.error("Error fetching companions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchCompanions();
    }
  }, [authToken]);

  // Function to toggle status
 
const toggleStatus = useCallback(
  async (data) => {
    // Get the new status after toggling
    const newStatus = data.status === 1 ? 0 : 1;

    // Update the state with the new status
    setRowData((prevData) =>
      prevData.map((row) =>
        row._id === data._id ? { ...row, status: newStatus } : row
      )
    );

    // Prepare the form data for the POST request
    const formData = new FormData();
    formData.append("token", authToken);
    formData.append("travelCompanionId", data._id);
    formData.append("statusFlag", newStatus);

    console.log(Object.fromEntries(formData));

    try {
      // Send the POST request
      const response = await fetch(
        `${baseURL}/app/masters/travel-companion/update/status`,
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("Response:", response);
    } catch (error) {
      console.error("Error:", error);
    }
  },
  [authToken, baseURL]
);

  // Handle form submission for adding or editing a companion
  const handleSubmit = async () => {
    try {
      if (isEditing && editingRowIndex !== null) {
        // Edit existing companion
        const updatedCompanion = {
          ...rowData[editingRowIndex],
          travel_companion_name: newCompanion,
          travel_companion_icon_link: companionUrl,
        };

        setRowData((prevData) =>
          prevData.map((row, index) =>
            index === editingRowIndex ? updatedCompanion : row
          )
        );

        const form = new FormData();
        form.append("token", authToken);
        form.append("travelCompanionId", updatedCompanion._id);
        form.append(
          "travelCompanionName",
          updatedCompanion.travel_companion_name
        );
        form.append("travelCompanionIconLink", companionUrl);

        // console.log(Object.fromEntries(form));

       const response = await fetch(
         `${baseURL}/app/masters/travel-companion/update`,
         {
           method: "POST",
           body: form,
         }
       );

        // console.log(response);

      } else {
        console.log({ newCompanion });

        // Add new companion
        const formData = new FormData();
        formData.append("travelCompanionName", newCompanion);
        formData.append("token", authToken);
        formData.append("travelCompanionIconLink", companionUrl);
        // console.log(Object.fromEntries(formData));
        const response = await axios.post(
          `${baseURL}/app/masters/travel-companion/add`,
          formData
        );
        console.log(response.data);
        fetchCompanions();
      }
      onClose(); // Close the modal after submission
      setNewCompanion(""); // Clear the input field
      setCompanionUrl("");
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
        width: 200,
        flex: false,
        filter: false,
        sortable: false,
        suppressHeaderMenuButton: true,
      },
      {
        headerName: "TRAVEL COMPANION NAME",
        field: "travel_companion_name",
        filter: true,
      },
      {
        headerName: "STATUS",
        field: "status",
        maxWidth: 250,
        cellRenderer: (params) => (
          // console.log(params.data),
          <Tag
            colorScheme={params.value === 1 ? "green" : "red"}
            onClick={() => toggleStatus(params.data)}
            cursor="pointer"
            mt={2}
          >
            {params.value === 1 ? "Active" : "Inactive"}
          </Tag>
        ),
      },
      {
        headerName: "Icon",
        field: "travel_companion_icon_link",
        filter: false,
        cellRenderer: (params) => (
          // console.log(params.data.travel_companion_icon_link),
          <img
            src={params.data.travel_companion_icon_link}
            alt={params.data.travel_companion_name}
            style={{ width: "50px", height: "50px" }}
          />
       
        ),
      },
      {
        headerName: "EDIT",
        field: "edit",
        maxWidth: 250,
        filter: false,
        cellRenderer: (params) => (
          <>
            <Button
              size="xs"
              colorScheme="blue"
              onClick={() => {
                setNewCompanion(params.data.travel_companion_name);
                setIsEditing(true);
                setEditingRowIndex(params.node.rowIndex);
                onOpen(); // Open the modal
              }}
              borderRadius={"full"}
              w={"36px"}
              h={"36px"}
              bgColor={"transparent"}
              _hover={{ bgColor: "#f5f6f7" }}
              border={"1px solid #626C70"}
              mt={"4px"}
            >
              <FiEdit color={"#626C70"} size={"18px"} />
            </Button>
          </>
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
        {loading ? (
          <Box w={"100%"} h={"auto"} className="gridContainer">
            <HStack bgColor={"white"} p={"24px"}>
              <HStack gap={"12px"} alignItems={"center"}>
                <Skeleton height="24px" width="24px" borderRadius="full" />
                <SkeletonText noOfLines={1} width="200px" />
              </HStack>
              <Spacer />
              <Skeleton height="40px" width="160px" borderRadius="md" />
            </HStack>
            <Skeleton height="60px" width="100%" mt={4} />
            <Skeleton height="60px" width="100%" mt={2} />
            <Skeleton height="60px" width="100%" mt={2} />
            <Skeleton height="60px" width="100%" mt={2} />
            <Skeleton height="60px" width="100%" mt={2} />
          </Box>
        ) : (
          <Box w={"100%"} h={"auto"} className="gridContainer">
            <HStack bgColor={"white"} p={"24px"}>
              <HStack gap={"12px"} alignItems={"center"}>
                <GrGroup color={"#888888"} size={24} />
                <Heading
                  fontSize={"20px"}
                  fontWeight={600}
                  className="gridContainer"
                >
                  Travel Companion
                </Heading>
              </HStack>
              <Spacer />
              <Button
                bgGradient={"linear(to-r, #0099FF, #54AB6A)"}
                _hover={{ bgGradient: "linear(to-r, #0099FF, #54AB6A)" }}
                color={"white"}
                gap={"8px"}
                onClick={() => {
                  setIsEditing(false);
                  setNewCompanion("");
                  onOpen(); // Open the modal
                }}
              >
                <BsFillPlusCircleFill size={22} />
                Add Travel Companion
              </Button>
            </HStack>

            <Box
              className="ag-theme-quartz"
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
                getRowHeight={() => 80}
              />
            </Box>
          </Box>
        )}

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
            <ModalBody>
              <Input
                placeholder="Enter Companion Icon URL"
                value={companionUrl}
                onChange={(e) => setCompanionUrl(e.target.value)}
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
