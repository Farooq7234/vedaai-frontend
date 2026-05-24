"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { GeneratedPaper } from "@/types";

const s = StyleSheet.create({
  page: {
    fontFamily: "Times-Roman",
    fontSize: 11,
    color: "#111",
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 50,
  },

  // Header
  schoolName: {
    fontFamily: "Times-Bold",
    fontSize: 16,
    textAlign: "center",
  },
  subjectLine: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 3,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#111",
    marginTop: 10,
    marginBottom: 8,
  },

  // Meta row
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  metaText: { fontSize: 11 },

  // Instructions
  generalInstruction: {
    fontSize: 11,
    marginBottom: 10,
  },

  // Student fields
  studentField: {
    fontSize: 11,
    marginBottom: 4,
  },

  // Section
  sectionTitle: {
    fontFamily: "Times-Bold",
    fontSize: 13,
    textAlign: "center",
    marginTop: 14,
    marginBottom: 6,
  },
  sectionTypeLabel: {
    fontFamily: "Times-Bold",
    fontSize: 11,
    marginBottom: 2,
  },
  sectionInstruction: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#444",
    marginBottom: 8,
  },

  // Questions
  questionRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  questionText: {
    fontSize: 11,
    lineHeight: 1.5,
    flex: 1,
  },

  // End line
  endText: {
    fontFamily: "Times-Bold",
    fontSize: 11,
    marginTop: 16,
    marginBottom: 16,
  },

  // Answer key
  answerKeyTitle: {
    fontFamily: "Times-Bold",
    fontSize: 13,
    marginBottom: 8,
    marginTop: 4,
  },
  answerRow: {
    fontSize: 10,
    marginBottom: 5,
    lineHeight: 1.5,
    color: "#222",
  },
});

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Easy",
  medium: "Moderate",
  hard: "Challenging",
};

export function PaperDocument({ paper }: { paper: GeneratedPaper }) {
  const { metadata, sections } = paper;

  // Flatten all questions for answer key
  const allQuestions = sections.flatMap((sec) => sec.questions);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* School + subject header */}
        <Text style={s.schoolName}>Delhi Public School, Sector-4, Bokaro</Text>
        <Text style={s.subjectLine}>Subject: {metadata.subject}</Text>
        <Text style={s.subjectLine}>Class: {metadata.gradeLevel}</Text>

        <View style={s.divider} />

        {/* Time + Marks */}
        <View style={s.metaRow}>
          <Text style={s.metaText}>Time Allowed: 45 minutes</Text>
          <Text style={s.metaText}>Maximum Marks: {metadata.totalMarks}</Text>
        </View>

        {/* General instruction */}
        <Text style={s.generalInstruction}>
          All questions are compulsory unless stated otherwise.
        </Text>

        <View style={s.divider} />

        {/* Student fields */}
        <Text style={s.studentField}>Name: ___________________________</Text>
        <Text style={s.studentField}>Roll Number: ___________________________</Text>
        <Text style={s.studentField}>Class: {metadata.gradeLevel}{"  "}Section: ___________</Text>

        {/* Sections */}
        {sections.map((section, si) => (
          <View key={section.label}>
            <Text style={s.sectionTitle}>{section.label}</Text>
            <Text style={s.sectionTypeLabel}>
              {section.questions[0]?.type || "Questions"}
            </Text>
            <Text style={s.sectionInstruction}>{section.instruction}</Text>

            {section.questions.map((q) => (
              <View key={q.number} style={s.questionRow}>
                <Text style={s.questionText}>
                  {q.number}.{"  "}[{DIFFICULTY_LABEL[q.difficulty] || q.difficulty}]{"  "}{q.text}{"  "}[{q.marks} {q.marks === 1 ? "Mark" : "Marks"}]
                  {q.options && q.options.length > 0
                    ? "\n" + q.options.map((o, i) => `   (${String.fromCharCode(97 + i)}) ${o}`).join("     ")
                    : ""}
                </Text>
              </View>
            ))}
          </View>
        ))}

        <Text style={s.endText}>End of Question Paper</Text>

        <View style={s.divider} />

        {/* Answer Key */}
        <Text style={s.answerKeyTitle}>Answer Key:</Text>
        {allQuestions.map((q) => (
          <Text key={q.number} style={s.answerRow}>
            {q.number}.{"  "}{q.text}
          </Text>
        ))}
      </Page>
    </Document>
  );
}
