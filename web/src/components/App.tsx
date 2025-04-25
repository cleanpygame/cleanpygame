import React from 'react';
import {StateProvider} from './StateProvider';
import {IdeLayout} from './IdeLayout';

/**
 * Root application component
 */
export function App(): React.ReactElement {
    return (
        <StateProvider>
            <IdeLayout/>
        </StateProvider>
    );
}