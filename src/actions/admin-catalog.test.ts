import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAdminLanguage, createAdminWordType, deleteAdminLanguage, deleteAdminWordType, updateAdminLanguage, updateAdminWordType } from './admin-catalog';

const updateTag = vi.hoisted(() => vi.fn());
const revalidatePath = vi.hoisted(() => vi.fn());
const requireAdmin = vi.hoisted(() => vi.fn());
const languagesApi = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn(), delete: vi.fn() }));
const wordTypesApi = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn(), delete: vi.fn() }));

vi.mock('next/cache', () => ({ updateTag, revalidatePath }));
vi.mock('./auth', () => ({ requireAdmin }));
vi.mock('./utils', () => ({
  toActionError: vi.fn(async (_error: unknown, key: string) => new Error(key)),
  translateError: vi.fn(async (key: string) => key),
}));
vi.mock('@/utils/server-api', () => ({ languagesApi, wordTypesApi }));

const LANGUAGE_ID = 'lang-vi';
const LANGUAGE = { code: 'vi', name: 'Vietnamese' };
const WORD_TYPE_ID = 'wt-noun';
const WORD_TYPE = { name: 'Noun', description: 'A naming word' };

describe('admin catalog actions and the reference-data cache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdmin.mockResolvedValue(undefined);
  });

  describe('languages', () => {
    it('busts the languages cache after a create, so the pickers pick it up at once', async () => {
      languagesApi.create.mockResolvedValue({ id: LANGUAGE_ID, ...LANGUAGE });

      await createAdminLanguage(LANGUAGE);

      expect(updateTag).toHaveBeenCalledWith('languages');
    });

    it('busts the languages cache after a rename', async () => {
      languagesApi.update.mockResolvedValue({ id: LANGUAGE_ID, ...LANGUAGE, name: 'Tiếng Việt' });

      await updateAdminLanguage(LANGUAGE_ID, { code: 'vi', name: 'Tiếng Việt' });

      expect(updateTag).toHaveBeenCalledWith('languages');
    });

    it('busts the languages cache after a delete', async () => {
      languagesApi.delete.mockResolvedValue({ id: LANGUAGE_ID, ...LANGUAGE });

      await deleteAdminLanguage(LANGUAGE_ID);

      expect(updateTag).toHaveBeenCalledWith('languages');
    });

    it('does not bust the cache or call the API when the input is invalid', async () => {
      await expect(createAdminLanguage({ code: 'EN', name: 'English' })).rejects.toThrow();

      expect(languagesApi.create).not.toHaveBeenCalled();
      expect(updateTag).not.toHaveBeenCalled();
    });

    it('does not bust the cache when the API refuses the change', async () => {
      languagesApi.delete.mockRejectedValue(new Error('in use'));

      await expect(deleteAdminLanguage(LANGUAGE_ID)).rejects.toThrow('adminDeleteLanguage');

      expect(updateTag).not.toHaveBeenCalled();
    });

    it('checks the admin role before anything else', async () => {
      requireAdmin.mockRejectedValue(new Error('Forbidden'));

      await expect(deleteAdminLanguage(LANGUAGE_ID)).rejects.toThrow('Forbidden');

      expect(languagesApi.delete).not.toHaveBeenCalled();
    });
  });

  describe('word types', () => {
    it('busts the word types cache after a create, so the pickers pick it up at once', async () => {
      wordTypesApi.create.mockResolvedValue({ id: WORD_TYPE_ID, ...WORD_TYPE });

      await createAdminWordType(WORD_TYPE);

      expect(updateTag).toHaveBeenCalledWith('word-types');
      expect(updateTag).not.toHaveBeenCalledWith('languages');
    });

    it('busts the word types cache after an edit', async () => {
      wordTypesApi.update.mockResolvedValue({ id: WORD_TYPE_ID, ...WORD_TYPE, description: 'Updated' });

      await updateAdminWordType(WORD_TYPE_ID, { ...WORD_TYPE, description: 'Updated' });

      expect(updateTag).toHaveBeenCalledWith('word-types');
    });

    it('busts the word types cache after a delete', async () => {
      wordTypesApi.delete.mockResolvedValue({ id: WORD_TYPE_ID, ...WORD_TYPE });

      await deleteAdminWordType(WORD_TYPE_ID);

      expect(updateTag).toHaveBeenCalledWith('word-types');
    });

    it('does not bust the cache or call the API when the name is blank', async () => {
      await expect(createAdminWordType({ name: '   ', description: 'A naming word' })).rejects.toThrow();

      expect(wordTypesApi.create).not.toHaveBeenCalled();
      expect(updateTag).not.toHaveBeenCalled();
    });

    it('does not bust the cache when the API refuses the delete', async () => {
      wordTypesApi.delete.mockRejectedValue(new Error('refused'));

      await expect(deleteAdminWordType(WORD_TYPE_ID)).rejects.toThrow('adminDeleteWordType');

      expect(updateTag).not.toHaveBeenCalled();
    });
  });
});
