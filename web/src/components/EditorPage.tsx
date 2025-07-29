import React from 'react';
import {useNavigate} from 'react-router-dom';
import {TopBar} from './TopBar';

/**
 * Editor page for creating and editing custom levels
 */
export function EditorPage(): React.ReactElement {
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate('/');
    };

    return (
        <div className="flex flex-col h-screen bg-[#2d2d2d] text-[#d4d4d4]">
            <TopBar/>
            <div className="flex flex-1 p-4 overflow-hidden">
                <div className="flex flex-col w-full">
                    <div className="flex justify-between mb-4">
                        <h1 className="text-xl">Level Editor</h1>
                        <div>
                            <button
                                className="px-4 py-2 mr-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] rounded"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#1e1e1e] p-4 rounded">
                        {/* Editor content will be added here in future implementations */}
                        <p>Editor content will be added here.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}