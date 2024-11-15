import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { format } from 'date-fns';

export default function CommandCard({ command, onEdit, onDelete }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{command.title}</CardTitle>
          <span className="text-sm text-gray-500">{command.platform}</span>
        </div>
        <CardDescription>
          {command.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
          <code>{command.command}</code>
        </pre>
        <div className="mt-4 flex flex-wrap gap-2">
          {command.tags.map((tag) => (
            <span
              key={tag}
              className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <span className="text-sm text-gray-500">
          {format(new Date(command.createdAt), 'MMM d, yyyy')}
        </span>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(command)}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(command._id)}>
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}