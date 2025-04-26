import React, {useEffect, useState} from 'react';
import {Highlight, themes, Token} from 'prism-react-renderer';
import './CodeView.css'; // Ensure CSS defines .code-line, .line-number, and .code-content

interface CodeViewProps {
    code: string;
    animate?: boolean;
    contentId?: string;
    onClick: (lineIndex: number, colIndex: number, token: string) => void;
}

/**
 * CodeView component
 * Renders code with syntax highlighting and animation
 */
export function CodeView({
                             code,
                             animate = false,
                             onClick
                         }: CodeViewProps): React.ReactElement {
    const [cursor, setCursor] = useState<number>(0);
    const [flashingKey, setFlashingKey] = useState<string | null>(null);

    useEffect(() => {
        if (!animate) {
            return;
        }

        if (animate) {
            setCursor(0);
            console.log("Starting animation for code:", code);
            const intervalRef = window.setInterval(() => {
                setCursor(c => {
                    if (c + 2 >= code.length) {
                        if (intervalRef !== null) {
                            clearInterval(intervalRef);
                        }
                        return Infinity;
                    }
                    return c + 2;
                });
            }, 5); // Slightly slower animation for better performance

            return () => {
                if (intervalRef !== null) {
                    clearInterval(intervalRef);
                }
            };
        }
    }, []);

    const visibleCode = animate ? code.substring(0, Math.min(code.length, cursor)) : code;

    const handleClick = (lineIndex: number, colIndex: number, token: Token): void => {
        const key = `${lineIndex} ${colIndex}`;
        setFlashingKey(key);
        setTimeout(() => {
            setFlashingKey(null);
            onClick(lineIndex, colIndex, token.content);
        }, 50);
    };

    function renderToken(
        lineIndex: number,
        colIndex: number,
        token: Token,
        getTokenProps: (options: { token: Token; key: string }) => any
    ): React.ReactNode {
        const {key, children: _, ...tokenProps} =
            getTokenProps({token, key: `${lineIndex} ${colIndex}`});

        let flashingClass = '';
        if (flashingKey === key) {
            flashingClass = 'flash-ok';
        }

        return (
            <span
                key={key}
                {...tokenProps}
                className={`${tokenProps.className} ${flashingClass}`}
                onClick={() => handleClick(lineIndex, colIndex, token)}>
        {token.content}
      </span>
        );
    }

    function renderLine(
        lineIndex: number,
        lineTokens: Token[],
        getLineProps: (options: { line: Token[]; key: number | string }) => any,
        getTokenProps: (options: { token: Token; key: string }) => any
    ): React.ReactNode {
        const {key: _, ...lineProps} = getLineProps({line: lineTokens, key: lineIndex});
        const cols: number[] = [];
        let colIndex = 0;

        for (let token of lineTokens) {
            cols.push(colIndex);
            colIndex += token.content.length;
        }

        return (
            <div
                key={lineIndex}
                {...lineProps}
                data-line-index={lineIndex}
                className="code-line">
                <span className="line-number">{lineIndex + 1}</span>
                <span className="code-content">
          {lineTokens.map((token, tokenIndex) =>
              renderToken(lineIndex, cols[tokenIndex], token, getTokenProps)
          )}
        </span>
            </div>
        );
    }

    return (
        <Highlight code={visibleCode} theme={themes.vsDark} language="python">
            {({className, style, tokens, getLineProps, getTokenProps}) => (
                <pre className={className} style={style}>
          {tokens.map((lineTokens, lineIndex) =>
              renderLine(
                  lineIndex,
                  lineTokens.filter(t => t.content.length > 0),
                  getLineProps,
                  getTokenProps
              )
          )}
        </pre>
            )}
        </Highlight>
    );
}