import React from "react";
import { toast } from "react-hot-toast";

type Role = "user" | "assistant";

type Message = {
  id: string;
  role: Role;
  text: string;
  timestamp: string;
};

function App() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [isChatLoading, setIsChatLoading] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploadedDocumentId, setUploadedDocumentId] = React.useState<string | null>(null);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const chatEnabled = Boolean(uploadedDocumentId);

  React.useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isChatLoading]);

  const pushMessage = React.useCallback((role: Role, text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${role}`,
        role,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, []);

  const handleFileSelection = React.useCallback((file: File | null) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please select a PDF file.");
      return;
    }
    setSelectedFile(file);
  }, []);

  const handleUpload = React.useCallback(async () => {
    if (!selectedFile || isUploading) {
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    setIsUploading(true);

    try {
      const response = await fetch("http://localhost:8000/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as { detail?: string } | null;
        throw new Error(errorBody?.detail || "Failed to upload document.");
      }

      const data = (await response.json()) as { document_id: string; chunks_indexed: number };
      setUploadedDocumentId(data.document_id);
      setMessages([]);
      toast.success(`Document indexed successfully (${data.chunks_indexed} chunks).`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  }, [isUploading, selectedFile]);

  const handleResetDocument = React.useCallback(async () => {
    if (isResetting) return;
    setIsResetting(true);
    try {
      const response = await fetch("http://localhost:8000/documents/reset", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to reset document.");
      }
      setUploadedDocumentId(null);
      setSelectedFile(null);
      setMessages([]);
      toast.success("Document reset. Upload a PDF to continue.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setIsResetting(false);
    }
  }, [isResetting]);

  const handleAsk = React.useCallback(async () => {
    if (!chatEnabled) {
      toast.error("Upload and index a PDF first.");
      return;
    }

    const trimmed = input.trim();
    if (!trimmed || isChatLoading) return;

    pushMessage("user", trimmed);
    setInput("");
    setIsChatLoading(true);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as { detail?: string } | null;
        throw new Error(errorBody?.detail || "Failed to fetch answer from backend.");
      }

      const data = (await response.json()) as { answer?: string };
      pushMessage("assistant", data.answer?.trim() || "No answer returned.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong while asking.");
    } finally {
      setIsChatLoading(false);
    }
  }, [chatEnabled, input, isChatLoading, pushMessage]);

  return (
    <div className="min-h-screen bg-bg text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col p-4 md:p-6">
        <header className="mb-4 rounded-2xl border border-violet-400/25 bg-white/[0.05] p-5 shadow-[0_0_90px_rgba(139,92,246,0.18)] backdrop-blur-xl">
          <h1 className="text-center text-xl font-semibold tracking-tight md:text-3xl">AI Document Assistant</h1>
        </header>

        <section className="glass glow-panel mb-4 rounded-2xl p-4 md:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upload your PDF</h2>
            <button className="btn" type="button" onClick={handleResetDocument} disabled={!chatEnabled || isResetting}>
              {isResetting ? "Resetting..." : "Reset Document"}
            </button>
          </div>

          <div
            className="hover-glow cursor-pointer rounded-2xl border border-dashed border-white/20 bg-black/20 p-6 text-center transition"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              handleFileSelection(e.dataTransfer.files?.[0] ?? null);
            }}
          >
            <p className="text-sm text-white/80">Drag and drop a PDF here, or click to browse</p>
            <p className="mt-2 text-xs text-white/50">Only PDF files are accepted</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => handleFileSelection(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-white/70">
              {selectedFile ? `Selected: ${selectedFile.name}` : "No file selected"}
            </p>
            <button className="btn btnPrimary" type="button" onClick={handleUpload} disabled={!selectedFile || isUploading}>
              {isUploading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Uploading...
                </span>
              ) : (
                "Upload PDF"
              )}
            </button>
          </div>
        </section>

        <main className="glass glow-panel flex min-h-[60vh] flex-1 flex-col rounded-2xl p-4">
          <div ref={chatContainerRef} className="custom-scroll mb-4 flex-1 space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-3">
            {messages.length === 0 ? (
              <p className="text-sm text-white/50">
                {chatEnabled ? "Ask questions about your uploaded document." : "Upload a PDF to start chatting."}
              </p>
            ) : null}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`w-fit max-w-[90%] rounded-2xl px-4 py-3 text-sm transition-all duration-300 ${
                  message.role === "user"
                    ? "ml-auto border border-violet-300/20 bg-violet-500/25 text-violet-100"
                    : "mr-auto border border-cyan-300/20 bg-cyan-500/15 text-cyan-100"
                }`}
              >
                <p>{message.text}</p>
                <span className="mt-1 block text-[11px] text-white/50">{message.timestamp}</span>
              </div>
            ))}

            {isChatLoading ? (
              <div className="mr-auto flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                <span className="h-2 w-2 animate-ping rounded-full bg-cyan-300" />
                Thinking...
              </div>
            ) : null}
          </div>

          <div className="flex gap-2">
            <input
              className="input"
              type="text"
              placeholder="Ask your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!chatEnabled || isChatLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void handleAsk();
                }
              }}
            />
            <button className="btn btnPrimary shrink-0" type="button" onClick={handleAsk} disabled={!chatEnabled || isChatLoading || !input.trim()}>
              {isChatLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
