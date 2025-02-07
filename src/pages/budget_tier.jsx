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
import "ag-grid-community/styles/ag-theme-quartz.css";
import Head from "next/head";
import styles from "../styles/budget_tier.module.css";
import axios from "axios";
import useAuth from "@/components/useAuth";

export default function BudgetTier() {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const authToken = useAuth(baseURL);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newBudgetTier, setNewBudgetTier] = useState("");
  const [rowData, setRowData] = useState([]);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch data from the API
  useEffect(() => {
    const fetchBudgetTiers = async () => {
      try {
        const response = await axios.get(
          `https://xplorionai-bryz7.ondigitalocean.app/app/masters/budget-tier/${authToken}`
        );
        const transformedData = response.data.map((item) => ({
          id: item._id,
          budgetTier: item.budget_tier,
          status: item.status,
        }));
        setRowData(transformedData);
      } catch (error) {
        console.error("Error fetching budget tiers:", error);
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

      try {
        await axios.put(
          `https://xplorionai-bryz7.ondigitalocean.app/app/masters/budget-tier/${updatedRow.id}`,
          { status: newStatus },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

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

    const budgetTierToEdit = rowData[editingRowIndex];
    try {
      await axios.put(
        `https://xplorionai-bryz7.ondigitalocean.app/app/masters/budget-tier/${budgetTierToEdit.id}`,
        { budget_tier: newBudgetTier },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      setRowData((prevData) =>
        prevData.map((row, index) =>
          index === editingRowIndex
            ? { ...row, budgetTier: newBudgetTier }
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

    try {
      const response = await axios.post(
        `${baseURL}/app/masters/budget-tier/add`,
        formData
      );

      console.log(response.data);
      setRowData((prevData) => [
        ...prevData,
        { id: response.data._id, budgetTier: newBudgetTier, status: 1 },
      ]);
      resetForm();
    } catch (error) {
      console.error("Error adding budget tier:", error);
    }
  };

  // Reset form and close modal
  const resetForm = () => {
    setNewBudgetTier("");
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
      {
        headerName: "BUDGET TIER",
        field: "budgetTier",
      },
      {
        headerName: "EDIT",
        field: "edit",
        cellRenderer: (params) => (
          <Button
            colorScheme="blue"
            onClick={() => {
              setNewBudgetTier(params.data.budgetTier);
              setEditingRowIndex(params.node.rowIndex);
              setIsEditing(true);
              onOpen();
            }}
          >
            Edit
          </Button>
        ),
      },
      {
        headerName: "STATUS",
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
        <title>Budget Tier</title>
      </Head>
      <main className={styles.main}>
        <Box mb={4}>
          <Button
            colorScheme="teal"
            onClick={() => {
              setNewBudgetTier("");
              setEditingRowIndex(null);
              setIsEditing(false);
              onOpen();
            }}
          >
            Add Budget Tier
          </Button>
        </Box>

        <Box className="ag-theme-quartz" style={{ height: 400, width: "100%" }}>
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
