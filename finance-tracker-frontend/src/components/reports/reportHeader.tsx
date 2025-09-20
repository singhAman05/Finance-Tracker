import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReportHeaderProps {
  title: string;
  subtitle: string;
  onExport: () => void; // Add this prop
}

export default function ReportHeader({
  title,
  subtitle,
  onExport,
}: ReportHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        </div>
      </div>
      <Button
        className="flex items-center gap-2 cursor-pointer"
        onClick={onExport}
      >
        <Download className="h-4 w-4" />
        Export Report
      </Button>
    </div>
  );
}
