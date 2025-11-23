import React, { useEffect, useState } from "react";
import LoadingText from "./LoadingText";
import "./Preloader.css";
import preloaderImage from "./Preloader_image.png";

const Preloader = () => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Minimum display time of 3 seconds
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="preloaderBg" id="preloader">
            <div className="preloader-container">
                <div className="spinner-ring"></div>
                <div className="spinner-ring-2"></div>
                <div className="preloader-image-wrapper">
                    <img
                        src={preloaderImage}
                        alt="AyuDost AI"
                        className="preloader-image"
                    />
                </div>
            </div>
            <div className="text-animation">
                <LoadingText />
            </div>
        </div>
    );
};

export default Preloader;
