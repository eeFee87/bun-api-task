import { serve, file, write } from 'bun';

interface Task {
  id: string;
  title: string;
  status: string;
}

const server = serve({
  port: 3000,
  async fetch(request) {
    const { url } = request;
    const { pathname } = new URL(url);
    const { method } = request;

    const dataFile = file(import.meta.dir + '/db.json');
    const { tasks } = await dataFile.json();
    //ROUTES

    // Init response
    if (pathname === '/') {
      return Response.json(
        { message: 'Welcome to my first API with Bun!' },
        { status: 200 }
      );
    }
    // GET All tasks
    if (pathname === '/tasks' && method === 'GET') {
      return Response.json({ data: tasks }, { status: 200 });
    }

    // Create a new Task
    if (pathname === '/tasks' && method === 'POST') {
      const body = await request.json();
      const newTask = {
        id: tasks.length + 1,
        ...body,
        status: 'Pending'
      };

      tasks.push(newTask);

      write(dataFile, JSON.stringify({ tasks }));

      return Response.json(
        { message: 'Task created', data: newTask },
        { status: 201 }
      );
    }

    //Update an existing Task
    if (pathname.includes('/tasks/') && method === 'PUT') {
      const body = await request.json();
      const id = pathname.split('/')[2];

      const index = tasks.findIndex((task: Task) => task.id == id);

      if (index !== -1) {
        tasks[index] = {
          ...tasks[index],
          ...body
        };

        write(dataFile, JSON.stringify({ tasks }));

        return Response.json(
          { message: 'Task updated', data: tasks[index] },
          { status: 201 }
        );
      }
      return Response.json({ message: 'Task not found' }, { status: 404 });
    }

    //Delete a Task
    if (pathname.includes('/tasks/') && method === 'DELETE') {
      const id = pathname.split('/')[2];

      const index = tasks.findIndex((task: Task) => task.id == id);
      if (index !== -1) {
        tasks.splice(index, 1);

        write(dataFile, JSON.stringify({ tasks }));

        return Response.json(
          { message: `Task with id:${id} deleted` },
          { status: 201 }
        );
      }
      return Response.json({ message: 'Task not found' }, { status: 404 });
    }

    //GET a Task by ID
    if (pathname.includes('/tasks/') && method === 'GET') {
      const id = pathname.split('/')[2];

      const index = tasks.findIndex((task: Task) => task.id == id);

      if (index !== -1) {
        return Response.json(
          { message: 'Task found', data: tasks[index] },
          { status: 200 }
        );
      }
      return Response.json({ message: 'Task not found!' }, { status: 404 });
    }

    //Not Found response
    return Response.json({ message: 'Not found!' }, { status: 404 });
  }
});

console.log(`Listening on localhost:${server.port}`);
