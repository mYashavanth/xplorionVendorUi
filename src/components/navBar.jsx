import { useRef, useEffect, useState } from "react";
import {
  Center,
  Flex,
  Heading,
  HStack,
  Spacer,
  Text,
  Icon,
  Box,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { AiOutlineHome } from "react-icons/ai";
import { RxDashboard } from "react-icons/rx";
import { IoLogOutOutline } from "react-icons/io5";
import { PiUsersThreeThin, PiDiamondThin } from "react-icons/pi";
import { RiArrowDropDownLine } from "react-icons/ri";

import {
  HiOutlineClipboardDocumentList,
  HiOutlineSquaresPlus,
} from "react-icons/hi2";

export default function NavBar() {
  const router = useRouter();
   const [userName , setUserName] = useState("");
   useEffect(() => {
     const LogEmail = localStorage.getItem("name");
     if (LogEmail) {
       const extractedName = LogEmail.split("@")[0]; // Extracts the part before '@'
       setUserName(extractedName);
     }
   }, []); // Runs only once when the component mounts
  
   
  const name = userName; // Change name to test
  const navBarRef = useRef(null);
  const path = router.pathname;

  useEffect(() => {
    if (navBarRef.current) {
      const navBarHeight = navBarRef.current.offsetHeight;
      document.documentElement.style.setProperty(
        "--navbar-height",
        `${navBarHeight}px`
      );
    }
  }, []);

  const getInitials = (name) => {
    const nameParts = name.split(/\s+/);
    if (nameParts.length === 1) {
      return nameParts[0][0].toUpperCase();
    }
    return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
  };

  const navItems = [
    { name: "Dashboard", icon: AiOutlineHome, path: "/" },
    { name: "App Users", icon: PiUsersThreeThin, path: "/signed_up_users" },
    {
      group: "Masters",
      icon: RxDashboard,
      items: [
        {
          name: "Interests Category",
          icon: PiDiamondThin,
          path: "/primary_category",
        },
        {
          name: "Sub Interests",
          icon: PiDiamondThin,
          path: "/interests_masters",
        },
        { name: "Cities", icon: PiDiamondThin, path: "/city_details" },
        { name: "Budget Tiers", icon: PiDiamondThin, path: "/budget_tier" },
        {
          name: "Travel Companion",
          icon: PiDiamondThin,
          path: "/travel_companion",
        },
      ],
    },
    {
      name: "Itineraries Generated",
      icon: HiOutlineClipboardDocumentList,
      path: "/itinerary_list",
    },
    {
      name: "Banner Master",
      icon: HiOutlineSquaresPlus,
      path: "/banner_master",
    },
    {
      name: "Logout",
      icon: IoLogOutOutline,
      action: () => {
        localStorage.removeItem("token");
        router.push("/login");
      },
    },
  ];

  const isActive = (path) => router.pathname === path;
  const isGroupActive = (items) => items.some((item) => isActive(item.path));

  return (
    <nav ref={navBarRef}>
      <Flex
        bgGradient={"linear(to-r, #0099FF, #54AB6A)"}
        p={"12px 180px"}
        color={"white"}
      >
        <Center gap={"6px"} maxW={"160px"}>
          <Image
            src="/navBar/logo.png"
            alt="logo"
            width={130}
            height={20}
            priority={true}
            style={{ objectFit: "contain", width: "auto" }}
          />
        </Center>
        <Spacer />
        {path === "/login" ? null : (
          <HStack ml={4}>
            <Text>Welcome, {name}</Text>
            <Center
              w="50px"
              h="50px"
              bg="#005CE8"
              fontWeight="bold"
              borderRadius="full"
              justifyContent="center"
              alignItems="center"
            >
              {getInitials(name)}
            </Center>
          </HStack>
        )}
      </Flex>
      {path === "/login" ? null : (
        <Flex p={"12px 180px"} gap={4} bgColor={"white"}>
          {navItems.map((item) =>
            item.group ? (
              <Dropdown
                key={item.group}
                group={item.group}
                icon={item.icon}
                items={item.items}
                isGroupActive={isGroupActive(item.items)}
                isActive={isActive}
              />
            ) : (
              <NavItem
                key={item.name}
                name={item.name}
                icon={item.icon}
                path={item.path}
                action={item.action}
                isActive={isActive(item.path)}
              />
            )
          )}
        </Flex>
      )}
    </nav>
  );
}

function NavItem({ name, icon, path, action, isActive, boxSize = 6 }) {
  return action ? (
    <Center
      as="button"
      onClick={action}
      color={isActive ? "#005CE8" : "#888888"}
      gap={"8px"}
      fontWeight={isActive ? "bold" : 400}
      cursor="pointer"
      _hover={{ color: "#005CE8" }}
    >
      <Icon as={icon} boxSize={6} />
      <Text>{name}</Text>
    </Center>
  ) : (
    <Link href={path} passHref>
      <Center
        color={isActive ? "#005CE8" : "#888888"}
        gap={"8px"}
        fontWeight={isActive ? "bold" : 400}
        cursor="pointer"
        _hover={{ color: "#005CE8" }}
      >
        <Icon as={icon} boxSize={boxSize} />
        <Text>{name}</Text>
      </Center>
    </Link>
  );
}

function Dropdown({ group, icon, items, isGroupActive, isActive }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      position="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Center
        color={isHovered || isGroupActive ? "#005CE8" : "#888888"}
        gap={"8px"}
        fontWeight={isGroupActive ? "bold" : 400}
        cursor="pointer"
        _hover={{ color: "#005CE8" }}
      >
        <Icon as={icon} boxSize={6} />
        <Text>{group}</Text>
        <RiArrowDropDownLine fontSize={24} />
      </Center>
      {isHovered && (
        <VStack
          position="absolute"
          top="100%"
          left={0}
          bg="white"
          boxShadow="md"
          p={2}
          zIndex={10}
          align="flex-start"
          w="200px"
        >
          {items.map((item) => (
            <NavItem
              key={item.name}
              name={item.name}
              icon={item.icon}
              path={item.path}
              isActive={isActive(item.path)}
              boxSize={4}
            />
          ))}
        </VStack>
      )}
    </Box>
  );
}
