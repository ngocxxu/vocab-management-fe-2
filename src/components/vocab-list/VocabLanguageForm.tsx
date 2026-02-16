'use client';

import type { ResponseAPI, TLanguage } from '@/types';
import { QuestionCircle } from '@solar-icons/react/ssr';
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

type Language = {
  code: string;
  name: string;
};

type VocabLanguageFormProps = {
  initialLanguagesData?: ResponseAPI<TLanguage[]>;
};

const VocabLanguageForm: React.FC<VocabLanguageFormProps> = ({ initialLanguagesData }) => {
  const form = useFormContext();
  const languages = initialLanguagesData?.items || [];
  const isLoading = false;
  const isError = false;

  const sourceLanguageCode = form.watch('sourceLanguageCode');
  const targetLanguageCode = form.watch('targetLanguageCode');

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        <QuestionCircle size={14} weight="BoldDuotone" />
        Basic Information
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="sourceLanguageCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  form.clearErrors('sourceLanguageCode');
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
              <FormLabel>Target</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  form.clearErrors('targetLanguageCode');
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

export default VocabLanguageForm;
