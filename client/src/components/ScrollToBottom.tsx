import { useState, useEffect } from "react";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScrollToBottomProps {
    scrollRef: React.RefObject<HTMLDivElement>;
    threshold?: number;
}

export function ScrollToBottom({ scrollRef, threshold = 200 }: ScrollToBottomProps) {
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const scrollElement = scrollRef.current;
        if (!scrollElement) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = scrollElement;
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
            setShowButton(distanceFromBottom > threshold);
        };

        scrollElement.addEventListener('scroll', handleScroll);
        return () => scrollElement.removeEventListener('scroll', handleScroll);
    }, [scrollRef, threshold]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    if (!showButton) return null;

    return (
        <div className="fixed bottom-24 right-8 z-50 animate-fade-in">
            <Button
                onClick={scrollToBottom}
                size="icon"
                className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
                aria-label="Scroll to bottom"
            >
                <ArrowDown className="h-5 w-5" />
            </Button>
        </div>
    );
}
