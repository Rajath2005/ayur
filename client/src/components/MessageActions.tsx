import { Copy, RotateCcw, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface MessageActionsProps {
    role: "user" | "assistant";
    content: string;
    onCopy: () => void;
    onRegenerate?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function MessageActions({
    role,
    content,
    onCopy,
    onRegenerate,
    onEdit,
    onDelete,
}: MessageActionsProps) {
    return (
        <div className="flex gap-1 bg-background/95 backdrop-blur-sm border rounded-lg shadow-md p-1 transition-opacity duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100 relative mt-2 md:absolute md:-bottom-8 md:left-0 md:mt-0">
            <TooltipProvider delayDuration={300}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onCopy}
                            className="h-7 px-2 text-xs hover:bg-accent"
                        >
                            <Copy className="h-3.5 w-3.5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Copy message</p>
                    </TooltipContent>
                </Tooltip>

                {role === "user" && onRegenerate && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onRegenerate}
                                className="h-7 px-2 text-xs hover:bg-accent"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Regenerate response</p>
                        </TooltipContent>
                    </Tooltip>
                )}

                {role === "user" && onEdit && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onEdit}
                                className="h-7 px-2 text-xs hover:bg-accent"
                            >
                                <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Edit message</p>
                        </TooltipContent>
                    </Tooltip>
                )}

                {onDelete && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDelete}
                                className="h-7 px-2 text-xs hover:bg-destructive hover:text-destructive-foreground"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Delete message</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </TooltipProvider>
        </div>
    );
}
