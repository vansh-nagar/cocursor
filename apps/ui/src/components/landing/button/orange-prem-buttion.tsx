import React from "react";

export type OrangePremButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
  };

const orangePremButtonStyle: React.CSSProperties = {
  background: "url(.png), linear-gradient(180deg, var(--primary) 0%, oklch(0.4 0 0) 100%)",
  backgroundBlendMode: "plus-lighter, normal",
  boxShadow:
    "0px 42px 107px rgba(0, 0, 0, 0.2), 0px 24.7206px 32.2574px rgba(0, 0, 0, 0.1), 0px 10.2677px 13.3981px rgba(0, 0, 0, 0.15), inset 0px 1px 4px 2px rgba(255, 255, 255, 0.1)",
  color: "var(--primary-foreground)",
};

const OrangePremButton: React.FC<OrangePremButtonProps> = ({
  children,
  style,
  className = "cursor-pointer",
  ...props
}) => {
  return (
    <button
      className={className}
      style={{ ...orangePremButtonStyle, ...style }}
      {...props}
    >
      {children}
    </button>
  );
};

export default OrangePremButton;
