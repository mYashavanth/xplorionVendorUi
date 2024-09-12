import { useRef, useEffect } from "react";
import {
  Center,
  Flex,
  Heading,
  HStack,
  Spacer,
  Text,
  Icon,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { AiOutlineHome } from "react-icons/ai";
import { PiNotepad } from "react-icons/pi";
import { RxDashboard } from "react-icons/rx";
import { IoLogOutOutline } from "react-icons/io5";
import { PiUsersThreeThin } from "react-icons/pi";

export default function NavBar() {
  const router = useRouter();
  const name = "Admin"; // Change name to test
  const navBarRef = useRef(null);
  const path = router.pathname;
  console.log({ path });

  useEffect(() => {
    if (navBarRef.current) {
      console.log(navBarRef.current);

      const navBarHeight = navBarRef.current.offsetHeight;
      console.log(navBarHeight);
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
    // { name: "Itineraries", icon: PiNotepad, path: "/login" },
    {
      name: "Users",
      icon: PiUsersThreeThin,
      path: "/signed_up_users",
    },
    {
      name: "Primary Category",
      icon: PiNotepad,
      path: "/primary_category",
    },
    {
      name: "Interests Masters",
      icon: RxDashboard,
      path: "/interests_masters",
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
  console.log({ router });

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
        {path === "/login" ? (
          <></>
        ) : (
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
      {path === "/login" ? (
        <></>
      ) : (
        <Flex p={"12px 180px"} gap={4} bgColor={"white"}>
          {navItems.map((item) => (
            <NavItem
              key={item.name}
              name={item.name}
              icon={item.icon}
              path={item.path}
              action={item.action}
              isActive={isActive(item.path)}
            />
          ))}
        </Flex>
      )}
    </nav>
  );
}

function NavItem({ name, icon, path, action, isActive }) {
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
        <Icon as={icon} boxSize={6} />
        <Text>{name}</Text>
      </Center>
    </Link>
  );
}
