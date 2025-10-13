import { SandboxTesting } from "@/features/user";
import { FbrEnvironment } from "@/shared/types/fbr";

type SandboxTestingPageProps = {
  environment?: FbrEnvironment;
};

export default function SandboxTestingPage({ environment = "sandbox" }: SandboxTestingPageProps) {
  return <SandboxTesting environment={environment} />;
}
