import { SandboxTesting } from "@/features/user";

type SandboxTestingPageProps = {
    isSandbox?: boolean;
};

export default function SandboxTestingPage({ isSandbox = true }: SandboxTestingPageProps) {
    return <SandboxTesting isSandbox={isSandbox} />;
}
