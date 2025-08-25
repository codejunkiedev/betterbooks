import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";

import { RootState } from "@/shared/services/store";
import { useToast } from "@/shared/hooks/useToast";
import { FBR_API_STATUS, type FbrApiStatus } from "@/shared/constants/fbr";
import { testFbrConnection, saveFbrApiCredentials } from "@/shared/services/api/fbr";
import { getFbrConfigStatus } from "@/shared/services/supabase/fbr";
import { AlertCircle, CheckCircle, Info, Loader2, ExternalLink } from "lucide-react";

export default function FbrApiConfig() {
	const { user } = useSelector((s: RootState) => s.user);
	const { toast } = useToast();


	const [sandboxKey, setSandboxKey] = useState("");
	const [productionKey, setProductionKey] = useState("");
	const [hasSandboxKey, setHasSandboxKey] = useState(false);
	const [hasProductionKey, setHasProductionKey] = useState(false);
	const [sandboxStatus, setSandboxStatus] = useState<FbrApiStatus>(FBR_API_STATUS.NOT_CONFIGURED);
	const [productionStatus, setProductionStatus] = useState<FbrApiStatus>(FBR_API_STATUS.NOT_CONFIGURED);
	const [testingSandbox, setTestingSandbox] = useState(false);
	const [testingProduction, setTestingProduction] = useState(false);
	const [saving, setSaving] = useState(false);
	const [loading, setLoading] = useState(true);
	const [lastSandboxTest, setLastSandboxTest] = useState<string | undefined>();
	const [lastProductionTest, setLastProductionTest] = useState<string | undefined>();

	const loadConfigStatus = useCallback(async () => {
		if (!user?.id) {
			setLoading(false);
			return;
		}

		try {
			const config = await getFbrConfigStatus(user.id);
			setSandboxStatus(config.sandbox_status as FbrApiStatus);
			setProductionStatus(config.production_status as FbrApiStatus);
			setLastSandboxTest(config.last_sandbox_test);
			setLastProductionTest(config.last_production_test);
			setHasSandboxKey(!!config.sandbox_api_key);
			setHasProductionKey(!!config.production_api_key);

			// Set the decrypted API keys in the input fields
			if (config.sandbox_api_key) {
				setSandboxKey(config.sandbox_api_key);
			}
			if (config.production_api_key) {
				setProductionKey(config.production_api_key);
			}
		} catch (error) {
			console.error('Failed to load FBR config status:', error);
		} finally {
			setLoading(false);
		}
	}, [user?.id]);

	// Load existing configuration on component mount
	useEffect(() => {
		loadConfigStatus();
	}, [loadConfigStatus]);

	const getStatusDisplay = (status: FbrApiStatus) => {
		switch (status) {
			case FBR_API_STATUS.CONNECTED:
				return {
					text: "Connected",
					className: "bg-green-100 text-green-800 border-green-200",
					icon: <CheckCircle className="h-4 w-4" />
				};
			case FBR_API_STATUS.FAILED:
				return {
					text: "Failed",
					className: "bg-red-100 text-red-800 border-red-200",
					icon: <AlertCircle className="h-4 w-4" />
				};
			case FBR_API_STATUS.NOT_CONFIGURED:
			default:
				return {
					text: "Not Configured",
					className: "bg-gray-100 text-gray-800 border-gray-200",
					icon: <Info className="h-4 w-4" />
				};
		}
	};

	const formatLastTest = (timestamp?: string) => {
		if (!timestamp) return null;
		try {
			return new Date(timestamp).toLocaleString();
		} catch {
			return null;
		}
	};

	async function testConnection(env: "sandbox" | "production") {
		const key = env === "sandbox" ? sandboxKey : productionKey;
		if (!key) {
			toast({
				title: "API key required",
				description: `Please enter the ${env} API key first.`,
				variant: "destructive"
			});
			return;
		}

		try {
			if (env === "sandbox") setTestingSandbox(true);
			else setTestingProduction(true);

			const response = await testFbrConnection({
				apiKey: key,
				environment: env,
				userId: typeof user?.id === 'string' ? user.id : undefined
			});

			if (response.success) {
				// Update local state with the saved status from database
				const responseData = response.data as { status: string; configStatus?: { sandbox_status: FbrApiStatus; production_status: FbrApiStatus; last_sandbox_test?: string; last_production_test?: string } };
				if (responseData?.configStatus) {
					const configStatus = responseData.configStatus;
					setSandboxStatus(configStatus.sandbox_status);
					setProductionStatus(configStatus.production_status);
					setLastSandboxTest(configStatus.last_sandbox_test);
					setLastProductionTest(configStatus.last_production_test);
				} else {
					// Fallback to local state update if no config status returned
					if (env === "sandbox") {
						setSandboxStatus(FBR_API_STATUS.CONNECTED);
						setLastSandboxTest(new Date().toISOString());
					} else {
						setProductionStatus(FBR_API_STATUS.CONNECTED);
						setLastProductionTest(new Date().toISOString());
					}
				}
				toast({
					title: "Connection Successful",
					description: response.message || "FBR API is accessible"
				});
			} else {
				// Update local state with the saved status from database
				const responseData = response.data as { status: string; configStatus?: { sandbox_status: FbrApiStatus; production_status: FbrApiStatus; last_sandbox_test?: string; last_production_test?: string } };
				if (responseData?.configStatus) {
					const configStatus = responseData.configStatus;
					setSandboxStatus(configStatus.sandbox_status);
					setProductionStatus(configStatus.production_status);
					setLastSandboxTest(configStatus.last_sandbox_test);
					setLastProductionTest(configStatus.last_production_test);
				} else {
					// Fallback to local state update if no config status returned
					if (env === "sandbox") setSandboxStatus(FBR_API_STATUS.FAILED);
					else setProductionStatus(FBR_API_STATUS.FAILED);
				}
				toast({
					title: "Connection Failed",
					description: response.message || "Unable to connect",
					variant: "destructive"
				});
			}
		} catch {
			if (env === "sandbox") setSandboxStatus(FBR_API_STATUS.FAILED);
			else setProductionStatus(FBR_API_STATUS.FAILED);
			toast({
				title: "Connection Failed",
				description: "Network error while testing connection",
				variant: "destructive"
			});
		} finally {
			if (env === "sandbox") setTestingSandbox(false);
			else setTestingProduction(false);
		}
	}

	async function saveCredentials() {
		const userId = user?.id;
		if (typeof userId !== 'string' || userId.length === 0) {
			toast({
				title: "Cannot save credentials",
				description: "User id is not available.",
				variant: "destructive"
			});
			return;
		}
		if (!sandboxKey && !productionKey) {
			toast({
				title: "Nothing to save",
				description: "Enter at least one API key.",
				variant: "destructive"
			});
			return;
		}
		setSaving(true);
		try {
			const response = await saveFbrApiCredentials({
				sandboxKey: sandboxKey || undefined,
				productionKey: productionKey || undefined,
				userId
			});

			if (response.success) {
				toast({
					title: "Credentials Saved",
					description: "credentials have been saved successfully"
				});
				// Reload configuration to update the UI
				await loadConfigStatus();
			} else {
				toast({
					title: "Save Failed",
					description: response.message || "Unable to save credentials",
					variant: "destructive"
				});
			}
		} catch {
			toast({
				title: "Save Failed",
				description: "Network error while saving credentials",
				variant: "destructive"
			});
		} finally {
			setSaving(false);
		}
	}

	if (loading) {
		return (
			<div className="max-w-4xl p-6 space-y-6">
				{/* Header Skeleton */}
				<div className="space-y-2">
					<div className="h-8 bg-gray-200 rounded-md w-64 animate-pulse"></div>
					<div className="h-4 bg-gray-200 rounded-md w-96 animate-pulse"></div>
				</div>

				{/* Instructions Card Skeleton */}
				<div className="rounded-lg border border-gray-200 p-4">
					<div className="flex items-start space-x-3">
						<div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
						<div className="space-y-2 flex-1">
							<div className="h-5 bg-gray-200 rounded-md w-48 animate-pulse"></div>
							<div className="space-y-2">
								<div className="h-4 bg-gray-200 rounded-md w-full animate-pulse"></div>
								<div className="h-4 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>
								<div className="h-4 bg-gray-200 rounded-md w-5/6 animate-pulse"></div>
								<div className="h-4 bg-gray-200 rounded-md w-2/3 animate-pulse"></div>
								<div className="h-4 bg-gray-200 rounded-md w-4/5 animate-pulse"></div>
							</div>
						</div>
					</div>
				</div>

				<div className="grid gap-6">
					{/* Sandbox Configuration Skeleton */}
					<div className="rounded-lg border border-gray-200 p-6 space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-2">
								<div className="h-6 bg-gray-200 rounded-md w-40 animate-pulse"></div>
								<div className="h-4 bg-gray-200 rounded-md w-48 animate-pulse"></div>
							</div>
							<div className="h-8 bg-gray-200 rounded-full w-24 animate-pulse"></div>
						</div>

						<div className="space-y-2">
							<div className="h-4 bg-gray-200 rounded-md w-32 animate-pulse"></div>
							<div className="h-10 bg-gray-200 rounded-md w-full animate-pulse"></div>
							<div className="h-3 bg-gray-200 rounded-md w-64 animate-pulse"></div>
						</div>

						<div className="flex justify-end">
							<div className="h-10 bg-gray-200 rounded-md w-40 animate-pulse"></div>
						</div>
					</div>

					{/* Production Configuration Skeleton */}
					<div className="rounded-lg border border-gray-200 p-6 space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-2">
								<div className="h-6 bg-gray-200 rounded-md w-44 animate-pulse"></div>
								<div className="h-4 bg-gray-200 rounded-md w-56 animate-pulse"></div>
							</div>
							<div className="h-8 bg-gray-200 rounded-full w-24 animate-pulse"></div>
						</div>

						<div className="space-y-2">
							<div className="h-4 bg-gray-200 rounded-md w-36 animate-pulse"></div>
							<div className="h-10 bg-gray-200 rounded-md w-full animate-pulse"></div>
							<div className="h-3 bg-gray-200 rounded-md w-64 animate-pulse"></div>
						</div>

						<div className="flex justify-end">
							<div className="h-10 bg-gray-200 rounded-md w-44 animate-pulse"></div>
						</div>
					</div>
				</div>

				{/* Save Button Skeleton */}
				<div className="flex justify-end pt-4 border-t border-gray-200">
					<div className="h-12 bg-gray-200 rounded-md w-32 animate-pulse"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl p-6 space-y-6">
			<div className="space-y-2">
				<h2 className="text-2xl font-semibold">FBR API Configuration</h2>
				<p className="text-gray-600">Configure your FBR API credentials to enable invoice creation and tax filing.</p>
			</div>

			{/* Instructions Card */}
			<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
				<div className="flex items-start space-x-3">
					<Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
					<div className="space-y-2">
						<h3 className="font-medium text-blue-900">How to Get Your FBR API Keys</h3>
						<ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
							<li>Visit the <a href="https://fbr.gov.pk" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900 inline-flex items-center">FBR Developer Portal <ExternalLink className="h-3 w-3 ml-1" /></a></li>
							<li>Register your business and complete the verification process</li>
							<li>Submit required documentation for API access approval</li>
							<li>Once approved, FBR will provide your Sandbox and Production API keys</li>
							<li>Test your Sandbox key first before using Production</li>
						</ol>
					</div>
				</div>
			</div>



			<div className="grid gap-6">
				{/* Sandbox Configuration */}
				<div className="rounded-lg border border-gray-200 p-6 space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-medium">Sandbox Environment</h3>
							<p className="text-sm text-gray-600">Use for testing and development</p>
						</div>
						<div className="flex items-center space-x-2">
							{(() => {
								const status = getStatusDisplay(sandboxStatus);
								return (
									<span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${status.className}`}>
										{status.icon}
										<span className="ml-1">{status.text}</span>
									</span>
								);
							})()}
						</div>
					</div>

					{lastSandboxTest && (
						<p className="text-xs text-gray-500">
							Last tested: {formatLastTest(lastSandboxTest)}
						</p>
					)}

					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700">Sandbox API Key</label>
						<input
							type="password"
							className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							placeholder={hasSandboxKey ? "API key saved - enter new key to update" : "Enter your FBR Sandbox API key"}
							value={sandboxKey}
							onChange={(e) => setSandboxKey(e.target.value)}
						/>
						<p className="text-xs text-gray-500">
							{hasSandboxKey ? "API key saved ✓" : "Your API key will be encrypted and stored securely"}
						</p>
					</div>

					<div className="flex justify-end">
						<button
							onClick={() => testConnection("sandbox")}
							disabled={testingSandbox || !sandboxKey.trim()}
							className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{testingSandbox && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
							{testingSandbox ? "Testing..." : "Test Sandbox Connection"}
						</button>
					</div>
				</div>

				{/* Production Configuration */}
				<div className="rounded-lg border border-gray-200 p-6 space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-medium">Production Environment</h3>
							<p className="text-sm text-gray-600">Use for live invoice creation and tax filing</p>
						</div>
						<div className="flex items-center space-x-2">
							{(() => {
								const status = getStatusDisplay(productionStatus);
								return (
									<span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${status.className}`}>
										{status.icon}
										<span className="ml-1">{status.text}</span>
									</span>
								);
							})()}
						</div>
					</div>

					{lastProductionTest && (
						<p className="text-xs text-gray-500">
							Last tested: {formatLastTest(lastProductionTest)}
						</p>
					)}

					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700">Production API Key</label>
						<input
							type="password"
							className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							placeholder={hasProductionKey ? "API key saved - enter new key to update" : "Enter your FBR Production API key"}
							value={productionKey}
							onChange={(e) => setProductionKey(e.target.value)}
						/>
						<p className="text-xs text-gray-500">
							{hasProductionKey ? "API key saved ✓" : "Your API key will be encrypted and stored securely"}
						</p>
					</div>

					<div className="flex justify-end">
						<button
							onClick={() => testConnection("production")}
							disabled={testingProduction || !productionKey.trim()}
							className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{testingProduction && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
							{testingProduction ? "Testing..." : "Test Production Connection"}
						</button>
					</div>
				</div>
			</div>

			{/* Save Button */}
			<div className="flex justify-end pt-4 border-t border-gray-200">
				<button
					onClick={saveCredentials}
					disabled={saving || (!sandboxKey.trim() && !productionKey.trim())}
					className="inline-flex items-center rounded-md bg-gray-900 px-6 py-3 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
				>
					{saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
					{saving ? "Saving..." : "Save Credentials"}
				</button>
			</div>


		</div>
	);
} 