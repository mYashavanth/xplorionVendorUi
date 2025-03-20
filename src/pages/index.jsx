import Head from "next/head";
import {
  Box,
  Button,
  Center,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Text,
  useDisclosure,
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
import "ag-grid-community/styles/ag-theme-quartz.css";
import styles from "../styles/home.module.css";
import { PiNotepad } from "react-icons/pi";
import { useRouter } from "next/router";
import axios from "axios";
import useAuth from "@/components/useAuth";
import Image from "next/image";


export default function Home() {
  const gridApiRef = useRef(null);
  const [userName , setUserName] = useState("");
 useEffect(() => {
   const LogEmail = localStorage.getItem("name");
   if (LogEmail) {
     const extractedName = LogEmail.split("@")[0]; // Extracts the part before '@'
     setUserName(extractedName);
   }
 }, []); // Runs only once when the component mounts

 console.log(userName); 


  // const router = useRouter();
  // const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  // const authToken = useAuth(baseURL);

  // console.log({ authToken });

  // Function to generate random data with date range having a minimum gap of 2 days
  // const generateRandomData = useCallback(() => {
  //   const travelCompanionsOptions = ["Family (with children)", "Friends"];
  //   const tripBudgetTierOptions = ["Luxury", "Economic"];

  //   return Array(100)
  //     .fill()
  //     .map((_, index) => {
  //       const startDate = getRandomDate();
  //       const endDate = getRandomDate(startDate);
  //       return {
  //         itineraryId: `KER240${index + 1}`,
  //         userNameEmail: "Rohan Canara, rohancanara@gmail.com",
  //         destination: "Kochi, Kerala",
  //         countryOfDest: "India",
  //         travelDateRange: {
  //           start: startDate,
  //           end: endDate,
  //         },
  //         travelCompanions:
  //           travelCompanionsOptions[
  //             Math.floor(Math.random() * travelCompanionsOptions.length)
  //           ],
  //         tripBudgetTier:
  //           tripBudgetTierOptions[
  //             Math.floor(Math.random() * tripBudgetTierOptions.length)
  //           ],
  //         action: "View Details",
  //       };
  //     });
  // }, []);

  // Function to get a random date within the year 2024
  // const getRandomDate = (minDate) => {
  //   const start = new Date(2024, 0, 1); // Start of the year
  //   const end = new Date(2024, 11, 31); // End of the year
  //   const min = minDate ? new Date(minDate) : start;
  //   const max = new Date(min.getTime() + 365 * 24 * 60 * 60 * 1000); // +1 year from minDate

  //   const randomDate = new Date(
  //     min.getTime() + Math.random() * (max.getTime() - min.getTime())
  //   );

  //   if (minDate) {
  //     return randomDate.toISOString().split("T")[0]; // Return YYYY-MM-DD format
  //   }

  //   return randomDate.toISOString().split("T")[0]; // Return YYYY-MM-DD format
  // };

  // const [rowData] = useState(generateRandomData);
  // const handleAction = useCallback(
  //   (params) => {
  //     console.log("Redirect to details page for:", params.data.itineraryId);
  //     // Add routing logic here
  //     // nvigate to the page inineraries which have a dynamic routing for itineraryId

  //     router.push(`/itineraries/${params.data.itineraryId}`);
  //   },
  //   [router]
  // );

  // Column definitions with floating filters and date filtering
  // const columnDefs = useMemo(
  //   () => [
  //     {
  //       headerName: "ITINERARY ID",
  //       field: "itineraryId",
  //     },
  //     {
  //       headerName: "USER NAME & EMAIL ID",
  //       field: "userNameEmail",
  //     },
  //     {
  //       headerName: "DESTINATION",
  //       field: "destination",
  //     },
  //     {
  //       headerName: "COUNTRY OF DEST.",
  //       field: "countryOfDest",
  //     },
  //     {
  //       headerName: "TRAVEL DATE RANGE",
  //       field: "travelDateRange",
  //       valueFormatter: (params) =>
  //         `${params.value.start} to ${params.value.end}`,
  //       filter: "agDateColumnFilter",
  //       filterParams: {
  //         comparator: (filterLocalDateAtMidnight, cellValue) => {
  //           const [start, end] = cellValue.split(" to ");
  //           const cellStartDate = new Date(start);
  //           const cellEndDate = new Date(end);
  //           console.log({
  //             filterLocalDateAtMidnight,
  //             cellEndDate,
  //             cellStartDate,
  //           });

  //           // Compare dates to determine if the filter criteria match
  //           if (cellEndDate < filterLocalDateAtMidnight) {
  //             return -1;
  //           } else if (cellStartDate > filterLocalDateAtMidnight) {
  //             return 1;
  //           } else {
  //             return 0;
  //           }
  //         },
  //       },
  //     },
  //     {
  //       headerName: "TRAVEL COMPANIONS",
  //       field: "travelCompanions",
  //     },
  //     {
  //       headerName: "TRIP BUDGET TIER",
  //       field: "tripBudgetTier",
  //     },
  //     {
  //       headerName: "ACTION",
  //       field: "action",
  //       filter: false, // No filter for action column
  //       cellRenderer: (params) => (
  //         <Button
  //           bgGradient={"linear(to-r, #0099FF, #54AB6A)"}
  //           color="white"
  //           size="sm"
  //           onClick={() => handleAction(params)}
  //           _hover={{
  //             bgGradient: "linear(to-r, #0099FF, #54AB6A)",
  //             boxShadow: "xl",
  //           }}
  //         >
  //           View
  //         </Button>
  //       ),
  //     },
  //   ],
  //   [handleAction]
  // );

  // const gridOptions = useMemo(
  //   () => ({
  //     rowData,
  //     columnDefs,
  //     defaultColDef: {
  //       filter: true,
  //       floatingFilter: true,
  //       flex: 1,
  //       sortable: true,
  //       resizable: true,
  //       filterParams: {
  //         debounceMs: 0,
  //         buttons: ["reset"],
  //       },
  //     },
  //     rowSelection: "multiple",
  //     suppressRowClickSelection: true,
  //     pagination: true,
  //     paginationPageSize: 10,
  //     paginationPageSizeSelector: [10, 20],
  //     enableCellTextSelection: true,
  //   }),
  //   [rowData, columnDefs]
  // );



  // new area 

   const router = useRouter();
   const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
   const authToken = useAuth(baseURL);
   const { isOpen, onOpen, onClose } = useDisclosure();
   const [interests, setInterests] = useState([]);
   const [rowData, setRowData] = useState([]);
   const [dataLen, setDataLen] = useState(0);
   const [serachLoc , setSerachLoc] = useState(0);

   // Sample data for the ag-Grid

   async function fetchData() {
     try {
       const response = await axios.get(
         `${baseURL}/app/masters/itinerary-requests/all/${authToken}`
       );
       console.log(response.data);
       const locations = response.data.map((item) => item.cityStateCountry);
       const uniqueLocations = Array.from(new Set(locations));
      //  console.log(uniqueLocations.length);
       setSerachLoc(uniqueLocations.length);
       setDataLen(response.data.length);
       let formatedData = response.data.map((item, index) => ({
         index: index + 1,
         ...item,
       }));
       setRowData(formatedData);
     } catch (error) {
       console.log(error.message);
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
       //  { headerName: "USERNAME & EMAIL", field: "username" },
       { headerName: "Time", field: "createdTime", minWidth: 150 },
       {
         headerName: "CREATED DATE & TIME",
         field: "createdDate",
         filter: "agDateColumnFilter",
         cellRenderer: (params) => {
           const date = params.data.createdDate;
          //  const time = params.data.createdTime;
           // Use <br> for a line break between date and time
           return (
             <div>
               <div>{date}</div>
               {/* <div>{time}</div> */}
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





  // new end 


  const detailsContentArr = [
    {
      title: "Itineraries Generated",
      content: dataLen,
      path: "/dashboard/totalItineraries.svg",
      color: "#FFFAC2",
    },
    {
      title: "Users",
      content: dataLen,
      path: "/dashboard/totalUsers.svg",
      color: "#F0F6FF",
    },
    {
      title: "Locations Searched",
      content: serachLoc,
      path: "/dashboard/noOfLocations.svg",
      color: "#E7F7EF",
    },
    // {
    //   title: "Popular Location",
    //   content: "Kerala",
    //   path: "/dashboard/mostPopularLocations.svg",
    //   color: "#F7F1E7",
    // },
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
          <Text fontWeight={600}>👋 Hey, {userName}</Text>
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
                <Image
                  src={item.path}
                  alt="logo"
                  width={30}
                  height={30}
                  style={{
                    width: "auto",
                    height: "auto",
                  }}
                />
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
          {/* <AgGridReact
            className="ag-theme-quartz"
            gridOptions={gridOptions}
            onGridReady={(params) => {
              gridApiRef.current = params.api;
              params.api.sizeColumnsToFit();
            }}
            domLayout="autoHeight"
            getRowHeight={() => 80}
          /> */}
          <AgGridReact
            className="ag-theme-quartz"
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
            getRowHeight={(params) => {
              return 80;
            }}
          />
        </Box>

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
