import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Spacer,
  Tag,
  Text,
  VStack,
  Link,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  List,
  ListItem,
  ListIcon,
  Card,
  CardBody,
  Image,
  SimpleGrid,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from "@chakra-ui/react";
import { FaRegHandPointRight } from "react-icons/fa";
import { Table } from "@chakra-ui/react";
import { VscActivateBreakpoints } from "react-icons/vsc";
import { useRouter } from "next/router";
import { IoLocationOutline, IoFastFoodOutline } from "react-icons/io5";
import { CiCalendar } from "react-icons/ci";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import styles from "../../styles/itineraries.module.css";
import { IoIosArrowBack, IoMdTime } from "react-icons/io";
import { TfiDownload } from "react-icons/tfi";
import { PiQuotes } from "react-icons/pi";
import { FaRegCircle } from "react-icons/fa6";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import { TbBeach } from "react-icons/tb";
import { TiInfoOutline } from "react-icons/ti";
import { MdOutlineTipsAndUpdates } from "react-icons/md";
import { GoChecklist } from "react-icons/go";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import useAuth from "@/components/useAuth";
// import Image from "next/image";

export default function Itinerary() {
  const route = useRouter();
  const { itineraryId } = route.query;
  // console.log({ itineraryId });
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const authToken = useAuth(baseURL);
  const tempToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyVG9rZW4iOiJ0ZXN0MTIzQGdtYWlsLmNvbS02NzYzZTFjODM1YWI2ZjVhY2RkYjBmYzEtMjAyNTAzMTcxNDEzMDEifQ.C3aigJ3pW5Is-_Z3Con-TM8G_w6IVuUp7u-Kd-bQGPI`;

  const headerRef = useRef(null);
  const navRef = useRef(null);
  const [activeSection, setActiveSection] = useState("summary");
  const [combinedHeight, setCombinedHeight] = useState(0);
  const [numberOfDays, setNumberOfDays] = useState(0);
  const [itineraryData, setItineraryData] = useState({});
  const [localFood, setLocalFood] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [bestTimes , setBestTimes] = useState([]);
  const [tips, setTips] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const navItemsData = [
    { id: "localFood", name: "Local Food", icon: IoFastFoodOutline },
    { id: "nationalHolidays", name: "National holidays", icon: TbBeach },
    { id: "bestTimes", name: "Best time to visit", icon: IoMdTime },
    { id: "importantInfo", name: "Important information", icon: TiInfoOutline },
    { id: "tips", name: "Tips", icon: MdOutlineTipsAndUpdates },
    { id: "packingList", name: "Packing list", icon: GoChecklist },
  ];

  // Calculate combined height and set CSS variable
  useEffect(() => {
    const updateHeights = () => {
      const headerHeight = headerRef.current?.offsetHeight || 0;
      const navbarHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--navbar-height"
        ),
        10
      );

      setCombinedHeight(headerHeight + navbarHeight);

      // Set the height as a CSS variable
      document.documentElement.style.setProperty(
        "--itinerary-header-height",
        `${headerHeight}px`
      );
    };

    updateHeights();

    window.addEventListener("resize", updateHeights);
    return () => {
      window.removeEventListener("resize", updateHeights);
    };
  }, [combinedHeight]);

  // Scroll into view with offset and smooth behavior
  const handleScrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);

    if (section) {
      const offsetTop = section.offsetTop - combinedHeight;

      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    // Scroll event listener for active link highlight
    const handleScroll = () => {
      const sections = document.querySelectorAll("section");
      let currentSection = "";

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - combinedHeight - 100) {
          currentSection = section.getAttribute("id");
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [combinedHeight]);

  const isAnyListItemActive = (numberOfDays) => {
    for (let i = 1; i <= numberOfDays; i++) {
      if (activeSection === `itineraryday${i}`) {
        return true;
      }
    }
    return false;
  };

  const downloadItineraryAsPDF = async () => {
    setIsDownloading(true); // Start loading

    const input = document.getElementById("itinerary-content");

    try {
      const canvas = await html2canvas(input, {
        scale: 2, // High-quality rendering
        useCORS: true,
      });

      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const padding = 10; // Padding around content
      const imgWidth = pageWidth - 2 * padding; // Image width with padding
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageImageHeight = pageHeight - 40; // Space for heading on first page

      let heightLeft = imgHeight;
      let position = padding + 20; // Start position for first page
      let page = 1;
      let sourceY = 0;

      while (heightLeft > 0) {
        if (page > 1) {
          pdf.addPage();
          position = padding; // Reset position for subsequent pages
        }

        // Add heading only on the first page
        if (page === 1) {
          pdf.setFontSize(16);
          pdf.setTextColor(0, 0, 0);
          pdf.text(
            `${itineraryData?.cityStateCountry} ${numberOfDays} days - ${itineraryData?.travelCompanion}`,
            padding + 4,
            padding + 10
          );
        }

        // Capture the portion of the image for this page
        const canvasPage = document.createElement("canvas");
        const ctx = canvasPage.getContext("2d");

        canvasPage.width = canvas.width;
        canvasPage.height = Math.min(
          canvas.height - sourceY,
          (pageImageHeight * canvas.width) / imgWidth
        );

        ctx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          canvasPage.height,
          0,
          0,
          canvas.width,
          canvasPage.height
        );

        const pageImgData = canvasPage.toDataURL("image/png");
        pdf.addImage(
          pageImgData,
          "PNG",
          padding,
          position,
          imgWidth,
          (canvasPage.height * imgWidth) / canvas.width
        );

        heightLeft -= pageImageHeight;
        sourceY += canvasPage.height;
        page++;
      }

      pdf.save(
        `${itineraryData?.cityStateCountry}_${numberOfDays}_days_itinerary.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false); // Stop loading
    }
  };

  async function fetchData() {
    try {
      const response = await fetch(
        `${baseURL}/app/masters/itinerary-requests/${itineraryId}/${authToken}`
      );
      const data = await response.json();
      console.log(data);
      setItineraryData(data[0]);
      setNumberOfDays(data[0]?.itinerary?.itinerary?.days?.length);
    } catch (error) {
      console.log(error.message);
    }
  }

  async function fetchFoodData() {
    try {
      const res = await fetch(
        `https://xplorionai-bryz7.ondigitalocean.app/food-drinks/$selectedPlace/${tempToken}`
      );
      const data = await res.json();
      // console.log(data);
      setLocalFood(data);
    } catch (error) {
      console.log(error.message);
    }
  }

  async function fetchHolidays() {
    try {
      const res = await fetch(
        `https://xplorionai-bryz7.ondigitalocean.app/national-holidays/$selectedPlace/${tempToken}`
      );
      const data = await res.json();
      // console.log(data);
      setHolidays(data);
    } catch (error) {
      console.log(error.message);
    }
  }

  async function fetchBestTimes(){
    try {
      const res = await fetch(
      `https://xplorionai-bryz7.ondigitalocean.app/best-time-to-visit-place/$selectedPlace/${tempToken}`
    )

    const data = await res.json();
    console.log(data);
    setBestTimes(data);
    } catch (error) {
      console.log(error.message);
    }
  }

  async function fetchTips(){
    try { 
      const res = await fetch(
        ` https://xplorionai-bryz7.ondigitalocean.app/tips-for-place/$selectedPlace/${tempToken}`
      )
    const data = await res.json();
    console.log(data);
    setTips(data);
  } catch (error) {
    console.log(error.message);
  }

}


  useEffect(() => {
    if (!authToken || !itineraryId) return;
    fetchData();
    // fetchFoodData();
    // fetchHolidays();
    // fetchBestTimes();
    // fetchTips();
  }, [authToken, itineraryId]);

  // console.log({ itineraryData, numberOfDays });

  return (
    <>
      <Head>
        <title>Itinerary {itineraryId}</title>
      </Head>
      <main className={styles.main}>
        <Flex
          ref={headerRef}
          borderBottom={"1px dashed gray"}
          className={styles.headerSection}
          p={"16px 0"}
          bgColor={"#f5f6f7"}
        >
          <VStack alignItems={"flex-start"} gap={"34px"}>
            <Heading className="heading">
              {itineraryData?.cityStateCountry} {numberOfDays} days -{" "}
              {itineraryData?.travelCompanion}
            </Heading>
            <HStack gap={"16px"}>
              <HStack>
                <IoLocationOutline />
                <Text>{itineraryData?.cityStateCountry}</Text>
              </HStack>
              <HStack>
                <CiCalendar />
                <Text>{numberOfDays} days</Text>
              </HStack>
              <HStack>
                {["Sightseeing", "Food and wine", "Nightlife", "Hiking"].map(
                  (tag, index) => (
                    <Tag
                      key={index}
                      size={"lg"}
                      border={"1px solid #0099FF"}
                      sx={{
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                        backgroundImage:
                          "linear-gradient(to right, #0099FF, #54AB6A)",
                        fontWeight: "bold",
                      }}
                    >
                      {tag}
                    </Tag>
                  )
                )}
              </HStack>
            </HStack>
          </VStack>
          <Spacer />
          <VStack alignItems={"flex-end"} gap={"32px"}>
            <Button
              variant="ghost"
              _hover={{ bgColor: "#E8E8E8" }}
              fontWeight={600}
            >
              <IoIosArrowBack /> <Text onClick={() => route.back()}>Back</Text>
            </Button>
            <Button
              variant="ghost"
              _hover={{ bgColor: "#EDF2FE" }}
              color={"#005CE8"}
              fontWeight={600}
              onClick={downloadItineraryAsPDF}
              isLoading={isDownloading}
            >
              <TfiDownload /> <Text>Download Itinerary</Text>
            </Button>
          </VStack>
        </Flex>

        {/* Sticky navigation bar and sections */}
        <Flex
        // border={"1px solid black"}
        >
          {/* In-page navigation on the left */}
          <Box
            ref={navRef}
            position={"sticky"}
            top={`calc(var(--itinerary-header-height) + var(--navbar-height))`}
            height={"fit-content"}
            width="250px"
            borderRight="1px dashed #E5E5E5"
            padding="16px"
            // border={"1px solid black"}
            overflowY={"scroll"}
            sx={{
              "&::-webkit-scrollbar": {
                width: "4px", // Set scrollbar width
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#888", // Color of the scrollbar thumb
                borderRadius: "10px", // Rounded corners
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: "#555", // Darker on hover
              },
              "&::-webkit-scrollbar-track": {
                background: "#f1f1f1", // Track color
              },
            }}
            // w={"fit-content"}
            h={
              "calc(100vh - var(--itinerary-header-height) - var(--navbar-height))"
            }
          >
            <VStack align="start" spacing={4}>
              <HStack
                cursor="pointer"
                onClick={() => handleScrollToSection("summary")}
                fontWeight={activeSection === "summary" ? "bold" : "normal"}
                color={activeSection === "summary" ? "#005CE8" : "black"}
                w={"100%"}
                p={2}
                borderRadius={"4px"}
                bgColor={
                  activeSection === "summary" ? "#EDF2FE" : "transparent"
                }
                _hover={{
                  bg: activeSection === "summary" ? "#EDF2FE" : "#E5E5E5",
                }}
              >
                <PiQuotes />
                <Text>Summary</Text>
              </HStack>

              <Accordion
                allowMultiple
                width="100%"
                border="none"
                sx={{ border: "none" }}
              >
                <AccordionItem
                  sx={{
                    border: "none",
                  }}
                >
                  <h2>
                    <AccordionButton
                      display="flex"
                      justifyContent="space-between"
                      p={"8px 8px"}
                      sx={{
                        border: "1px solid balck",
                        borderRadius: "4px",
                        bg: isAnyListItemActive(numberOfDays)
                          ? "#EDF2FE"
                          : "transparent",
                        _hover: {
                          bg: isAnyListItemActive(numberOfDays)
                            ? "#EDF2FE"
                            : "#E5E5E5",
                        },
                      }}
                      fontWeight={
                        isAnyListItemActive(numberOfDays) ? "bold" : "normal"
                      }
                      color={
                        isAnyListItemActive(numberOfDays) ? "#005CE8" : "black"
                      }
                    >
                      <HStack>
                        <HiOutlineClipboardDocumentList />
                        <Text>Itinerary</Text>
                      </HStack>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel sx={{ border: "none", p: "10px 16px" }}>
                    <List spacing={3}>
                      {itineraryData.itinerary?.itinerary?.days?.map(
                        (_, index) => (
                          <ListItem
                            key={index}
                            display="flex"
                            alignItems="center"
                            // id={`itineraryday${index + 1}`}
                            onClick={() =>
                              handleScrollToSection(`itineraryday${index + 1}`)
                            }
                            cursor="pointer"
                            fontWeight={
                              activeSection === `itineraryday${index + 1}`
                                ? "bold"
                                : "normal"
                            }
                            color={
                              activeSection === `itineraryday${index + 1}`
                                ? "#005CE8"
                                : "black"
                            }
                          >
                            <ListIcon
                              as={FaRegCircle}
                              sx={{ fontSize: "10px" }}
                            />
                            day {index + 1}
                          </ListItem>
                        )
                      )}
                    </List>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>

              {navItemsData.map((item, index) => (
                <HStack
                  key={index}
                  cursor="pointer"
                  onClick={() => handleScrollToSection(item.id)}
                  fontWeight={activeSection === item.id ? "bold" : "normal"}
                  color={activeSection === item.id ? "#005CE8" : "black"}
                  w={"100%"}
                  p={2}
                  borderRadius={"4px"}
                  bgColor={
                    activeSection === item.id ? "#EDF2FE" : "transparent"
                  }
                  _hover={{
                    bg: activeSection === item.id ? "#EDF2FE" : "#E5E5E5",
                  }}
                >
                  <item.icon />
                  <Text>{item.name}</Text>
                </HStack>
              ))}
            </VStack>
          </Box>

          {/* Sections on the right */}
          <Box
            flex={1}
            pl={"32px"}
            display={"flex"}
            flexDirection={"column"}
            gap={"32px"}
            id="itinerary-content"
            // border={"1px solid black"}
          >
            <section
              id="summary"
              // style={{ height: "100vh", border: "1px solid red" }}
            >
              <HStack>
                <PiQuotes size={"32px"} color={"#005CE8"} />
                <Heading style={{ fontSize: "24px", fontWeight: "500" }}>
                  About {itineraryData?.cityStateCountry}
                </Heading>
              </HStack>
              <Text mt={4}>{itineraryData?.itinerary?.about_place}</Text>
            </section>
            {/* sections for days dynamically */}
            {/* heading for number of days */}
            <section>
              <HStack>
                <HiOutlineClipboardDocumentList
                  size={"32px"}
                  color={"#005CE8"}
                />
                <Heading style={{ fontSize: "24px", fontWeight: "500" }}>
                  {numberOfDays} - Day Itinerary
                </Heading>
              </HStack>
            </section>

            {itineraryData?.itinerary?.itinerary?.days?.map((day, index) => (
              <section
                key={index}
                id={`itineraryday${index + 1}`}
                // style={{ height: "100vh", border: "1px solid orange" }}
              >
                <HStack>
                  <FaRegCircle color={"#005CE8"} />
                  <Heading style={{ fontSize: "24px", fontWeight: "500" }}>
                    Day {index + 1} Itinerary
                  </Heading>
                </HStack>
                <Box ml={6} mt={2} borderTop={"1px dashed #888888"}>
                  {day?.activities?.map((activity, activityIndex) => (
                    <Box key={`activity${activityIndex}`} mt={4}>
                      <Heading style={{ fontSize: "16px", fontWeight: "500" }}>
                        {activity?.time}: {activity?.activity}
                      </Heading>
                      <Text
                        mt={4}
                        style={{ fontSize: "16px", color: "#888888" }}
                      >
                        {activity.one_line_description_about_place}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </section>
            ))}

            <Box
              style={{
                padding: "16px",
              }}
            >
              <section id="localFood">
                <HStack spacing={2} mb={4}>
                  <IoFastFoodOutline size={"32px"} color={"#005CE8"} />
                  <Heading style={{ fontSize: "24px", fontWeight: "500" }}>
                    Local Food
                  </Heading>
                </HStack>
              </section>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {localFood?.map((card, index) => (
                  <Card
                    key={index}
                    w="100%"
                    h="100%"
                    borderRadius="md"
                    // boxShadow="md"
                    overflow="hidden"
                    zIndex={-1}
                  >
                    <Image
                      src={card.food_drink_image}
                      alt={card.food_drink_name}
                      w="full"
                      h="200px"
                      objectFit="cover"
                    />
                    <CardBody>
                      <VStack align="start" spacing={2}>
                        <Heading size="md">{card.food_drink_name}</Heading>
                        <Text fontSize="sm" color="gray.600">
                          {card.food_drink_type}
                        </Text>
                        <Text>{card.food_drink_description}</Text>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </Box>

            <Box padding="16px">
              <section id="nationalHolidays">
                <HStack spacing={2} mb={4}>
                  <TbBeach size="32px" color="#005CE8" />
                  <Heading fontSize="24px" fontWeight="500">
                    National Holiday
                  </Heading>
                </HStack>
                <Text>
                  Here you can find the national calendar of all public holidays
                  for the year. These dates are subject to change as official
                  updates occur.
                </Text>
              </section>

              <Box mt={8}>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th borderBottom="2px solid #E2E8F0">Holiday Name</Th>
                      <Th borderBottom="2px solid #E2E8F0">Date</Th>
                      <Th borderBottom="2px solid #E2E8F0">Day</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {holidays?.map((item, index) => (
                      <Tr key={index}>
                        <Td py={3} px={4} borderBottom="1px solid #E2E8F0">
                          {item.date}
                        </Td>
                        <Td py={3} px={4} borderBottom="1px solid #E2E8F0">
                          {item.day}
                        </Td>
                        <Td py={3} px={4} borderBottom="1px solid #E2E8F0">
                          {item.holiday_name}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>

            <Box>
              <section id="bestTimes">
                <HStack spacing={2} mb={4}>
                  <IoMdTime size={"32px"} color={"#005CE8"} />
                  <Heading style={{ fontSize: "24px", fontWeight: "500" }}>
                    Best Time To Visit
                  </Heading>
                </HStack>
              </section>
              <Box mt={12}>
                {bestTimes?.map((time, index) => (
                  <>
                    <Box key={index} display={"flex"} gap={4}>
                      <VscActivateBreakpoints />
                      <Text mb={2}>{time.tip}</Text>
                    </Box>
                    <Box border={"1px  dotted  #E2E8F0"} my={4}></Box>
                  </>
                ))}
              </Box>
            </Box>

            <Box>
              <section id="tips">
                <HStack spacing={2} mb={4}>
                  <MdOutlineTipsAndUpdates size={"32px"} color={"#005CE8"} />
                  <Heading style={{ fontSize: "24px", fontWeight: "500" }}>
                    Tips
                  </Heading>
                </HStack>
              </section>

              <Box mt={12}>
                {tips?.map((time, index) => (
                  <>
                    <Box key={index} display={"flex"} gap={4}>
                      <FaRegHandPointRight />
                      <Text mb={2}>{time.tip}</Text>
                    </Box>
                    <Box border={"1px  dotted  #E2E8F0"} my={4}></Box>
                  </>
                ))}
              </Box>
            </Box>

            {/* {navItemsData.map((item, index) => (
              <section
                key={index}
                id={item.id}
                style={{ height: "100vh", border: "1px solid blue" }}
              >
                <Heading size="lg">{item.name}</Heading>
                <Text mt={4}>Content for {item.name}</Text>
              </section>
            ))} */}
          </Box>
        </Flex>
      </main>
    </>
  );
}
