import { serve, file, write } from 'bun';

const server = serve({
  port: 3000,
  async fetch(request) {
    const { url } = request;
    const { pathname } = new URL(url);
    const { method } = request;

    const dataFile = file(import.meta.dir + '/db.json');
    const { tasks } = await dataFile.json();

    if (pathname === '/') {
      return Response.json(
        { message: 'Welcome to my first API with Bun!' },
        { status: 200 }
      );
    }

    if (pathname === '/tasks' && method === 'GET') {
      return Response.json({ data: tasks }, { status: 200 });
    }

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
    if (pathname.includes('/tasks/') && method === 'PUT') {
      const body = await request.json();
      const id = pathname.split('/')[2];

      const index = tasks.findIndex((task: any) => task.id == id);

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
    if (pathname.includes('/tasks/') && method === 'DELETE') {
      const id = pathname.split('/')[2];

      const index = tasks.findIndex((task: any) => task.id == id);

      tasks.splice(index, 1);

      write(dataFile, JSON.stringify({ tasks }));

      return Response.json(
        { message: `Task with id:${id} deleted` },
        { status: 201 }
      );
    }
    if (pathname.includes('/tasks/') && method === 'GET') {
      const id = pathname.split('/')[2];

      const index = tasks.findIndex((task: any) => task.id == id);

      if (index !== -1) {
        return Response.json(
          { message: 'Task found', data: tasks[index] },
          { status: 200 }
        );
      }
      return Response.json({ message: 'Not found!' }, { status: 404 });
    }
    return Response.json({ message: 'Not found!' }, { status: 404 });
  }
});

console.log(`Listening on localhost:${server.port}`);
