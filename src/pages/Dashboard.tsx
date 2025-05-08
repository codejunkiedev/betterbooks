import { Button } from "@/components/ui/button";
import { Upload, Sparkles, FileText, Activity } from "lucide-react";

const mockStats = [
  {
    icon: <FileText className="h-6 w-6 text-black" />,
    label: "Documents Uploaded",
    value: 128,
  },
  {
    icon: <Sparkles className="h-6 w-6 text-black" />,
    label: "AI Suggestions",
    value: 42,
  },
  {
    icon: <Activity className="h-6 w-6 text-black" />,
    label: "Active Sessions",
    value: 5,
  },
];

const mockRecent = [
  {
    name: "Invoice_March.pdf",
    date: "2024-06-01",
    status: "Processed",
    type: "Document",
  },
  {
    name: "AI Summary for Q1",
    date: "2024-05-28",
    status: "Completed",
    type: "AI Suggestion",
  },
  {
    name: "Report_April.pdf",
    date: "2024-05-20",
    status: "Processed",
    type: "Document",
  },
];

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      {/* Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-black">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="flex items-center gap-2">
            <a href="/upload">
              <Upload className="h-4 w-4" /> Upload Document
            </a>
          </Button>
          <Button asChild variant="outline" className="flex items-center gap-2">
            <a href="/ai-suggestion">
              <Sparkles className="h-4 w-4" /> AI Suggestion
            </a>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {mockStats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-center rounded-full bg-gray-100 h-12 w-12">
              {stat.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{stat.value}</div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
        <div className="p-4 pb-2 text-lg font-semibold text-black">Recent Activity</div>
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="py-2 px-4 font-medium">Name</th>
              <th className="py-2 px-4 font-medium">Type</th>
              <th className="py-2 px-4 font-medium">Date</th>
              <th className="py-2 px-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockRecent.map((item, idx) => (
              <tr key={idx} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                <td className="py-2 px-4 text-black">{item.name}</td>
                <td className="py-2 px-4 text-gray-700">{item.type}</td>
                <td className="py-2 px-4 text-gray-700">{item.date}</td>
                <td className="py-2 px-4">
                  <span className="inline-block rounded px-2 py-1 text-xs font-medium bg-gray-100 text-black">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 