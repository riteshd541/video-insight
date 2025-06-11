import { useEffect } from "react";

import VideoForm from "../components/VideoForm";
import Header from "../components/Header/Header";

export default function DashboardPage() {
  useEffect(() => {
    if (!localStorage.getItem("token") || !localStorage.getItem("user"))
      window.location.href = "/";
  }, []);

  return (
    <div>
      <Header />
      <VideoForm />
    </div>
  );
}
