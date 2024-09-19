import { Box, Heading, Text, Button } from "@chakra-ui/react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Custom404() {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>404 - Page Not Found</title>
      </Head>
      <Box
        textAlign="center"
        py={10}
        px={6}
        height="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        h="calc(100vh - var(--navbar-height))"
      >
        <Box>
          <Heading
            display="inline-block"
            as="h1"
            size="4xl"
            bgGradient="linear(to-r, teal.400, teal.600)"
            backgroundClip="text"
          >
            404
          </Heading>
          <Text fontSize="xl" mt={3} mb={2}>
            Page Not Found
          </Text>
          <Text color="gray.500" mb={6}>
            The page you are looking for doesnot seem to exist.
          </Text>
          <Button
            colorScheme="teal"
            bgGradient="linear(to-r, teal.400, teal.500, teal.600)"
            color="white"
            variant="solid"
            onClick={() => router.push("/")}
          >
            Go to Home
          </Button>
        </Box>
      </Box>
    </>
  );
}
