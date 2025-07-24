import { Download } from "lucide-react";
import { Button } from "@/shared/components/Button";

interface JournalHeaderProps {
    onExport: () => void;
}

export function JournalHeader({ onExport }: JournalHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">General Journal</h1>
                <p className="text-gray-500 mt-1">View and manage your double-entry journal entries</p>
            </div>
            <Button onClick={onExport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
            </Button>
        </div>
    );
} 