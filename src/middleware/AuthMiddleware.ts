import axios from "axios";
import type {AxiosResponse, AxiosError} from "axios";
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
})
export function setupAuthInterceptor(){
    api.interceptors.response.use(
        (res: AxiosResponse) => res,
        async (err: AxiosError) => {
        if(err.response && err.response.status === 401){
            try{
                await api.post("user/logout");
            } catch(_) {}
            window.location.href = "/login";
        }
        return Promise.reject(err);
    }
    )
}