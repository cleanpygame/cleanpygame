import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {TopBar} from './TopBar';
import CodeMirror from '@uiw/react-codemirror';
import {python} from '@codemirror/lang-python';
import {PyLevelsGuide} from './PyLevelsGuide';

/**
 * Editor page for creating and editing custom levels
 */
export function EditorPage(): React.ReactElement {
    const navigate = useNavigate();
    const [code, setCode] = useState<string>('##file example.py\n\n"""start\nWelcome to the level editor!\n"""\n##start-reply "Let\'s create a level"\n\n# Your code here\n\n"""final\nGreat job creating your level!\n"""\n##final-reply "Finish"');
    const [filename, setFilename] = useState<string>('example.py');
    const [errors, setErrors] = useState<string[]>([]);

    const handleCancel = () => {
        navigate('/');
    };

    const handleSave = () => {
        // Save functionality will be implemented later
        console.log('Save clicked');
    };

    const handleShare = () => {
        // Share functionality will be implemented later
        console.log('Share clicked');
    };

    const handleCodeChange = (value: string) => {
        setCode(value);

        // Extract filename from code (simple implementation)
        const fileMatch = value.match(/##file\s+([^\s]+)/);
        if (fileMatch && fileMatch[1]) {
            setFilename(fileMatch[1]);
        }

        // Validation will be implemented later
        setErrors([]);
    };

    return (
        <div className="flex flex-col h-screen bg-[#2d2d2d] text-[#d4d4d4]">
            <TopBar/>
            <div className="flex flex-1 p-4 overflow-hidden">
                <div className="flex flex-col w-full">
                    {/* Top Section */}
                    <div className="flex justify-between mb-4">
                        <div className="flex items-center">
                            <h1 className="text-xl mr-4">Level Editor</h1>
                            <span className="text-gray-400">File: {filename}</span>
                        </div>
                        <div>
                            <button
                                className="px-4 py-2 mr-2 bg-[#4c8b36] hover:bg-[#5da142] rounded"
                                onClick={handleSave}
                            >
                                Save
                            </button>
                            <button
                                className="px-4 py-2 mr-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] rounded"
                                onClick={handleShare}
                            >
                                Share
                            </button>
                            <button
                                className="px-4 py-2 mr-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] rounded"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>

                    {/* Middle Section */}
                    <div className="flex flex-1 space-x-4 mb-4">
                        {/* Code Editor (Left) */}
                        <div className="flex-1 bg-[#1e1e1e] rounded overflow-hidden">
                            <CodeMirror
                                value={code}
                                height="100%"
                                extensions={[python()]}
                                onChange={handleCodeChange}
                                theme="dark"
                                className="h-full"
                            />
                        </div>

                        {/* PyLevel Format Guide (Right) */}
                        <div className="w-1/3 bg-[#1e1e1e] p-4 rounded overflow-auto">
                            <PyLevelsGuide className="text-sm"/>
                        </div>
                    </div>

                    {/* Bottom Section - Errors */}
                    <div className="bg-[#1e1e1e] p-4 rounded h-32 overflow-auto">
                        <h2 className="text-lg font-semibold mb-2">Validation</h2>
                        {errors.length > 0 ? (
                            <ul className="text-red-400">
                                {errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-green-400">No errors found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}