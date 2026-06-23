

async function test() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IkFkbWluIiwicGVybWlzc2lvbnMiOlsiKiJdLCJpYXQiOjE3ODE3ODAwNDAsImV4cCI6MTc4MjEzNjQ0MH0.BwwvRT972i5zlwmuiIe5sTO9N0DjkTP6yX7JaLVTCl0";
  const meRes = await fetch('http://localhost:8080/graphql', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query: 'query { me { id username role permissions } }'
    })
  });
  const meData = await meRes.json();
  console.log('Me:', JSON.stringify(meData, null, 2));
}

test();
