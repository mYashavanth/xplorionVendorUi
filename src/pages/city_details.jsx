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
  HStack,
  Heading,
  Spacer,
  Skeleton,
  SkeletonText,
  Switch,
  Text,
} from "@chakra-ui/react";
import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import axios from "axios";
import Head from "next/head";
import useAuth from "@/components/useAuth";
import styles from "../styles/city_details.module.css";
import { PiCity } from "react-icons/pi";
import { BsFillPlusCircleFill } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";

export default function CityList() {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const authToken = useAuth(baseURL);

  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      try {
        const response = await axios.get(
          `${baseURL}/app/masters/city/all/${authToken}`
        );

        // Log raw response (for debugging)
        console.log("Raw API response:", response.data);

        // If response.data is a string (unlikely with axios), parse it safely
        let data =
          typeof response.data === "string"
            ? JSON.parse(response.data.replace(/"\w+": NaN/g, '"status": null'))
            : response.data;

        // Deep clean NaN values (if response.data is already an object)
        const cleanData = JSON.parse(
          JSON.stringify(data, (key, value) =>
            typeof value === "number" && isNaN(value) ? null : value
          )
        );

        console.log("Cleaned data:", cleanData);
        setRowData(cleanData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (authToken) {
      fetchData();
    }
  }, [authToken]);

  // Function to toggle the status
  const toggleStatus = useCallback(
    async (rowData) => {
      const formData = new FormData();
      formData.append("token", authToken);
      formData.append("cityId", rowData._id);
      formData.append("status", rowData.status === 1 ? 0 : 1);
      try {
        const response = await axios.post(
          `${baseURL}/system-users/city/update/status`,
          formData
        );
        console.log({ statusData: response.data });
        setRowData((prevData) =>
          prevData.map((row) => {
            if (row._id === rowData._id) {
              return { ...row, status: rowData.status === 1 ? 0 : 1 };
            }
            return row;
          })
        );
      } catch (error) {
        console.error("Error updating status:", error);
      }
    },
    [authToken]
  );

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
      console.log({ editingRowIndex });
      formData.append("cityId", editingRowIndex);

      try {
        await axios.post(`${baseURL}/app/masters/city/update`, formData);

        console.log("url:", `${baseURL}/app/masters/city/update`);

        setRowData((prevData) =>
          prevData.map((row) => {
            if (row._id === editingRowIndex) {
              return { ...row, city, state, country };
            }
            return row;
          })
        );
      } catch (error) {
        console.error("Error updating city:", error);
      }
    } else {
      try {
        const response = await axios.post(
          `${baseURL}/app/masters/city/add`,
          formData
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
  const StatusCellRenderer = (params) => {
    const isActive = params.value === 1;
    const [isLoading, setIsLoading] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);

    const handleStatus = async () => {
      if (isDisabled) return;

      setIsDisabled(true);
      setIsLoading(true);

      try {
        await toggleStatus(params.data);
      } catch (error) {
        console.error("Error updating status:", error);
      } finally {
        setIsLoading(false);
        // Re-enable after a short delay to prevent rapid clicks
        setTimeout(() => setIsDisabled(false), 1000);
      }
    };

    return (
      <HStack spacing={2}>
        <Switch
          colorScheme="green"
          isChecked={isActive}
          onChange={handleStatus}
          isDisabled={isDisabled}
          isLoading={isLoading}
          size="md"
        />
        <Text color={isActive ? "green.500" : "red.500"} fontWeight="medium">
          {isActive ? "Active" : "Inactive"}
        </Text>
      </HStack>
    );
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
        cellRenderer: StatusCellRenderer,
      },
      {
        headerName: "ACTIONS",
        field: "actions",
        cellRenderer: (params) => (
          <>
            <Button
              size="xs"
              colorScheme="blue"
              onClick={() => {
                setCityData({
                  city: params.data.city,
                  state: params.data.state,
                  country: params.data.country,
                });
                console.log(params.data);
                setEditingRowIndex(params.data._id);
                setIsEditing(true);
                onOpen();
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
        <title>City List</title>
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
            <HStack
              bgColor={"white"}
              p={"24px"}
              borderRadius={"8px 8px 0px 0px"}
            >
              <HStack gap={"12px"} alignItems={"center"}>
                <PiCity color={"#888888"} size={24} />
                <Heading
                  fontSize={"20px"}
                  fontWeight={600}
                  className="gridContainer"
                >
                  City List
                </Heading>
              </HStack>
              <Spacer />
              <Button
                bgGradient={"linear(to-r, #0099FF, #54AB6A)"}
                _hover={{ bgGradient: "linear(to-r, #0099FF, #54AB6A)" }}
                color={"white"}
                gap={"8px"}
                onClick={() => {
                  resetForm();
                  onOpen();
                }}
              >
                <BsFillPlusCircleFill size={22} />
                Add City
              </Button>
            </HStack>
            <Box className="ag-theme-quartz" w={"100%"} h={"auto"}>
              <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                pagination={true}
                paginationPageSize={50}
                paginationPageSizeSelector={[50, 100, 150]}
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

        {/* Modal for adding or editing a city */}
        <Modal isOpen={isOpen} onClose={resetForm} isCentered>
          <ModalOverlay zIndex={1000} />
          <ModalContent maxWidth={"512px"}>
            <ModalHeader borderBottom={"1px solid #E5E7EB"} p={"20px 34px"}>
              {isEditing ? "Edit City" : "Add New City"}
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
              <Button variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                bgGradient={"linear(to-r, #0099FF, #54AB6A)"}
                _hover={{
                  bgGradient: "linear(to-r, #0099FF, #54AB6A)",
                  boxShadow: "lg",
                }}
                color="white"
                ml={3}
                onClick={handleSaveCity}
              >
                {isEditing ? "Save Changes" : "Add"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </main>
    </>
  );
}
