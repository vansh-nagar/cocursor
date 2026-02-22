interface BentoTextSectionProps {
  title: string;
  description: string;
  className?: string;
}

const BentoTextSection = ({
  title,
  description,
  className = "",
}: BentoTextSectionProps) => {
  return (
    <div className={` ${className} max-sm:mt-6`}>
      <div className="text-base sm:text-lg md:text-xl leading-tight sm:leading-6 sm:mt-6 font-serif font-medium ">
        {title}
      </div>
      <div className="text-xs sm:text-sm mt-2">{description}</div>
    </div>
  );
};

export default BentoTextSection;
