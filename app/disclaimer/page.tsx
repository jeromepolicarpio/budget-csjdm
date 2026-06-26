import { permanentRedirect } from "next/navigation";

export default function DisclaimerPage() {
  permanentRedirect("/docs#disclaimer");
}
