import {
  Box,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { useState } from "react";

export default function Level2Test() {
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  const questions = [
    {
      id: "q1",
      question:
        "How often do you actively seek new experiences to understand yourself better?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      id: "q2",
      question:
        "How comfortable are you with exploring your weaknesses and areas for improvement?",
      options: [
        "Very uncomfortable",
        "Uncomfortable",
        "Neutral",
        "Comfortable",
        "Very comfortable",
      ],
    },
    {
      id: "q3",
      question:
        "How often do you experiment with new approaches to personal challenges?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    },
    {
      id: "q4",
      question:
        "How willing are you to step outside your comfort zone for personal growth?",
      options: [
        "Not willing at all",
        "Slightly willing",
        "Moderately willing",
        "Very willing",
        "Extremely willing",
      ],
    },
  ];

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("Level 2 Test Answers:", answers);
    // Handle test submission logic here
    alert("Level 2 Test submitted successfully!");
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "800px",
        mx: "auto",
        p: 4,
        backgroundColor: "#F9F8F6",
        borderRadius: "16px",
        mt: 4,
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: "#005F73",
          fontWeight: "bold",
          textAlign: "center",
          mb: 4,
        }}
      >
        Level 2: Exploration Test
      </Typography>

      <Typography
        variant="body1"
        sx={{
          fontSize: "1.1rem",
          lineHeight: 1.7,
          mb: 4,
          textAlign: "center",
          color: "#666",
        }}
      >
        This test assesses your willingness and ability to explore new
        possibilities and approaches in your life.
      </Typography>

      {questions.map((question, index) => (
        <Box key={question.id} sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: "#2B2B2B",
              fontWeight: "600",
            }}
          >
            {index + 1}. {question.question}
          </Typography>

          <RadioGroup
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          >
            {question.options.map((option, optionIndex) => (
              <FormControlLabel
                key={optionIndex}
                value={option}
                control={<Radio sx={{ color: "#E87A42" }} />}
                label={option}
                sx={{ mb: 1 }}
              />
            ))}
          </RadioGroup>
        </Box>
      ))}

      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < questions.length}
          sx={{
            background: "#E87A42",
            color: "#fff",
            borderRadius: "25px",
            padding: "12px 32px",
            fontWeight: "bold",
            fontSize: "1rem",
            "&:hover": {
              background: "#D16A35",
            },
            "&:disabled": {
              background: "#ccc",
            },
          }}
        >
          Submit Level 2 Test
        </Button>
      </Box>
    </Box>
  );
}
