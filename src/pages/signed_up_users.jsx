import React, { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useRouter } from "next/router";
import { PiUsersThreeThin } from "react-icons/pi";
import styles from "../styles/signed_up_users.module.css";

export default function SignedUpUsers() {
  const router = useRouter();
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [btnLoading, setBtnLoading] = useState({});
  const [loading, setLoading] = useState({ fetch: true });
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    const verifyAuthToken = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await axios.get(
          `${baseURL}/app/super-users/auth/${token}`
        );

        if (response.status === 200) {
          setAuthToken(token);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Authentication failed", error);
        router.push("/login");
      }
    };

    verifyAuthToken();
  }, [router]);

  useEffect(() => {
    if (authToken) {
      fetchUserData();
    }
  }, [authToken]);

  const fetchUserData = async () => {
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
  };

  const updateToken = async (userId, newStatus) => {
    if (!authToken) return;

    try {
      setBtnLoading((prev) => ({ ...prev, [userId]: true }));
      await axios.post(
        `${baseURL}/app/super-admin/app-users/all/token-update/${userId}`,
        {
          status: newStatus,
          token: authToken,
        }
      );
      fetchUserData(); // Refresh the data
    } catch (error) {
      console.error("Error updating status:", error.message);
    } finally {
      setBtnLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const columnDefs = [
    {
      headerName: "Sl. No.",
      valueGetter: (params) => params.node.rowIndex + 1,
      width: 150,
      flex: false,
      filter: false,
      sortable: false,
      suppressHeaderMenuButton: true,
    },
    {
      field: "app_user_name",
      headerName: "App User Name",
      valueGetter: (params) => params.data.app_user_name || "-",
    },
    { field: "username", headerName: "Username" },
    { field: "email", headerName: "Email" },
    { field: "created_date", headerName: "Created Date" },
    {
      field: "status",
      headerName: "Status",
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
  ];

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
              className="ag-theme-alpine"
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
              getRowHeight={() => 60}
            />
          </Box>
        )}
      </main>
    </>
  );
}
