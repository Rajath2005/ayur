import type { Message } from "@shared/schema";

interface ImageMessageBubbleProps {
  message: Message;
}

interface ImageAttachment {
  type: string;
  url: string;
}

export function ImageMessageBubble({ message }: ImageMessageBubbleProps) {
  const attachments = message.attachments as ImageAttachment[] | null;
  const imageAttachment = attachments?.find((att: ImageAttachment) => att.type === 'image');

  return (
    <div className="space-y-3">
      {imageAttachment && (
        <div className="relative">
          <img
            src={imageAttachment.url}
            alt="Uploaded image"
            className="rounded-2xl max-w-full h-auto aspect-video object-cover shadow-sm border"
          />
        </div>
      )}
      {message.content && (
        <div className={`rounded-2xl px-4 py-3 break-words ${
          message.role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted border"
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      )}
    </div>
  );
}
