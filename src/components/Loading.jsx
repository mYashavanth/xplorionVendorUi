import { Box } from "@chakra-ui/react";

function Loading() {
  const data1 = [
    {
      _id: "66ddf2d8c55b06ebb53853ef",
      primary_category: "Entertainment Industry",
      status: 1,
      created_date: "2024-09-08",
    },
    {
      _id: "66deacc5505e963226e84689",
      primary_category: "Food",
      status: 1,
      created_date: "2024-09-09",
    },
    {
      _id: "66decd4e505e963226e84691",
      primary_category: "Hobbies & Interests",
      status: 1,
      created_date: "2024-09-09",
    },
    {
      _id: "66df073f505e963226e84692",
      primary_category: "Medical Tourism",
      status: 1,
      created_date: "2024-09-09",
    },
  ];
  const data = [
    {
      primary_category_id: "66ddf2d8c55b06ebb53853ef",
      sub_category_data: [
        {
          sub_category_name: "Updated Sub Category Test",
          sub_category_id: "66e1d6975adb30a369d5ff32",
          status: 1,
        },
        {
          sub_category_name: "Sub cat 2",
          sub_category_id: "66e1d6975adb30a369d5ff33",
          status: 1,
        },
        {
          sub_category_name: "Sub Cat 3",
          sub_category_id: "66e1d6975adb30a369d5ff34",
          status: 1,
        },
        {
          sub_category_name: "Sub Cat 4",
          sub_category_id: "66e1da615e5b3951358c3206",
          status: 1,
        },
      ],
    },
    { primary_category_id: "66de93bc505e963226e84686", sub_category_data: [] },
    { primary_category_id: "66dea1a9505e963226e84687", sub_category_data: [] },
    { primary_category_id: "66dea435505e963226e84688", sub_category_data: [] },
    { primary_category_id: "66deacc5505e963226e84689", sub_category_data: [] },
    { primary_category_id: "66debc3a505e963226e8468a", sub_category_data: [] },
    { primary_category_id: "66debff0505e963226e8468b", sub_category_data: [] },
    { primary_category_id: "66debff0505e963226e8468c", sub_category_data: [] },
    { primary_category_id: "66dec00d505e963226e8468d", sub_category_data: [] },
    { primary_category_id: "66dec017505e963226e8468e", sub_category_data: [] },
    { primary_category_id: "66dec018505e963226e8468f", sub_category_data: [] },
    { primary_category_id: "66dec018505e963226e84690", sub_category_data: [] },
    { primary_category_id: "66decd4e505e963226e84691", sub_category_data: [] },
    { primary_category_id: "66df073f505e963226e84692", sub_category_data: [] },
  ];
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      className="loadingSection"
    >
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop
              offset="0%"
              style={{ stopColor: "#54AB6A", stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#0099FF", stopOpacity: 1 }}
            />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#grad1)"
          strokeWidth="8"
          fill="none"
          strokeDasharray="283"
          strokeDashoffset="75"
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </Box>
  );
}

export default Loading;
