import {beforeEach, describe, expect, test, vi} from 'vitest';
import {getCustomLevelById, getUserLevels} from '../firebase/firestore';
import {doc, getDoc} from 'firebase/firestore';

// Mock Firebase functions
vi.mock('firebase/firestore', () => ({
    doc: vi.fn(),
    getDoc: vi.fn(),
    collection: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    serverTimestamp: vi.fn(() => 'mocked-timestamp'),
    arrayUnion: vi.fn(data => data)
}));

vi.mock('../firebase/index', () => ({
    db: {}
}));

describe('User Levels Functions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('getUserLevels returns user levels when they exist', async () => {
        // Mock data
        const mockUserLevels = {
            exists: () => true,
            data: () => ({
                levels: [
                    {level_id: 'level1', filename: 'test1.py'},
                    {level_id: 'level2', filename: 'test2.py'}
                ]
            })
        };

        // Setup mocks
        (doc as any).mockReturnValue('userLevelsDocRef');
        (getDoc as any).mockResolvedValue(mockUserLevels);

        // Call the function
        const result = await getUserLevels('testUserId');

        // Assertions
        expect(doc).toHaveBeenCalledWith(expect.anything(), 'userLevels', 'testUserId');
        expect(getDoc).toHaveBeenCalledWith('userLevelsDocRef');
        expect(result).toEqual([
            {level_id: 'level1'},
            {level_id: 'level2'}
        ]);
    });

    test('getUserLevels returns empty array when user has no levels', async () => {
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
        const result = await getUserLevels('testUserId');

        // Assertions
        expect(doc).toHaveBeenCalledWith(expect.anything(), 'userLevels', 'testUserId');
        expect(getDoc).toHaveBeenCalledWith('userLevelsDocRef');
        expect(result).toEqual([]);
    });

    test('getUserLevels returns empty array when user document does not exist', async () => {
        // Mock data
        const mockUserLevels = {
            exists: () => false
        };

        // Setup mocks
        (doc as any).mockReturnValue('userLevelsDocRef');
        (getDoc as any).mockResolvedValue(mockUserLevels);

        // Call the function
        const result = await getUserLevels('testUserId');

        // Assertions
        expect(doc).toHaveBeenCalledWith(expect.anything(), 'userLevels', 'testUserId');
        expect(getDoc).toHaveBeenCalledWith('userLevelsDocRef');
        expect(result).toEqual([]);
    });

    test('getCustomLevelById returns level when it exists', async () => {
        // Mock data
        const mockLevel = {
            exists: () => true,
            data: () => ({
                id: 'level1',
                content: '##file test.py\n\n"""start\nTest\n"""\n##start-reply "Start"\n\n# Code\n\n"""final\nDone\n"""\n##final-reply "Finish"',
                author_id: 'testUserId',
                filename: 'test.py',
                created_at: 'mocked-timestamp'
            })
        };

        // Setup mocks
        (doc as any).mockReturnValue('levelDocRef');
        (getDoc as any).mockResolvedValue(mockLevel);

        // Call the function
        const result = await getCustomLevelById('level1');

        // Assertions
        expect(doc).toHaveBeenCalledWith(expect.anything(), 'customLevels', 'level1');
        expect(getDoc).toHaveBeenCalledWith('levelDocRef');
        expect(result).toEqual({
            id: 'level1',
            content: '##file test.py\n\n"""start\nTest\n"""\n##start-reply "Start"\n\n# Code\n\n"""final\nDone\n"""\n##final-reply "Finish"',
            author_id: 'testUserId',
            filename: 'test.py',
            created_at: 'mocked-timestamp'
        });
    });

    test('getCustomLevelById returns null when level does not exist', async () => {
        // Mock data
        const mockLevel = {
            exists: () => false
        };

        // Setup mocks
        (doc as any).mockReturnValue('levelDocRef');
        (getDoc as any).mockResolvedValue(mockLevel);

        // Call the function
        const result = await getCustomLevelById('level1');

        // Assertions
        expect(doc).toHaveBeenCalledWith(expect.anything(), 'customLevels', 'level1');
        expect(getDoc).toHaveBeenCalledWith('levelDocRef');
        expect(result).toBeNull();
    });
});