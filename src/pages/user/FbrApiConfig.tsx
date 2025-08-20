import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/shared/services/store";
import { useToast } from "@/shared/hooks/useToast";
import { getFbrProfileByUser } from "@/shared/services/supabase/fbr";

export default function FbrApiConfig() {
	const { user } = useSelector((s: RootState) => s.user);
	const { toast } = useToast();
	const [allowed, setAllowed] = useState(false);

	useEffect(() => {
		const run = async () => {
			if (!user?.id) return;
			const { data } = await getFbrProfileByUser(user.id);
			if (!data) {
				toast({ title: "Complete FBR Profile", description: "Please complete your FBR profile first.", variant: "destructive" });
				window.location.href = "/fbr/profile";
				return;
			}
			setAllowed(true);
		};
		run();
	}, [user?.id, toast]);

	if (!allowed) return null;

	return (
		<div className="max-w-2xl p-6 space-y-4">
			<h2 className="text-xl font-semibold">FBR API Configuration</h2>
			<p>Configure your digital invoicing API settings here. (Coming soon)</p>
		</div>
	);
} 