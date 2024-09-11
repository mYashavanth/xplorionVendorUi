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
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { IoLocationOutline } from "react-icons/io5";
import { CiCalendar } from "react-icons/ci";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import styles from "../../styles/itineraries.module.css";
import { IoIosArrowBack } from "react-icons/io";
import { TfiDownload } from "react-icons/tfi";

export default function Itinerary() {
  const route = useRouter();
  const { itineraryId } = route.query;

  const headerRef = useRef(null);
  const navRef = useRef(null);
  const [activeSection, setActiveSection] = useState("");
  const [combinedHeight, setCombinedHeight] = useState(0);

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
  }, []);

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
        if (window.scrollY >= sectionTop - combinedHeight) {
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
                <Tag size={"lg"} bgColor={"#E5E5E5"}>
                  Sightseeing
                </Tag>
                <Tag size={"lg"} bgColor={"#E5E5E5"}>
                  Food and wine
                </Tag>
                <Tag size={"lg"} bgColor={"#E5E5E5"}>
                  Nightlife
                </Tag>
                <Tag size={"lg"} bgColor={"#E5E5E5"}>
                  Hiking
                </Tag>
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
        <Flex  border={"1px solid black"}>
          {/* In-page navigation on the left */}
          <Box
            ref={navRef}
            position={"sticky"}
            top={`calc(var(--itinerary-header-height) + var(--navbar-height))`}
            height={"fit-content"}
            width="250px"
            borderRight="1px solid #E5E5E5"
            padding="16px"
          >
            <VStack align="start" spacing={4}>
              <Text
                onClick={() => handleScrollToSection("section1")}
                fontWeight={activeSection === "section1" ? "bold" : "normal"}
                color={activeSection === "section1" ? "#005CE8" : "black"}
                cursor="pointer"
              >
                Section 1
              </Text>
              <Text
                onClick={() => handleScrollToSection("section2")}
                fontWeight={activeSection === "section2" ? "bold" : "normal"}
                color={activeSection === "section2" ? "#005CE8" : "black"}
                cursor="pointer"
              >
                Section 2
              </Text>
              <Text
                onClick={() => handleScrollToSection("section3")}
                fontWeight={activeSection === "section3" ? "bold" : "normal"}
                color={activeSection === "section3" ? "#005CE8" : "black"}
                cursor="pointer"
              >
                Section 3
              </Text>
            </VStack>
          </Box>

          {/* Sections on the right */}
          <Box flex={1} pl={"32px"}>
            <section
              id="section1"
              style={{ height: "100vh", border: "1px solid red" }}
            >
              <Heading size="lg">Section 1</Heading>
              <Text mt={4}>Content for Section 1</Text>
            </section>

            <section
              id="section2"
              style={{ height: "100vh", border: "1px solid green" }}
            >
              <Heading size="lg">Section 2</Heading>
              <Text mt={4}>Content for Section 2</Text>
            </section>

            <section
              id="section3"
              style={{ height: "100vh", border: "1px solid blue" }}
            >
              <Heading size="lg">Section 3</Heading>
              <Text mt={4}>Content for Section 3</Text>
            </section>
          </Box>
        </Flex>
      </main>
    </>
  );
}
