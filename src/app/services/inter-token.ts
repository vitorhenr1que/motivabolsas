export async function getInterToken(){
    const response = await fetch('/api/inter-token',{
        method: "POST"
    })
    return response.json()
}