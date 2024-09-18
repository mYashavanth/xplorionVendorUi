import React, { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useRouter } from "next/router";
import Head from "next/head";
import styles from "../styles/primary_category.module.css";
import { FiEdit } from "react-icons/fi";
import { PiNotepad } from "react-icons/pi";
import { BsFillPlusCircleFill } from "react-icons/bs";
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
  const [btnLoading, setBtnLoading] = useState({});
  const [loading, setLoading] = useState({ fetch: true });

  useEffect(() => {
    fetchPrimaryCategories();
  }, [authToken, fetchPrimaryCategories]);

  const fetchPrimaryCategories = async () => {
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
  };

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
      setBtnLoading((prev) => ({ ...prev, [categoryId]: true }));
      const formData = new FormData();
      formData.append("primaryCategoryId", categoryId);
      formData.append("status", status);
      formData.append("token", authToken);

      await axios.post(
        `${baseURL}/app/masters/primary-category/update/status`,
        formData
      );
      fetchPrimaryCategories();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setBtnLoading((prev) => ({ ...prev, [categoryId]: false }));
    }
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
  };
  const columns = [
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
    { headerName: "Primary Category", field: "primary_category" },

    {
      headerName: "Created Date",
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
      headerName: "Status",
      field: "status",
      filter: false,
      cellRenderer: (params) => (
        <Button
          size="sm"
          colorScheme={params.value === 1 ? "green" : "red"}
          onClick={() =>
            handleStatusChange(params.data._id, params.value === 1 ? 0 : 1)
          }
          isLoading={btnLoading[params.data._id]}
        >
          {params.value === 1 ? "Active" : "Inactive"}
        </Button>
      ),
    },
    {
      headerName: "Actions",
      field: "_id",
      filter: false,
      cellRenderer: (params) => (
        <>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={() => {
              setSelectedCategory(params.data);
              setPrimaryCategory(params.data.primary_category);
              onOpen();
            }}
            borderRadius={"full"}
            w={"48px"}
            h={"48px"}
            bgColor={"transparent"}
            _hover={{ bgColor: "#f5f6f7" }}
            border={"1px solid #626C70"}
            mt={"4px"}
          >
            <FiEdit color={"#626C70"} size={"24px"} />
          </Button>
        </>
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
            <HStack bgColor={"white"} p={"24px"}>
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
              className="ag-theme-alpine"
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
                return 60;
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
