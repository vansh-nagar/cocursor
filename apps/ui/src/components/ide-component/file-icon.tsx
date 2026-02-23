import React from 'react';
import { 
  SiTypescript, 
  SiJavascript, 
  SiHtml5, 
  SiCss3, 
  SiJson, 
  SiMarkdown, 
  SiReact,
  SiVite,
  SiTailwindcss,
  SiPostcss
} from 'react-icons/si';
import { VscFileCode } from 'react-icons/vsc';
import { FileImage, File } from 'lucide-react';

interface FileIconProps {
  filename: string;
  className?: string;
}

export const FileIconCustom = ({ filename, className = "size-4" }: FileIconProps) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  const name = filename.toLowerCase();

  if (name === 'package.json') return <SiJson className={`${className} text-white`} />;
  if (name === 'tsconfig.json') return <SiTypescript className={`${className} text-white`} />;
  if (name === 'vite.config.ts' || name === 'vite.config.js') return <SiVite className={`${className} text-white`} />;
  if (name === 'tailwind.config.js' || name === 'tailwind.config.ts') return <SiTailwindcss className={`${className} text-white`} />;
  if (name === 'postcss.config.js') return <SiPostcss className={`${className} text-white`} />;

  switch (extension) {
    case 'ts':
      return <SiTypescript className={`${className} text-white`} />;
    case 'tsx':
      return <SiReact className={`${className} text-white`} />;
    case 'js':
      return <SiJavascript className={`${className} text-white`} />;
    case 'jsx':
      return <SiReact className={`${className} text-white`} />;
    case 'html':
      return <SiHtml5 className={`${className} text-white`} />;
    case 'css':
      return <SiCss3 className={`${className} text-white`} />;
    case 'json':
      return <SiJson className={`${className} text-white`} />;
    case 'md':
      return <SiMarkdown className={`${className} text-white`} />;
    case 'svg':
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return <FileImage className={`${className} text-white`} />;
    case 'sh':
    case 'bash':
    case 'zsh':
      return <VscFileCode className={`${className} text-white`} />;
    default:
      return <File className={`${className} text-white`} />;
  }
};
