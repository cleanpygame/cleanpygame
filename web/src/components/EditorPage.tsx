import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {TopBar} from './TopBar';
import CodeMirror from '@uiw/react-codemirror';
import {python} from '@codemirror/lang-python';
import {PyLevelsGuide} from './PyLevelsGuide';
import {parseLevelText, ParseResult} from '../levels_compiler/parser';
import {getCurrentUser} from '../firebase/auth';
import {deleteLevelFromUserLevels, getCustomLevelById, saveCustomLevel} from '../firebase/firestore';

/**
 * Editor page for creating and editing custom levels
 */
export function EditorPage(): React.ReactElement {
    const navigate = useNavigate();
    const {levelId: levelIdParam} = useParams<{ levelId: string }>();
    const [code, setCode] = useState<string>('##file example.py\n\n"""start\nWelcome to the level editor!\n"""\n##start-reply "Let\'s create a level"\n\n# Your code here\n\n"""final\nGreat job creating your level!\n"""\n##final-reply "Finish"');
    const [filename, setFilename] = useState<string>('example.py');
    const [errors, setErrors] = useState<string[]>([]);
    const [isSaved, setIsSaved] = useState<boolean>(false);
    const [levelId, setLevelId] = useState<string | null>(levelIdParam || null);
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    const [initialCode, setInitialCode] = useState<string>(code); // Store initial code to detect changes
    const [isLoading, setIsLoading] = useState<boolean>(!!levelIdParam);

    // Load level if levelId is provided
    useEffect(() => {
        const loadLevel = async () => {
            if (levelIdParam) {
                try {
                    setIsLoading(true);
                    const level = await getCustomLevelById(levelIdParam);
                    if (level) {
                        setCode(level.content);
                        setInitialCode(level.content);
                        setFilename(level.filename);
                        setLevelId(levelIdParam);
                        setIsSaved(true);
                        setHasChanges(false);
                    } else {
                        console.error('Level not found');
                        navigate('/editor'); // Redirect to create new level if not found
                    }
                } catch (error) {
                    console.error('Error loading level:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        loadLevel();
    }, [levelIdParam, navigate]);

    // Check if code has changed from initial or last saved state
    useEffect(() => {
        if (isSaved) {
            // If saved, compare with current code
            setHasChanges(code !== initialCode);
        }
    }, [code, initialCode, isSaved]);

    const handleCancel = () => {
        if (hasChanges) {
            // Show confirmation dialog if there are unsaved changes
            const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
            if (!confirmLeave) {
                return;
            }
        }
        navigate('/');
    };

    const handleSave = async () => {
        try {
            const user = getCurrentUser();
            if (!user) {
                alert('You must be signed in to save a level');
                return;
            }

            if (errors.length > 0) {
                // Should not happen as button is disabled, but check anyway
                alert('Please fix the errors before saving');
                return;
            }

            // Save the level to Firestore
            const savedLevelId = await saveCustomLevel(user, code, filename, levelId || undefined);
            setLevelId(savedLevelId);
            setIsSaved(true);
            setHasChanges(false);
            setInitialCode(code); // Update initial code to detect future changes

            // Navigate to the level
            navigate(`/community-levels/${savedLevelId}`);
        } catch (error) {
            console.error('Error saving level:', error);
            alert('Failed to save level. Please try again.');
        }
    };

    const handleShare = () => {
        if (!levelId) {
            alert('You must save the level before sharing');
            return;
        }

        // Create the share URL
        const shareUrl = `${window.location.origin}/community-levels/${levelId}`;

        // Copy to clipboard
        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                alert('Link copied to clipboard!');
            })
            .catch((error) => {
                console.error('Error copying to clipboard:', error);
                alert(`Share this link: ${shareUrl}`);
            });
    };

    const handleDelete = async () => {
        if (!levelId) {
            return; // Should not happen as button is only visible when levelId exists
        }

        // Show confirmation dialog
        const confirmDelete = window.confirm('Are you sure you want to delete this level? This action cannot be undone.');
        if (!confirmDelete) {
            return;
        }

        try {
            const user = getCurrentUser();
            if (!user) {
                alert('You must be signed in to delete a level');
                return;
            }

            // Delete the level from userLevels
            await deleteLevelFromUserLevels(user.uid, levelId);

            // Navigate back to home page
            navigate('/');
        } catch (error) {
            console.error('Error deleting level:', error);
            alert('Failed to delete level. Please try again.');
        }
    };

    const handleCodeChange = (value: string) => {
        setCode(value);
        setHasChanges(true);

        // Parse the code using parseLevelText
        const result: ParseResult = parseLevelText(value);

        if (result.error) {
            // If there's an error, update the errors state
            setErrors([result.error]);
        } else if (result.level) {
            // If parsing succeeded, clear the errors state
            setErrors([]);

            // Extract the filename from the level
            if (result.level.filename) {
                setFilename(result.level.filename);
            }
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#2d2d2d] text-[#d4d4d4]">
            <TopBar/>
            <div className="flex flex-1 p-4 overflow-auto">
                <div className="flex flex-col w-full min-h-min">
                    {/* Top Section */}
                    <div className="flex justify-between mb-4">
                        <div className="flex items-center">
                            <h1 className="text-xl mr-4">Level Editor</h1>
                            <span className="text-gray-400">File: {filename}</span>
                        </div>
                        <div>
                            <button
                                className={`px-4 py-2 mr-2 rounded ${
                                    errors.length === 0
                                        ? "bg-[#4c8b36] hover:bg-[#5da142]"
                                        : "bg-[#4c8b36] opacity-50 cursor-not-allowed"
                                }`}
                                onClick={handleSave}
                                disabled={errors.length > 0}
                            >
                                Save
                            </button>
                            <button
                                className={`px-4 py-2 mr-2 rounded ${
                                    isSaved
                                        ? "bg-[#3c3c3c] hover:bg-[#4c4c4c]"
                                        : "bg-[#3c3c3c] opacity-50 cursor-not-allowed"
                                }`}
                                onClick={handleShare}
                                disabled={!isSaved}
                            >
                                Share
                            </button>
                            {levelId && (
                                <button
                                    className="px-4 py-2 mr-2 bg-[#8b3636] hover:bg-[#a13636] rounded"
                                    onClick={handleDelete}
                                >
                                    Delete Level
                                </button>
                            )}
                            <button
                                className="px-4 py-2 mr-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] rounded"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>

                    {/* Middle Section */}
                    <div className="flex space-x-4 mb-4" style={{minHeight: "300px", height: "calc(100vh - 250px)"}}>
                        {/* Code Editor (Left) */}
                        <div className="flex-1 bg-[#1e1e1e] rounded overflow-hidden relative">
                            {isLoading && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e] bg-opacity-70 z-10">
                                    <span className="text-white">Loading...</span>
                                </div>
                            )}
                            <CodeMirror
                                value={code}
                                height="100%"
                                extensions={[python()]}
                                onChange={handleCodeChange}
                                theme="dark"
                                className="h-full overflow-auto"
                            />
                        </div>

                        {/* PyLevel Format Guide (Right) */}
                        <div className="w-1/3 bg-[#1e1e1e] p-4 rounded overflow-auto">
                            <PyLevelsGuide className="text-sm"/>
                        </div>
                    </div>

                    {/* Bottom Section - Errors */}
                    <div className="bg-[#1e1e1e] p-4 rounded min-h-[120px] overflow-auto">
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