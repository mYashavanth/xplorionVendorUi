import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from "axios";
import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  FormControl,
  FormLabel,
  Tag,
  TagLabel,
  TagCloseButton,
  Heading,
  Spacer,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Spinner,
  Select,
} from "@chakra-ui/react";
import Head from "next/head";
import styles from "../styles/interests_masters.module.css";
import { RxDashboard } from "react-icons/rx";
import { BsFillPlusCircleFill } from "react-icons/bs";
import { FiEdit, FiTrash2, FiEdit3 } from "react-icons/fi";
import { useRouter } from "next/router";
import useAuth from "@/components/useAuth";

export default function InterestsMasters() {
  const router = useRouter();
  const [rowData, setRowData] = useState([]);
  const [initialSubCategories, setInitialSubCategories] = useState([]);
  const [formData, setFormData] = useState({
    primary_category_id: "",
    primary_category: "",
    sub_category_data: [],
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [newInterest, setNewInterest] = useState("");
  const [loading, setLoading] = useState(true);
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  // console.log({ baseURL });
  const authToken = useAuth(baseURL);
  console.log({ authToken, rowData });
  const [btnLoading, setBtnLoading] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSubCategory, setCurrentSubCategory] = useState({
    subCategoryId: "",
    subCategoryName: "",
  });
  const [primary_categorys, setPrimaryCategories] = useState([]);

  const openEditModal = useCallback((subCategoryId, subCategoryName) => {
    setCurrentSubCategory({ subCategoryId, subCategoryName });
    setIsModalOpen(true);
  }, []);
  const handleUpdateSubCategory = async () => {
    try {
      const token = authToken;
      const formData = new FormData();

      // Append the fields to FormData
      formData.append("subCategory", currentSubCategory.subCategoryName);
      formData.append("subCategoryId", currentSubCategory.subCategoryId);
      formData.append("token", token);

      const response = await axios.post(
        `${baseURL}/app/masters/sub-category/update`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        console.log("Subcategory updated successfully");
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error updating subcategory:", error);
    }
  };
  const fetchData = useCallback(async () => {
    if (!authToken) return;
    try {
      const response = await axios.get(
        `${baseURL}/app/masters/sub-category/all/${authToken}`
      );
      setRowData(response.data);
    } catch (error) {
      console.error("There was an error fetching the data!", error);
    } finally {
      setLoading(false);
    }
  }, [authToken, baseURL]);

  useEffect(() => {
    const fetchPrimaryCategories = async () => {
      if (!authToken) return;
      try {
        const response = await axios.get(
          `${baseURL}/app/masters/primary-category/all/active/${authToken}`
        );
        setPrimaryCategories(response.data);
        console.log({ primary_categorys: response, data: response.data });
      } catch (error) {
        console.error("Error fetching primary categories:", error);
      }
    };

    fetchPrimaryCategories();
    fetchData();
  }, [authToken, baseURL, fetchData]);
  // const fetchData = async () => {
  //   if (!authToken) return;
  //   try {
  //     const response = await axios.get(
  //       `${baseURL}/app/masters/sub-category/all/${authToken}`
  //     );

  //     // console.log({ response });
  //     setRowData(response.data);
  //   } catch (error) {
  //     console.error("There was an error fetching the data!", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isEditing) {
        const initialSubCategoriesData = initialSubCategories.map(
          (item) => item.sub_category_name
        );
        const editFormData = new FormData();

        // Append the fields to FormData
        editFormData.append("primaryCategoryId", formData.primary_category_id);
        editFormData.append(
          "subCategory",
          JSON.stringify([
            ...initialSubCategoriesData,
            ...formData.sub_category_data,
          ])
        );
        editFormData.append("token", authToken);
        console.log({
          primaryCategoryId: formData.primary_category_id,
          subCategory: JSON.stringify([
            ...initialSubCategoriesData,
            ...formData.sub_category_data,
          ]),
          token: authToken,
        });

        const response = await axios.post(
          `${baseURL}/app/masters/sub-category/add`,
          editFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log({ response });
      } else {
        const addFormData = new FormData();
        addFormData.append("primaryCategoryId", formData.primary_category_id);
        addFormData.append(
          "subCategory",
          JSON.stringify(formData.sub_category_data)
        );
        addFormData.append("token", authToken);

        console.log({
          primaryCategoryId: formData.primary_category_id,
          subCategory: JSON.stringify(formData.sub_category_data),
          token: authToken,
        });

        const response = await axios.post(
          `${baseURL}/app/masters/sub-category/add`,
          addFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log({ response });
      }

      fetchData();
      onClose();
    } catch (error) {
      console.error(
        `There was an error ${isEditing ? "updating" : "adding"} the item!`,
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = useCallback(
    (data) => {
      setFormData({
        primary_category_id: data.primary_category_id,
        primary_category: data.primaryCategoryName,
        sub_category_data: [],
      });
      setInitialSubCategories(data.sub_category_data);
      setIsEditing(true);
      onOpen();
    },
    [onOpen]
  );

  const handleAdd = () => {
    setFormData({
      primary_category_id: "",
      interest_category: "",
      sub_category_data: [],
    });
    setInitialSubCategories([]);
    setIsEditing(false);
    onOpen();
  };

  const handleAddInterest = () => {
    if (newInterest) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        sub_category_data: [...prevFormData.sub_category_data, newInterest],
      }));
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (interest) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      sub_category_data: prevFormData.sub_category_data.filter(
        (item) => item !== interest
      ),
    }));
  };
  const handleStatusChange = useCallback(
    async (subCategoryId, currentStatus) => {
      try {
        setBtnLoading((prev) => ({ ...prev, [subCategoryId]: true }));
        const newStatus = currentStatus === 1 ? 0 : 1;

        const formData = new FormData();
        formData.append("status", newStatus);
        formData.append("subCategoryId", subCategoryId);
        formData.append("token", authToken);

        await axios.post(
          `${baseURL}/app/masters/sub-category/update/status`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        fetchData();
      } catch (error) {
        console.error("Failed to update status:", error);
      } finally {
        setBtnLoading((prev) => ({ ...prev, [subCategoryId]: false }));
      }
    },
    [authToken, baseURL, fetchData]
  );

  const columnDefs = useMemo(
    () => [
      {
        headerName: "S.No",
        valueGetter: "node.rowIndex + 1",
        cellClass: "serial-number-cell",
        width: 150,
        flex: false,
        filter: false,
        sortable: false,
        suppressHeaderMenuButton: true,
      },
      {
        headerName: "Interest Category",
        field: "primaryCategoryName",
        flex: 3,
      },
      {
        headerName: "Category Based Interests",
        field: "sub_category_data",
        valueFormatter: (params) => {
          const subCategories = params.value.map(
            (item) => item.sub_category_name
          );
          return subCategories.join(", ");
        },
        cellRenderer: (params) => {
          return (
            <Box
              minH={"100px"}
              display={"flex"}
              flexDirection={"column"}
              mt={3}
              gap={2}
            >
              {params.value.map((item) => (
                <HStack key={item.sub_category_id}>
                  <Tag
                    color={item.status === 1 ? "green.700" : "gray.700"}
                    border={
                      item.status === 1 ? "1px solid green" : "1px solid gray"
                    }
                    bgColor={item.status === 1 ? "#f1fff6" : "#f4f9ff"}
                    cursor={
                      btnLoading[item.sub_category_id]
                        ? "not-allowed"
                        : "pointer"
                    }
                    onClick={
                      !btnLoading[item.sub_category_id]
                        ? () =>
                            handleStatusChange(
                              item.sub_category_id,
                              item.status
                            )
                        : null
                    }
                    w={"fit-content"}
                    minW={"100px"}
                  >
                    {btnLoading[item.sub_category_id] ? (
                      <Spinner
                        size="sm"
                        color={item.status === 1 ? "green.700" : "gray.700"}
                      />
                    ) : (
                      item.sub_category_name
                    )}
                    {/* Add Edit Icon */}
                  </Tag>
                  <Button
                    size="xs"
                    ml={2}
                    onClick={() =>
                      openEditModal(
                        item.sub_category_id,
                        item.sub_category_name
                      )
                    }
                    bg={"white"}
                    _hover={{ bg: "gray.100" }}
                    border={"1px solid #626C70"}
                  >
                    <FiEdit3 size={"12px"} color={"#626C70"} />
                  </Button>
                </HStack>
              ))}
            </Box>
          );
        },

        flex: 3,
      },
      {
        headerName: "Action",
        field: "action",
        filter: false,
        flex: 2,
        cellRenderer: (params) => {
          return (
            <HStack spacing={2} mt={3}>
              <Button
                borderRadius={"full"}
                size="sm"
                onClick={() => handleEdit(params.data)}
                w={"48px"}
                h={"48px"}
                bgColor={"transparent"}
                _hover={{ bgColor: "#f5f6f7" }}
                border={"1px solid #626C70"}
              >
                <FiEdit color={"#626C70"} size={"24px"} />
              </Button>
            </HStack>
          );
        },
      },
    ],
    [btnLoading, handleStatusChange, openEditModal, handleEdit]
  );

  return (
    <>
      <Head>
        <title>Interests Masters</title>
      </Head>
      <main className={styles.main}>
        {loading ? (
          <Box w={"100%"} h={"auto"}>
            <Box mb="6">
              <Skeleton height="24px" width="180px" mb="4" />
              <Skeleton height="16px" width="250px" />
            </Box>
            <Box bgColor={"white"} p={"24px"} mb="6">
              <HStack>
                <SkeletonCircle size="10" />
                <SkeletonText noOfLines={1} width="200px" />
                <Spacer />
                <Skeleton height="40px" width="150px" />
              </HStack>
            </Box>
            <Skeleton height="40px" mb="4" />
            <Skeleton height="40px" mb="4" />
            <Skeleton height="40px" mb="4" />
            <Skeleton height="40px" />
          </Box>
        ) : (
          <>
            <Box>
              <Text fontWeight={600}>Interests Category</Text>
              <Text>
                View/manage interest categories and configure preferences.
              </Text>
            </Box>
            <Box w={"100%"} h={"auto"} className="gridContainer">
              <HStack bgColor={"white"} p={"24px"}>
                <HStack gap={"12px"} alignItems={"center"}>
                  <RxDashboard color={"#888888"} size={24} />
                  <Heading
                    fontSize={"20px"}
                    fontWeight={600}
                    className="gridContainer"
                  >
                    Interests Category
                  </Heading>
                </HStack>
                <Spacer />
                <Button
                  bgGradient={"linear(to-r, #0099FF, #54AB6A)"}
                  _hover={{ bgGradient: "linear(to-r, #0099FF, #54AB6A)" }}
                  onClick={handleAdd}
                  color={"white"}
                  gap={"8px"}
                >
                  <BsFillPlusCircleFill size={22} />
                  Add New
                </Button>
              </HStack>
              <AgGridReact
                className="ag-theme-alpine"
                rowData={rowData}
                columnDefs={columnDefs}
                pagination={true}
                paginationPageSize={5}
                paginationPageSizeSelector={[5, 10, 15]}
                enableCellTextSelection={true}
                defaultColDef={{
                  filter: true,
                  floatingFilter: true,
                  sortable: true,
                  resizable: true,
                  filterParams: {
                    debounceMs: 0,
                    buttons: ["reset"],
                  },
                }}
                domLayout="autoHeight"
                getRowHeight={(params) => {
                  // console.log({ params });

                  if (params?.data.sub_category_data.length > 1) {
                    return params.data.sub_category_data.length * 45;
                  } else {
                    return 80;
                  }
                }}
                // change the row hover color
                getRowClass={() => styles.rowHover}
              />
            </Box>
          </>
        )}

        {/* Modal for Adding/Editing Interests */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay zIndex={1000} />
          <ModalContent maxWidth={"512px"}>
            <ModalHeader borderBottom={"1px solid #E5E7EB"} p={"20px 34px"}>
              {isEditing ? "Edit Interest" : "Add New Interest"} something
            </ModalHeader>
            <ModalCloseButton
              borderRadius={"full"}
              bgColor={"#F5F6F7"}
              _hover={{ bgColor: "#E5E7EB" }}
              w={"40px"}
              h={"40px"}
              m={"8px 24px 0 0"}
            />
            <ModalBody p={"20px 34px 100px"} bgColor={"#f5f6f7"}>
              <VStack spacing={6}>
                <FormControl>
                  <FormLabel>Interest Category</FormLabel>
                  {isEditing ? (
                    <Input
                      placeholder="Interest Category"
                      value={formData.primary_category}
                      // onChange={(e) =>
                      //   setFormData({
                      //     ...formData,
                      //     primary_category: e.target.value,
                      //   })
                      // }
                      readOnly
                    />
                  ) : (
                    <Select
                      value={formData.primary_category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          primary_category_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Interest Category</option>
                      {primary_categorys.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.primary_category}
                        </option>
                      ))}
                    </Select>
                  )}
                </FormControl>
                <FormControl>
                  <FormLabel>Category Based Interests</FormLabel>
                  <HStack>
                    <Input
                      placeholder="Add a Category Based Interest"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                    />
                    <Button
                      onClick={handleAddInterest}
                      colorScheme="blue"
                      ml={2}
                    >
                      Add
                    </Button>
                  </HStack>
                  <VStack mt={4} spacing={0} alignItems={"flex-start"}>
                    <FormLabel>Associated interests</FormLabel>
                    <Box display="flex" flexWrap="wrap">
                      {initialSubCategories.map((subCategory) => (
                        <Tag
                          key={subCategory.sub_category_id}
                          size="md"
                          borderRadius="4px"
                          variant="outline"
                          colorScheme="blue"
                          m={1}
                          p={2}
                          bgColor={"#EDF2FE"}
                        >
                          <TagLabel>{subCategory.sub_category_name}</TagLabel>
                        </Tag>
                      ))}
                      {formData.sub_category_data.map(
                        (interest, index) => (
                          console.log({ interest }),
                          (
                            <Tag
                              key={index}
                              size="md"
                              borderRadius="4px"
                              variant="outline"
                              colorScheme="blue"
                              m={1}
                              p={2}
                              bgColor={"#EDF2FE"}
                            >
                              <TagLabel>{interest}</TagLabel>
                              <TagCloseButton
                                onClick={() => handleRemoveInterest(interest)}
                              />
                            </Tag>
                          )
                        )
                      )}
                    </Box>
                  </VStack>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                bgGradient={"linear(to-r, #0099FF, #54AB6A)"}
                _hover={{
                  bgGradient: "linear(to-r, #0099FF, #54AB6A)",
                  boxShadow: "lg",
                }}
                color="white"
                ml={3}
                onClick={handleSubmit}
              >
                {isEditing ? "Update" : "Create"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        {/* Modal for Editing Subcategory */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Subcategory</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input
                value={currentSubCategory.subCategoryName}
                onChange={(e) =>
                  setCurrentSubCategory({
                    ...currentSubCategory,
                    subCategoryName: e.target.value,
                  })
                }
              />
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={handleUpdateSubCategory}
              >
                Save
              </Button>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </main>
    </>
  );
}
