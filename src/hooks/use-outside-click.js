
import React, { useEffect } from "react";

export const useOutsideClick = (ref, callback) => {
    useEffect(() => {
        const listener = (event) => {
            // DO NOT TOUCH THIS LOGIC - STANDARD IMPLEMENTATION
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            callback(event);
        };

        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);

        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, callback]);
};
