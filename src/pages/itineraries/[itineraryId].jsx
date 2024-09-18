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
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { IoLocationOutline } from "react-icons/io5";
import { CiCalendar } from "react-icons/ci";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import styles from "../../styles/itineraries.module.css";
import { IoIosArrowBack } from "react-icons/io";
import { TfiDownload } from "react-icons/tfi";
import { PiQuotes } from "react-icons/pi";
import { FaRegCircle } from "react-icons/fa6";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import { IoFastFoodOutline } from "react-icons/io5";
import { TbBeach } from "react-icons/tb";
import { IoMdTime } from "react-icons/io";
import { TiInfoOutline } from "react-icons/ti";
import { MdOutlineTipsAndUpdates } from "react-icons/md";
import { GoChecklist } from "react-icons/go";

export default function Itinerary() {
  const route = useRouter();
  const { itineraryId } = route.query;

  const headerRef = useRef(null);
  const navRef = useRef(null);
  const [activeSection, setActiveSection] = useState("summary");
  const [combinedHeight, setCombinedHeight] = useState(0);
  const numberOfDays = 3;
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
              Kochi ( Cochin ) 5 days - Friends
            </Heading>
            <HStack gap={"16px"}>
              <HStack>
                <IoLocationOutline />
                <Text>Kochi (Cochin), India</Text>
              </HStack>
              <HStack>
                <CiCalendar />
                <Text>5 days</Text>
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
              <IoIosArrowBack /> <Text>Back</Text>
            </Button>
            <Button
              variant="ghost"
              _hover={{ bgColor: "#EDF2FE" }}
              color={"#005CE8"}
              fontWeight={600}
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
            // overflowY={"scroll"}
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
                      {Array.from({ length: numberOfDays }).map((_, index) => (
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
                      ))}
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
            // border={"1px solid black"}
          >
            <section
              id="summary"
              style={{ height: "100vh", border: "1px solid red" }}
            >
              <Heading size="lg">Summary</Heading>
              <Text mt={4}>Content for Summary</Text>
            </section>
            {/* sections for days dynamically */}

            {Array.from({ length: numberOfDays }).map((_, index) => (
              <section
                key={index}
                id={`itineraryday${index + 1}`}
                style={{ height: "100vh", border: "1px solid orange" }}
              >
                <Heading size="lg">day {index + 1}</Heading>
                <Text mt={4}>Content for day {index + 1}</Text>
              </section>
            ))}

            {navItemsData.map((item, index) => (
              <section
                key={index}
                id={item.id}
                style={{ height: "100vh", border: "1px solid blue" }}
              >
                <Heading size="lg">{item.name}</Heading>
                <Text mt={4}>Content for {item.name}</Text>
              </section>
            ))}
          </Box>
        </Flex>
      </main>
    </>
  );
}
