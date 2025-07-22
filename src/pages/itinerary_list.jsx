import React, { useState, useCallback, useMemo, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  Button,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  HStack,
  Heading,
  Spacer,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import styles from "../styles/itinerary_list.module.css";
import Head from "next/head";
import axios from "axios";
import useAuth from "@/components/useAuth";
import { useRouter } from "next/router";
import { GrGroup } from "react-icons/gr";
import { BsFillPlusCircleFill } from "react-icons/bs";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";

export default function ItineraryList() {
  const router = useRouter();
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const authToken = useAuth(baseURL);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [interests, setInterests] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sample data for the ag-Grid

  async function fetchData() {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseURL}/app/masters/itinerary-requests/all/${authToken}`
      );
      // console.log(response.data);
      let formatedData = response.data.map((item, index) => ({
        index: index + 1,
        ...item,
      }));
      setRowData(formatedData);
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (!authToken) return;
    fetchData();
  }, [authToken]);

  const handleAction = useCallback(
    (params) => {
      console.log("Redirect to details page for:", params.data._id);
      // Add routing logic here
      // nvigate to the page inineraries which have a dynamic routing for itineraryId

      router.push(`/itineraries/${params.data._id}`);
    },
    [router]
  );

  const handleViewInterests = useCallback(
    (interests) => {
      setInterests(interests.split(","));
      onOpen(); // Open the modal
    },
    [onOpen]
  );
  // Columns definition for ag-Grid
  const columnDefs = useMemo(
    () => [
      {
        headerName: "SL",
        field: "index",
        width: 80,
        flex: false,
        filter: false,
        sortable: false,
        suppressHeaderMenuButton: true,
      },
      { headerName: "ITENARY ID", field: "_id", minWidth: 250 },
      { headerName: "USERNAME & EMAIL", field: "username" },
      {
        headerName: "CREATED DATE & TIME",
        field: "createdDate",
        filter: "agDateColumnFilter",
        cellRenderer: (params) => {
          const date = params.data.createdDate;
          const time = params.data.createdTime;
          // Use <br> for a line break between date and time
          return (
            <div>
              <div>{date}</div>
              <div>{time}</div>
            </div>
          );
        },
        filter: "agDateColumnFilter",
        filterParams: {
          comparator: (filterLocalDateAtMidnight, cellValue) => {
            console.log({
              filterLocalDateAtMidnight,
              cellValue,
            });

            const dateParts = cellValue.split("-");
            const year = Number(dateParts[0]);
            const month = Number(dateParts[1]) - 1;
            const day = Number(dateParts[2]);
            const cellDate = new Date(year, month, day);

            if (cellDate < filterLocalDateAtMidnight) {
              return -1;
            } else if (cellDate > filterLocalDateAtMidnight) {
              return 1;
            } else {
              return 0;
            }
          },
        },
      },
      { headerName: "CITY", field: "cityStateCountry" },
      {
        headerName: "INTERESTS",
        field: "interests",
        filter: false,
        sortable: false,
        maxWidth: 170,
        cellRenderer: (params) => (
          <Button
            border={"1px solid #0099FF"}
            color="#0099FF"
            bg={"white"}
            size="sm"
            _hover={{
              boxShadow: "xl",
            }}
            onClick={() =>
              handleViewInterests(params.data.primaryCategorySubCategoryData)
            }
          >
            View Interests
          </Button>
        ),
      },
      {
        headerName: "ACTION",
        field: "action",
        filter: false,
        sortable: false,
        maxWidth: 100,
        cellRenderer: (params) => (
          <Button
            bgGradient={"linear(to-r, #0099FF, #54AB6A)"}
            color="white"
            size="sm"
            onClick={() => handleAction(params)}
            _hover={{
              bgGradient: "linear(to-r, #0099FF, #54AB6A)",
              boxShadow: "xl",
            }}
          >
            View
          </Button>
        ),
      },
    ],
    [handleViewInterests]
  );

  // Function to handle the "View Interests" button click
  // const handleViewInterests = (interests) => {
  //   setInterests(interests);
  //   onOpen(); // Open the modal
  // };

  return (
    <>
      <Head>
        <title>Itinerary List</title>
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
                <HiOutlineClipboardDocumentList color={"#888888"} size={24} />
                <Heading
                  fontSize={"20px"}
                  fontWeight={600}
                  className="gridContainer"
                >
                  Itineraries Generated
                </Heading>
              </HStack>
            </HStack>
            <Box>
              {/* Ag-Grid Section */}
              <Box className="ag-theme-quartz" w={"100%"} h={"auto"}>
                <AgGridReact
                  rowData={rowData}
                  columnDefs={columnDefs}
                  pagination={true}
                  paginationPageSize={10}
                  paginationPageSizeSelector={[10, 25, 50]}
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
                  getRowHeight={(params) => {
                    return 80;
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Chakra UI Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Interests</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {interests.length > 0 ? (
                interests.map((interest, index) => (
                  <Box key={index} mb={2}>
                    {interest}
                  </Box>
                ))
              ) : (
                <Box>No interests available</Box>
              )}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </main>
    </>
  );
}
