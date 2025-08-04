import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Input,
  HStack,
  Heading,
  Spacer,
  filter,
  Skeleton,
  SkeletonText,
  Switch,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useRouter } from "next/router";
import Head from "next/head";
import styles from "../styles/primary_category.module.css";
import { FiEdit } from "react-icons/fi";
import { PiNotepad } from "react-icons/pi";
import { BsFillPlusCircleFill } from "react-icons/bs";
import { RiDeleteBin5Line } from "react-icons/ri";
import useAuth from "@/components/useAuth";

export default function PrimaryCategory() {
  const router = useRouter();
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [primaryCategory, setPrimaryCategory] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const authToken = useAuth(baseURL);
  // const [btnLoading, setBtnLoading] = useState({});
  const [loading, setLoading] = useState({ fetch: true });

  const fetchPrimaryCategories = useCallback(async () => {
    if (!authToken) return;

    try {
      //   setLoading((prevLoading) => ({ ...prevLoading, fetch: true }));
      const response = await axios.get(
        `${baseURL}/app/masters/primary-category/all/${authToken}`
      );
      setRowData(response.data);
      console.log({ response, data: response.data });
    } catch (error) {
      console.error("Error fetching primary categories:", error);
    } finally {
      setLoading((prevLoading) => ({ ...prevLoading, fetch: false }));
    }
  }, [authToken, baseURL]);

  useEffect(() => {
    fetchPrimaryCategories();
  }, [authToken, fetchPrimaryCategories]);

  const handleAddCategory = async () => {
    try {
      setLoading((prev) => ({ ...prev, add: true }));
      const formData = new FormData();
      formData.append("primaryCategory", primaryCategory);
      formData.append("token", authToken);

      await axios.post(`${baseURL}/app/masters/primary-category/add`, formData);
      fetchPrimaryCategories();
      onClose();
    } catch (error) {
      console.error("Error adding category:", error);
    } finally {
      setLoading((prev) => ({ ...prev, add: false }));
    }
  };

  const handleUpdateCategory = async () => {
    try {
      setLoading((prev) => ({ ...prev, update: true }));
      const formData = new FormData();
      formData.append("primaryCategory", primaryCategory);
      formData.append("primaryCategoryId", selectedCategory._id);
      formData.append("token", authToken);

      await axios.post(
        `${baseURL}/app/masters/primary-category/update`,
        formData
      );
      fetchPrimaryCategories();
      onClose();
    } catch (error) {
      console.error("Error updating category:", error);
    } finally {
      setLoading((prev) => ({ ...prev, update: false }));
    }
  };

  const handleStatusChange = async (categoryId, status) => {
    try {
      const formData = new FormData();
      formData.append("primaryCategoryId", categoryId);
      formData.append("status", status);
      formData.append("token", authToken);

      let response = await axios.post(
        `${baseURL}/app/masters/primary-category/update/status`,
        formData
      );
      console.log("Status update response:", response.data);
      fetchPrimaryCategories();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDeleteCategory = async (primaryCategoryId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this primary category?"
    );
    if (!confirmDelete) return;

    const formData = new FormData();
    formData.append("token", authToken);
    formData.append("primaryCategoryId", primaryCategoryId);

    try {
      const response = await axios.post(
        `${baseURL}/app/masters/primary-category/delete`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response.data);

      if (response.data.errFlag === 0) {
        // Remove the deleted row from rowData
        setRowData((prevData) =>
          prevData.filter((row) => row._id !== primaryCategoryId)
        );
      } else {
        console.error(
          "Error deleting primary category:",
          response.data.message
        );
      }
    } catch (error) {
      console.error("Error deleting primary category:", error);
    }
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
  };
  const columns = [
    {
      headerName: "SL",
      valueGetter: "node.rowIndex + 1",
      cellClass: "serial-number-cell",
      width: 150,
      flex: false,
      filter: false,
      sortable: false,
      suppressHeaderMenuButton: true,
    },
    { headerName: "PRIMARY CATEGORY", field: "primary_category" },

    {
      headerName: "CREATED DATE",
      field: "created_date",
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
      },
    },
    {
      headerName: "STATUS",
      field: "status",
      filter: false,
      cellRenderer: (params) => {
        const isActive = params.value === 1;
        const [isLoading, setIsLoading] = useState(false);
        const [isDisabled, setIsDisabled] = useState(false);

        const handleStatus = async () => {
          if (isDisabled) return;

          setIsDisabled(true);
          setIsLoading(true);

          try {
            await handleStatusChange(
              params.data._id,
              params.value === 1 ? 0 : 1
            );
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
            <Text
              color={isActive ? "green.500" : "red.500"}
              fontWeight="medium"
            >
              {isActive ? "Active" : "Inactive"}
            </Text>
          </HStack>
        );
      },
    },
    {
      headerName: "ACTION",
      field: "_id",
      filter: false,
      cellRenderer: (params) => (
        <HStack spacing={2}>
          <Button
            size="xs"
            colorScheme="blue"
            onClick={() => {
              setSelectedCategory(params.data);
              setPrimaryCategory(params.data.primary_category);
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
          <Button
            size="xs"
            colorScheme="red"
            onClick={() => handleDeleteCategory(params.data._id)}
            borderRadius={"full"}
            w={"36px"}
            h={"36px"}
            bgColor={"transparent"}
            _hover={{ bgColor: "#f5f6f7" }}
            border={"1px solid #E84646"}
            mt={"4px"}
          >
            <RiDeleteBin5Line color={"#E84646"} size={"18px"} />
          </Button>
        </HStack>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Primary Category</title>
      </Head>
      <main className={styles.main}>
        {loading.fetch ? (
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
                <PiNotepad color={"#888888"} size={24} />
                <Heading
                  fontSize={"20px"}
                  fontWeight={600}
                  className="gridContainer"
                >
                  Primary Category
                </Heading>
              </HStack>
              <Spacer />
              <Button
                bgGradient={"linear(to-r, #0099FF, #54AB6A)"}
                _hover={{ bgGradient: "linear(to-r, #0099FF, #54AB6A)" }}
                color={"white"}
                gap={"8px"}
                onClick={() => {
                  setSelectedCategory(null);
                  setPrimaryCategory("");
                  onOpen();
                }}
              >
                <BsFillPlusCircleFill size={22} />
                Add Primary Category
              </Button>
            </HStack>
            <AgGridReact
              className="ag-theme-quartz"
              rowData={Array.isArray(rowData) ? rowData : []}
              columnDefs={columns}
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
              onGridReady={onGridReady}
              domLayout="autoHeight"
              getRowHeight={(params) => {
                return 80;
              }}
            />
          </Box>
        )}

        {/* Add/Edit Modal */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay zIndex={1000} />
          <ModalContent maxWidth={"512px"}>
            <ModalHeader borderBottom={"1px solid #E5E7EB"} p={"20px 34px"}>
              {selectedCategory
                ? "Edit Primary Category"
                : "Add Primary Category"}
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
                placeholder="Primary Category"
                value={primaryCategory}
                onChange={(e) => setPrimaryCategory(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                bgGradient={"linear(to-r, #0099FF, #54AB6A)"}
                _hover={{
                  bgGradient: "linear(to-r, #0099FF, #54AB6A)",
                  color: "white",
                }}
                color={"white"}
                ml={3}
                onClick={
                  selectedCategory ? handleUpdateCategory : handleAddCategory
                }
                isLoading={loading.add || loading.update}
              >
                {selectedCategory ? "Update" : "Create"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </main>
    </>
  );
}
