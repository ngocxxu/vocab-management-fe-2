'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export function ExampleForm() {
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Vocabulary word added successfully!', {
      description: `Added "${word}" to your vocabulary list.`,
    });
    setWord('');
    setDefinition('');
    setDifficulty('');
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Add New Vocabulary</CardTitle>
        <CardDescription>
          Add a new word to your vocabulary management system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="word">Word</Label>
            <Input
              id="word"
              placeholder="Enter a word..."
              value={word}
              onChange={e => setWord(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="definition">Definition</Label>
            <Textarea
              id="definition"
              placeholder="Enter the definition..."
              value={definition}
              onChange={e => setDefinition(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select value={difficulty} onValueChange={setDifficulty} required>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            Add Word
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
