import React, {useEffect, useRef, useState} from 'react';
import {Highlight, themes} from 'prism-react-renderer';
import PropTypes from 'prop-types';
import './CodeView.css'; // Ensure CSS defines .code-line, .line-number, and .code-content

/**
 * CodeView component
 * Props:
 *  - code: string // code lines
 *  - animate: boolean // whether to animate the code
 *  - contentId: number // animation is triggered only when contentId changes
 *  - onClick: (line: number, col: number, token: string) => void // called when a code is clicked
 */
export function CodeView({code, animate, contentId, onClick}) {
    const [cursor, setCursor] = useState(0);
    const [flashingKey, setFlashingKey] = useState(null);

    const ref = useRef('');

    useEffect(() => {

        // Reset cursor when animation should restart
        if (animate && ref.current !== contentId) {
            ref.current = contentId;
            setCursor(0);
        }
        if (animate) {
            const intervalRef = { id: null };
            intervalRef.id = setInterval(() => {
                setCursor(c => {
                    if (c + 2 >= code.length) {
                        clearInterval(intervalRef.id);
                        return Infinity;
                    }
                    return c + 2;
                });
            }, 5); // Slightly slower animation for better performance

            return () => clearInterval(intervalRef.id);
        }
    }, [code, contentId, animate]);



    let visibleCode = animate ? code.substring(0, Math.min(code.length, cursor)) : code;


    const handleClick = (lineIndex, colIndex, token) => {
        const key = `${lineIndex} ${colIndex}`;
        setFlashingKey(key);
        setTimeout(() => {
                setFlashingKey(null);
            onClick(lineIndex, colIndex, token.content);
        }, 50);
    };


    function renderToken(lineIndex, colIndex, token, getTokenProps) {
        const {key, children: _, ...tokenProps} =
            getTokenProps({token, key: `${lineIndex} ${colIndex}`});
        let flashingClass = '';
        if (flashingKey === key) {
            flashingClass = 'flash-ok';
        }


        return (
            <span
                key={ key }
                {...tokenProps}
                className={`${tokenProps.className} ${flashingClass}`}
                onClick={() => handleClick(lineIndex, colIndex, token)}>
                {token.content}
            </span>
        );
    }

    function renderLine(lineIndex, lineTokens, getLineProps, getTokenProps) {
        const {key: _, ...lineProps} = getLineProps({line: lineTokens, key: lineIndex});
        const cols = [];
        let colIndex = 0;
        for (let token of lineTokens) {
            cols.push(colIndex);
            colIndex+= token.content.length;
        }
        return (
            <div
                key={lineIndex}
                {...lineProps}
                data-line-index={lineIndex}
                className="code-line" >
                <span className="line-number">{lineIndex + 1}</span>
                <span className="code-content">
                  {lineTokens.map((token, tokenIndex) => renderToken(lineIndex, cols[tokenIndex], token, getTokenProps))}
                </span>
            </div>
        );
    }

    return (
        <Highlight code={visibleCode} theme={themes.vsDark} language="python">
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <pre className={className} style={style}>
                    {tokens.map((lineTokens, lineIndex) => renderLine(lineIndex, lineTokens.filter(t => t.content.length > 0), getLineProps, getTokenProps))}
                </pre>
            )}
        </Highlight>
    );
}

CodeView.propTypes = {
    code: PropTypes.string.isRequired,
    animate: PropTypes.bool,
    contentId: PropTypes.string,
    onClick: PropTypes.func.isRequired,
};

CodeView.defaultProps = {
    animate: false,
};
