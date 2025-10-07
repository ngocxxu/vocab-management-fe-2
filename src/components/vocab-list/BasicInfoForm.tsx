'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguages } from '@/hooks/useLanguages';

type Language = {
  code: string;
  name: string;
};

const BasicInfoForm: React.FC = () => {
  const form = useFormContext();
  const { languages, isLoading, isError } = useLanguages();

  // Get current form values to filter options
  const sourceLanguageCode = form.watch('sourceLanguageCode');
  const targetLanguageCode = form.watch('targetLanguageCode');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Basic Information</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="sourceLanguageCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source Language</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  form.clearErrors('sourceLanguageCode');
                  // Clear target language if it's the same as source
                  if (value === targetLanguageCode) {
                    form.setValue('targetLanguageCode', '');
                  }
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoading
                    ? (
                        <SelectItem value="loading" disabled>
                          Loading languages...
                        </SelectItem>
                      )
                    : isError
                      ? (
                          <SelectItem value="error" disabled>
                            Error loading languages
                          </SelectItem>
                        )
                      : (
                          languages?.filter(language => language.code !== targetLanguageCode).map((language: Language) => (
                            <SelectItem key={language.code} value={language.code}>
                              {language.name}
                            </SelectItem>
                          ))
                        )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetLanguageCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Language</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  form.clearErrors('targetLanguageCode');
                  // Clear source language if it's the same as target
                  if (value === sourceLanguageCode) {
                    form.setValue('sourceLanguageCode', '');
                  }
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoading
                    ? (
                        <SelectItem value="loading" disabled>
                          Loading languages...
                        </SelectItem>
                      )
                    : isError
                      ? (
                          <SelectItem value="error" disabled>
                            Error loading languages
                          </SelectItem>
                        )
                      : (
                          languages?.filter(language => language.code !== sourceLanguageCode).map((language: Language) => (
                            <SelectItem key={language.code} value={language.code}>
                              {language.name}
                            </SelectItem>
                          ))
                        )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

      </div>

      <FormField
        control={form.control}
        name="textSource"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Source Text</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter source text..."
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  form.clearErrors('textSource');
                }}
                className="mt-1"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicInfoForm;
