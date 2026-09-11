const API_URL = import.meta.env.VITE_API_URL;

export const loginUser = async ({ username, password }) => {
  const response = await fetch(`${API_URL}/user/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Usuario o contraseña incorrectos');
    }
    throw new Error('Error al conectar con el servidor');
  }
  return await response.text(); 
  
};

export const isUserAuth = async () => {
    const res = await fetch(`${API_URL}/user/validate`, {
        method: "GET",
        credentials: "include",
    });
    return res.ok;
}
export const getUserAuth = async() => {
  const res = await fetch(`${API_URL}/user/get`,{
    method: "GET",
    credentials: "include",
  });
  return res.ok;
}
