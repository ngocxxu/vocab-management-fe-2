import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExampleForm } from '@/components/ui/example-form';

export const metadata: Metadata = {
  title: 'Vocabulary Management System',
  description: 'A modern vocabulary management system built with Next.js and shadcn/ui',
};

export default async function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            Vocabulary Management System
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            Built with Next.js and shadcn/ui components for a modern, accessible, and beautiful user experience.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
          {/* Example Form */}
          <div>
            <ExampleForm />
          </div>

          {/* Component Showcase */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Components</CardTitle>
                <CardDescription>
                  shadcn/ui components ready to use in your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Form Elements</h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Button</li>
                      <li>• Input</li>
                      <li>• Label</li>
                      <li>• Textarea</li>
                      <li>• Select</li>
                      <li>• Form</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Layout & Feedback</h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Card</li>
                      <li>• Dialog</li>
                      <li>• Dropdown Menu</li>
                      <li>• Sonner (Toasts)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  How to add more components to your project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                  <code className="text-sm">
                    npx shadcn@latest add [component-name]
                  </code>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Replace [component-name] with any component from the shadcn/ui registry.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
