import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { ChatView } from "./components/views/ChatView";
import { ImageView } from "./components/views/ImageView";
import { VideoView } from "./components/views/VideoView";
import { AssetsView } from "./components/views/AssetsView";
import { PromptsView } from "./components/views/PromptsView";
import { Toaster } from "sonner";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" expand={false} richColors />
      <Routes>
        <Route path="/creation" element={<Layout />}>
          <Route index element={<Navigate to="/creation/chat" replace />} />
          <Route path="chat" element={<ChatView />} />
          <Route path="image" element={<ImageView />} />
          <Route path="video" element={<VideoView />} />
          <Route path="assets" element={<AssetsView />} />
          <Route path="prompts" element={<PromptsView />} />
        </Route>
        <Route path="*" element={<Navigate to="/creation/chat" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

