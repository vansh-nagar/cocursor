import React from "react";

export type OrangePremButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
  };

const orangePremButtonStyle: React.CSSProperties = {
  background: "url(.png), linear-gradient(180deg, #FF5700 0%, #EF5200 100%)",
  backgroundBlendMode: "plus-lighter, normal",
  boxShadow:
    "0px 42px 107px rgba(255, 88, 0, 0.34), 0px 24.7206px 32.2574px rgba(255, 88, 0, 0.1867), 0px 10.2677px 13.3981px rgba(255, 88, 0, 0.22), 0px 3.71362px 4.84582px rgba(255, 88, 0, 0.153301), inset 0px 1px 4px 2px #FFEDDB",
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
