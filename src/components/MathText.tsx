import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathTextProps {
  text: string;
  className?: string;
  block?: boolean;
}

export function MathText({ text, className = '', block = false }: MathTextProps) {
  // Split text by LaTeX delimiters
  const parts = text.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Block math ($$...$$)
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const math = part.slice(2, -2);
          return <BlockMath key={index} math={math} />;
        }
        
        // Inline math ($...$)
        if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1);
          return <InlineMath key={index} math={math} />;
        }
        
        // Regular text
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
