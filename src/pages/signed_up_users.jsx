import React, { useState, useEffect, useCallback, useMemo } from "react";
import Head from "next/head";
import {
  Box,
  Button,
  HStack,
  Spacer,
  Skeleton,
  SkeletonText,
  Heading,
  filter,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  Stack,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useRouter } from "next/router";
import { PiUsersThreeThin } from "react-icons/pi";
import styles from "../styles/signed_up_users.module.css";
import useAuth from "@/components/useAuth";

export default function SignedUpUsers() {
  const router = useRouter();
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [btnLoading, setBtnLoading] = useState({});
  const [loading, setLoading] = useState({ fetch: true });
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const authToken = useAuth(baseURL);
  const [subCategories, setSubCategories] = useState([]);
  const [fetchedDataCache, setFetchedDataCache] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [subCatLoading, setSubCatLoading] = useState(false);
  const toast = useToast();

  // State for itinerary limit modal
  const {
    isOpen: isLimitModalOpen,
    onOpen: onLimitModalOpen,
    onClose: onLimitModalClose,
  } = useDisclosure();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [limitLoading, setLimitLoading] = useState(false);
  const [itineraryLimits, setItineraryLimits] = useState({
    itineraryNo: 0,
    activityRedo: 0,
    dayRedo: 0,
    similerPlaces: 0,
  });

  const handleFetchSubCategories = useCallback(
    async (app_user_id) => {
      if (fetchedDataCache[app_user_id]) {
        setSubCategories(fetchedDataCache[app_user_id]);
        onOpen();
      } else {
        setSubCatLoading(true);
        try {
          const response = await axios.get(
            `https://xplorionai-bryz7.ondigitalocean.app/app/super-admin/interests/${authToken}/${app_user_id}`
          );
          setFetchedDataCache((prevCache) => ({
            ...prevCache,
            [app_user_id]: response.data,
          }));
          setSubCategories(response.data);
          onOpen();
        } catch (error) {
          console.error("Error fetching sub-categories:", error);
        } finally {
          setSubCatLoading(false);
        }
      }
    },
    [fetchedDataCache, onOpen, authToken]
  );

  // Open itinerary limit modal and set current user ID
  const handleOpenLimitModal = (userId) => {
    setCurrentUserId(userId);
    onLimitModalOpen();
  };

  // Handle itinerary limit changes
  const handleLimitChange = (field, value) => {
    setItineraryLimits((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Submit itinerary limits to backend
  const handleSubmitLimits = async () => {
    if (!currentUserId || !authToken) return;

    setLimitLoading(true);
    try {
      const formData = new FormData();
      formData.append("iternaryNo", -Math.abs(itineraryLimits.itineraryNo));
      formData.append("activityRedo", -Math.abs(itineraryLimits.activityRedo));
      formData.append("dayRedo", -Math.abs(itineraryLimits.dayRedo));
      formData.append(
        "similerPlaces",
        -Math.abs(itineraryLimits.similerPlaces)
      );
      formData.append("token", authToken);
      formData.append("appUserId", currentUserId);

      console.log(
        "Submitting itinerary limits:",
        Object.fromEntries(formData.entries())
      );

      let response = await axios.post(
        `${baseURL}/iternary-config/app-users`,
        formData
      );
      console.log("Itinerary limits updated:", response.data);

      toast({
        title: "Success",
        description: "Itinerary limits updated successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onLimitModalClose();
    } catch (error) {
      console.error("Error updating itinerary limits:", error);
    } finally {
      setLimitLoading(false);
    }
  };

  const fetchUserData = useCallback(async () => {
    if (!authToken) return;

    try {
      setLoading((prevLoading) => ({ ...prevLoading, fetch: true }));
      const response = await axios.get(
        `${baseURL}/app/super-admin/app-users/all/${authToken}`
      );
      setRowData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading((prevLoading) => ({ ...prevLoading, fetch: false }));
    }
  }, [authToken, baseURL]);

  useEffect(() => {
    if (authToken) {
      fetchUserData();
    }
  }, [authToken, fetchUserData]);

  const updateToken = useCallback(
    async (userId, newStatus) => {
      if (!authToken) return;
      const formData = new FormData();
      formData.append("userToken", authToken);
      formData.append("appUserId", userId);
      formData.append("status", newStatus);

      try {
        setBtnLoading((prev) => ({ ...prev, [userId]: true }));
        const response = await axios.post(
          `${baseURL}/app/system-users/appuser-update-status`,
          formData
        );

        setRowData((prevData) => {
          return prevData.map((item) => {
            if (item._id === userId) {
              return { ...item, status: newStatus };
            }
            return item;
          });
        });
      } catch (error) {
        console.error("Error updating status:", error.message);
      } finally {
        setBtnLoading((prev) => ({ ...prev, [userId]: false }));
      }
    },
    [authToken, baseURL]
  );

  const columnDefs = useMemo(
    () => [
      {
        headerName: "SL",
        valueGetter: (params) => params.node.rowIndex + 1,
        width: 150,
        flex: false,
        filter: false,
        sortable: false,
        suppressHeaderMenuButton: true,
      },
      {
        field: "app_user_name",
        headerName: "APP USER NAME",
        valueGetter: (params) => params.data.app_user_name || "-",
      },
      { field: "username", headerName: "USERNAME" },
      { field: "email", headerName: "EMAIL" },
      { field: "created_date", headerName: "CREATED DATE" },
      { field: "created_time", headerName: "CREATED TIME" },
      {
        headerName: "STATUS",
        field: "status",
        filter: false,
        cellRenderer: (params) => {
          const isActive = params.value === 1;
          return (
            <Button
              size="sm"
              onClick={() => updateToken(params.data._id, isActive ? 0 : 1)}
              isLoading={btnLoading[params.data._id]}
              colorScheme={isActive ? "green" : "red"}
              variant="solid"
            >
              {isActive ? "Active" : "Inactive"}
            </Button>
          );
        },
      },
      {
        headerName: "ACTION",
        field: "_id",
        filter: false,
        sortable: false,
        width: 200,
        minWidth: 200,
        cellRenderer: (params) => (
          <HStack spacing={2} mt={1}>
            <Button
              bgGradient={"linear(to-r, #0099FF, #54AB6A)"}
              color="white"
              size="sm"
              _hover={{
                bgGradient: "linear(to-r, #0099FF, #54AB6A)",
                boxShadow: "xl",
              }}
              onClick={() => handleOpenLimitModal(params.value)}
            >
              Set Limits
            </Button>
            <Button
              border={"1px solid #0099FF"}
              color="#0099FF"
              bg={"white"}
              size="sm"
              _hover={{
                boxShadow: "xl",
              }}
              onClick={() => handleFetchSubCategories(params.value)}
            >
              Interests
            </Button>
          </HStack>
        ),
      },
    ],
    [btnLoading, handleFetchSubCategories, updateToken]
  );

  return (
    <>
      <Head>
        <title>App Users Management</title>
        <meta
          name="description"
          content="Manage app users and their token statuses"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
                <PiUsersThreeThin color={"#888888"} size={24} />
                <Heading
                  fontSize={"20px"}
                  fontWeight={600}
                  className="gridContainer"
                >
                  Signed Up Users
                </Heading>
              </HStack>
              <Spacer />
            </HStack>
            <AgGridReact
              className="ag-theme-quartz"
              rowData={Array.isArray(rowData) ? rowData : []}
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
              onGridReady={(params) => setGridApi(params.api)}
              domLayout="autoHeight"
              getRowHeight={() => 80}
            />
          </Box>
        )}

        {/* Sub-Categories Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Sub-Categories</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {subCatLoading ? (
                <Text>Loading...</Text>
              ) : (
                subCategories.map((subCategory, index) => (
                  <Text key={index}>
                    {subCategory.interest_details[0].sub_category_name}
                  </Text>
                ))
              )}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Itinerary Limits Modal */}
        <Modal isOpen={isLimitModalOpen} onClose={onLimitModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Set Itinerary Limits</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Itinerary Number</FormLabel>
                  <NumberInput
                    min={1}
                    value={itineraryLimits.itineraryNo}
                    onChange={(value) =>
                      handleLimitChange("itineraryNo", value)
                    }
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Activity Redo Limit</FormLabel>
                  <NumberInput
                    min={1}
                    value={itineraryLimits.activityRedo}
                    onChange={(value) =>
                      handleLimitChange("activityRedo", value)
                    }
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Day Redo Limit</FormLabel>
                  <NumberInput
                    min={1}
                    value={itineraryLimits.dayRedo}
                    onChange={(value) => handleLimitChange("dayRedo", value)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Similar Places Limit</FormLabel>
                  <NumberInput
                    min={1}
                    value={itineraryLimits.similerPlaces}
                    onChange={(value) =>
                      handleLimitChange("similerPlaces", value)
                    }
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onLimitModalClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSubmitLimits}
                isLoading={limitLoading}
              >
                Save Limits
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </main>
    </>
  );
}
