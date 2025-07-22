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
import styles from "../styles/budget_tier.module.css";
import axios from "axios";
import useAuth from "@/components/useAuth";
import { FiEdit } from "react-icons/fi";
import { TbReceiptRupee } from "react-icons/tb";
import { BsFillPlusCircleFill } from "react-icons/bs";
import { RiDeleteBin5Line } from "react-icons/ri";
import Image from "next/image";

export default function BudgetTier() {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const authToken = useAuth(baseURL);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newBudgetTier, setNewBudgetTier] = useState("");
  const [budgetIconUrl, setbudgetIconUrl] = useState("");
  const [budgetTierId, setBudgetTierId] = useState(null);
  const [rowData, setRowData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch data from the API
  useEffect(() => {
    const fetchBudgetTiers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://xplorionai-bryz7.ondigitalocean.app/app/masters/budget-tier/${authToken}`
        );

        console.log(response.data);
        const transformedData = response.data.map((item) => ({
          id: item._id,
          budgetTier: item.budget_tier,
          status: item.status,
          budget_tier_icon: item.budget_tier_icon || null,
        }));
        setRowData(transformedData);
      } catch (error) {
        console.error("Error fetching budget tiers:", error);
      } finally {
        setLoading(false);
      }
    };

    if (authToken) {
      fetchBudgetTiers();
    }
  }, [authToken]);

  // Function to toggle status
  const toggleStatus = useCallback(
    async (rowIndex) => {
      const updatedRow = rowData[rowIndex];
      const newStatus = updatedRow.status === 1 ? 0 : 1;

      const form = new FormData();
      form.append("token", authToken);
      form.append("budgetTierId", updatedRow.id);
      form.append("statusFlag", newStatus);

      try {
        const response = await axios.post(
          `https://xplorionai-bryz7.ondigitalocean.app/app/masters/budget-tier/update/status`,
          form
        );

        console.log(response);
        setRowData((prevData) =>
          prevData.map((row, index) =>
            index === rowIndex ? { ...row, status: newStatus } : row
          )
        );
      } catch (error) {
        console.error("Error updating status:", error);
      }
    },
    [rowData, authToken]
  );

  // Function to handle editing budget tier
  const handleEditBudgetTier = async () => {
    if (newBudgetTier.trim() === "") return;

    console.log(budgetTierId, newBudgetTier, "id and name");

    const form = new FormData();
    form.append("token", authToken);
    form.append("budgetTierId", budgetTierId);
    form.append("budgetTierName", newBudgetTier);
    form.append("budgetTierIcon", budgetIconUrl);

    console.log(Object.fromEntries(form));

    try {
      const response = await axios.post(
        `https://xplorionai-bryz7.ondigitalocean.app/app/masters/budget-tier/update`,
        form
      );

      console.log(response);

      setRowData((prevData) =>
        prevData.map((row) =>
          row.id === budgetTierId
            ? {
                ...row,
                budgetTier: newBudgetTier,
                budget_tier_icon: budgetIconUrl,
              } // Update both fields
            : row
        )
      );
      resetForm();
    } catch (error) {
      console.error("Error editing budget tier:", error);
    }
  };

  // Function to handle adding a new budget tier
  const handleAddBudgetTier = async () => {
    if (newBudgetTier.trim() === "") return;

    const formData = new FormData();
    formData.append("token", authToken);
    formData.append("budgetTierName", newBudgetTier);
    formData.append("budgetTierIcon", budgetIconUrl);

    console.log(Object.fromEntries(formData));

    try {
      const response = await axios.post(
        `${baseURL}/app/masters/budget-tier/add`,
        formData
      );

      // console.log(response);
      setRowData((prevData) => [
        ...prevData,
        { id: response.data._id, budgetTier: newBudgetTier, status: 1 },
      ]);
      resetForm();
    } catch (error) {
      console.error("Error adding budget tier:", error);
    }
  };

  // Function to handle deleting a budget tier
  const handleDeleteBudgetTier = async (budgetTierId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this budget tier?"
    );
    if (!confirmDelete) return;

    const formData = new FormData();
    formData.append("token", authToken);
    formData.append("budgetTierId", budgetTierId);

    try {
      const response = await axios.post(
        `${baseURL}/app/masters/budget-tier/delete`,
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
          prevData.filter((row) => row.id !== budgetTierId)
        );
      } else {
        console.error("Error deleting budget tier:", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting budget tier:", error);
    }
  };

  // Reset form and close modal
  const resetForm = () => {
    setNewBudgetTier("");
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
        width: 200,
        flex: false,
        filter: false,
        sortable: false,
        suppressHeaderMenuButton: true,
      },
      {
        headerName: "BUDGET TIER",
        field: "budgetTier",
      },
      {
        headerName: "ICON",
        field: "icon",
        maxWidth: 250,
        cellRenderer: (params) =>
          params.data.budget_tier_icon ? (
            <img
              src={params.data.budget_tier_icon}
              alt={params.data.budgetTier}
              style={{ width: "50px", height: "50px" }}
            />
          ) : (
            <span>No Icon</span>
          ),
      },
      {
        headerName: "STATUS",
        field: "status",
        maxWidth: 250,
        cellRenderer: (params) => (
          // console.log(params.data),
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
        headerName: "ACTION",
        field: "_id",
        maxWidth: 250,
        cellRenderer: (params) => (
          // console.log(params.data),
          <HStack spacing={2}>
            <Button
              size="xs"
              colorScheme="blue"
              onClick={() => {
                setNewBudgetTier(params.data.budgetTier);
                setBudgetTierId(params.data.id);
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
            <Button
              size="xs"
              colorScheme="red"
              onClick={() => handleDeleteBudgetTier(params.data.id)}
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
    ],
    [toggleStatus]
  );

  return (
    <>
      <Head>
        <title>Budget Tier</title>
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
                <TbReceiptRupee color={"#888888"} size={24} />
                <Heading
                  fontSize={"20px"}
                  fontWeight={600}
                  className="gridContainer"
                >
                  Budget Tier
                </Heading>
              </HStack>
              <Spacer />
              <Button
                bgGradient={"linear(to-r, #0099FF, #54AB6A)"}
                _hover={{ bgGradient: "linear(to-r, #0099FF, #54AB6A)" }}
                color={"white"}
                gap={"8px"}
                onClick={() => {
                  setNewBudgetTier("");
                  setIsEditing(false);
                  onOpen();
                }}
              >
                <BsFillPlusCircleFill size={22} />
                Add Budget Tier
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

        {/* Modal for adding or editing a budget tier */}
        <Modal isOpen={isOpen} onClose={resetForm}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {isEditing ? "Edit Budget Tier" : "Add New Budget Tier"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input
                placeholder="Enter Budget Tier"
                value={newBudgetTier}
                onChange={(e) => setNewBudgetTier(e.target.value)}
              />
            </ModalBody>

            <ModalBody>
              <Input
                placeholder="Enter Companion Icon URL"
                value={budgetIconUrl}
                onChange={(e) => setbudgetIconUrl(e.target.value)}
              />
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={isEditing ? handleEditBudgetTier : handleAddBudgetTier}
              >
                {isEditing ? "Edit" : "Add"}
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
