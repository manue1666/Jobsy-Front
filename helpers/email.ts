import api from '@/request';
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function sendEmail() : Promise<void> {
    try{
        const token = await AsyncStorage.getItem('token');
        const user = await AsyncStorage.getItem('user');
        const response = await api.post('/email/post', user, {
            headers : {
                Authorization : `Bearer ${token}`,
                 'Content-Type': 'application/json',
            }
        });
        return response.data;
    }catch(err){
        console.error('Error en senEmail', err);
        throw err;
    }
}