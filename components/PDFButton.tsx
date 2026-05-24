"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import { GeneratedPaper } from "@/types";
import { PaperDocument } from "./PaperPDF";

export default function PDFButton({ paper }: { paper: GeneratedPaper }) {
  return (
    <PDFDownloadLink
      document={<PaperDocument paper={paper} />}
      fileName={`${paper.metadata.subject}-${paper.metadata.topic}.pdf`}
      className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
    >
      {({ loading: pdfLoading }) =>
        pdfLoading ? (
          <><Loader2 size={16} className="animate-spin" /> Preparing...</>
        ) : (
          <><Download size={16} /> Download PDF</>
        )
      }
    </PDFDownloadLink>
  );
}
