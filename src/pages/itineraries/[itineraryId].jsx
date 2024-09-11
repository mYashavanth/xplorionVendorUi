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
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { IoLocationOutline } from "react-icons/io5";
import { CiCalendar } from "react-icons/ci";
import Head from "next/head";
import { useEffect, useRef } from "react";
import styles from "../../styles/itineraries.module.css";
import { IoIosArrowBack } from "react-icons/io";
import { TfiDownload } from "react-icons/tfi";

export default function Itinerary() {
  const route = useRouter();
  const { itineraryId } = route.query;

  // useRef to get the Flex container element
  const headerRef = useRef(null);

  useEffect(() => {
    if (headerRef.current) {
      const headerHeight = headerRef.current.offsetHeight;

      // Setting the height as a CSS variable
      document.documentElement.style.setProperty(
        "--itinerary-header-height",
        `${headerHeight}px`
      );
    }
  }, []); // Empty dependency array to run once after component mounts

  return (
    <>
      <Head>
        <title>Itinerary {itineraryId}</title>
      </Head>
      <main className={styles.main}>
        {/* Attach the ref to the Flex component */}
        <Flex
          ref={headerRef}
          // border={"1px solid black"}
          borderBottom={"1px dashed gray"}
          className={styles.headerSection}
          p={"16px 0"}
        >
          <VStack
            // border={"1px solid black"}
            alignItems={"flex-start"}
            gap={"34px"}
          >
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
          <VStack
            alignItems={"flex-end"}
            gap={"32px"}
            // border={"1px solid black"}
          >
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
        
      </main>
    </>
  );
}
