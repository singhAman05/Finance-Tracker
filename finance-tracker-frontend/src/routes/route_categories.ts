export const fetchSystemCategories = async()=>{
    const token = localStorage.getItem('jwt');
  if (!token) {
    throw new Error('Not authenticated');
  }
  try{
    const res = await fetch(`http://localhost:8000/api/category/get-system-categories`,{
      method : 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const result = await res.json();
    // console.log(result)
    if(res.status!==200){
      throw new Error(`${result.message}`)
    }

    return result.data
  }catch(err){
    throw new Error(`${err}`);
  }
}