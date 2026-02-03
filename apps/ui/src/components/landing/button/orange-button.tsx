// White variant button
export const whiteButtonStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "8px",
  boxShadow:
    "0.444584px 0.444584px 0.628737px -0.75px rgba(0, 0, 0, 0.26), 1.21072px 1.21072px 1.71222px -1.5px rgba(0, 0, 0, 0.247), 2.6583px 2.6583px 3.75941px -2.25px rgba(0, 0, 0, 0.23), 5.90083px 5.90083px 8.34503px -3px rgba(0, 0, 0, 0.192), 14px 14px 21.2132px -3.75px rgba(0, 0, 0, 0.2), -0.5px -0.5px 0px rgba(0, 0, 0, 0.686), inset 1px 1px 1px rgba(255, 255, 255, 0.7), inset -1px -1px 1px rgba(0, 0, 0, 0.23)",
  color: "#222222",
  border: "2px solid #fff",
};

export const WhiteButton: React.FC<OrangeButtonProps> = ({
  children,
  style,
  className = "flex justify-center items-center cursor-pointer",
  ...props
}) => {
  return (
    <button
      className={className}
      style={{ ...whiteButtonStyle, ...style }}
      {...props}
    >
      {children}
    </button>
  );
};
import React from "react";

type OrangeButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

const orangeButtonStyle: React.CSSProperties = {
  background: "#FF4A00",
  boxShadow:
    "0.444584px 0.444584px 0.628737px -1px rgba(0, 0, 0, 0.26), 1.21072px 1.21072px 1.71222px -1.5px rgba(0, 0, 0, 0.247), 2.6583px 2.6583px 3.75941px -2.25px rgba(0, 0, 0, 0.23), 5.90083px 5.90083px 8.34503px -3px rgba(0, 0, 0, 0.192), 10px 10px 21.2132px -3.75px rgba(0, 0, 0, 0.23), -0.5px -0.5px 0px rgba(149, 43, 0, 0.53), inset 1px 1px 1px rgba(255, 255, 255, 0.83), inset -1px -1px 1px rgba(0, 0, 0, 0.23)",
  borderRadius: "8px",
};

const OrangeButton: React.FC<OrangeButtonProps> = ({
  children,
  style,
  className = "px-4 py-1.5 flex justify-center items-center cursor-pointer",
  ...props
}) => {
  return (
    <button
      className={className}
      style={{ ...orangeButtonStyle, ...style }}
      {...props}
    >
      {children}
    </button>
  );
};

// Black variant button
export const blackButtonStyle: React.CSSProperties = {
  background: "#222222",
  borderRadius: "8px",
  boxShadow:
    "0.444584px 0.444584px 0.628737px -0.75px rgba(0, 0, 0, 0.26), 1.21072px 1.21072px 1.71222px -1.5px rgba(0, 0, 0, 0.247), 2.6583px 2.6583px 3.75941px -2.25px rgba(0, 0, 0, 0.23), 5.90083px 5.90083px 8.34503px -3px rgba(0, 0, 0, 0.192), 14px 14px 21.2132px -3.75px rgba(0, 0, 0, 0.2), -0.5px -0.5px 0px rgba(0, 0, 0, 0.686), inset 1px 1px 1px rgba(255, 255, 255, 0.7), inset -1px -1px 1px rgba(0, 0, 0, 0.23)",
};

export const BlackButton: React.FC<OrangeButtonProps> = ({
  children,
  style,
  className = "flex justify-center items-center cursor-pointer",
  ...props
}) => {
  return (
    <button
      className={className}
      style={{ ...blackButtonStyle, ...style }}
      {...props}
    >
      {children}
    </button>
  );
};

export default OrangeButton;
