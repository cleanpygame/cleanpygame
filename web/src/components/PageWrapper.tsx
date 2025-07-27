import React, {ReactElement} from 'react';
import {TopBar} from './TopBar';

/**
 * Generic page wrapper component
 * This component is used to render any page component with the correct layout
 */
interface PageWrapperProps {
    Component: React.ComponentType<any>;
}

export function PageWrapper({Component}: PageWrapperProps): ReactElement {
    return (
        <div className="flex flex-col h-screen bg-[#2d2d2d] text-[#d4d4d4]">
            <TopBar/>
            <div className="flex-1 overflow-auto">
                <Component/>
            </div>
        </div>
    );
}