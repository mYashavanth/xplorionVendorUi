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
  const [subCategories, setSubCategories] = useState([]); // Holds the sub-category names for the modal
  const [fetchedDataCache, setFetchedDataCache] = useState({}); // Cache for storing fetched data per app_user_id
  const { isOpen, onOpen, onClose } = useDisclosure(); // Controls modal visibility
  const [subCatLoading, setSubCatLoading] = useState(false); // Loading state for API call

  const handleFetchSubCategories = useCallback(
    async (app_user_id) => {
      if (fetchedDataCache[app_user_id]) {
        // If data is already in the cache, use it
        setSubCategories(fetchedDataCache[app_user_id]);
        onOpen();
      } else {
        // If data is not in cache, fetch from API
        setSubCatLoading(true);

        try {
          const response = await axios.get(
            `https://xplorionai-bryz7.ondigitalocean.app/app/super-admin/interests/${authToken}/${app_user_id}`
          );

          // Extracting sub-category names from the response
          // const fetchedSubCategories = response.data.map(
          //   (item) => item.interest_details[0].sub_category_name
          // );
          // Updating the cache with the fetched data
          setFetchedDataCache((prevCache) => ({
            ...prevCache,
            [app_user_id]: response.data,
          }));

          setSubCategories(response.data);
          console.log({ responseData: response.data });
          // if(response.data.){

          onOpen(); // Open the modal once data is fetched
        } catch (error) {
          console.error("Error fetching sub-categories:", error);
        } finally {
          setSubCatLoading(false);
        }
      }
    },
    [fetchedDataCache, onOpen, authToken]
  );

  const fetchUserData = useCallback(async () => {
    if (!authToken) return;

    try {
      setLoading((prevLoading) => ({ ...prevLoading, fetch: true }));
      const response = await axios.get(
        `${baseURL}/app/super-admin/app-users/all/${authToken}`
      );
      setRowData(response.data);
      console.log({ response, data: response.data });
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
        console.log({ response, data: response.data, newStatus, userId });

        // fetchUserData(); // Refresh the data
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
    [authToken, baseURL, fetchUserData]
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
        headerName: "ACTION",
        field: "_id",
        filter: false,
        sortable: false,
        cellRenderer: (params) => (
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
            View Interest
          </Button>
        ),
      },
      {
        headerName: "STATUS",
        field: "status",
        filter: false,
        cellRenderer: (params) => {
          const isActive = params.value === 1;
          return (
            <Button
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
              {/* <Skeleton height="40px" width="160px" borderRadius="md" /> */}
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
      </main>
    </>
  );
}
