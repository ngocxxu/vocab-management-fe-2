'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, ChevronDown, Clock, Edit, Filter, MoreVertical, Plus, XCircle } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/table';

type VocabItem = {
  id: string;
  word: string;
  translation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  lastReviewed: string;
  status: 'Mastered' | 'Learning' | 'Not Started';
  category: string[];
  progress: number;
};

const VocabList: React.FC = () => {
  const [globalFilter, setGlobalFilter] = useState('');

  // Memoize the data to prevent unnecessary re-renders
  const data = useMemo<VocabItem[]>(() => [
    {
      id: '1',
      word: 'Bonjour',
      translation: 'Hello',
      difficulty: 'Easy',
      lastReviewed: 'July 15, 2026',
      status: 'Mastered',
      category: ['Greetings', 'Basic'],
      progress: 95,
    },
    {
      id: '2',
      word: 'Merci',
      translation: 'Thank you',
      difficulty: 'Easy',
      lastReviewed: 'July 14, 2026',
      status: 'Learning',
      category: ['Politeness', 'Basic'],
      progress: 75,
    },
    {
      id: '3',
      word: 'Au revoir',
      translation: 'Goodbye',
      difficulty: 'Easy',
      lastReviewed: 'July 13, 2026',
      status: 'Mastered',
      category: ['Greetings', 'Basic'],
      progress: 90,
    },
    {
      id: '4',
      word: 'S\'il vous plaît',
      translation: 'Please',
      difficulty: 'Medium',
      lastReviewed: 'July 12, 2026',
      status: 'Learning',
      category: ['Politeness', 'Formal'],
      progress: 60,
    },
    {
      id: '5',
      word: 'Excusez-moi',
      translation: 'Excuse me',
      difficulty: 'Medium',
      lastReviewed: 'July 11, 2026',
      status: 'Not Started',
      category: ['Politeness', 'Formal'],
      progress: 25,
    },
    {
      id: '6',
      word: 'Comment allez-vous?',
      translation: 'How are you?',
      difficulty: 'Medium',
      lastReviewed: 'July 10, 2026',
      status: 'Learning',
      category: ['Greetings', 'Conversation'],
      progress: 70,
    },
    {
      id: '7',
      word: 'Je m\'appelle',
      translation: 'My name is',
      difficulty: 'Medium',
      lastReviewed: 'July 9, 2026',
      status: 'Mastered',
      category: ['Introduction', 'Basic'],
      progress: 85,
    },
    {
      id: '8',
      word: 'Enchanté',
      translation: 'Nice to meet you',
      difficulty: 'Hard',
      lastReviewed: 'July 8, 2026',
      status: 'Not Started',
      category: ['Introduction', 'Formal'],
      progress: 15,
    },
  ], []);

  // Memoize columns to prevent unnecessary re-renders
  const columns = useMemo<ColumnDef<VocabItem>[]>(() => [
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
      accessorKey: 'word',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold text-slate-700 dark:text-slate-300"
        >
          Word
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 text-sm font-bold text-white shadow-lg">
            {row.original.word.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">{row.original.word}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{row.original.translation}</div>
          </div>
        </div>
      ),
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'progress',
      header: 'Progress',
      cell: ({ row }) => (
        <div className="w-full">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {row.original.progress}
              %
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
              style={{ width: `${row.original.progress}%` }}
            />
          </div>
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'lastReviewed',
      header: 'Last Reviewed',
      cell: ({ row }) => (
        <div className="text-sm text-slate-600 dark:text-slate-400">{row.original.lastReviewed}</div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'category',
      header: 'Categories',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.category.map(cat => (
            <span
              key={cat}
              className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-700 dark:text-slate-200"
            >
              {cat}
            </span>
          ))}
        </div>
      ),
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row: _row }) => {
        const statusConfig = {
          'Mastered': { icon: CheckCircle, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20' },
          'Learning': { icon: Clock, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20' },
          'Not Started': { icon: XCircle, color: 'text-slate-600 bg-slate-100 dark:bg-slate-700' },
        };
        const config = statusConfig[_row.original.status];
        const Icon = config.icon;

        return (
          <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${config.color}`}>
            <Icon className="mr-2 h-4 w-4" />
            {_row.original.status}
          </div>
        );
      },
      enableSorting: true,
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Vocab List</h1>
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-sm font-medium text-purple-800 dark:bg-purple-900/20 dark:text-purple-200">
              {data.length}
              {' '}
              Total
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Track your vocabulary learning progress and review history.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" className="border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Vocab
          </Button>
        </div>
      </div>

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
  );
};

export default VocabList;
