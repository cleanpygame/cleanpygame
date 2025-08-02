import React, {useState} from 'react';
import {PyLevelsGuide} from './PyLevelsGuide';
import {AiCoAuthor} from './AiCoAuthor';

interface TabsContainerProps {
    className?: string;
}

/**
 * TabsContainer component
 * Renders a tabbed interface with Documentation and AI tabs
 */
export function TabsContainer({className}: TabsContainerProps = {}): React.ReactElement {
    const [activeTab, setActiveTab] = useState<'documentation' | 'ai'>('documentation');

    return (
        <div className={`tabs-container ${className}`}>
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-700 mb-4">
                <button
                    className={`px-4 py-2 mr-2 ${
                        activeTab === 'documentation'
                            ? 'bg-[#1e1e1e] text-white border-t border-l border-r border-gray-700 rounded-t'
                            : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setActiveTab('documentation')}
                >
                    Documentation
                </button>
                <button
                    className={`px-4 py-2 ${
                        activeTab === 'ai'
                            ? 'bg-[#1e1e1e] text-white border-t border-l border-r border-gray-700 rounded-t'
                            : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setActiveTab('ai')}
                >
                    AI CoAuthor
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'documentation' && (
                    <PyLevelsGuide/>
                )}

                {activeTab === 'ai' && (
                    <AiCoAuthor/>
                )}
            </div>
        </div>
    );
}