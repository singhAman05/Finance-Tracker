import { apiClient } from "@/utils/Error_handler";

export const createAccountRoute = async (payload: object) => {
  const token = localStorage.getItem('jwt');
  if (!token) {
    throw new Error('Not authenticated');
  }
  console.log("Payload for createAccountRoute:", payload);
  const res = await fetch('http://localhost:8000/api/accounts/creating-account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  const result = await res.json();
  // console.log("Response from createAccountRoute:", result);
  return result; // { account: { ... } }
};

export const fetchAccountsRoute = async()=>{

  // return apiClient<any>(
  //   `/api/accounts/fetch-accounts`,
  //   {
  //     method: "POST",
  //   }
  // )
  const token = localStorage.getItem('jwt');
  if (!token) {
    throw new Error('Not authenticated');
  }
  try{
    const res = await fetch(`http://localhost:8000/api/accounts/fetch-accounts`,{
      method : 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const result = await res.json();
    // console.log("Response data:", result);
    if(res.status!==200){
      throw new Error(`${result.message}`)
    }

    return result.data
  }catch(err){
    throw new Error(`${err}`);
  }
}