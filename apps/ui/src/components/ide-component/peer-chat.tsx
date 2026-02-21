"use client";

import { useRef, useState, KeyboardEvent, useCallback, useEffect } from "react";
import {
  Send,
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Upload,
  Download,
  Paperclip,
  Loader2,
  Wifi,
  WifiOff,
  FileIcon,
  X,
  ChevronDown,
  History,
  FileText,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverHeader,
  PopoverTitle,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SharedFile {
  id: string;
  name: string;
  url: string;
  timestamp: number;
  type: "sent" | "received";
}

interface PeerChatProps {
  projectId?: string;
  roomConnection: any;
}

const PeerChat = ({ projectId, roomConnection }: PeerChatProps) => {
  const [chatPrompt, setChatPrompt] = useState("");
  const textareaRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [fileHistory, setFileHistory] = useState<SharedFile[]>([]);

  const {
    sendMessage,
    peerMessages,
    totalUserCount,
    peerConnected,
    isAudioEnabled,
    isVideoEnabled,
    isInCall,
    toggleAudio,
    toggleVideo,
    endCall,
    localVideoStream,
    remoteVideoStream,
    localStream,
    remoteStream,
    localStreams,
    remoteStreams,
    send,
    File: selectedFiles,
    setFile,
    Image: receivedFileUrl,
    sendingFile,
    fileNameRef,
    uploadedSize,
    totalSize,
  } = roomConnection;

  const localVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      localVideoStream.current = node;
      if (node && localStream) {
        node.srcObject = localStream;
      }
    },
    [localStream],
  );

  const remoteVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      remoteVideoStream.current = node;
      if (node && remoteStream) {
        node.srcObject = remoteStream;
      }
    },
    [remoteStream],
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [peerMessages.length]);

  const handlePromptSubmit = () => {
    if (!chatPrompt.trim()) return;
    sendMessage(chatPrompt.trim());
    setChatPrompt("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePromptSubmit();
    }
  };

  useEffect(() => {
    if (receivedFileUrl) {
      const newFile: SharedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: fileNameRef.current || "received-file",
        url: receivedFileUrl,
        timestamp: Date.now(),
        type: "received",
      };
      setFileHistory((prev) => [newFile, ...prev]);
    }
  }, [receivedFileUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(Array.from(files));
    }
  };

  const handleSendFile = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    const fileName = selectedFiles[0].name;
    const fileUrl = URL.createObjectURL(selectedFiles[0]); // Temporary URL for history representation

    await send();

    const newFile: SharedFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: fileName,
      url: fileUrl,
      timestamp: Date.now(),
      type: "sent",
    };
    setFileHistory((prev) => [newFile, ...prev]);

    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownloadFile = () => {
    if (!receivedFileUrl) return;
    const a = document.createElement("a");
    a.href = receivedFileUrl;
    a.download = fileNameRef.current || "received-file";
    a.click();
  };

  const uploadProgress =
    totalSize > 0 ? Math.min((uploadedSize / totalSize) * 100, 100) : 0;

  const hasRemoteStream =
    remoteStream && remoteStream.getTracks().length > 0;
  const hasLocalStream =
    localStream && localStream.getTracks().length > 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-1 px-3 py-1.5 border-b bg-muted/40 shrink-0">
        <div className="flex items-center gap-2">
          {peerConnected ? (
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 gap-1.5 py-0.5">
              <span className="relative flex size-1.5">
                <span className="aspect-square animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative aspect-square inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground gap-1.5 py-0.5">
              <WifiOff className="size-3" />
              Waiting for peer
            </Badge>
          )}
        </div>
        <Badge variant="secondary" className="tabular-nums py-0.5">
          {totalUserCount} {totalUserCount === 1 ? "user" : "users"}
        </Badge>
        
        <div className="ml-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7 hover:bg-muted shrink-0">
                <History className="size-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <PopoverHeader className="p-3 border-b">
                <PopoverTitle className="text-xs text-muted-foreground flex items-center gap-2">
                  <FileText className="size-3.5" />
                  Shared Media
                </PopoverTitle>
              </PopoverHeader>
              <ScrollArea className="h-[300px]">
                {fileHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center gap-2">
                    <History className="size-8 text-muted-foreground/20" />
                    <p className="text-xs text-muted-foreground/60">No files shared yet</p>
                  </div>
                ) : (
                  <div className="flex flex-col divide-y">
                    {fileHistory.map((file) => (
                      <div key={file.id} className="p-3 hover:bg-muted/50 transition-colors flex items-center gap-3 group">
                        <div className={cn(
                          "size-8 rounded flex items-center justify-center shrink-0 shadow-xs border",
                          file.type === "sent" ? "bg-[#FA6000]/5 border-[#FA6000]/10" : "bg-emerald-500/5 border-emerald-500/10"
                        )}>
                          <FileIcon className={cn("size-4", file.type === "sent" ? "text-[#FA6000]" : "text-emerald-600")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate text-foreground">{file.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
                              <Clock className="size-2.5" />
                              {new Date(file.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[10px] text-muted-foreground/30 shrink-0">•</span>
                            <span className={cn(
                              "text-[9px] font-bold uppercase tracking-tight px-1 rounded-[2px] shrink-0 border",
                              file.type === "sent" 
                                ? "bg-[#FA6000]/5 text-[#FA6000] border-[#FA6000]/10" 
                                : "bg-emerald-500/5 text-emerald-600 border-emerald-500/10"
                            )}>
                              {file.type}
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = file.url;
                            a.download = file.name;
                            a.click();
                          }}
                        >
                          <Download className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <div className="p-2 border-t bg-muted/30 text-center">
                <p className="text-[10px] text-muted-foreground">Files are only kept for this session</p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {(hasLocalStream || hasRemoteStream) && (
        <>
          <div className="shrink-0 bg-black/5 dark:bg-black/20 p-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              <div className="relative aspect-video bg-neutral-900 rounded-lg overflow-hidden">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!hasRemoteStream && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-[11px] text-white/50">Peer camera off</p>
                  </div>
                )}
                <Badge variant="secondary" className="absolute bottom-1 left-1.5 text-[10px] py-0 px-1.5 bg-black/60 text-white/80 border-0">
                  Peer
                </Badge>
              </div>

              <div className="relative aspect-video bg-neutral-800 rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/60">
                    <VideoOff className="size-5 text-white/30" />
                  </div>
                )}
                <Badge variant="secondary" className="absolute bottom-1 left-1.5 text-[10px] py-0 px-1.5 bg-black/60 text-white/80 border-0">
                  You
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 pb-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isAudioEnabled ? "default" : "outline"}
                    size="icon"
                    className={cn(
                      "size-8 rounded-full",
                      isAudioEnabled && "bg-emerald-600 hover:bg-emerald-700 text-white"
                    )}
                    onClick={toggleAudio}
                  >
                    {isAudioEnabled ? <Mic className="size-3.5" /> : <MicOff className="size-3.5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {isAudioEnabled ? "Mute" : "Unmute"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isVideoEnabled ? "default" : "outline"}
                    size="icon"
                    className={cn(
                      "size-8 rounded-full",
                      isVideoEnabled && "bg-emerald-600 hover:bg-emerald-700 text-white"
                    )}
                    onClick={toggleVideo}
                  >
                    {isVideoEnabled ? <Video className="size-3.5" /> : <VideoOff className="size-3.5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {isVideoEnabled ? "Stop Video" : "Start Video"}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <Separator />
        </>
      )}

      {(selectedFiles || receivedFileUrl || sendingFile) && (
        <div className="shrink-0 p-3 bg-muted/20 border-b space-y-2">
          {selectedFiles && selectedFiles.length > 0 && !sendingFile && (
            <div className="flex items-center gap-3 bg-background border px-3 py-2.5 rounded-md shadow-sm">
              <div className="size-9 rounded bg-[#FA6000]/10 flex items-center justify-center shrink-0 shadow-inner">
                <FileIcon className="size-5 text-[#FA6000]" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-semibold truncate text-foreground">
                    {selectedFiles[0].name}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="default"
                  className="h-8 px-3 text-xs bg-[#FA6000] hover:bg-[#E55800] text-white shadow-sm"
                  onClick={handleSendFile}
                  disabled={!peerConnected}
                >
                  <Upload className="size-3.5 mr-1.5 grayscale brightness-200" />
                  Send
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {sendingFile && (
            <div className="bg-background border rounded-md p-3 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded bg-[#FA6000]/10 flex items-center justify-center shrink-0">
                  <Loader2 className="size-3.5 animate-spin text-[#FA6000]" />
                </div>
                <span className="text-xs font-semibold text-foreground flex-1 truncate">
                  Sending file...
                </span>
                <span className="text-[10px] font-mono font-bold text-muted-foreground">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
              <Progress value={uploadProgress} className="h-1 bg-muted" />
            </div>
          )}

          {receivedFileUrl && (
            <div className="flex items-center gap-3 bg-background border px-3 py-2 rounded-md shadow-sm animate-in fade-in slide-in-from-top-1 duration-300 overflow-hidden">
              <div className="size-8 rounded bg-emerald-500/10 flex items-center justify-center shrink-0 shadow-inner">
                <Download className="size-4 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold truncate text-foreground">
                    {fileNameRef.current || "Received file"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2.5 text-[11px] border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:text-emerald-700 text-emerald-600 transition-all shadow-sm flex items-center gap-1.5"
                  onClick={handleDownloadFile}
                >
                  <Download className="size-3" />
                  Download
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7 text-muted-foreground hover:bg-muted shrink-0"
                  onClick={() => {
                    // roomConnection.clearReceivedFile() logic
                  }}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col min-h-full">
          <div className="px-3 py-3 space-y-1 flex-1">
            {peerMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[200px] text-center gap-3">
                
              </div>
            ) : (
              peerMessages.map((msg: any, i: number) => {
                const isUser = msg.role === "user";
                const showGap =
                  i === 0 || peerMessages[i - 1]?.role !== msg.role;

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      isUser ? "justify-end" : "justify-start",
                      showGap ? "mt-3" : "mt-0.5"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] min-w-0 px-4 py-2 text-[13px] leading-relaxed border shadow-sm wrap-break-word whitespace-pre-wrap rounded-sm",
                        isUser
                          ? "bg-[#FA6000] text-white border-[#E55800]"
                          : "bg-[#FA6000]/5 text-foreground border-[#FA6000]/10"
                      )}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} className="h-0" />
          </div>
        </div>
      </ScrollArea>

      <Separator />

      <div className="shrink-0 p-3 bg-background border-t">
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 border-input hover:bg-muted"
                onClick={() => fileInputRef.current?.click()}
                disabled={!peerConnected}
              >
                <Paperclip className="size-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Attach File</TooltipContent>
          </Tooltip>

          <Input
            ref={textareaRef as any}
            placeholder="Type a message..."
            value={chatPrompt}
            onChange={(e) => setChatPrompt(e.target.value)}
            onKeyDown={handleKeyDown as any}
            className="flex-1 h-10 border px-3 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-[#FA6000]/30"
          />

          <Button
            onClick={handlePromptSubmit}
            disabled={!chatPrompt.trim()}
            size="icon"
            className="h-10 w-10 shrink-0 bg-[#FA6000] hover:bg-[#E55800] text-white shadow-sm"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PeerChat;
