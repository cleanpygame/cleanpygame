import React, {useContext} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {GameStateContext} from '../reducers';

/**
 * ConfirmationPage component
 * Shown after successfully joining a group
 */
export function GroupJoinFinalPage(): React.ReactElement {
    // We don't need the code parameter here
    useParams<{ code: string }>();
    const context = useContext(GameStateContext);
    const navigate = useNavigate();

    if (!context) {
        throw new Error('ConfirmationPage must be used within a GameStateContext Provider');
    }

    const {state} = context;
    const {selectedGroup} = state;

    const handleStartPlaying = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[#2d2d2d] text-[#d4d4d4] flex items-center justify-center">
            <div className="bg-[#333333] p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-600 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <h1 className="text-2xl font-semibold mb-2">Successfully Joined Group!</h1>
                    {selectedGroup && (
                        <p className="text-lg">
                            You have joined <span className="font-medium">{selectedGroup.name}</span>
                        </p>
                    )}
                </div>

                <p className="mb-6 text-gray-400">
                    Your progress will now be visible to the group owner.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleStartPlaying}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Start Playing
                    </button>
                </div>
            </div>
        </div>
    );
}