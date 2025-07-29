import React from 'react';
import {Highlight, themes} from 'prism-react-renderer';

interface PyLevelsGuideProps {
    className?: string;
}

/**
 * PyLevelsGuide component
 * Renders the PyLevels format guide with syntax highlighting
 */
export function PyLevelsGuide({className = ''}: PyLevelsGuideProps): React.ReactElement {
    // PyLevels format guide content in PyLevel format
    const guideContent = `##file example.py
"""start
Welcome to the level editor! This is a message from the buddy.
"""
##start-reply "Let's create a level"

# This is a sample level in PyLevels format
# Below are examples of different block types

##replace event1
def poorly_named_function():
    return "Hello World"
##with
def greet_user():
    return "Hello World"
##end

##explain "Good function names should describe what the function does"

##replace-span event2 x_coordinate user_x_position

##hint "Use descriptive variable names"

##replace-on event1
print(poorly_named_function())
##with
print(greet_user())
##end

"""final
Great job creating your level!
"""
##final-reply "Finish"`;

    return (
        <div className={`py-levels-guide ${className}`}>
            <h2 className="text-lg font-semibold mb-2">PyLevels Format Guide</h2>
            <Highlight code={guideContent} theme={themes.vsDark} language="python">
                {({className, style, tokens, getLineProps, getTokenProps}) => (
                    <pre className={className} style={style}>
                        {tokens.map((line, i) => (
                            <div key={i} {...getLineProps({line})}>
                                {line.map((token, key) => {
                                    // Extract token props but handle key separately
                                    const tokenProps = getTokenProps({token, key});
                                    // Extract key from tokenProps to avoid React warning about spreading key
                                    const {key: _, ...restTokenProps} = tokenProps;
                                    return <span key={key} {...restTokenProps} />;
                                })}
                            </div>
                        ))}
                    </pre>
                )}
            </Highlight>
        </div>
    );
}