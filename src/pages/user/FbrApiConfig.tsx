import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/shared/services/store";
import { useToast } from "@/shared/hooks/useToast";
import { getFbrProfileByUser } from "@/shared/services/supabase/fbr";

export default function FbrApiConfig() {
	const { user } = useSelector((s: RootState) => s.user);
	const { toast } = useToast();
	const [allowed, setAllowed] = useState(false);

	const [sandboxKey, setSandboxKey] = useState("");
	const [productionKey, setProductionKey] = useState("");
	const [sandboxStatus, setSandboxStatus] = useState<"Not tested" | "Connected" | "Failed">("Not tested");
	const [productionStatus, setProductionStatus] = useState<"Not tested" | "Connected" | "Failed">("Not tested");
	const [testingSandbox, setTestingSandbox] = useState(false);
	const [testingProduction, setTestingProduction] = useState(false);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		const run = async () => {
			if (!user?.id) return;
			try {
				const { data } = await getFbrProfileByUser(user.id);
				if (!data) {
					toast({ title: "Complete FBR Profile", description: "Please complete your FBR profile first.", variant: "destructive" });
					window.location.href = "/fbr/profile";
					return;
				}
				setAllowed(true);
			} catch {
				setAllowed(true); // allow UI even if profile check fails
			}
		};
		run();
	}, [user?.id, toast]);

	async function testConnection(env: "sandbox" | "production") {
		const key = env === "sandbox" ? sandboxKey : productionKey;
		if (!key) {
			toast({ title: "API key required", description: `Please enter the ${env} API key first.`, variant: "destructive" });
			return;
		}
		try {
			if (env === "sandbox") setTestingSandbox(true); else setTestingProduction(true);
			const res = await fetch("/api/fbr/test-connection", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ apiKey: key, environment: env, userId: typeof user?.id === 'string' ? user.id : undefined }),
			});
			const data = await res.json();
			if (data?.success) {
				if (env === "sandbox") setSandboxStatus("Connected"); else setProductionStatus("Connected");
				toast({ title: "Success", description: data.message || "Connection Successful" });
			} else {
				if (env === "sandbox") setSandboxStatus("Failed"); else setProductionStatus("Failed");
				toast({ title: "Connection failed", description: data?.message || "Unable to connect", variant: "destructive" });
			}
		} catch {
			if (env === "sandbox") setSandboxStatus("Failed"); else setProductionStatus("Failed");
			toast({ title: "Connection failed", description: "Network error while testing connection", variant: "destructive" });
		} finally {
			if (env === "sandbox") setTestingSandbox(false); else setTestingProduction(false);
		}
	}

	async function saveCredentials() {
		const userId = user?.id;
		if (typeof userId !== 'string' || userId.length === 0) {
			toast({ title: "Cannot save credentials", description: "User id is not available.", variant: "destructive" });
			return;
		}
		if (!sandboxKey && !productionKey) {
			toast({ title: "Nothing to save", description: "Enter at least one API key.", variant: "destructive" });
			return;
		}
		setSaving(true);
		try {
			const res = await fetch("/api/fbr/save-credentials", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ sandboxKey: sandboxKey || undefined, productionKey: productionKey || undefined, userId }),
			});
			const data = await res.json();
			if (data?.success) {
				toast({ title: "Saved", description: "Credentials saved successfully" });
			} else {
				toast({ title: "Save failed", description: data?.message || "Unable to save credentials", variant: "destructive" });
			}
		} catch {
			toast({ title: "Save failed", description: "Network error while saving credentials", variant: "destructive" });
		} finally {
			setSaving(false);
		}
	}

	if (!allowed) return null;

	return (
		<div className="max-w-2xl p-6 space-y-6">
			<h2 className="text-2xl font-semibold">FBR API Configuration</h2>
			<div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
				To get your FBR API keys, log in to the FBR Developer Portal and register your business. Once approved, FBR will provide Sandbox and Production keys.
			</div>
			<div className="grid gap-6">
				{/* Sandbox */}
				<div className="rounded-lg border border-gray-200 p-4 space-y-3">
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-medium">Sandbox</h3>
						<span className="text-sm px-2 py-1 rounded-full border">{sandboxStatus}</span>
					</div>
					<label className="block text-sm font-medium">Sandbox API Key</label>
					<input
						type="password"
						className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						placeholder="Enter sandbox API key"
						value={sandboxKey}
						onChange={(e) => setSandboxKey(e.target.value)}
					/>
					<div className="flex justify-end">
						<button
							onClick={() => testConnection("sandbox")}
							disabled={testingSandbox}
							className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
						>
							{testingSandbox ? "Testing..." : "Test Sandbox Connection"}
						</button>
					</div>
				</div>

				{/* Production */}
				<div className="rounded-lg border border-gray-200 p-4 space-y-3">
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-medium">Production</h3>
						<span className="text-sm px-2 py-1 rounded-full border">
							{productionStatus}
						</span>
					</div>
					<label className="block text-sm font-medium">Production API Key</label>
					<input
						type="password"
						className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						placeholder="Enter production API key"
						value={productionKey}
						onChange={(e) => setProductionKey(e.target.value)}
					/>
					<div className="flex justify-end">
						<button
							onClick={() => testConnection("production")}
							disabled={testingProduction}
							className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
						>
							{testingProduction ? "Testing..." : "Test Production Connection"}
						</button>
					</div>
				</div>
			</div>

			<div className="flex justify-end">
				<button
					onClick={saveCredentials}
					disabled={saving}
					className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
				>
					{saving ? "Saving..." : "Save Credentials"}
				</button>
			</div>
		</div>
	);
} 