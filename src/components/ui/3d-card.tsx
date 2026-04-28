"use client";

import { cn } from "@/lib/utils";
import React, {
    createContext,
    useState,
    useContext,
    useRef,
    useEffect,
} from "react";

const MouseEnterContext = createContext<
    [boolean, React.Dispatch<React.SetStateAction<boolean>>] | undefined
>(undefined);

export const CardContainer = ({
    children,
    className,
    containerClassName,
}: {
    children?: React.ReactNode;
    className?: string;
    containerClassName?: string;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMouseEntered, setIsMouseEntered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const { left, top, width, height } =
            containerRef.current.getBoundingClientRect();

        const x = (e.clientX - left - width / 2) / 25;
        const y = (e.clientY - top - height / 2) / 25;

        containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
    };

    return (
        <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
            <div
                className={cn("py-20 flex items-center justify-center", containerClassName)}
                style={{ perspective: "1000px" }}
            >
                <div
                    ref={containerRef}
                    onMouseEnter={() => setIsMouseEntered(true)}
                    onMouseLeave={() => {
                        setIsMouseEntered(false);
                        if (containerRef.current)
                            containerRef.current.style.transform = "rotateY(0deg) rotateX(0deg)";
                    }}
                    onMouseMove={handleMouseMove}
                    className={cn(
                        "flex items-center justify-center relative transition-all duration-200",
                        className
                    )}
                    style={{ transformStyle: "preserve-3d" }}
                >
                    {children}
                </div>
            </div>
        </MouseEnterContext.Provider>
    );
};

export const CardBody = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <div
        className={cn(
            "h-96 w-96 [transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d]",
            className
        )}
    >
        {children}
    </div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CardItem = ({
    as: Tag = "div",
    children,
    className,
    translateX = 0,
    translateY = 0,
    translateZ = 0,
    rotateX = 0,
    rotateY = 0,
    rotateZ = 0,
    ...rest
}: any) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isMouseEntered] = useMouseEnter();

    useEffect(() => {
        if (!ref.current) return;
        ref.current.style.transform = isMouseEntered
            ? `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px)
         rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`
            : `translateX(0) translateY(0) translateZ(0) rotateX(0) rotateY(0) rotateZ(0)`;
    }, [isMouseEntered]);

    return (
        <Tag
            ref={ref}
            className={cn("w-fit transition duration-200 ease-linear", className)}
            {...rest}
        >
            {children}
        </Tag>
    );
};

export const useMouseEnter = () => {
    const context = useContext(MouseEnterContext);
    if (!context) {
        throw new Error("useMouseEnter must be used within CardContainer");
    }
    return context;
};
