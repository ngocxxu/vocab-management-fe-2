'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { TVocab } from '@/types/vocab-list';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, Edit, MoreVertical } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form } from '@/components/ui/form';
import { DataTable } from '@/components/ui/table';
import AddVocabDialog from './AddVocabDialog';
import VocabListHeader from './VocabListHeader';

// Define the form schema
const FormSchema = z.object({
  textSource: z.string().min(1, 'Source text is required'),
  sourceLanguageCode: z.string().min(1, 'Source language is required'),
  targetLanguageCode: z.string().min(1, 'Target language is required'),
  textTargets: z.array(z.object({
    wordTypeId: z.string().min(1, 'Word type is required'),
    textTarget: z.string().min(1, 'Target text is required'),
    grammar: z.string(),
    explanationSource: z.string(),
    explanationTarget: z.string(),
    subjectIds: z.array(z.string()),
    vocabExamples: z.array(z.object({
      source: z.string(),
      target: z.string(),
    })),
  })).min(1, 'At least one text target is required'),
});

type FormData = z.infer<typeof FormSchema>;

const VocabList: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [globalFilter, setGlobalFilter] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      textSource: '',
      sourceLanguageCode: '',
      targetLanguageCode: '',
      textTargets: [{
        wordTypeId: '',
        textTarget: '',
        grammar: '',
        explanationSource: '',
        explanationTarget: '',
        subjectIds: [],
        vocabExamples: [{ source: '', target: '' }],
      }],
    },
  });

  const [activeTab, setActiveTab] = useState('0');

  const addTextTarget = () => {
    const newIndex = form.watch('textTargets').length;
    form.setValue('textTargets', [...form.watch('textTargets'), {
      wordTypeId: '',
      textTarget: '',
      grammar: '',
      explanationSource: '',
      explanationTarget: '',
      subjectIds: [], // Ensure this is always initialized as an empty array
      vocabExamples: [{ source: '', target: '' }],
    }]);
    setActiveTab(newIndex.toString());
  };

  const removeTextTarget = (index: number) => {
    if (form.watch('textTargets').length > 1) {
      form.setValue('textTargets', form.watch('textTargets').filter((_, i) => i !== index));
      // Switch to the previous tab if removing the current one
      if (activeTab === index.toString()) {
        setActiveTab(Math.max(0, index - 1).toString());
      }
    }
  };

  const handleInputChange = (field: string, value: string, targetIndex?: number) => {
    if (targetIndex !== undefined) {
      const currentTargets = form.watch('textTargets');
      const updatedTargets = currentTargets.map((target, index) =>
        index === targetIndex
          ? { ...target, [field]: value }
          : target,
      );
      form.setValue('textTargets', updatedTargets);
    } else {
      form.setValue(field as keyof FormData, value);
    }
  };

  const handleExampleChange = (exampleIndex: number, field: 'source' | 'target', value: string, targetIndex: number = 0) => {
    const currentTargets = form.watch('textTargets');
    const updatedTargets = currentTargets.map((target, index) =>
      index === targetIndex
        ? {
            ...target,
            vocabExamples: target.vocabExamples.map((example, exIndex) =>
              exIndex === exampleIndex
                ? { ...example, [field]: value }
                : example,
            ),
          }
        : target,
    );
    form.setValue('textTargets', updatedTargets);
  };

  const addExample = (targetIndex: number = 0) => {
    const currentTargets = form.watch('textTargets');
    const updatedTargets = currentTargets.map((target, index) =>
      index === targetIndex
        ? { ...target, vocabExamples: [...target.vocabExamples, { source: '', target: '' }] }
        : target,
    );
    form.setValue('textTargets', updatedTargets);
  };

  const removeExample = (exampleIndex: number, targetIndex: number = 0) => {
    const currentTargets = form.watch('textTargets');
    const updatedTargets = currentTargets.map((target, index) =>
      index === targetIndex
        ? {
            ...target,
            vocabExamples: target.vocabExamples.filter((_, exIndex) => exIndex !== exampleIndex),
          }
        : target,
    );
    form.setValue('textTargets', updatedTargets);
  };

  const handleSubmit = () => {
    // Here you would send the data to your backend
    // The formData matches the TCreateVocab type structure
    // You can access the data via formData variable
  };

  // Memoize the data to prevent unnecessary re-renders - using the actual TVocab structure
  const data = useMemo<TVocab[]>(() => [
    {
      id: 'cme9s70fv000cqh1s1ick06db',
      sourceLanguageCode: 'ko',
      targetLanguageCode: 'vi',
      textSource: '안녕하세요',
      textTargets: [
        {
          textTarget: 'Xin chào',
          wordType: { id: '1', name: 'Greeting', description: 'A greeting expression' },
          explanationSource: 'Korean greeting',
          explanationTarget: 'Vietnamese greeting',
          vocabExamples: [
            { source: '안녕하세요, 만나서 반갑습니다', target: 'Xin chào, rất vui được gặp bạn' },
          ],
          grammar: 'Interjection',
          textTargetSubjects: [
            {
              id: '1',
              subject: { id: '1', name: 'Basic Greetings', order: 1 },
            },
          ],
        },
      ],
    },
    {
      id: 'cme9s70fv000cqh1s1ick06dc',
      sourceLanguageCode: 'ko',
      targetLanguageCode: 'vi',
      textSource: '감사합니다',
      textTargets: [
        {
          textTarget: 'Cảm ơn',
          wordType: { id: '2', name: 'Expression', description: 'A thank you expression' },
          explanationSource: 'Korean thank you',
          explanationTarget: 'Vietnamese thank you',
          vocabExamples: [
            { source: '정말 감사합니다', target: 'Thực sự cảm ơn bạn' },
          ],
          grammar: 'Interjection',
          textTargetSubjects: [
            {
              id: '2',
              subject: { id: '2', name: 'Politeness', order: 2 },
            },
          ],
        },
      ],
    },
    {
      id: 'cme9s70fv000cqh1s1ick06dd',
      sourceLanguageCode: 'ko',
      targetLanguageCode: 'vi',
      textSource: '안녕히 가세요',
      textTargets: [
        {
          textTarget: 'Tạm biệt',
          wordType: { id: '3', name: 'Farewell', description: 'A goodbye expression' },
          explanationSource: 'Korean goodbye',
          explanationTarget: 'Vietnamese goodbye',
          vocabExamples: [
            { source: '안녕히 가세요, 또 만나요', target: 'Tạm biệt, hẹn gặp lại' },
          ],
          grammar: 'Interjection',
          textTargetSubjects: [
            {
              id: '3',
              subject: { id: '3', name: 'Farewells', order: 3 },
            },
          ],
        },
      ],
    },
    {
      id: 'cme9s70fv000cqh1s1ick06de',
      sourceLanguageCode: 'ko',
      targetLanguageCode: 'vi',
      textSource: '제발',
      textTargets: [
        {
          textTarget: 'Làm ơn',
          wordType: { id: '4', name: 'Request', description: 'A please expression' },
          explanationSource: 'Korean please',
          explanationTarget: 'Vietnamese please',
          vocabExamples: [
            { source: '제발 도와주세요', target: 'Làm ơn giúp tôi' },
          ],
          grammar: 'Adverb',
          textTargetSubjects: [
            {
              id: '4',
              subject: { id: '4', name: 'Requests', order: 4 },
            },
          ],
        },
      ],
    },
    {
      id: 'cme9s70fv000cqh1s1ick06df',
      sourceLanguageCode: 'ko',
      targetLanguageCode: 'vi',
      textSource: '실례합니다',
      textTargets: [
        {
          textTarget: 'Xin lỗi',
          wordType: { id: '5', name: 'Apology', description: 'An excuse me expression' },
          explanationSource: 'Korean excuse me',
          explanationTarget: 'Vietnamese excuse me',
          vocabExamples: [
            { source: '실례합니다, 길을 비켜주세요', target: 'Xin lỗi, làm ơn nhường đường' },
          ],
          grammar: 'Interjection',
          textTargetSubjects: [
            {
              id: '5',
              subject: { id: '5', name: 'Apologies', order: 5 },
            },
          ],
        },
      ],
    },
  ], []);

  // Memoize columns to prevent unnecessary re-renders
  const columns = useMemo<ColumnDef<TVocab>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    {
      accessorKey: 'textSource',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold text-slate-700 dark:text-slate-300"
        >
          Source Text
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const firstTarget = row.original.textTargets[0];
        return (
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 text-sm font-bold text-white shadow-lg">
              {row.original.textSource.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">{row.original.textSource}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {firstTarget?.textTarget || 'No translation'}
              </div>
            </div>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'sourceLanguageCode',
      header: 'Source Language',
      cell: ({ row }) => (
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {row.original.sourceLanguageCode.toUpperCase()}
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'targetLanguageCode',
      header: 'Target Language',
      cell: ({ row }) => (
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {row.original.targetLanguageCode.toUpperCase()}
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'textTargets',
      header: 'Word Type',
      cell: ({ row }) => {
        const firstTarget = row.original.textTargets[0];
        return (
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {firstTarget?.wordType?.name || 'N/A'}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'textTargets',
      header: 'Subjects',
      cell: ({ row }) => {
        const firstTarget = row.original.textTargets[0];
        const subjects = firstTarget?.textTargetSubjects || [];

        return (
          <div className="flex flex-wrap gap-1">
            {subjects.map(subject => (
              <span
                key={subject.id}
                className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-700 dark:text-slate-200"
              >
                {subject.subject.name}
              </span>
            ))}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'textTargets',
      header: 'Examples',
      cell: ({ row }) => {
        const firstTarget = row.original.textTargets[0];
        const examples = firstTarget?.vocabExamples || [];

        return (
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {examples.length > 0 ? `${examples.length} example(s)` : 'No examples'}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row: _row }) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
            <Edit className="h-4 w-4 text-slate-500" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
            <MoreVertical className="h-4 w-4 text-slate-500" />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ], []);

  return (
    <Form {...form}>
      <div className="space-y-6">
        <VocabListHeader
          totalCount={data.length}
          onAddVocab={() => setOpen(true)}
        />

        <AddVocabDialog
          formData={form.watch()}
          activeTab={activeTab}
          onInputChange={handleInputChange}
          onExampleChange={handleExampleChange}
          onAddExample={addExample}
          onRemoveExample={removeExample}
          onAddTextTarget={addTextTarget}
          onRemoveTextTarget={removeTextTarget}
          onActiveTabChange={setActiveTab}
          onSubmit={handleSubmit}
          open={open}
          setOpen={setOpen}
        />

        {/* Reusable DataTable Component */}
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Search vocab..."
          searchValue={globalFilter}
          onSearchChangeAction={setGlobalFilter}
          showSearch={true}
          showPagination={true}
          pageSize={8}
          className=""
          headerClassName=""
          rowClassName=""
          cellClassName=""
        />
      </div>
    </Form>
  );
};

export default VocabList;
