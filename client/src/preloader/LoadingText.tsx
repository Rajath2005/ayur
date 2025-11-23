import React, { useState, useEffect } from "react";

const LoadingText = () => {
    const [text, setText] = useState("Initializing AyuDost AI");
    const [dots, setDots] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length < 3 ? prev + "." : ""));
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="text-center">
            <h2 className="text-xl font-semibold text-primary tracking-wide">
                {text}{dots}
            </h2>
            <p className="text-sm text-muted-foreground mt-2 opacity-80">
                Preparing your wellness journey...
            </p>
        </div>
    );
};

export default LoadingText;
