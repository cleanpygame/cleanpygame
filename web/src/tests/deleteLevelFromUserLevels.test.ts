import {describe, expect, test, vi} from 'vitest';
import {deleteLevelFromUserLevels} from '../firebase/firestore';
import {doc, getDoc, updateDoc} from 'firebase/firestore';

// Mock Firebase functions
vi.mock('firebase/firestore', () => ({
    doc: vi.fn(),
    getDoc: vi.fn(),
    updateDoc: vi.fn(),
    serverTimestamp: vi.fn(() => 'mocked-timestamp')
}));

vi.mock('../firebase/index', () => ({
    db: {}
}));

describe('deleteLevelFromUserLevels Function', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('deleteLevelFromUserLevels removes level from userLevels', async () => {
        // Mock data
        const mockUserLevels = {
            exists: () => true,
            data: () => ({
                levels: [
                    {level_id: 'level1'},
                    {level_id: 'level2'},
                    {level_id: 'level3'}
                ]
            })
        };

        // Setup mocks
        (doc as any).mockReturnValue('userLevelsDocRef');
        (getDoc as any).mockResolvedValue(mockUserLevels);
        (updateDoc as any).mockResolvedValue(undefined);

        // Call the function
        await deleteLevelFromUserLevels('testUserId', 'level2');

        // Assertions
        expect(doc).toHaveBeenCalledWith(expect.anything(), 'userLevels', 'testUserId');
        expect(getDoc).toHaveBeenCalledWith('userLevelsDocRef');
        expect(updateDoc).toHaveBeenCalledWith('userLevelsDocRef', {
            levels: [
                {level_id: 'level1'},
                {level_id: 'level3'}
            ],
            updatedAt: 'mocked-timestamp'
        });
    });

    test('deleteLevelFromUserLevels handles non-existent document', async () => {
        // Mock data
        const mockUserLevels = {
            exists: () => false
        };

        // Setup mocks
        (doc as any).mockReturnValue('userLevelsDocRef');
        (getDoc as any).mockResolvedValue(mockUserLevels);

        // Call the function
        await deleteLevelFromUserLevels('testUserId', 'level2');

        // Assertions
        expect(doc).toHaveBeenCalledWith(expect.anything(), 'userLevels', 'testUserId');
        expect(getDoc).toHaveBeenCalledWith('userLevelsDocRef');
        expect(updateDoc).not.toHaveBeenCalled();
    });

    test('deleteLevelFromUserLevels handles document with no levels', async () => {
        // Mock data
        const mockUserLevels = {
            exists: () => true,
            data: () => ({
                // No levels property
            })
        };

        // Setup mocks
        (doc as any).mockReturnValue('userLevelsDocRef');
        (getDoc as any).mockResolvedValue(mockUserLevels);

        // Call the function
        await deleteLevelFromUserLevels('testUserId', 'level2');

        // Assertions
        expect(doc).toHaveBeenCalledWith(expect.anything(), 'userLevels', 'testUserId');
        expect(getDoc).toHaveBeenCalledWith('userLevelsDocRef');
        expect(updateDoc).not.toHaveBeenCalled();
    });

    test('deleteLevelFromUserLevels handles level not found in array', async () => {
        // Mock data
        const mockUserLevels = {
            exists: () => true,
            data: () => ({
                levels: [
                    {level_id: 'level1'},
                    {level_id: 'level3'}
                ]
            })
        };

        // Setup mocks
        (doc as any).mockReturnValue('userLevelsDocRef');
        (getDoc as any).mockResolvedValue(mockUserLevels);
        (updateDoc as any).mockResolvedValue(undefined);

        // Call the function
        await deleteLevelFromUserLevels('testUserId', 'level2');

        // Assertions
        expect(doc).toHaveBeenCalledWith(expect.anything(), 'userLevels', 'testUserId');
        expect(getDoc).toHaveBeenCalledWith('userLevelsDocRef');
        expect(updateDoc).toHaveBeenCalledWith('userLevelsDocRef', {
            levels: [
                {level_id: 'level1'},
                {level_id: 'level3'}
            ],
            updatedAt: 'mocked-timestamp'
        });
    });
});