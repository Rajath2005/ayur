import { Download, Trash2, FileText, Printer, Bookmark, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConversationToolbarProps {
    onExport: () => void;
    onClear: () => void;
    onSummarize?: () => void;
    onPrint: () => void;
    onBookmark?: () => void;
    disabled?: boolean;
}

export function ConversationToolbar({
    onExport,
    onClear,
    onSummarize,
    onPrint,
    onBookmark,
    disabled = false,
}: ConversationToolbarProps) {
    return (
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-3xl mx-auto px-4 py-2">
                <div className="flex items-center gap-2">
                    {/* Desktop: Show all buttons */}
                    <div className="hidden md:flex items-center gap-2">
                        <TooltipProvider delayDuration={300}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onExport}
                                        disabled={disabled}
                                        className="h-8 gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        <span className="text-xs">Export</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Export conversation as text file</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onClear}
                                        disabled={disabled}
                                        className="h-8 gap-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="text-xs">Clear</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Clear all messages</TooltipContent>
                            </Tooltip>

                            {onSummarize && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={onSummarize}
                                            disabled={disabled}
                                            className="h-8 gap-2"
                                        >
                                            <FileText className="h-4 w-4" />
                                            <span className="text-xs">Summarize</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>AI-powered summary</TooltipContent>
                                </Tooltip>
                            )}

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onPrint}
                                        disabled={disabled}
                                        className="h-8 gap-2"
                                    >
                                        <Printer className="h-4 w-4" />
                                        <span className="text-xs">Print</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Print conversation</TooltipContent>
                            </Tooltip>

                            {onBookmark && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={onBookmark}
                                            disabled={disabled}
                                            className="h-8 gap-2"
                                        >
                                            <Bookmark className="h-4 w-4" />
                                            <span className="text-xs">Bookmark</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Bookmark this conversation</TooltipContent>
                                </Tooltip>
                            )}
                        </TooltipProvider>
                    </div>

                    {/* Mobile: Show dropdown menu */}
                    <div className="md:hidden">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" disabled={disabled} className="h-8 gap-2">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="text-xs">More</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem onClick={onExport}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onClear}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Clear
                                </DropdownMenuItem>
                                {onSummarize && (
                                    <DropdownMenuItem onClick={onSummarize}>
                                        <FileText className="h-4 w-4 mr-2" />
                                        Summarize
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={onPrint}>
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print
                                </DropdownMenuItem>
                                {onBookmark && (
                                    <DropdownMenuItem onClick={onBookmark}>
                                        <Bookmark className="h-4 w-4 mr-2" />
                                        Bookmark
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    );
}
