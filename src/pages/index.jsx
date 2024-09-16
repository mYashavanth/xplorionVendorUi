import Head from "next/head";
import {
  Box,
  Button,
  Center,
  Heading,
  HStack,
  Spacer,
  Text,
} from "@chakra-ui/react";
import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import styles from "../styles/home.module.css";
import { PiNotepad } from "react-icons/pi";
import { useRouter } from "next/router";
import axios from "axios";
import useAuth from "@/components/useAuth";

export default function Home() {
  const gridApiRef = useRef(null);
  const router = useRouter();
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const authToken = useAuth(baseURL);

  console.log({ authToken });

  // Function to generate random data with date range having a minimum gap of 2 days
  const generateRandomData = useCallback(() => {
    const travelCompanionsOptions = ["Family (with children)", "Friends"];
    const tripBudgetTierOptions = ["Luxury", "Economic"];

    return Array(100)
      .fill()
      .map((_, index) => {
        const startDate = getRandomDate();
        const endDate = getRandomDate(startDate);
        return {
          itineraryId: `KER240${index + 1}`,
          userNameEmail: "Rohan Canara, rohancanara@gmail.com",
          destination: "Kochi, Kerala",
          countryOfDest: "India",
          travelDateRange: {
            start: startDate,
            end: endDate,
          },
          travelCompanions:
            travelCompanionsOptions[
              Math.floor(Math.random() * travelCompanionsOptions.length)
            ],
          tripBudgetTier:
            tripBudgetTierOptions[
              Math.floor(Math.random() * tripBudgetTierOptions.length)
            ],
          action: "View Details",
        };
      });
  }, []);

  // Function to get a random date within the year 2024
  const getRandomDate = (minDate) => {
    const start = new Date(2024, 0, 1); // Start of the year
    const end = new Date(2024, 11, 31); // End of the year
    const min = minDate ? new Date(minDate) : start;
    const max = new Date(min.getTime() + 365 * 24 * 60 * 60 * 1000); // +1 year from minDate

    const randomDate = new Date(
      min.getTime() + Math.random() * (max.getTime() - min.getTime())
    );

    if (minDate) {
      return randomDate.toISOString().split("T")[0]; // Return YYYY-MM-DD format
    }

    return randomDate.toISOString().split("T")[0]; // Return YYYY-MM-DD format
  };

  const [rowData] = useState(generateRandomData);

  // Column definitions with floating filters and date filtering
  const columnDefs = useMemo(
    () => [
      {
        headerName: "ITINERARY ID",
        field: "itineraryId",
      },
      {
        headerName: "USER NAME & EMAIL ID",
        field: "userNameEmail",
      },
      {
        headerName: "DESTINATION",
        field: "destination",
      },
      {
        headerName: "COUNTRY OF DEST.",
        field: "countryOfDest",
      },
      {
        headerName: "TRAVEL DATE RANGE",
        field: "travelDateRange",
        valueFormatter: (params) =>
          `${params.value.start} to ${params.value.end}`,
        filter: "agDateColumnFilter",
        filterParams: {
          comparator: (filterLocalDateAtMidnight, cellValue) => {
            const [start, end] = cellValue.split(" to ");
            const cellStartDate = new Date(start);
            const cellEndDate = new Date(end);
            console.log({
              filterLocalDateAtMidnight,
              cellEndDate,
              cellStartDate,
            });

            // Compare dates to determine if the filter criteria match
            if (cellEndDate < filterLocalDateAtMidnight) {
              return -1;
            } else if (cellStartDate > filterLocalDateAtMidnight) {
              return 1;
            } else {
              return 0;
            }
          },
        },
      },
      {
        headerName: "TRAVEL COMPANIONS",
        field: "travelCompanions",
      },
      {
        headerName: "TRIP BUDGET TIER",
        field: "tripBudgetTier",
      },
      {
        headerName: "ACTION",
        field: "action",
        filter: false, // No filter for action column
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
    []
  );

  const handleAction = useCallback((params) => {
    console.log("Redirect to details page for:", params.data.itineraryId);
    // Add routing logic here
    // nvigate to the page inineraries which have a dynamic routing for itineraryId

    router.push(`/itineraries/${params.data.itineraryId}`);
  }, []);

  const gridOptions = useMemo(
    () => ({
      rowData,
      columnDefs,
      defaultColDef: {
        filter: true,
        floatingFilter: true,
        flex: 1,
        sortable: true,
        resizable: true,
        filterParams: {
          debounceMs: 0,
          buttons: ["reset"],
        },
      },
      rowSelection: "multiple",
      suppressRowClickSelection: true,
      pagination: true,
      paginationPageSize: 10,
      paginationPageSizeSelector: [10, 20],
      enableCellTextSelection: true,
    }),
    [rowData, columnDefs]
  );
  const detailsContentArr = [
    {
      title: "Itineraries Generated",
      content: "157,367",
      path: "/dashboard/totalItineraries.svg",
      color: "#FFFAC2",
    },
    {
      title: "Users",
      content: "9,741",
      path: "/dashboard/totalUsers.svg",
      color: "#F0F6FF",
    },
    {
      title: "Locations Searched",
      content: "990",
      path: "/dashboard/noOfLocations.svg",
      color: "#E7F7EF",
    },
    {
      title: "Popular Location",
      content: "Kerala",
      path: "/dashboard/mostPopularLocations.svg",
      color: "#F7F1E7",
    },
  ];

  return (
    <>
      <Head>
        <title>Dashboard</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={styles.main}>
        <Box>
          <Text fontWeight={600}>👋 Hey, Rohan</Text>
          <Text>Here is all your XplorionAI analytics overview</Text>
        </Box>
        <HStack gap={"24px"}>
          {detailsContentArr.map((item) => (
            <HStack
              bgColor={"white"}
              p={"24px"}
              width={"372px"}
              key={item.title}
              borderRadius={"8px"}
            >
              <Box>
                <Text>{item.title}</Text>
                <Heading fontSize={"24px"} fontWeight={600}>
                  {item.content}
                </Heading>
              </Box>
              <Spacer />
              <Center
                borderRadius={"50%"}
                w={"64px"}
                h={"64px"}
                bgColor={item.color}
              >
                <img src={item.path} alt="logo" />
              </Center>
            </HStack>
          ))}
        </HStack>
        <Box h={"auto"} w={"100%"} className="gridContainer">
          <HStack
            p={"24px"}
            gap={"12px"}
            alignItems={"center"}
            bgColor={"white"}
          >
            <PiNotepad color={"#888888"} size={24} />
            <Heading
              fontSize={"20px"}
              fontWeight={600}
              className="gridContainer"
            >
              Manage Itineraries
            </Heading>
          </HStack>
          <AgGridReact
            className="ag-theme-alpine"
            gridOptions={gridOptions}
            onGridReady={(params) => {
              gridApiRef.current = params.api;
              params.api.sizeColumnsToFit();
            }}
            domLayout="autoHeight"
          />
        </Box>
      </main>
    </>
  );
}
