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
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => router.back()}
          className="rounded-full border border-border bg-card text-text-primary hover:bg-muted shadow-sm h-12 w-12"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter text-text-primary">
            {title}
          </h1>
          <p className="text-base text-text-secondary mt-1">
            {subtitle}
          </p>
        </div>
      </div>
      <Button
        onClick={onExport}
        className="group bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 shadow-lg transition-all hover:shadow-xl active:scale-95 flex items-center gap-2 h-12 font-medium"
      >
        <Download className="h-4 w-4 transition-transform group-hover:scale-110" />
        Export Report
      </Button>
    </div>
  );
}
