import React, {useEffect, useRef, useState} from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import PropTypes from 'prop-types';
import './CodeView.css'; // Ensure CSS defines .code-line, .line-number, and .code-content

/**
 * CodeView component
 * Props:
 *  - code: string // code lines
 *  - regions: TextRegion[]
 *  - animate: boolean // whether to animate the code
 *  - contentId: number // animation is triggered only when contentId changes
 *  - onEvent: (eventId: string, line: number, col: number, token: string) => void // called when a region token is clicked
 *  - onMisclick: (line: number, col: number, token: string) => void // called when clicking non-region tokens
 */
export function CodeView({ code, regions, animate, contentId, onEvent, onMisclick }) {
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


    const handleClick = (lineIndex, colIndex, eventId, token) => {
        const key = `${lineIndex} ${colIndex}`;
        setFlashingKey(key);
        setTimeout(() => {
                setFlashingKey(null);
                if (eventId)
                    onEvent(eventId, lineIndex, colIndex, token.content);
                else
                    onMisclick(lineIndex, colIndex, token.content);
            }, 100);
    };


    function renderToken(lineIndex, colIndex, token, getTokenProps) {
        const {key, children: _, ...tokenProps} =
            getTokenProps({token, key: `${lineIndex} ${colIndex}`});
        const region = regions.find(r => r.contains(lineIndex, colIndex, token.content.length));
        let flashingClass = '';
        if (flashingKey === key) {
            flashingClass = region ? 'flash-ok' : 'flash-error';
        }


        return (
            <span
                key={ key }
                {...tokenProps}
                className={`${tokenProps.className} ${flashingClass}`}
                onClick={() => handleClick(lineIndex, colIndex, region?.eventId, token)} >
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
    regions: PropTypes.arrayOf(
        PropTypes.shape({
            startLine: PropTypes.number.isRequired,
            startCol: PropTypes.number.isRequired,
            endLine: PropTypes.number.isRequired,
            endCol: PropTypes.number.isRequired,
            eventId: PropTypes.string.isRequired,
        })
    ).isRequired,
    onEvent: PropTypes.func.isRequired,
    onMisclick: PropTypes.func.isRequired,
};

CodeView.defaultProps = {};
